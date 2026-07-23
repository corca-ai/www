import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownToHtml } from './lib/markdown-renderer.js';

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
    mobileNavigation: '목차와 추천 글',
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
    mobileNavigation: 'Contents and recommended posts',
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
    mobileNavigation: '目次とおすすめ記事',
    previous: '前の記事',
    next: '次の記事',
    postsBreadcrumb: '記事',
    dateLocale: 'ja-JP',
  },
  zh: {
    lang: 'zh-CN',
    hreflang: 'zh-CN',
    ogLocale: 'zh_CN',
    blogPath: '/zh/blog',
    imageAltSuffix: '代表图片',
    toc: '目录',
    recommendations: '推荐文章',
    mobileNavigation: '目录和推荐文章',
    previous: '上一篇',
    next: '下一篇',
    postsBreadcrumb: '文章',
    dateLocale: 'zh-CN',
  },
};
const supportedLocales = Object.keys(localePaths);
const translationTargetLocales = supportedLocales.filter((locale) => locale !== 'ko');
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
await renderBlogDiscoveryFiles(postRecordsByLocale);

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
  const taxonomyContext = {
    title,
    description,
    slug,
    content: articleHtml,
  };
  const tags = normalizePostTags(
    metadata.tags ||
      parsed?.metadata.tags ||
      metadata.section ||
      parsed?.metadata.section ||
      '코르카',
    taxonomyContext,
  );
  const section = normalizePostSection(
    metadata.section || parsed?.metadata.section,
    tags,
    taxonomyContext,
  );
  const uploadedCover = await writeCoverImage(value, slug);
  await writeBodyImages(value, slug);
  await deleteBodyImages(value, slug);
  const post = {
    ...parsed?.metadata,
    title,
    description,
    date: normalizeDate(metadata.date || parsed?.metadata.date || todayInTimeZone('Asia/Seoul')),
    tags,
    author: String(metadata.author || parsed?.metadata.author || '').trim(),
    cover:
      uploadedCover || normalizeCover(metadata.cover || parsed?.metadata.cover || defaultCover),
    language: normalizeLanguage(metadata.language || parsed?.metadata.language || 'ko'),
    coverAlt: String(metadata.coverAlt || parsed?.metadata.coverAlt || '').trim(),
    section,
    wordCount: estimateWordCount(articleHtml),
  };

  if (format === 'markdown') {
    post.sourceFormat = 'markdown';
    post.sourceMarkdown = content.trim();
  }

  validatePost({ slug, ...post });
  await mkdir(sourcesDir, { recursive: true });
  await writeFile(join(sourcesDir, `${slug}.html`), renderPostSource(post, articleHtml));
  await writePostTranslations(post, articleHtml, slug);
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
  await rm(join(blogRoot, slug), { recursive: true, force: true });
  for (const locale of ['en', 'ja', 'zh']) {
    await rm(join(translationsDir, locale, `${slug}.html`), { force: true });
    await rm(join(repoRoot, `public/${locale}/blog/${slug}`), {
      recursive: true,
      force: true,
    });
    await rm(join(repoRoot, `public/${locale}/blog/posts/${slug}`), {
      recursive: true,
      force: true,
    });
  }
  console.log(`Admin post deleted: ${slug}`);
}

async function writePostTranslations(post, articleHtml, slug) {
  if (!shouldAutoTranslatePosts()) {
    return;
  }

  const sourceLanguage = normalizeLanguage(post.language || 'ko');
  for (const locale of translationTargetLocales) {
    const translationPath = join(translationsDir, locale, `${slug}.html`);
    await mkdir(dirname(translationPath), { recursive: true });

    if (locale === sourceLanguage) {
      await writeFile(
        translationPath,
        renderPostSource(
          {
            ...post,
            language: locale,
            tags: localizePostTags(post.tags, locale),
            section: localizePostTopic(post.section || post.tags?.[0] || '', locale),
          },
          articleHtml,
        ),
      );
      continue;
    }

    const translated = await translatePostSource(post, articleHtml, locale, sourceLanguage);
    await writeFile(translationPath, renderPostSource(translated.post, translated.articleHtml));
  }
}

function shouldAutoTranslatePosts() {
  const value = String(process.env.BLOG_AUTO_TRANSLATE || '1')
    .trim()
    .toLowerCase();
  return !['0', 'false', 'off', 'no'].includes(value);
}

async function translatePostSource(post, articleHtml, targetLocale, sourceLocale) {
  const translator = createTranslator(sourceLocale, targetLocale);
  const [title, description, coverAlt, translatedArticleHtml] = await Promise.all([
    translator(String(post.title || '')),
    translator(String(post.description || '')),
    post.coverAlt ? translator(String(post.coverAlt || '')) : Promise.resolve(''),
    translateArticleHtml(articleHtml, translator),
  ]);

  return {
    post: {
      ...post,
      title: title || post.title,
      description: trimDescription(description || post.description),
      tags: localizePostTags(post.tags || [], targetLocale),
      language: targetLocale,
      coverAlt: coverAlt || '',
      section: localizePostTopic(post.section || post.tags?.[0] || '', targetLocale),
      wordCount: estimateWordCount(translatedArticleHtml),
    },
    articleHtml: translatedArticleHtml,
  };
}

function createTranslator(sourceLocale, targetLocale) {
  if (translationProvider() === 'fixture') {
    return async (value) => fixtureTranslate(value, targetLocale);
  }
  return async (value) => googleTranslate(value, sourceLocale, targetLocale);
}

function translationProvider() {
  return String(process.env.BLOG_TRANSLATION_PROVIDER || 'google')
    .trim()
    .toLowerCase();
}

async function translateArticleHtml(html, translateText) {
  const protectedBlocks = [];
  const protectedHtml = String(html || '').replace(
    /<(pre|code|script|style|svg|math)\b[\s\S]*?<\/\1>/gi,
    (match) => {
      const token = `__CORCA_PROTECTED_HTML_${protectedBlocks.length}__`;
      protectedBlocks.push(match);
      return token;
    },
  );
  const parts = protectedHtml.split(/(<[^>]+>)/g);
  const textIndexes = [];
  const texts = [];

  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index].startsWith('<')) continue;
    if (!shouldTranslateText(parts[index])) continue;
    textIndexes.push(index);
    texts.push(decodeHtml(parts[index]));
  }

  const translatedTexts = await translateTextBatch(texts, translateText);
  for (let index = 0; index < textIndexes.length; index += 1) {
    parts[textIndexes[index]] = escapeHtml(translatedTexts[index] || texts[index]);
  }

  return translateImageAltAttributes(parts.join(''), translateText).then((value) =>
    protectedBlocks.reduce(
      (nextHtml, block, index) => nextHtml.replace(`__CORCA_PROTECTED_HTML_${index}__`, block),
      value,
    ),
  );
}

async function translateImageAltAttributes(html, translateText) {
  const matches = [...String(html || '').matchAll(/\salt=(["'])(.*?)\1/gi)];
  const values = matches
    .map((match) => decodeHtml(match[2]))
    .filter((value) => shouldTranslateText(value));
  if (!values.length) return html;

  const translated = await translateTextBatch(values, translateText);
  let translatedIndex = 0;
  return String(html || '').replace(/\salt=(["'])(.*?)\1/gi, (match, quote, value) => {
    const decoded = decodeHtml(value);
    if (!shouldTranslateText(decoded)) return match;
    const nextValue = translated[translatedIndex] || decoded;
    translatedIndex += 1;
    return ` alt=${quote}${escapeAttribute(nextValue)}${quote}`;
  });
}

async function translateTextBatch(texts, translateText) {
  const normalizedTexts = texts.map((text) => String(text || ''));
  const translated = [];
  const chunkLimit = Number(process.env.BLOG_TRANSLATION_CHUNK_LIMIT || 2800);
  let chunk = [];
  let chunkLength = 0;

  const flush = async () => {
    if (!chunk.length) return;
    translated.push(...(await translateTextChunk(chunk, translateText)));
    chunk = [];
    chunkLength = 0;
  };

  for (const text of normalizedTexts) {
    const nextLength = chunkLength + text.length + translationDelimiter(0).length + 2;
    if (chunk.length && nextLength > chunkLimit) {
      await flush();
    }
    chunk.push(text);
    chunkLength += text.length + translationDelimiter(0).length + 2;
  }
  await flush();
  return translated;
}

async function translateTextChunk(texts, translateText) {
  if (texts.length === 1) {
    return [await translateText(texts[0])];
  }

  const delimiter = translationDelimiter(Date.now());
  const joined = texts.join(`\n${delimiter}\n`);
  const translated = await translateText(joined);
  const parts = translated.split(delimiter).map((value) => value.trim());
  if (parts.length === texts.length) {
    return parts;
  }
  return Promise.all(texts.map((text) => translateText(text)));
}

function translationDelimiter(seed) {
  return `<<<CORCA_TRANSLATE_BREAK_${seed}>>>`;
}

function shouldTranslateText(value) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return false;
  if (/^__CORCA_PROTECTED_HTML_\d+__$/.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;
  return /[A-Za-z가-힣ぁ-んァ-ン一-龯]/.test(text);
}

function fixtureTranslate(value, targetLocale) {
  const text = String(value || '');
  if (!text.trim()) return text;
  return `[${targetLocale}] ${text}`;
}

async function googleTranslate(value, sourceLocale, targetLocale) {
  const text = String(value || '');
  if (!text.trim()) return text;

  const params = new URLSearchParams({
    client: 'gtx',
    sl: googleTranslateLanguage(sourceLocale),
    tl: googleTranslateLanguage(targetLocale),
    dt: 't',
    q: text,
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
    headers: { 'accept-language': 'en-US,en;q=0.9' },
  });
  if (!response.ok) {
    throw new Error(`Google Translate request failed with ${response.status}`);
  }
  const data = await response.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] || '').join('')
    : '';
  return translated.trim() || text;
}

function googleTranslateLanguage(locale) {
  if (locale === 'zh') return 'zh-CN';
  return locale || 'ko';
}

async function syncPostIndex() {
  await mkdir(postsDir, { recursive: true });
  const baseRecords = await readBasePostRecords();
  const postRecordsByLocale = await buildPostRecordsByLocale(baseRecords);

  for (const locale of supportedLocales) {
    const localePostsDir = join(repoRoot, localePaths[locale], 'posts');
    const localePosts = postRecordsByLocale.get(locale).map((record) => record.post);
    const indexJson = `${JSON.stringify(localePosts, null, 2)}\n`;
    await mkdir(localePostsDir, { recursive: true });
    await writeFile(join(localePostsDir, 'index.json'), indexJson);
    await writeFile(join(repoRoot, localePaths[locale], 'index.json'), indexJson);
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
    const taxonomyContext = {
      title,
      description,
      slug,
      content: parsed.articleHtml,
    };
    const tags = normalizePostTags(
      parsed.metadata.tags || parsed.metadata.section || '코르카',
      taxonomyContext,
    );
    const cover = resolvePostCover(parsed.metadata.cover, parsed.articleHtml);
    const post = {
      slug,
      title,
      description,
      date: normalizeDate(requiredString(parsed.metadata.date, 'date')),
      tags,
      author: String(parsed.metadata.author || '').trim(),
      cover,
      wordCount: normalizeWordCount(parsed.metadata.wordCount, parsed.articleHtml),
      language: normalizeLanguage(parsed.metadata.language || 'ko'),
      coverAlt: String(parsed.metadata.coverAlt || '').trim(),
      section: normalizePostSection(parsed.metadata.section, tags, taxonomyContext),
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
  const taxonomyContext = {
    title,
    description,
    slug: baseRecord.post.slug,
    content: parsed.articleHtml,
  };
  const tags = normalizePostTags(parsed.metadata.tags || baseRecord.post.tags, taxonomyContext);
  const localizedCover = normalizeCover(parsed.metadata.cover);
  const post = {
    ...baseRecord.post,
    title,
    description,
    tags: localizePostTags(tags, locale),
    author: String(parsed.metadata.author || baseRecord.post.author || '').trim(),
    cover: localizedCover === defaultCover ? baseRecord.post.cover : localizedCover,
    wordCount: normalizeWordCount(parsed.metadata.wordCount, parsed.articleHtml),
    language: locale,
    coverAlt: String(parsed.metadata.coverAlt || baseRecord.post.coverAlt || '').trim(),
    section: localizePostTopic(
      normalizePostSection(
        parsed.metadata.section || baseRecord.post.section,
        tags,
        taxonomyContext,
      ),
      locale,
    ),
    searchText: stripTags(parsed.articleHtml),
  };
  validatePost(post);
  return { post, articleHtml: parsed.articleHtml, source, sourcePath: translationPath };
}

async function renderAllStaticPosts(postRecordsByLocale) {
  const availableLocalesBySlug = groupLocalesBySlug(postRecordsByLocale);
  await removeLegacyStaticPostPages();
  for (const locale of supportedLocales) {
    const records = postRecordsByLocale.get(locale) || [];
    const localePosts = records.map((record) => record.post);
    const postBySlug = new Map(localePosts.map((item) => [item.slug, item]));
    for (const record of records) {
      const post = record.post;
      const outputDir = join(repoRoot, localePaths[locale], post.slug);
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

async function removeLegacyStaticPostPages() {
  for (const locale of supportedLocales) {
    const legacyPostsDir = join(repoRoot, localePaths[locale], 'posts');
    const entries = await readdir(legacyPostsDir, { withFileTypes: true }).catch(() => []);
    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => rm(join(legacyPostsDir, entry.name), { recursive: true, force: true })),
    );
  }
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
      .replace(/\n\s*<meta name="robots"[^>]*>/gi, '')
      .replace(/\n\s*<link rel="canonical" href="[^"]+">/g, '')
      .replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${escapeAttribute(labels.description)}">\n    <meta name="robots" content="index, follow">`,
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
      .replace(/href="\/blog\/rss\.xml"/g, 'href="/rss"')
      .replace(/"description":\s*"[^"]*"/, `"description": ${JSON.stringify(labels.description)}`)
      .replace(
        /"inLanguage":\s*"[^"]*"/,
        `"inLanguage": ${JSON.stringify(localeLabels[locale].lang)}`,
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
        /(<div id="heroTopicFilters"[^>]*>)[\s\S]*?(<\/div>)/,
        `$1\n${renderTopicFilterButtons(records)}\n          $2`,
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
        /(<aside id="recommendationsPanel"[^>]*aria-label=")[^"]*("[^>]*>)/,
        `$1${escapeAttribute(localeLabels[locale].recommendations)}$2`,
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

async function renderBlogDiscoveryFiles(postRecordsByLocale) {
  const sitemapCategories = renderBlogCategoriesSitemap(postRecordsByLocale);
  const sitemapTags = renderBlogTagsSitemap(postRecordsByLocale);
  const sitemapPosts = renderBlogPostsSitemap(postRecordsByLocale);
  const sitemap = renderBlogSitemapAlias(postRecordsByLocale);
  const rss = renderBlogRss(postRecordsByLocale.get('ko') || []);
  const feed = renderBlogJsonFeed(postRecordsByLocale.get('ko') || []);
  const robots = renderBlogRobotsTxt();

  await writeFile(join(repoRoot, 'public/sitemap-categories.xml'), sitemapCategories);
  await writeFile(join(repoRoot, 'public/sitemap-tags.xml'), sitemapTags);
  await writeFile(join(repoRoot, 'public/sitemap-posts.xml'), sitemapPosts);
  await writeFile(join(blogRoot, 'sitemap.xml'), sitemap);
  await writeFile(join(blogRoot, 'rss.xml'), rss);
  await writeFile(join(blogRoot, 'feed.json'), feed);
  await writeFile(join(blogRoot, 'robots.txt'), robots);
  console.log('Rendered blog sitemap index children, RSS, JSON feed and robots.txt.');
}

function renderBlogCategoriesSitemap(postRecordsByLocale) {
  const lastmod = newestPostDate(postRecordsByLocale);
  return renderUrlset(
    supportedLocales.flatMap((locale) =>
      getPostTopics(postRecordsByLocale.get(locale) || []).map((topic) => ({
        path: `${localeLabels[locale].blogPath}?topic=${topicKey(topic)}`,
        lastmod,
      })),
    ),
  );
}

function renderTopicFilterButtons(records) {
  return getPostTopics(records)
    .map(
      (topic) =>
        `            <button type="button" data-topic-filter="${escapeAttribute(topicKey(topic))}" data-topic-value="${escapeAttribute(topic)}" aria-pressed="false">${escapeHtml(topic)}</button>`,
    )
    .join('\n');
}

function getPostTopics(records) {
  const topics = [
    ...new Set(records.map(({ post }) => String(post.section || '').trim()).filter(Boolean)),
  ];
  const order = ['product', 'ax', 'corca'];
  return topics.sort(
    (first, second) => order.indexOf(topicKey(first)) - order.indexOf(topicKey(second)),
  );
}

function topicKey(value) {
  const keyMap = {
    ax: 'ax',
    moonlight: 'moonlight',
    문라이트: 'moonlight',
    trace: 'trace',
    트레이스: 'trace',
    kraken: 'kraken',
    크라켄: 'kraken',
    ceal: 'ceal',
    씰: 'ceal',
    margin: 'margin',
    마진: 'margin',
    corca: 'corca',
    코르카: 'corca',
    product: 'product',
    제품: 'product',
  };
  return (
    keyMap[
      String(value || '')
        .trim()
        .toLowerCase()
    ] || normalizeSlug(value)
  );
}

function renderBlogTagsSitemap(postRecordsByLocale) {
  const lastmod = newestPostDate(postRecordsByLocale);
  const entries = [];
  for (const locale of supportedLocales) {
    const tags = [
      ...new Set(
        (postRecordsByLocale.get(locale) || []).flatMap(({ post }) =>
          [...(post.tags || []), post.section].filter(Boolean),
        ),
      ),
    ].sort((a, b) => a.localeCompare(b, localeLabels[locale].lang));
    for (const tag of tags) {
      entries.push({
        path: `${localeLabels[locale].blogPath}?q=${encodeURIComponent(tag)}`,
        lastmod,
      });
    }
  }
  return renderUrlset(entries);
}

function renderBlogPostsSitemap(postRecordsByLocale) {
  const entries = [];
  for (const locale of supportedLocales) {
    const records = postRecordsByLocale.get(locale) || [];
    for (const { post } of records) {
      entries.push({
        path: staticPostPath(post, locale),
        lastmod: post.date,
      });
    }
  }
  return renderUrlset(entries);
}

function renderUrlset(entries) {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeHtml(absoluteSiteUrl(entry.path))}</loc>
    <lastmod>${escapeHtml(sitemapDateTime(entry.lastmod))}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl?v=20260721-blue"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function sitemapDateTime(value) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return text;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T00:00:00.000Z`;
  return `${todayInTimeZone('Asia/Seoul')}T00:00:00.000Z`;
}

function renderBlogSitemapAlias(postRecordsByLocale) {
  const lastmod = `${newestPostDate(postRecordsByLocale)}T00:00:00.000Z`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl?v=20260721-blue"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeHtml(absoluteSiteUrl('/sitemap-posts.xml'))}</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

function renderBlogRss(records) {
  const latestDate = newestRecordDate(records);
  const items = records
    .map(({ post }) => {
      const url = absoluteSiteUrl(staticPostPath(post, 'ko'));
      return `    <item>
      <title><![CDATA[${cdata(post.title)}]]></title>
      <link>${escapeHtml(url)}</link>
      <guid isPermaLink="true">${escapeHtml(url)}</guid>
      <pubDate>${escapeHtml(rssDate(post.date))}</pubDate>
      <description><![CDATA[${cdata(post.description)}]]></description>
      <category><![CDATA[${cdata(getRssCategory(post))}]]></category>
${post.author ? `      <dc:creator><![CDATA[${cdata(post.author)}]]></dc:creator>` : ''}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[Corca Blog]]></title>
    <link>${escapeHtml(absoluteSiteUrl('/blog'))}</link>
    <atom:link href="${escapeAttribute(absoluteSiteUrl('/rss'))}" rel="self" type="application/rss+xml" />
    <description><![CDATA[${cdata(blogIndexLabels.ko.description)}]]></description>
    <language>ko-KR</language>
    <lastBuildDate>${escapeHtml(rssDate(latestDate))}</lastBuildDate>
    <generator>Astro</generator>
    <ttl>60</ttl>
${items}
  </channel>
</rss>
`;
}

function getRssCategory(post) {
  return [...new Set([post.section || post.tags?.[0] || 'Corca', ...(post.tags || [])])]
    .filter(Boolean)
    .join(' · ');
}

function cdata(value) {
  return String(value || '').replaceAll(']]>', ']]]]><![CDATA[>');
}

function renderBlogJsonFeed(records) {
  const items = records.map(({ post, articleHtml }) => {
    const url = absoluteSiteUrl(staticPostPath(post, 'ko'));
    return {
      id: url,
      url,
      title: post.title,
      content_html: absolutizeBlogContentHtml(articleHtml),
      summary: post.description,
      date_published: `${post.date}T00:00:00.000Z`,
      ...(post.author ? { authors: [{ name: post.author }] } : {}),
      tags: [...new Set([post.section, ...(post.tags || [])].filter(Boolean))],
    };
  });
  return `${JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Corca Blog',
      home_page_url: absoluteSiteUrl('/blog'),
      feed_url: absoluteSiteUrl('/blog/feed.json'),
      description: blogIndexLabels.ko.description,
      language: 'ko',
      items,
    },
    null,
    2,
  )}\n`;
}

function renderBlogRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /blog/admin
Disallow: /blog/admin/

Sitemap: ${absoluteSiteUrl('/sitemap.xml')}
`;
}

function newestPostDate(postRecordsByLocale) {
  const dates = [];
  for (const records of postRecordsByLocale.values()) {
    for (const { post } of records) dates.push(post.date);
  }
  return newestDate(dates);
}

function newestRecordDate(records) {
  return newestDate(records.map(({ post }) => post.date));
}

function newestDate(values) {
  return (
    values
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .sort((a, b) => new Date(`${b}T00:00:00.000Z`) - new Date(`${a}T00:00:00.000Z`))[0] ||
    todayInTimeZone('Asia/Seoul')
  );
}

function rssDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return new Date().toUTCString();
  return date.toUTCString();
}

function absolutizeBlogContentHtml(html) {
  return prepareArticleHtml(html).replace(
    /((?:src|href)=["'])\/blog\//g,
    `$1${blogSiteOrigin()}/blog/`,
  );
}

function renderIndexAbout(labels) {
  return `<section id="about" class="about-section" aria-label="${escapeAttribute(labels.aboutEyebrow)}">
        <div>
          <p class="eyebrow">${escapeHtml(labels.aboutEyebrow)}</p>
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
                  <div class="meta"><time datetime="${post.date}">${formatPostDate(post.date, locale)}</time>${post.author ? ` | ${escapeHtml(post.author)}` : ''} | <strong>${escapeHtml(post.tags[0] || post.section)}</strong></div>
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
  return `${localeLabels[locale].blogPath}/${encodeURIComponent(post.slug)}`;
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

function renderStaticPostSeoLinks(post, locale, availableLocalesBySlug) {
  const availableLocales = availableLocalesBySlug?.get(post.slug) || new Set([locale]);
  const lines = [
    `    <link rel="canonical" href="${escapeAttribute(absoluteSiteUrl(staticPostPath(post, locale)))}">`,
  ];

  for (const code of supportedLocales) {
    if (!availableLocales.has(code)) continue;
    lines.push(
      `    <link rel="alternate" hreflang="${localeLabels[code].hreflang}" href="${escapeAttribute(absoluteSiteUrl(staticPostPath(post, code)))}">`,
    );
  }

  if (availableLocales.has('ko')) {
    lines.push(
      `    <link rel="alternate" hreflang="x-default" href="${escapeAttribute(absoluteSiteUrl(staticPostPath(post, 'ko')))}">`,
    );
  }

  return lines.join('\n');
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
  const blogStylesHref = shell.blogStylesHref || '/blog/styles.css';
  const coverUrl = absoluteBlogAsset(post.cover);
  const pageUrl = absoluteSiteUrl(staticPostPath(post, locale));
  const publishedTime = `${post.date}T00:00:00.000Z`;
  const toc = tableOfContents(articleHtml);
  const recommendations = recommendationPosts(post, posts);
  const pageNav = adjacentPostNav(post, posts, postBySlug, locale);
  const articleSection = post.section || post.tags[0] || '코르카';
  const imageAlt = post.coverAlt || `${post.title} ${localeLabels[locale].imageAltSuffix}`;
  const articleAuthorMeta = post.author
    ? `    <meta property="article:author" content="${escapeAttribute(post.author)}">\n`
    : '';
  const visibleAuthor = post.author
    ? `              <span class="meta-item">${escapeHtml(post.author)}</span>\n`
    : '';

  return `<!doctype html>
<html lang="${localeLabels[locale].lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(post.title)} | Corca Blog</title>
    <meta name="description" content="${escapeAttribute(post.description)}">
    <meta name="robots" content="index, follow">
${renderStaticPostSeoLinks(post, locale, availableLocalesBySlug)}
    <meta property="og:title" content="${escapeAttribute(post.title)}">
    <meta property="og:description" content="${escapeAttribute(post.description)}">
    <meta property="og:site_name" content="Corca Blog">
    <meta property="og:locale" content="${localeLabels[locale].ogLocale}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${coverUrl}">
    <meta property="og:image:secure_url" content="${coverUrl}">
    <meta property="og:image:alt" content="${escapeAttribute(imageAlt)}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="article:published_time" content="${publishedTime}">
    <meta property="article:modified_time" content="${publishedTime}">
${articleAuthorMeta}    <meta property="article:section" content="${escapeAttribute(articleSection)}">
${post.tags.map((tag) => `    <meta property="article:tag" content="${escapeAttribute(tag)}">`).join('\n')}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttribute(post.title)}">
    <meta name="twitter:description" content="${escapeAttribute(post.description)}">
    <meta name="twitter:image" content="${coverUrl}">
    <meta name="twitter:image:alt" content="${escapeAttribute(imageAlt)}">
    <meta name="theme-color" content="#ffffff">
    <link rel="alternate" type="application/rss+xml" title="Corca Blog RSS" href="/rss">
    <link rel="alternate" type="application/feed+json" title="Corca Blog JSON Feed" href="/blog/feed.json">
    <script type="application/ld+json" data-corca-managed="post-structured-data">${JSON.stringify(postStructuredData(post, coverUrl, pageUrl, articleSection, locale))}</script>
    <link rel="icon" href="/blog/assets/favicon.png" type="image/png">
    <link rel="stylesheet" href="/_astro/BaseLayout.BXVN9hzb.css">
    <link rel="stylesheet" href="${escapeAttribute(blogStylesHref)}">
  </head>
  <body>${shell.beforeMain}<main id="main" tabindex="-1">
      <section class="post-view static-post-view">
        <article id="article" class="article static-article">
          <header class="article-header">
            <h1>${escapeHtml(post.title)}</h1>
            <p>${escapeHtml(post.description)}</p>
            <div class="article-meta">
              <span class="meta-item"><time datetime="${post.date}">${formatPostDate(post.date, locale)}</time></span>
${visibleAuthor}            </div>
            ${renderStaticMobileNavigation(toc, recommendations, locale)}
          </header>
          <div class="article-content">
${articleHtml}
          </div>
        </article>
${renderStaticTableOfContents(toc, locale)}
        <aside class="toc static-toc recommendations-panel" aria-label="${escapeAttribute(localeLabels[locale].recommendations)}">
${renderStaticRecommendations(recommendations, locale)}
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
  const blogStylesHref =
    html.match(/<link rel="stylesheet" href="(\/blog\/styles\.css[^"]*)">/)?.[1] ||
    '/blog/styles.css';
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
  return { beforeMain, afterMain, blogStylesHref };
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
  const blogUrl = absoluteSiteUrl('/blog');
  const postsUrl = absoluteSiteUrl('/blog/#posts');
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
        ...(post.author ? { author: { '@type': 'Organization', name: post.author } } : {}),
        publisher: { '@type': 'Organization', name: 'Corca' },
        inLanguage: localeLabels[locale].lang,
        timeRequired: `PT${Math.max(1, Math.ceil(post.wordCount / 500))}M`,
        isPartOf: { '@type': 'Blog', name: 'Corca Blog', url: blogUrl },
        mainEntityOfPage: canonical,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Corca Blog',
            item: blogUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: localeLabels[locale].postsBreadcrumb,
            item: postsUrl,
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
                <small><time datetime="${post.date}">${formatPostDate(post.date, locale)}</time>${post.author ? ` · ${escapeHtml(post.author)}` : ''}</small>
              </a>`;
}

function renderStaticMobileNavigation(toc, recommendations, locale) {
  const labels = localeLabels[locale];
  return `            <details class="article-mobile-navigation">
              <summary>${escapeHtml(labels.mobileNavigation)}</summary>
              <div class="article-mobile-navigation-content">
${renderStaticNavigationSections(toc, recommendations, locale)}
              </div>
            </details>`;
}

function renderStaticNavigationSections(toc, recommendations, locale) {
  const sections = [];
  if (toc) {
    sections.push(renderStaticTocSection(toc, locale));
  }
  sections.push(renderStaticRecommendations(recommendations, locale));
  return sections.join('\n');
}

function renderStaticTableOfContents(toc, locale) {
  if (!toc) return '';
  const labels = localeLabels[locale];
  return `        <aside class="toc static-toc table-of-contents-panel" aria-label="${escapeAttribute(labels.toc)}">
${renderStaticTocSection(toc, locale)}
        </aside>`;
}

function renderStaticTocSection(toc, locale) {
  const labels = localeLabels[locale];
  return `<section class="toc-section" aria-label="${escapeAttribute(labels.toc)}">
  <strong>${escapeHtml(labels.toc)}</strong>
  ${toc}
</section>`;
}

function renderStaticRecommendations(recommendations, locale) {
  const labels = localeLabels[locale];
  return `<section class="toc-recommendations" aria-label="${escapeAttribute(labels.recommendations)}">
  <strong>${escapeHtml(labels.recommendations)}</strong>
  <div class="toc-recommendation-list">
${recommendations.map((item) => renderRecommendation(item, locale)).join('\n')}
  </div>
</section>`;
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
  const thumbnailSrc = `/blog/${String(post.cover || defaultCover).replace(/^\/+/, '')}`;
  const displayTopic = post.tags[0] || post.section || '코르카';
  return `        <a class="related-card post-pagination-card ${className}" href="${escapeAttribute(staticPostPath(post, locale))}" aria-label="${label}: ${escapeAttribute(post.title)}">
          <span class="related-cue" aria-hidden="true">${cue}</span>
          <span class="related-thumbnail" aria-hidden="true">
            <img src="${escapeAttribute(thumbnailSrc)}" alt="" loading="lazy" decoding="async">
          </span>
          <span class="related-copy">
            <span class="related-meta">${label} · <strong>${escapeHtml(displayTopic)}</strong> · <time datetime="${post.date}">${formatPostDate(post.date, locale)}</time></span>
            <span class="related-title">${escapeHtml(post.title)}</span>
          </span>
        </a>`;
}

function tableOfContents(articleHtml) {
  const items = [...articleHtml.matchAll(/<h2\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => ({
      id: match[1],
      text: stripTags(match[2]),
    }))
    .filter((item) => item.id && item.text);
  if (!items.length) return '';
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
  const taxonomyContext = {
    title: metadata.title,
    description: metadata.description,
  };
  const normalizedTags = normalizePostTags(metadata.tags, taxonomyContext);
  const language = normalizeLanguage(metadata.language || 'ko');
  const post = {
    title: String(metadata.title || '').trim(),
    description: String(metadata.description || '').trim(),
    date: String(metadata.date || '').trim(),
    tags: localizePostTags(normalizedTags, language),
    author: String(metadata.author || '').trim(),
    cover: normalizeCover(metadata.cover),
    language,
  };
  if (metadata.coverAlt) post.coverAlt = String(metadata.coverAlt).trim();
  post.section = localizePostTopic(
    normalizePostSection(metadata.section, normalizedTags, taxonomyContext),
    language,
  );
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

function normalizePostTags(value, context = {}) {
  const tags = normalizeRawTags(value);
  const haystack = normalizeSearchText(
    [...tags, context.title, context.description, context.slug, context.content]
      .filter(Boolean)
      .join(' '),
  );
  return [pickDisplayTopic(tags, haystack) || '코르카'];
}

function normalizePostSection(value, tags, context = {}) {
  const rawSection = normalizeRawTags(value);
  const haystack = normalizeSearchText(
    [...rawSection, ...tags, context.title, context.description, context.slug, context.content]
      .filter(Boolean)
      .join(' '),
  );
  return pickCategory([...rawSection, ...tags], haystack);
}

function pickDisplayTopic(tags, haystack) {
  const rules = [
    ['문라이트', ['moonlight', '문라이트']],
    ['트레이스', ['trace', '트레이스']],
    ['씰', ['ceal', '씰']],
    ['마진', ['margin', '마진']],
    ['크라켄', ['kraken', '크라켄']],
    ['제품', ['product', 'products', '제품']],
    ['AX', ['ax']],
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

function pickCategory(tags, haystack) {
  const rules = [
    [
      '제품',
      [
        'product',
        'products',
        '제품',
        'moonlight',
        '문라이트',
        'trace',
        '트레이스',
        'kraken',
        '크라켄',
        'ceal',
        '씰',
        'margin',
        '마진',
        '논문',
        'research',
        'paper',
        '일정',
        '캘린더',
        'calendar',
        'schedule',
        'locality',
        'ads',
        '광고',
        '리테일',
        'retail',
      ],
    ],
    ['AX', ['ax', 'engineering', '엔지니어링', '개발', '워크플로', 'agent', '에이전트']],
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
    const url = new URL(text, 'https://www.corca.ai/blog/post/');
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
  if (post.tags.length !== 1)
    fail(`Post metadata must have exactly one display topic: ${post.slug}`);
  const sectionKey = categoryKey(post.section);
  if (!['product', 'ax', 'corca'].includes(sectionKey))
    fail(`Post metadata must use Product, AX, or Corca as its category: ${post.slug}`);
  if (sectionKey !== categoryKey(post.tags[0]))
    fail(`Post display topic must belong to its public category: ${post.slug}`);
  if (sectionKey === 'product' && topicKey(post.tags[0]) === 'product')
    fail(
      `Product posts must use Moonlight, Trace, Ceal, Margin, or Kraken as the display topic: ${post.slug}`,
    );
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

function categoryKey(value) {
  const key = topicKey(value);
  if (['product', 'moonlight', 'trace', 'ceal', 'margin', 'kraken'].includes(key)) {
    return 'product';
  }
  return key;
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
  return `${blogSiteOrigin()}/blog/${String(path || defaultCover).replace(/^\/+/, '')}`;
}

function absoluteSiteUrl(path) {
  const normalizedPath = `/${String(path || '').replace(/^\/+/, '')}`;
  return `${blogSiteOrigin()}${normalizedPath}`;
}

function blogSiteOrigin() {
  const fallback = 'https://www.corca.ai';
  const raw =
    String(
      process.env.CORCA_SITE_URL || process.env.SITE_URL || repoSiteOrigin() || fallback,
    ).trim() || fallback;
  try {
    return new URL(raw).origin;
  } catch {
    return fallback;
  }
}

function repoSiteOrigin() {
  try {
    const source = readFileSync(join(repoRoot, 'src/site.ts'), 'utf8');
    return source.match(/SITE_ORIGIN\s*=\s*['"]([^'"]+)['"]/)?.[1] || '';
  } catch {
    return '';
  }
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
