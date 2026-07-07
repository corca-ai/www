import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(
  process.env.BLOG_ADMIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..'),
);
const blogRoot = join(repoRoot, 'public/blog');
const sourcesDir = join(blogRoot, 'admin/post-sources');
const translationsDir = join(blogRoot, 'admin/post-translations');
const postsDir = join(blogRoot, 'posts');
const adminAssetsDir = join(blogRoot, 'assets/admin-posts');
const localePaths = {
  ko: 'public/blog',
  en: 'public/en/blog',
  ja: 'public/ja/blog',
  zh: 'public/zh/blog',
};
const localeLabels = {
  ko: {
    lang: 'ko',
    hreflang: 'ko-KR',
    ogLocale: 'ko_KR',
    blogPath: '/blog',
    imageAltSuffix: '대표 이미지',
    toc: '목차',
    recommendations: '추천 글',
    previous: '이전 글',
    next: '다음 글',
    postsBreadcrumb: '글',
    dateLocale: 'ko-KR',
  },
  en: {
    lang: 'en',
    hreflang: 'en-US',
    ogLocale: 'en_US',
    blogPath: '/en/blog',
    imageAltSuffix: 'representative image',
    toc: 'Table of contents',
    recommendations: 'Recommended posts',
    previous: 'Previous post',
    next: 'Next post',
    postsBreadcrumb: 'Posts',
    dateLocale: 'en-US',
  },
  ja: {
    lang: 'ja',
    hreflang: 'ja-JP',
    ogLocale: 'ja_JP',
    blogPath: '/ja/blog',
    imageAltSuffix: '代表画像',
    toc: '目次',
    recommendations: 'おすすめ記事',
    previous: '前の記事',
    next: '次の記事',
    postsBreadcrumb: '記事',
    dateLocale: 'ja-JP',
  },
  zh: {
    lang: 'zh',
    hreflang: 'zh-CN',
    ogLocale: 'zh_CN',
    blogPath: '/zh/blog',
    imageAltSuffix: '代表图片',
    toc: '目录',
    recommendations: '推荐文章',
    previous: '上一篇',
    next: '下一篇',
    postsBreadcrumb: '文章',
    dateLocale: 'zh-CN',
  },
};
const supportedLocales = Object.keys(localePaths);
const defaultAuthor = 'Corca Team';
const defaultCover = 'assets/editorial-cover.jpg';
const blogIndexLabels = {
  ko: {
    description: 'Corca가 AI 제품, 워크플로, 팀 운영에서 배운 내용을 기록하는 공식 블로그입니다.',
    heroSub: '기술 발전의 혜택을 모두가 누리게 하여 인류 문명의 발전에 기여한다.',
    lead: 'Corca의 기술, AI 제품, 개발 조직, 문화에 대한 이야기를 들려드려요.',
    topicFilter: '주제별 글 필터',
    latest: '최신 글',
    recent: '최근 읽은 글',
    saved: '저장한 글',
    save: '저장',
    savePost: '글 저장',
    back: '목록으로',
    share: '공유',
    shareAndSave: '공유와 보관',
    copyLink: '링크 복사',
    sharePost: '공유하기',
    readingSettings: '읽기 설정',
    searchAndFilter: '글 검색 및 필터',
    search: '검색',
    searchPlaceholder: '제목, 키워드, 주제',
    clearSearch: '검색 지우기',
    sort: '정렬',
    newest: '최신순',
    oldest: '오래된순',
    title: '제목순',
    loading: '글 목록을 불러오는 중',
    page: '글 페이지',
    empty: '조건에 맞는 글이 없습니다.',
    fallback: 'JavaScript 없이 볼 수 있는 글 목록입니다.',
    aboutEyebrow: '블로그 소개',
    aboutTitle: '제품을 만드는 과정 자체를 기록합니다',
    aboutCopy:
      'Corca Blog는 회사의 공식 기록 공간입니다. 제품 의사결정, AI 워크플로, 팀 운영에서 얻은 배움을 독자가 바로 이해할 수 있는 글로 정리합니다.',
    aboutProductTitle: '제품 노트',
    aboutProductCopy: 'AI 제품을 설계하고 운영하며 마주친 문제와 선택을 기록합니다.',
    aboutWorkflowTitle: '워크플로 에세이',
    aboutWorkflowCopy: '반복 가능한 업무 흐름, 자동화, 리서치 방식을 공유합니다.',
    aboutCompanyTitle: '회사 생각',
    aboutCompanyCopy: 'Corca가 중요하게 보는 원칙과 일하는 방식을 공개합니다.',
  },
  en: {
    description:
      'The official Corca blog for lessons from AI products, workflows, and team operations.',
    heroSub:
      'Contributing to human progress by making the benefits of technology available to everyone.',
    lead: 'Stories about Corca technology, AI products, engineering teams, and culture.',
    topicFilter: 'Filter posts by topic',
    latest: 'Latest post',
    recent: 'Recently read posts',
    saved: 'Saved posts',
    save: 'Save',
    savePost: 'Save article',
    back: 'Back to list',
    share: 'Share',
    shareAndSave: 'Share and save',
    copyLink: 'Copy link',
    sharePost: 'Share',
    readingSettings: 'Reading settings',
    searchAndFilter: 'Search and filter posts',
    search: 'Search',
    searchPlaceholder: 'Title, keyword, topic',
    clearSearch: 'Clear search',
    sort: 'Sort',
    newest: 'Newest',
    oldest: 'Oldest',
    title: 'Title',
    loading: 'Loading posts',
    page: 'Post pages',
    empty: 'No posts match these conditions.',
    fallback: 'Posts available without JavaScript.',
    aboutEyebrow: 'About the blog',
    aboutTitle: 'We document how Corca builds products',
    aboutCopy:
      'Corca Blog is the company’s official record for product decisions, AI workflows, and operating lessons written so readers can understand and apply them quickly.',
    aboutProductTitle: 'Product notes',
    aboutProductCopy:
      'Problems and choices we encounter while designing and operating AI products.',
    aboutWorkflowTitle: 'Workflow essays',
    aboutWorkflowCopy:
      'Repeatable workflows, automation patterns, and research practices from our team.',
    aboutCompanyTitle: 'Company thinking',
    aboutCompanyCopy: 'The principles and working methods Corca chooses to share publicly.',
  },
  ja: {
    description: 'AI製品、ワークフロー、チーム運営から得た学びを記録するCorca公式ブログです。',
    heroSub: '技術発展の恩恵をすべての人が享受できるようにし、人類文明の発展に貢献します。',
    lead: 'Corcaの技術、AI製品、開発組織、カルチャーについてお届けします。',
    topicFilter: 'トピック別に記事を絞り込む',
    latest: '最新記事',
    recent: '最近読んだ記事',
    saved: '保存した記事',
    save: '保存',
    savePost: '記事を保存',
    back: '一覧へ戻る',
    share: '共有',
    shareAndSave: '共有と保存',
    copyLink: 'リンクをコピー',
    sharePost: '共有する',
    readingSettings: '読み方設定',
    searchAndFilter: '記事の検索とフィルター',
    search: '検索',
    searchPlaceholder: 'タイトル、キーワード、トピック',
    clearSearch: '検索をクリア',
    sort: '並び替え',
    newest: '新しい順',
    oldest: '古い順',
    title: 'タイトル順',
    loading: '記事一覧を読み込み中',
    page: '記事ページ',
    empty: '条件に一致する記事がありません。',
    fallback: 'JavaScriptなしで表示できる記事一覧です。',
    aboutEyebrow: 'ブログについて',
    aboutTitle: 'Corcaのプロダクトづくりを記録します',
    aboutCopy:
      'Corca Blogは会社の公式な記録の場です。プロダクトの意思決定、AIワークフロー、チーム運営から得た学びを、読者がすぐ理解できる記事として整理します。',
    aboutProductTitle: 'プロダクトノート',
    aboutProductCopy: 'AIプロダクトを設計・運用する中で向き合った課題と選択を記録します。',
    aboutWorkflowTitle: 'ワークフローエッセイ',
    aboutWorkflowCopy: '再現可能な仕事の流れ、自動化、リサーチの方法を共有します。',
    aboutCompanyTitle: '会社の考え',
    aboutCompanyCopy: 'Corcaが大切にしている原則と働き方を公開します。',
  },
  zh: {
    description: 'Corca 官方博客，记录 AI 产品、工作流和团队运营中的经验。',
    heroSub: '让每个人都能享受技术发展的成果，并为人类文明进步作出贡献。',
    lead: '分享 Corca 的技术、AI 产品、工程团队和文化故事。',
    topicFilter: '按主题筛选文章',
    latest: '最新文章',
    recent: '最近阅读',
    saved: '已保存文章',
    save: '保存',
    savePost: '保存文章',
    back: '返回列表',
    share: '分享',
    shareAndSave: '分享与保存',
    copyLink: '复制链接',
    sharePost: '分享',
    readingSettings: '阅读设置',
    searchAndFilter: '搜索和筛选文章',
    search: '搜索',
    searchPlaceholder: '标题、关键词、主题',
    clearSearch: '清除搜索',
    sort: '排序',
    newest: '最新',
    oldest: '最早',
    title: '标题',
    loading: '正在加载文章',
    page: '文章分页',
    empty: '没有符合条件的文章。',
    fallback: '无需 JavaScript 也可浏览的文章列表。',
    aboutEyebrow: '关于博客',
    aboutTitle: '记录 Corca 打造产品的过程',
    aboutCopy:
      'Corca Blog 是公司的官方记录空间，用清晰的文章整理产品决策、AI 工作流和团队运营中的经验。',
    aboutProductTitle: '产品笔记',
    aboutProductCopy: '记录我们设计和运营 AI 产品时遇到的问题与选择。',
    aboutWorkflowTitle: '工作流文章',
    aboutWorkflowCopy: '分享可复用的工作流、自动化方式和研究方法。',
    aboutCompanyTitle: '公司思考',
    aboutCompanyCopy: '公开 Corca 重视的原则和工作方式。',
  },
};

const payload = readPayload();
const action = String(payload.action || '')
  .trim()
  .toLowerCase();

if (action === 'upsert') {
  await upsertPost(payload);
} else if (action === 'delete') {
  await deletePost(payload);
} else if (action === 'sync') {
  console.log('Syncing existing blog post sources.');
} else {
  fail('ADMIN_POST_CHANGE action must be upsert, delete, or sync.');
}

const postRecordsByLocale = await syncPostIndex();
await renderAllStaticPosts(postRecordsByLocale);
await renderBlogIndexPages(postRecordsByLocale);

async function upsertPost(value) {
  const format = normalizeFormat(value.format);
  const content = decodeContent(value.contentBase64 || value.content || '');
  const metadata = normalizeMetadata(value.metadata || {});
  const slug = normalizeSlug(value.slug || metadata.slug || metadata.title || '');

  if (!slug) fail('Admin post upsert requires a slug or title.');
  if (!content.trim()) fail('Admin post upsert requires content.');

  const parsed = format === 'html' ? parsePostSource(content, `${slug}.html`) : null;
  const articleHtml = format === 'markdown' ? markdownToHtml(content) : parsed.articleHtml;
  const sourceName = basename(String(value.fileName || ''), extname(String(value.fileName || '')));
  const title = requiredString(
    metadata.title || parsed?.metadata.title || markdownTitle(content) || sourceName,
    'title',
  );
  const description = trimDescription(
    metadata.description || parsed?.metadata.description || summarizeMarkdown(content) || title,
  );
  const tags = normalizePostTags(metadata.tags || parsed?.metadata.tags || '코르카', {
    title,
    description,
    slug,
    content: articleHtml,
  });
  const uploadedCover = await writeCoverImage(value, slug);
  await writeBodyImages(value, slug);
  await deleteBodyImages(value, slug);
  const post = {
    ...parsed?.metadata,
    title,
    description,
    date: normalizeDate(metadata.date || parsed?.metadata.date || todayInTimeZone('Asia/Seoul')),
    tags,
    author: String(metadata.author || parsed?.metadata.author || defaultAuthor).trim(),
    cover:
      uploadedCover || normalizeCover(metadata.cover || parsed?.metadata.cover || defaultCover),
    language: normalizeLanguage(metadata.language || parsed?.metadata.language || 'ko'),
    coverAlt: String(metadata.coverAlt || parsed?.metadata.coverAlt || '').trim(),
    section: String(metadata.section || parsed?.metadata.section || tags[0] || '').trim(),
    wordCount: estimateWordCount(articleHtml),
  };

  if (format === 'markdown') {
    post.sourceFormat = 'markdown';
    post.sourceMarkdown = content.trim();
  }

  await mkdir(sourcesDir, { recursive: true });
  await writeFile(join(sourcesDir, `${slug}.html`), renderPostSource(post, articleHtml));
  console.log(`Admin ${format} post upserted: public/blog/admin/post-sources/${slug}.html`);
}

async function writeCoverImage(value, slug) {
  const encoded = String(value.coverImageBase64 || '').trim();
  if (!encoded) return '';

  const buffer = Buffer.from(encoded, 'base64');
  if (!buffer.length || buffer.length > 70000) {
    fail('Admin cover image must be a non-empty image under 70KB after encoding.');
  }

  const extension = normalizeImageExtension(value.coverImageFileName || value.coverImageMime || '');
  if (!extension) fail('Admin cover image must be jpg, png, or webp.');

  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  const filename = `${slug}-${hash}.${extension}`;
  await mkdir(adminAssetsDir, { recursive: true });
  await writeFile(join(adminAssetsDir, filename), buffer);
  return `assets/admin-posts/${filename}`;
}

async function writeBodyImages(value, slug) {
  const images = Array.isArray(value.bodyImages) ? value.bodyImages : [];
  for (const image of images) {
    const encoded = String(image?.contentBase64 || '').trim();
    const fileName = normalizeAdminImageFileName(image?.fileName, slug);
    if (!encoded || !fileName) fail('Admin body image payload is invalid.');

    const buffer = Buffer.from(encoded, 'base64');
    if (!buffer.length || buffer.length > 90000) {
      fail('Admin body image must be a non-empty image under 90KB after encoding.');
    }

    const extension = normalizeImageExtension(fileName || image?.mime || '');
    if (!extension) fail('Admin body image must be jpg, png, or webp.');

    await mkdir(adminAssetsDir, { recursive: true });
    await writeFile(join(adminAssetsDir, fileName), buffer);
  }
}

async function deleteBodyImages(value, slug) {
  const paths = Array.isArray(value.deleteBodyImagePaths) ? value.deleteBodyImagePaths : [];
  for (const path of paths) {
    const normalizedPath = String(path || '').trim();
    const fileName = normalizedPath.split('/').pop() || '';
    if (
      !normalizedPath.startsWith(`assets/admin-posts/${slug}-`) ||
      !normalizeAdminImageFileName(fileName, slug)
    ) {
      fail(`Unsafe admin body image delete path: ${normalizedPath}`);
    }
    assertSafeRelativePath(normalizedPath, 'body image', 'assets/admin-posts/');
    await rm(join(blogRoot, normalizedPath), { force: true });
  }
}

async function deletePost(value) {
  const slug = normalizeSlug(value.slug || '');
  if (!slug) fail('Admin post delete requires a slug.');

  await rm(join(sourcesDir, `${slug}.html`), { force: true });
  await rm(join(postsDir, slug), { recursive: true, force: true });
  for (const locale of ['en', 'ja', 'zh']) {
    await rm(join(repoRoot, `public/${locale}/blog/posts/${slug}`), {
      recursive: true,
      force: true,
    });
  }
  console.log(`Admin post deleted: ${slug}`);
}

async function syncPostIndex() {
  await mkdir(postsDir, { recursive: true });
  const baseRecords = await readBasePostRecords();
  const postRecordsByLocale = await buildPostRecordsByLocale(baseRecords);

  for (const locale of supportedLocales) {
    const localePostsDir = join(repoRoot, localePaths[locale], 'posts');
    const localePosts = postRecordsByLocale.get(locale).map((record) => record.post);
    await mkdir(localePostsDir, { recursive: true });
    await writeFile(
      join(localePostsDir, 'index.json'),
      `${JSON.stringify(localePosts, null, 2)}\n`,
    );
  }
  console.log(
    `Synced ${baseRecords.length} posts into ${supportedLocales.length} locale post indexes.`,
  );
  return postRecordsByLocale;
}

async function readBasePostRecords() {
  const filenames = (await readdir(sourcesDir).catch(() => []))
    .filter((file) => file.endsWith('.html'))
    .sort((a, b) => a.localeCompare(b, 'ko'));
  const records = [];

  for (const filename of filenames) {
    const slug = filename.replace(/\.html$/, '');
    if (!/^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/.test(slug)) {
      fail(`Invalid slug from file name: public/blog/admin/post-sources/${filename}`);
    }

    const source = await readFile(join(sourcesDir, filename), 'utf8');
    const parsed = parsePostSource(source, filename);
    const title = requiredString(parsed.metadata.title, 'title');
    const description = trimDescription(requiredString(parsed.metadata.description, 'description'));
    const tags = normalizePostTags(parsed.metadata.tags || '코르카', {
      title,
      description,
      slug,
      content: parsed.articleHtml,
    });
    const cover = resolvePostCover(parsed.metadata.cover, parsed.articleHtml);
    const post = {
      slug,
      title,
      description,
      date: normalizeDate(requiredString(parsed.metadata.date, 'date')),
      tags,
      author: String(parsed.metadata.author || defaultAuthor).trim(),
      cover,
      wordCount: normalizeWordCount(parsed.metadata.wordCount, parsed.articleHtml),
      language: normalizeLanguage(parsed.metadata.language || 'ko'),
      coverAlt: String(parsed.metadata.coverAlt || '').trim(),
      section: String(parsed.metadata.section || tags[0] || '').trim(),
      searchText: stripTags(parsed.articleHtml),
    };

    validatePost(post);
    records.push({
      post,
      articleHtml: parsed.articleHtml,
      source,
      sourcePath: join(sourcesDir, filename),
    });
  }

  return sortPostRecords(records);
}

async function buildPostRecordsByLocale(baseRecords) {
  const recordsByLocale = new Map();
  for (const locale of supportedLocales) {
    const records = [];
    for (const baseRecord of baseRecords) {
      records.push(await localizePostRecord(baseRecord, locale));
    }
    recordsByLocale.set(locale, sortPostRecords(records));
  }
  return recordsByLocale;
}

async function localizePostRecord(baseRecord, locale) {
  if (locale === 'ko') {
    return {
      ...baseRecord,
      post: { ...baseRecord.post, language: 'ko' },
    };
  }

  const translationPath = join(translationsDir, locale, `${baseRecord.post.slug}.html`);
  const source = await readFile(translationPath, 'utf8').catch(() => '');
  if (!source.trim()) {
    return {
      ...baseRecord,
      post: { ...baseRecord.post, language: locale },
    };
  }

  const parsed = parsePostSource(source, relative(repoRoot, translationPath));
  const title = requiredString(parsed.metadata.title || baseRecord.post.title, 'title');
  const description = trimDescription(
    requiredString(parsed.metadata.description || baseRecord.post.description, 'description'),
  );
  const tags = normalizePostTags(parsed.metadata.tags || baseRecord.post.tags, {
    title,
    description,
    slug: baseRecord.post.slug,
    content: parsed.articleHtml,
  });
  const post = {
    ...baseRecord.post,
    title,
    description,
    tags: localizePostTags(tags, locale),
    author: String(parsed.metadata.author || baseRecord.post.author || defaultAuthor).trim(),
    cover: normalizeCover(parsed.metadata.cover || baseRecord.post.cover),
    wordCount: normalizeWordCount(parsed.metadata.wordCount, parsed.articleHtml),
    language: locale,
    coverAlt: String(parsed.metadata.coverAlt || baseRecord.post.coverAlt || '').trim(),
    section: localizePostTopic(
      String(parsed.metadata.section || tags[0] || baseRecord.post.section || '').trim(),
      locale,
    ),
    searchText: stripTags(parsed.articleHtml),
  };
  validatePost(post);
  return { post, articleHtml: parsed.articleHtml, source, sourcePath: translationPath };
}

async function renderAllStaticPosts(postRecordsByLocale) {
  const availableLocalesBySlug = groupLocalesBySlug(postRecordsByLocale);
  for (const locale of supportedLocales) {
    const records = postRecordsByLocale.get(locale) || [];
    const localePosts = records.map((record) => record.post);
    const postBySlug = new Map(localePosts.map((item) => [item.slug, item]));
    for (const record of records) {
      const post = record.post;
      const outputDir = join(repoRoot, localePaths[locale], 'posts', post.slug);
      const html = renderStaticPostPage(
        post,
        prepareArticleHtml(record.articleHtml),
        localePosts,
        postBySlug,
        locale,
        availableLocalesBySlug,
      );
      await mkdir(outputDir, { recursive: true });
      await writeFile(join(outputDir, 'index.html'), html);
    }
  }
  console.log(
    `Rendered ${postRecordsByLocale.get('ko').length} static blog posts into ${supportedLocales.length} locales.`,
  );
}

async function renderBlogIndexPages(postRecordsByLocale) {
  for (const locale of supportedLocales) {
    const file = join(repoRoot, localePaths[locale], 'index.html');
    const labels = blogIndexLabels[locale] || blogIndexLabels.ko;
    const records = postRecordsByLocale.get(locale) || [];
    let html = await readFile(file, 'utf8').catch(() => '');
    if (!html) continue;

    html = html
      .replace(/<html lang="[^"]*"/, `<html lang="${localeLabels[locale].lang}"`)
      .replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${escapeAttribute(labels.description)}">`,
      )
      .replace(
        /<meta property="og:description" content="[^"]*">/,
        `<meta property="og:description" content="${escapeAttribute(labels.description)}">`,
      )
      .replace(
        /<meta property="og:locale" content="[^"]*">/,
        `<meta property="og:locale" content="${localeLabels[locale].ogLocale}">`,
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*">/,
        `<meta name="twitter:description" content="${escapeAttribute(labels.description)}">`,
      )
      .replace(/"description":\s*"[^"]*"/, `"description": ${JSON.stringify(labels.description)}`)
      .replace(
        /"inLanguage":\s*"[^"]*"/,
        `"inLanguage": ${JSON.stringify(localeLabels[locale].hreflang)}`,
      )
      .replace(
        /<span class="hero-title-sub">[\s\S]*?<\/span>/,
        `<span class="hero-title-sub">${escapeHtml(labels.heroSub)}</span>`,
      )
      .replace(/<p class="lead">[\s\S]*?<\/p>/, `<p class="lead">${escapeHtml(labels.lead)}</p>`)
      .replace(
        /(<div id="heroTopicFilters"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.topicFilter)}$2`,
      )
      .replace(
        /(<section id="featuredPost"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.latest)}$2`,
      )
      .replace(
        /(<section id="recentReads"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.recent)}$2`,
      )
      .replace(
        /(<section id="savedReads"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.saved)}$2`,
      )
      .replace(
        /(<button id="backButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.back)}$2`,
      )
      .replace(
        /(<button id="currentPostSaveButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.save)}$2`,
      )
      .replace(/aria-label="공유와 보관"/g, `aria-label="${escapeAttribute(labels.shareAndSave)}"`)
      .replace(/(<summary>)공유(<\/summary>)/, `$1${escapeHtml(labels.share)}$2`)
      .replace(
        /(<button id="copyLinkButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.copyLink)}$2`,
      )
      .replace(
        /(<button id="sharePostButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.sharePost)}$2`,
      )
      .replace(
        /(<button id="downloadPostButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.savePost)}$2`,
      )
      .replace(/aria-label="읽기 설정"/g, `aria-label="${escapeAttribute(labels.readingSettings)}"`)
      .replace(
        /(<details class="reading-settings">\s*<summary>)[\s\S]*?(<\/summary>)/,
        `$1${escapeHtml(labels.readingSettings)}$2`,
      )
      .replace(
        /(<aside id="tableOfContents"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(localeLabels[locale].toc)}$2`,
      )
      .replace(
        /(<section class="toolbar"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.searchAndFilter)}$2`,
      )
      .replace(
        /(<label class="search-box">\s*<span>)[\s\S]*?(<\/span>)/,
        `$1${escapeHtml(labels.search)}$2`,
      )
      .replace(
        /(<input id="searchInput"[^>]*placeholder=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.searchPlaceholder)}$2`,
      )
      .replace(
        /(<button id="clearSearchButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.clearSearch)}$2`,
      )
      .replace(
        /(<button id="savedOnlyButton"[^>]*>)[\s\S]*?(<\/button>)/,
        `$1${escapeHtml(labels.saved)} 0$2`,
      )
      .replace(
        /(<label class="sort-box">\s*<span>)[\s\S]*?(<\/span>)/,
        `$1${escapeHtml(labels.sort)}$2`,
      )
      .replace(/(<option value="newest">)[\s\S]*?(<\/option>)/, `$1${escapeHtml(labels.newest)}$2`)
      .replace(/(<option value="oldest">)[\s\S]*?(<\/option>)/, `$1${escapeHtml(labels.oldest)}$2`)
      .replace(/(<option value="title">)[\s\S]*?(<\/option>)/, `$1${escapeHtml(labels.title)}$2`)
      .replace(
        /(<div id="postList"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.loading)}$2`,
      )
      .replace(
        /(<nav id="postPagination"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(labels.page)}$2`,
      )
      .replace(/(<p id="emptyState"[^>]*>)[\s\S]*?(<\/p>)/, `$1${escapeHtml(labels.empty)}$2`)
      .replace(/<noscript>[\s\S]*?<\/noscript>/, renderIndexNoscript(records, locale, labels))
      .replace(
        /<section id="archive"[\s\S]*?(?=\n\s*<section id="about")/,
        `<section id="archive" class="archive-section" aria-label="${escapeAttribute(labels.page)}" hidden></section>`,
      )
      .replace(/<section id="about"[\s\S]*?<\/section>/, renderIndexAbout(labels));

    await writeFile(file, html);
  }
}

function renderIndexAbout(labels) {
  return `<section id="about" class="about-section" aria-labelledby="aboutTitle">
        <div>
          <p class="eyebrow">${escapeHtml(labels.aboutEyebrow)}</p>
          <h2 id="aboutTitle">${escapeHtml(labels.aboutTitle)}</h2>
          <p>${escapeHtml(labels.aboutCopy)}</p>
        </div>
        <div class="about-grid">
          <article>
            <strong>${escapeHtml(labels.aboutProductTitle)}</strong>
            <p>${escapeHtml(labels.aboutProductCopy)}</p>
          </article>
          <article>
            <strong>${escapeHtml(labels.aboutWorkflowTitle)}</strong>
            <p>${escapeHtml(labels.aboutWorkflowCopy)}</p>
          </article>
          <article>
            <strong>${escapeHtml(labels.aboutCompanyTitle)}</strong>
            <p>${escapeHtml(labels.aboutCompanyCopy)}</p>
          </article>
        </div>
      </section>`;
}

function renderIndexNoscript(records, locale, labels) {
  const cards = records
    .map(
      ({ post }) => `            <article class="post-card">
              <a href="${escapeAttribute(staticPostPath(post, locale))}">
                <img src="${escapeAttribute(`/blog/${post.cover}`)}" alt="" width="1672" height="941" loading="lazy" decoding="async">
                <div class="post-card-body">
                  <h3>${escapeHtml(post.title)}</h3>
                  <p>${escapeHtml(post.description)}</p>
                  <div class="meta"><time datetime="${post.date}">${formatPostDate(post.date, locale)}</time> | ${escapeHtml(post.author)}</div>
                </div>
              </a>
            </article>`,
    )
    .join('');
  return `<noscript>
          <p class="filter-summary static-fallback-note">${escapeHtml(labels.fallback)}</p>
          <div class="post-list static-fallback">
${cards}
          </div>
        </noscript>`;
}

function groupLocalesBySlug(postRecordsByLocale) {
  const groups = new Map();
  for (const [locale, records] of postRecordsByLocale) {
    for (const record of records) {
      const locales = groups.get(record.post.slug) || new Set();
      locales.add(locale);
      groups.set(record.post.slug, locales);
    }
  }
  return groups;
}

function staticPostPath(post, locale) {
  return `${localeLabels[locale].blogPath}/posts/${encodeURIComponent(post.slug)}`;
}

function localizePostTags(tags, locale) {
  return tags.map((tag) => localizePostTopic(tag, locale));
}

function localizePostTopic(value, locale) {
  if (locale === 'ko') return value;
  const text = String(value || '').trim();
  const topicMap = {
    AX: 'AX',
    Tech: 'Tech',
    문라이트: 'Moonlight',
    Moonlight: 'Moonlight',
    트레이스: 'Trace',
    Trace: 'Trace',
    크라켄: 'Kraken',
    Kraken: 'Kraken',
    씰: 'Ceal',
    Ceal: 'Ceal',
    마진: 'Margin',
    Margin: 'Margin',
    코르카: 'Corca',
    Corca: 'Corca',
    제품: 'Product',
    Product: 'Product',
  };
  return topicMap[text] || text;
}

function renderStaticPostPage(
  post,
  articleHtml,
  posts,
  postBySlug,
  locale,
  availableLocalesBySlug,
) {
  const shell = getBlogShell(locale, post.slug, availableLocalesBySlug);
  const coverUrl = absoluteBlogAsset(post.cover);
  const canonical = `https://www.corca.ai${staticPostPath(post, locale)}`;
  const publishedTime = `${post.date}T00:00:00.000Z`;
  const toc = tableOfContents(articleHtml);
  const recommendations = recommendationPosts(post, posts);
  const pageNav = adjacentPostNav(post, posts, postBySlug, locale);
  const articleSection = post.section || post.tags[0] || '코르카';
  const imageAlt = post.coverAlt || `${post.title} ${localeLabels[locale].imageAltSuffix}`;

  return `<!doctype html>
<html lang="${localeLabels[locale].lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(post.title)} | Corca Blog</title>
    <meta name="description" content="${escapeAttribute(post.description)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${escapeAttribute(post.title)}">
    <meta property="og:description" content="${escapeAttribute(post.description)}">
    <meta property="og:site_name" content="Corca Blog">
    <meta property="og:locale" content="${localeLabels[locale].ogLocale}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${coverUrl}">
    <meta property="og:image:secure_url" content="${coverUrl}">
    <meta property="og:image:alt" content="${escapeAttribute(imageAlt)}">
    <meta property="og:url" content="${canonical}">
    <meta property="article:published_time" content="${publishedTime}">
    <meta property="article:modified_time" content="${publishedTime}">
    <meta property="article:author" content="${escapeAttribute(post.author)}">
    <meta property="article:section" content="${escapeAttribute(articleSection)}">
${post.tags.map((tag) => `    <meta property="article:tag" content="${escapeAttribute(tag)}">`).join('\n')}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttribute(post.title)}">
    <meta name="twitter:description" content="${escapeAttribute(post.description)}">
    <meta name="twitter:image" content="${coverUrl}">
    <meta name="twitter:image:alt" content="${escapeAttribute(imageAlt)}">
    <meta name="theme-color" content="#ffffff">
    <link rel="alternate" type="application/rss+xml" title="Corca Blog RSS" href="/blog/rss.xml">
    <link rel="alternate" type="application/feed+json" title="Corca Blog JSON Feed" href="/blog/feed.json">
    <script type="application/ld+json" data-corca-managed="post-structured-data">${JSON.stringify(postStructuredData(post, coverUrl, canonical, articleSection, locale))}</script>
    <link rel="icon" href="/blog/assets/favicon.png" type="image/png">
    <link rel="stylesheet" href="/_astro/BaseLayout.BXVN9hzb.css">
    <link rel="stylesheet" href="/blog/styles.css">
  </head>
  <body>${shell.beforeMain}<main id="main" tabindex="-1">
      <section class="post-view static-post-view">
        <article id="article" class="article static-article">
          <header class="article-header">
            <h1>${escapeHtml(post.title)}</h1>
            <p>${escapeHtml(post.description)}</p>
            <div class="article-meta">
              <span class="meta-item"><time datetime="${post.date}">${formatPostDate(post.date, locale)}</time></span>
              <span class="meta-item">${escapeHtml(post.author)}</span>
            </div>
          </header>
          <div class="article-content">
${articleHtml}
          </div>
        </article>
        <aside class="toc static-toc" aria-label="${escapeAttribute(localeLabels[locale].toc)}">
          <section class="toc-section" aria-label="${escapeAttribute(localeLabels[locale].toc)}">
            <strong>${escapeHtml(localeLabels[locale].toc)}</strong>
            ${toc}
          </section>
          <section class="toc-recommendations" aria-label="${escapeAttribute(localeLabels[locale].recommendations)}">
            <strong>${escapeHtml(localeLabels[locale].recommendations)}</strong>
            <div class="toc-recommendation-list">
${recommendations.map((item) => renderRecommendation(item, locale)).join('')}
            </div>
          </section>
        </aside>
        ${pageNav}
      </section>
    </main>${shell.afterMain}</body>
</html>
`;
}

function getBlogShell(locale, slug, availableLocalesBySlug) {
  const file = join(repoRoot, localePaths[locale], 'index.html');
  const html = readFileSyncText(file);
  const bodyStart = html.indexOf('<body>');
  const mainStart = html.indexOf('<main id="main"');
  const bodyEnd = html.indexOf('</body>');
  const footerStart = bodyEnd < 0 ? -1 : html.lastIndexOf('<footer', bodyEnd);
  const mainClose = footerStart < 0 ? -1 : html.lastIndexOf('</main>', footerStart);
  if (bodyStart < 0 || mainStart < 0 || mainClose < 0 || bodyEnd < 0) {
    fail(`Could not locate blog shell in ${relative(repoRoot, file)}`);
  }

  let beforeMain = html.slice(bodyStart + '<body>'.length, mainStart);
  let afterMain = html.slice(mainClose + '</main>'.length, bodyEnd);
  afterMain = afterMain.replace(/<script type="module" src="\/blog\/app\.js"><\/script>/g, '');
  beforeMain = localizeLanguageLinks(beforeMain, locale, slug, availableLocalesBySlug);
  return { beforeMain, afterMain };
}

function readFileSyncText(file) {
  return readFileSync(file, 'utf8');
}

function localizeLanguageLinks(html, locale, slug, availableLocalesBySlug) {
  const availableLocales = availableLocalesBySlug?.get(slug) || new Set([locale]);
  let next = html;
  for (const code of supportedLocales) {
    const path = availableLocales.has(code)
      ? staticPostPath({ slug }, code)
      : localeLabels[code].blogPath;
    next = next.replace(
      new RegExp(`href="[^"]+" hreflang="${localeLabels[code].hreflang}"`, 'g'),
      `href="${path}" hreflang="${localeLabels[code].hreflang}"`,
    );
  }
  return next.replace(/<html lang="[^"]*">/, `<html lang="${localeLabels[locale].lang}">`);
}

function postStructuredData(post, coverUrl, canonical, section, locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: coverUrl,
        thumbnailUrl: coverUrl,
        url: canonical,
        keywords: post.tags,
        articleSection: section,
        wordCount: post.wordCount,
        datePublished: post.date,
        dateModified: post.date,
        author: { '@type': 'Organization', name: post.author },
        publisher: { '@type': 'Organization', name: 'Corca' },
        inLanguage: localeLabels[locale].hreflang,
        timeRequired: `PT${Math.max(1, Math.ceil(post.wordCount / 500))}M`,
        isPartOf: { '@type': 'Blog', name: 'Corca Blog', url: 'https://www.corca.ai/blog/' },
        mainEntityOfPage: canonical,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Corca Blog',
            item: 'https://www.corca.ai/blog/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: localeLabels[locale].postsBreadcrumb,
            item: 'https://www.corca.ai/blog/#posts',
          },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ],
  };
}

function recommendationPosts(post, posts) {
  return posts
    .filter((item) => item.slug !== post.slug)
    .sort((a, b) => {
      const aScore = sharedTagScore(post, a);
      const bScore = sharedTagScore(post, b);
      return bScore - aScore || new Date(b.date) - new Date(a.date);
    })
    .slice(0, 3);
}

function sharedTagScore(a, b) {
  const tags = new Set(a.tags || []);
  return (b.tags || []).filter((tag) => tags.has(tag)).length;
}

function renderRecommendation(post, locale) {
  return `              <a class="toc-recommendation" href="${escapeAttribute(staticPostPath(post, locale))}">
                <span>${escapeHtml(post.title)}</span>
                <small><time datetime="${post.date}">${formatPostDate(post.date, locale)}</time> · ${escapeHtml(post.author)}</small>
              </a>`;
}

function adjacentPostNav(post, posts, postBySlug, locale) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  const previous = index >= 0 ? posts[index + 1] : null;
  const next = index > 0 ? posts[index - 1] : null;
  const cards = [];
  if (previous && postBySlug.has(previous.slug)) {
    cards.push(
      renderAdjacentCard(
        previous,
        locale,
        localeLabels[locale].previous,
        '←',
        'post-pagination-previous',
      ),
    );
  }
  if (next && postBySlug.has(next.slug)) {
    cards.push(
      renderAdjacentCard(next, locale, localeLabels[locale].next, '→', 'post-pagination-next'),
    );
  }
  return cards.length
    ? `<nav class="post-pagination" aria-label="글 이동">\n${cards.join('')}\n        </nav>`
    : '';
}

function renderAdjacentCard(post, locale, label, cue, className) {
  return `        <a class="related-card post-pagination-card ${className}" href="${escapeAttribute(staticPostPath(post, locale))}" aria-label="${label}: ${escapeAttribute(post.title)}">
          <span class="related-cue" aria-hidden="true">${cue}</span>
          <span class="related-meta">${label} · <strong>${escapeHtml(post.section || post.tags[0] || '코르카')}</strong> · <time datetime="${post.date}">${formatPostDate(post.date, locale)}</time></span>
          <strong>${escapeHtml(post.title)}</strong>
        </a>`;
}

function tableOfContents(articleHtml) {
  const items = [...articleHtml.matchAll(/<h2\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => ({
      id: match[1],
      text: stripTags(match[2]),
    }))
    .filter((item) => item.id && item.text);
  if (!items.length) return '<ol></ol>';
  return `<ol>\n${items.map((item) => `              <li><a href="#${escapeAttribute(item.id)}">${escapeHtml(item.text)}</a></li>`).join('\n')}\n            </ol>`;
}

function prepareArticleHtml(html) {
  let headingIndex = 0;
  return rewriteBlogAssetUrls(String(html || '').trim()).replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs, body) => {
      if (/\sid=/.test(attrs)) return match;
      headingIndex += 1;
      const id = `section-${headingIndex}`;
      const text = stripTags(body);
      return `<h2${attrs} id="${id}">${body}<a class="heading-anchor" href="#${id}" tabindex="-1" aria-label="${escapeAttribute(text)} 섹션 링크"></a></h2>`;
    },
  );
}

function parsePostSource(html, relativePath) {
  const source = String(html || '');
  const embeddedMetadata = parseEmbeddedPostMetadata(source, relativePath);
  const publicHtml = stripPostMetadata(source);
  const articleHtml =
    embeddedMetadata?.sourceFormat === 'markdown' && embeddedMetadata.sourceMarkdown
      ? markdownToHtml(embeddedMetadata.sourceMarkdown)
      : extractDocumentArticle(publicHtml) || publicHtml;
  return {
    articleHtml,
    metadata: embeddedMetadata || inferDocumentMetadata(source),
    publicHtml,
  };
}

function parseEmbeddedPostMetadata(html, relativePath) {
  const match = String(html || '').match(/^\s*<!--\s*corca-post\s*([\s\S]*?)-->/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Post metadata must be valid JSON in ${relativePath}: ${error.message}`);
  }
}

function stripPostMetadata(html) {
  return String(html || '').replace(/^\s*<!--\s*corca-post\s*[\s\S]*?-->\s*/i, '');
}

function inferDocumentMetadata(html) {
  const source = String(html || '');
  const articleHtml = extractDocumentArticle(source);
  const title = firstPresent([
    metaContent(source, ({ property }) => property === 'og:title'),
    elementText(source, 'title'),
    elementText(articleHtml, 'h1'),
    elementText(articleHtml, 'h2'),
  ]);
  const description = firstPresent([
    metaContent(source, ({ name }) => name === 'description'),
    metaContent(source, ({ property }) => property === 'og:description'),
    summarizeDescription(elementText(articleHtml, 'p')),
  ]);
  const date = normalizeDate(
    firstPresent([
      metaContent(source, ({ name }) => ['date', 'publish_date', 'published_time'].includes(name)),
      metaContent(source, ({ property }) => property === 'article:published_time'),
      timeDateTime(source),
      todayInTimeZone('Asia/Seoul'),
    ]),
  );
  const tags = normalizePostTags(
    [
      ...metaContents(source, ({ property }) => property === 'article:tag'),
      metaContent(source, ({ name }) => ['keywords', 'tags'].includes(name)),
    ]
      .filter(Boolean)
      .join(','),
    { title, description },
  );
  const author = firstPresent([
    metaContent(source, ({ name }) => name === 'author'),
    metaContent(source, ({ property }) => property === 'article:author'),
    defaultAuthor,
  ]);
  const cover = normalizeCover(
    firstPresent([
      metaContent(source, ({ property }) => property === 'og:image'),
      metaContent(source, ({ name }) => name === 'twitter:image'),
      findFirstArticleImage(articleHtml),
    ]),
  );

  return { title, description, date, tags, author, cover, language: 'ko' };
}

function renderPostSource(metadata, articleHtml) {
  const post = {
    title: String(metadata.title || '').trim(),
    description: String(metadata.description || '').trim(),
    date: String(metadata.date || '').trim(),
    tags: normalizePostTags(metadata.tags, {
      title: metadata.title,
      description: metadata.description,
    }),
    author: String(metadata.author || defaultAuthor).trim(),
    cover: normalizeCover(metadata.cover),
    language: normalizeLanguage(metadata.language || 'ko'),
  };
  if (metadata.coverAlt) post.coverAlt = String(metadata.coverAlt).trim();
  if (metadata.section) post.section = String(metadata.section).trim();
  if (metadata.wordCount) post.wordCount = Number(metadata.wordCount);
  if (metadata.sourceFormat === 'markdown' && metadata.sourceMarkdown) {
    post.sourceFormat = 'markdown';
    post.sourceMarkdown = String(metadata.sourceMarkdown).trim();
  }

  return `<!--
corca-post
${JSON.stringify(post, null, 2)}
-->
${String(articleHtml || '').trim()}
`;
}

function extractDocumentArticle(html) {
  const source = String(html || '');
  return (
    elementInnerHtml(source, 'article') ||
    elementInnerHtml(source, 'main') ||
    elementInnerHtml(source, 'body') ||
    stripPostMetadata(source)
  );
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const html = [];
  let paragraph = [];
  let list = [];
  let listTag = 'ul';
  let quote = [];
  let table = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      html.push(`<${listTag}>${list.map((item) => renderListItem(item)).join('')}</${listTag}>`);
      list = [];
      listTag = 'ul';
    }
  };
  const flushTable = () => {
    if (table.length) {
      html.push(renderMarkdownTable(table));
      table = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      const content = quote.join('\n').trim();
      if (content) {
        html.push(`<blockquote>${markdownToHtml(content)}</blockquote>`);
      }
      quote = [];
    }
  };
  const flushCode = () => {
    if (code.length) {
      html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      code = [];
    }
  };
  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushTable();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushTextBlocks();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!trimmed) {
      flushTextBlocks();
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushTextBlocks();
      html.push('<hr>');
      continue;
    }
    const linkCard = parseLinkCardMarker(trimmed);
    if (linkCard) {
      flushTextBlocks();
      html.push(renderLinkCard(linkCard));
      continue;
    }
    if (isMarkdownTableRow(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      table.push(trimmed);
      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushTextBlocks();
      html.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const nextTag = ordered ? 'ol' : 'ul';
      if (list.length && listTag !== nextTag) flushList();
      listTag = nextTag;
      list.push(unordered?.[1] || ordered?.[1] || '');
      continue;
    }
    const quoteItem = trimmed.match(/^>\s?(.*)$/);
    if (quoteItem) {
      flushParagraph();
      flushList();
      quote.push(quoteItem[1]);
      continue;
    }
    flushList();
    flushTable();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushTextBlocks();
  if (inCode) {
    flushCode();
  }
  return html.join('\n');
}

function renderListItem(item) {
  const task = String(item || '').match(/^\[( |x|X)]\s+(.+)$/);
  if (task) {
    const checked = task[1].toLowerCase() === 'x';
    return `<li class="task-list-item"><input type="checkbox" disabled${checked ? ' checked' : ''}> <span>${inlineMarkdown(task[2])}</span></li>`;
  }
  return `<li>${inlineMarkdown(item)}</li>`;
}

function isMarkdownTableRow(value) {
  return /^\|.+\|$/.test(value) && value.split('|').length > 2;
}

function renderMarkdownTable(rows) {
  const parsedRows = rows.map(parseMarkdownTableRow).filter((row) => row.length);
  if (!parsedRows.length) return '';
  const hasDivider = parsedRows[1]?.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
  const head = hasDivider ? parsedRows[0] : null;
  const bodyRows = hasDivider ? parsedRows.slice(2) : parsedRows;
  const headHtml = head
    ? `<thead><tr>${head.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead>`
    : '';
  const bodyHtml = `<tbody>${bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody>`;
  return `<table>${headHtml}${bodyHtml}</table>`;
}

function parseMarkdownTableRow(value) {
  return String(value || '')
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_match, alt, src) =>
        `<img src="${safeMarkdownUrl(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">`,
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, text, href) => `<a href="${safeMarkdownUrl(href)}">${text}</a>`,
    )
    .replace(
      /\{color=(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/color\}/g,
      '<span style="color: $1">$2</span>',
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/(^|[\s([{])_([^_\s][^_]*?)_(?=$|[\s.,!?;:)\]}])/g, '$1<em>$2</em>')
    .replace(/(^|[\s([{])\*([^*\s][^*]*?)\*(?=$|[\s.,!?;:)\]}])/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function parseLinkCardMarker(value) {
  const match = String(value || '').match(/^\{\{corca-link-card:([^}]+)\}\}$/);
  if (!match) {
    return null;
  }
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function renderLinkCard(card) {
  const url = String(card.url || '');
  if (!/^https?:\/\//i.test(url)) {
    return '';
  }
  const host = card.host || linkHost(url);
  const label = String(card.label || url).trim();
  return `<aside class="article-link-card"><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer"><span class="article-link-card-domain">${escapeHtml(host)}</span><strong>${escapeHtml(label)}</strong><span class="article-link-card-url">${escapeHtml(url)}</span></a></aside>`;
}

function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function safeMarkdownUrl(value) {
  const text = decodeHtml(value).trim();
  if (
    /^(https?:)?\/\//i.test(text) ||
    text.startsWith('assets/') ||
    text.startsWith('/assets/') ||
    text.startsWith('/blog/assets/') ||
    text.startsWith('#')
  ) {
    return escapeAttribute(text);
  }
  return '#';
}

function normalizePostTags(value, context = {}) {
  const tags = normalizeRawTags(value);
  const haystack = normalizeSearchText(
    [...tags, context.title, context.description, context.slug, context.content]
      .filter(Boolean)
      .join(' '),
  );
  const visible = pickTopic(tags, haystack);
  const normalized = [visible || '코르카'];
  if (
    tags.some((tag) => matchesAlias(tag, ['제품', 'product', 'products'])) ||
    matchesAlias(haystack, ['제품', 'product', 'products'])
  ) {
    normalized.push('제품');
  }
  if (
    ['문라이트', '트레이스', '크라켄', '씰', '마진'].includes(normalized[0]) &&
    !normalized.includes('제품')
  ) {
    normalized.push('제품');
  }
  return [...new Set(normalized)];
}

function pickTopic(tags, haystack) {
  const rules = [
    ['AX', ['ax', 'engineering', '엔지니어링', '개발', '워크플로', 'agent', '에이전트']],
    ['문라이트', ['moonlight', '문라이트', '논문', 'research', 'paper']],
    ['트레이스', ['trace', '트레이스', '일정', '캘린더', 'calendar', 'schedule']],
    ['크라켄', ['kraken', '크라켄']],
    ['씰', ['ceal', '씰', 'ceal-terview', 'locality']],
    ['마진', ['margin', '마진', 'ads', '광고', '리테일', 'retail']],
    ['코르카', ['corca', '코르카', '회사', '팀', '문화', '세미나', '채용', 'company', 'culture']],
  ];
  for (const tag of tags) {
    const rule = rules.find(([topic, aliases]) => topic === tag || matchesAlias(tag, aliases));
    if (rule) return rule[0];
  }
  const scored = rules
    .map(([topic, aliases]) => ({
      topic,
      score: aliases.filter((alias) => matchesAlias(haystack, [alias])).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.topic || '코르카';
}

function normalizeRawTags(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(raw.map((tag) => String(tag || '').trim()).filter(Boolean))];
}

function matchesAlias(value, aliases) {
  const normalizedValue = normalizeSearchText(value);
  return aliases.some((alias) => {
    const normalizedAlias = normalizeSearchText(alias);
    return normalizedValue === normalizedAlias || normalizedValue.includes(normalizedAlias);
  });
}

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[()_\-·:：,，;；/|]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function readPayload() {
  const raw = process.env.ADMIN_POST_CHANGE || '';
  if (!raw) fail('ADMIN_POST_CHANGE is required.');
  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`ADMIN_POST_CHANGE must be JSON: ${error.message}`);
  }
}

function normalizeMetadata(value) {
  return Object.fromEntries(
    Object.entries(value || {}).map(([key, item]) => [
      key,
      typeof item === 'string' ? item.trim() : item,
    ]),
  );
}

function normalizeFormat(value) {
  const format = String(value || '')
    .trim()
    .toLowerCase();
  if (format === 'markdown' || format === 'md') return 'markdown';
  if (format === 'html' || format === 'htm') return 'html';
  fail('Admin post format must be markdown or html.');
}

function decodeContent(value) {
  const text = String(value || '');
  if (!text) return '';
  return Buffer.from(text, 'base64').toString('utf8');
}

function normalizeImageExtension(value) {
  const text = String(value || '')
    .trim()
    .toLowerCase();
  const extension = text.match(/\.([a-z0-9]+)$/)?.[1] || text.split('/').pop() || '';
  if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
  if (extension === 'png' || extension === 'webp') return extension;
  return '';
}

function normalizeAdminImageFileName(value, slug) {
  const fileName = basename(String(value || '').trim());
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`^${escapedSlug}-[a-f0-9]{12}\\.(?:jpe?g|png|webp)$`, 'i').test(fileName)) {
    return '';
  }
  return fileName;
}

function requiredString(value, label) {
  const text = String(value || '').trim();
  if (!text) fail(`Admin post ${label} is required.`);
  return text;
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) fail('Admin post date must use YYYY-MM-DD.');
  return match[1];
}

function normalizeLanguage(value) {
  const text = String(value || '')
    .trim()
    .toLowerCase()
    .replace('_', '-');
  if (!text) return 'ko';
  if (text.startsWith('en')) return 'en';
  if (text.startsWith('ko') || text.startsWith('kr') || text === '한국어' || text === 'korean')
    return 'ko';
  if (text.startsWith('ja') || text.startsWith('jp')) return 'ja';
  if (text.startsWith('zh') || text.startsWith('cn')) return 'zh';
  return 'ko';
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function markdownTitle(markdown) {
  return (
    String(markdown || '')
      .match(/^#\s+(.+)$/m)?.[1]
      ?.trim() || ''
  );
}

function summarizeMarkdown(markdown) {
  const text =
    stripMarkdown(markdown)
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .find((part) => part.length >= 20) || stripMarkdown(markdown);
  return trimDescription(text);
}

function stripMarkdown(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimDescription(value) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).trimEnd()}...`;
}

function normalizeWordCount(value, articleHtml) {
  if (value === undefined || value === null || value === '') return estimateWordCount(articleHtml);
  const wordCount = Number(value);
  if (!Number.isInteger(wordCount) || wordCount < 100)
    fail('Post metadata wordCount must be an integer of at least 100.');
  return wordCount;
}

function estimateWordCount(html) {
  return Math.max(100, Math.ceil(stripTags(html).length));
}

function resolvePostCover(value, articleHtml = '') {
  const cover = normalizeCover(value);
  if (cover && cover !== defaultCover) return cover;
  return findFirstArticleImage(articleHtml) || cover || defaultCover;
}

function normalizeCover(value) {
  const text = String(value || '').trim();
  if (!text) return defaultCover;
  const relativeAsset = text.replace(/^\.\/+/, '').replace(/^(\.\.\/)+/, '');
  if (relativeAsset.startsWith('assets/')) return relativeAsset;
  if (text.startsWith('/blog/assets/')) return text.slice('/blog/'.length);
  if (text.startsWith('/assets/')) return text.slice(1);
  try {
    const url = new URL(text, 'https://www.corca.ai/blog/posts/post/');
    const assetIndex = url.pathname.indexOf('/assets/');
    if (assetIndex >= 0) return url.pathname.slice(assetIndex + 1);
  } catch {
    // Fall through to default cover for non-URL values.
  }
  return defaultCover;
}

function findFirstArticleImage(html) {
  for (const match of String(html || '').matchAll(/<img\b([^>]*)>/gi)) {
    const src = getAttributes(match[1]).src;
    const cover = normalizeCover(src);
    if (cover && cover !== defaultCover) return cover;
  }
  return '';
}

function validatePost(post) {
  if (post.description.length > 180)
    fail(`Post metadata description must be 180 characters or fewer: ${post.slug}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date))
    fail(`Post metadata date must use YYYY-MM-DD: ${post.slug}`);
  if (!post.cover.startsWith('assets/'))
    fail(`Post metadata cover must live under assets/: ${post.slug}`);
  assertSafeRelativePath(
    `admin/post-sources/${post.slug}.html`,
    'post source',
    'admin/post-sources/',
    '.html',
  );
  assertSafeRelativePath(post.cover, 'cover image', 'assets/');
}

function assertSafeRelativePath(relativePath, label, prefix, extension) {
  const value = String(relativePath || '');
  const absolute = resolve(blogRoot, value);
  const inside = relative(blogRoot, absolute);
  const normalizedInside = inside.split(sep).join('/');
  if (
    !value ||
    value.startsWith('/') ||
    inside === '..' ||
    inside.startsWith(`..${sep}`) ||
    inside.startsWith(sep)
  ) {
    fail(`Unsafe path for ${label}: ${relativePath}`);
  }
  if (prefix && !normalizedInside.startsWith(prefix))
    fail(`${label} must live under ${prefix}: ${relativePath}`);
  if (extension && !normalizedInside.endsWith(extension))
    fail(`${label} must use ${extension}: ${relativePath}`);
}

function sortPostRecords(values) {
  return [...values].sort((a, b) => {
    const first = a.post;
    const second = b.post;
    return (
      new Date(second.date) - new Date(first.date) ||
      String(first.title || '').localeCompare(String(second.title || ''), 'ko')
    );
  });
}

function absoluteBlogAsset(path) {
  if (/^https?:\/\//.test(path)) return path;
  return `https://www.corca.ai/blog/${String(path || defaultCover).replace(/^\/+/, '')}`;
}

function rewriteBlogAssetUrls(html) {
  return String(html || '')
    .replace(/((?:src|href)=["'])\.\.\/assets\//g, '$1/blog/assets/')
    .replace(/((?:src|href)=["'])\.\/assets\//g, '$1/blog/assets/')
    .replace(/((?:src|href)=["'])assets\//g, '$1/blog/assets/')
    .replace(/((?:src|href)=["'])blog\/assets\//g, '$1/blog/assets/')
    .replace(/((?:src|href)=["'])\/?blog\/assets\//g, '$1/blog/assets/');
}

function formatPostDate(value, locale) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(localeLabels[locale]?.dateLocale || 'ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function todayInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(new Date());
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${valueByType.year}-${valueByType.month}-${valueByType.day}`;
}

function firstPresent(values) {
  return values.map((value) => String(value || '').trim()).find(Boolean) || '';
}

function summarizeDescription(value) {
  const text = stripTags(value);
  return text.length <= 180
    ? text
    : text
        .slice(0, 180)
        .replace(/\s+\S*$/, '')
        .trim();
}

function elementText(html, tagName) {
  return stripTags(elementInnerHtml(html, tagName));
}

function elementInnerHtml(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = String(html || '').match(pattern);
  return match ? match[1].trim() : '';
}

function timeDateTime(html) {
  const match = String(html || '').match(/<time\b([^>]*)>/i);
  return match ? getAttributes(match[1]).datetime || '' : '';
}

function metaContent(html, predicate) {
  return metaContents(html, predicate)[0] || '';
}

function metaContents(html, predicate) {
  const values = [];
  for (const match of String(html || '').matchAll(/<meta\b([^>]*)>/gi)) {
    const attrs = getAttributes(match[1]);
    const normalized = {
      name: String(attrs.name || '')
        .trim()
        .toLowerCase(),
      property: String(attrs.property || '')
        .trim()
        .toLowerCase(),
    };
    if (attrs.content !== undefined && predicate(normalized))
      values.push(decodeHtml(attrs.content));
  }
  return values;
}

function getAttributes(value) {
  const attrs = {};
  const pattern = /([^\s=/"'>]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  for (const match of String(value || '').matchAll(pattern)) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? '';
  }
  return attrs;
}

function stripTags(value) {
  return decodeHtml(
    String(value || '')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\s*(script|style|noscript)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
