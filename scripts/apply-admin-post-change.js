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
const postsDir = join(blogRoot, 'posts');
const adminAssetsDir = join(blogRoot, 'assets/admin-posts');
const localePaths = {
  ko: 'public/blog',
  en: 'public/en/blog',
  ja: 'public/ja/blog',
  zh: 'public/zh/blog',
};
const localeLabels = {
  ko: { lang: 'ko', hreflang: 'ko-KR', ogLocale: 'ko_KR', blogPath: '/blog' },
  en: { lang: 'en', hreflang: 'en-US', ogLocale: 'en_US', blogPath: '/en/blog' },
  ja: { lang: 'ja', hreflang: 'ja-JP', ogLocale: 'ja_JP', blogPath: '/ja/blog' },
  zh: { lang: 'zh', hreflang: 'zh-CN', ogLocale: 'zh_CN', blogPath: '/zh/blog' },
};
const supportedLocales = Object.keys(localePaths);
const defaultAuthor = 'Corca Team';
const defaultCover = 'assets/editorial-cover.jpg';

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

const posts = await syncPostIndex();
await renderAllStaticPosts(posts);

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
  const filenames = (await readdir(sourcesDir).catch(() => []))
    .filter((file) => file.endsWith('.html'))
    .sort((a, b) => a.localeCompare(b, 'ko'));
  const posts = [];

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
    posts.push(post);
  }

  const sorted = sortPosts(posts);
  for (const locale of supportedLocales) {
    const localePostsDir = join(repoRoot, localePaths[locale], 'posts');
    await mkdir(localePostsDir, { recursive: true });
    await writeFile(join(localePostsDir, 'index.json'), `${JSON.stringify(sorted, null, 2)}\n`);
  }
  console.log(`Synced ${sorted.length} posts into ${supportedLocales.length} locale post indexes.`);
  return sorted;
}

async function renderAllStaticPosts(posts) {
  const sortedPosts = sortPosts(posts);
  const postsByLocale = groupPostsByLocale(sortedPosts);
  const availableLocalesBySlug = groupLocalesBySlug(posts);
  for (const post of posts) {
    const source = await readFile(join(sourcesDir, `${post.slug}.html`), 'utf8');
    const parsed = parsePostSource(source, `${post.slug}.html`);
    const articleHtml = prepareArticleHtml(parsed.articleHtml);
    for (const locale of supportedLocales) {
      const outputDir = join(repoRoot, localePaths[locale], 'posts', post.slug);
      const localePosts = postsByLocale.get(locale) || [];
      const postBySlug = new Map(localePosts.map((item) => [item.slug, item]));
      const html = renderStaticPostPage(
        post,
        articleHtml,
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
    `Rendered ${posts.length} static blog posts into ${supportedLocales.length} locales.`,
  );
}

function groupPostsByLocale(posts) {
  const groups = new Map(supportedLocales.map((locale) => [locale, []]));
  for (const locale of supportedLocales) {
    groups.set(locale, posts);
  }
  return groups;
}

function groupLocalesBySlug(posts) {
  const groups = new Map();
  for (const post of posts) {
    groups.set(post.slug, new Set(supportedLocales));
  }
  return groups;
}

function staticPostPath(post, locale) {
  return `${localeLabels[locale].blogPath}/posts/${encodeURIComponent(post.slug)}/`;
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
  const pageNav = adjacentPostNav(post, posts, postBySlug);
  const articleSection = post.section || post.tags[0] || '코르카';

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
    <meta property="og:image:alt" content="${escapeAttribute(post.coverAlt || `${post.title} 대표 이미지`)}">
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
    <meta name="twitter:image:alt" content="${escapeAttribute(post.coverAlt || `${post.title} 대표 이미지`)}">
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
              <span class="meta-item"><time datetime="${post.date}">${formatKoreanDate(post.date)}</time></span>
              <span class="meta-item">${escapeHtml(post.author)}</span>
            </div>
          </header>
          <div class="article-content">
${articleHtml}
          </div>
        </article>
        <aside class="toc static-toc" aria-label="글 목차">
          <section class="toc-section" aria-label="글 목차">
            <strong>목차</strong>
            ${toc}
          </section>
          <section class="toc-recommendations" aria-label="추천 글">
            <strong>추천 글</strong>
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
            name: '글',
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
                <small><time datetime="${post.date}">${formatKoreanDate(post.date)}</time> · ${escapeHtml(post.author)}</small>
              </a>`;
}

function adjacentPostNav(post, posts, postBySlug) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  const previous = index >= 0 ? posts[index + 1] : null;
  const next = index > 0 ? posts[index - 1] : null;
  const cards = [];
  if (previous && postBySlug.has(previous.slug)) {
    cards.push(
      renderAdjacentCard(previous, post.language, '이전 글', '←', 'post-pagination-previous'),
    );
  }
  if (next && postBySlug.has(next.slug)) {
    cards.push(renderAdjacentCard(next, post.language, '다음 글', '→', 'post-pagination-next'));
  }
  return cards.length
    ? `<nav class="post-pagination" aria-label="글 이동">\n${cards.join('')}\n        </nav>`
    : '';
}

function renderAdjacentCard(post, locale, label, cue, className) {
  return `        <a class="related-card post-pagination-card ${className}" href="${escapeAttribute(staticPostPath(post, locale))}" aria-label="${label}: ${escapeAttribute(post.title)}">
          <span class="related-cue" aria-hidden="true">${cue}</span>
          <span class="related-meta">${label} · <strong>${escapeHtml(post.section || post.tags[0] || '코르카')}</strong> · <time datetime="${post.date}">${formatKoreanDate(post.date)}</time></span>
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
  return `${text.slice(0, 179).trimEnd()}...`;
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

function sortPosts(values) {
  return [...values].sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date) ||
      String(a.title || '').localeCompare(String(b.title || ''), 'ko'),
  );
}

function absoluteBlogAsset(path) {
  if (/^https?:\/\//.test(path)) return path;
  return `https://www.corca.ai/blog/${String(path || defaultCover).replace(/^\/+/, '')}`;
}

function rewriteBlogAssetUrls(html) {
  return String(html || '')
    .replace(/((?:src|href)=["'])\.\.\/assets\//g, '$1/blog/assets/')
    .replace(/((?:src|href)=["'])\.\/assets\//g, '$1/blog/assets/')
    .replace(/((?:src|href)=["'])assets\//g, '$1/blog/assets/');
}

function formatKoreanDate(value) {
  const [year, month, day] = String(value || '').split('-');
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`;
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
