import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_BASE_PATH = '/blog';
const BLOG_POSTS_BASE_PATH = `${BLOG_BASE_PATH}/posts`;
export const BLOG_RSS_PATH = `${BLOG_BASE_PATH}/rss.xml`;
export const BLOG_JSON_FEED_PATH = `${BLOG_BASE_PATH}/feed.json`;
const BLOG_ASSET_BASE_PATH = '/blog-assets';

export interface BlogPostIndexEntry {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  author: string;
  cover: string;
  file: string;
  wordCount: number;
  language?: string;
  coverAlt?: string;
  section?: string;
}

interface BlogTocItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost extends BlogPostIndexEntry {
  articleHtml: string;
  coverPath: string;
  path: string;
  readingTime: string;
  searchText: string;
  toc: BlogTocItem[];
}

const postsDir = join(process.cwd(), 'src/blog/posts');
const indexPath = join(postsDir, 'index.json');

let postsCache: Promise<BlogPost[]> | null = null;

export function blogPostPath(post: Pick<BlogPostIndexEntry, 'slug'>): string {
  return `${BLOG_POSTS_BASE_PATH}/${encodeURIComponent(post.slug)}`;
}

function blogAssetPath(value: string): string {
  const text = String(value || '').trim();
  if (!text) return `${BLOG_ASSET_BASE_PATH}/editorial-cover.jpg`;
  if (/^https?:\/\//i.test(text) || text.startsWith('data:')) return text;

  const normalized = text
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '')
    .replace(/^(\.\.\/)+/, '');

  if (normalized.startsWith('blog-assets/')) return `/${normalized}`;
  if (normalized.startsWith('assets/')) {
    return `${BLOG_ASSET_BASE_PATH}/${normalized.slice('assets/'.length)}`;
  }

  return `${BLOG_ASSET_BASE_PATH}/${normalized}`;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  postsCache ??= readBlogPosts();
  return postsCache;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function relatedBlogPosts(post: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const postTags = new Set(post.tags);
  const scored = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.reduce((total, tag) => total + (postTags.has(tag) ? 1 : 0), 0),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime(),
    )
    .map((item) => item.candidate);

  return scored.slice(0, limit);
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function blogPostLanguage(post: Pick<BlogPostIndexEntry, 'language'>): 'ko' | 'en' {
  return String(post.language || '')
    .toLowerCase()
    .startsWith('en')
    ? 'en'
    : 'ko';
}

async function readBlogPosts(): Promise<BlogPost[]> {
  const rawEntries = JSON.parse(await readFile(indexPath, 'utf8')) as BlogPostIndexEntry[];
  const posts = await Promise.all(rawEntries.map(readBlogPostEntry));
  return posts.sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      a.title.localeCompare(b.title, 'ko'),
  );
}

async function readBlogPostEntry(entry: BlogPostIndexEntry): Promise<BlogPost> {
  const sourceFileName = entry.file.split('/').pop() || `${entry.slug}.html`;
  const sourcePath = join(postsDir, sourceFileName);
  const sourceHtml = await readFile(sourcePath, 'utf8');
  const article = normalizeArticleHtml(extractArticleHtml(sourceHtml), entry.title, entry.file);

  return {
    ...entry,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    coverPath: blogAssetPath(entry.cover),
    path: blogPostPath(entry),
    readingTime: estimateReadingTime(entry),
    articleHtml: article.html,
    searchText: stripTags(article.html).slice(0, 4000),
    toc: article.toc,
  };
}

function extractArticleHtml(html: string): string {
  const source = stripPostMetadata(html);
  return (
    elementInnerHtml(source, 'article') ||
    elementInnerHtml(source, 'main') ||
    elementInnerHtml(source, 'body') ||
    source
  ).trim();
}

function normalizeArticleHtml(
  html: string,
  title: string,
  sourcePath: string,
): { html: string; toc: BlogTocItem[] } {
  const withoutUtilities = removeReaderUtilityBlocks(html)
    .replace(
      /<\s*(script|style|noscript|iframe|object|embed|form|input|button|select|textarea)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
      '',
    )
    .replace(/<\s*(input|button|select|textarea)\b[^>]*>/gi, '');
  const withoutDuplicateTitle = withoutUtilities.replace(
    /<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi,
    (_match, attrs: string, content: string) =>
      normalizeText(stripTags(content)) === normalizeText(title)
        ? ''
        : `<h2${attrs}>${content}</h2>`,
  );
  const withoutArticleHeader = withoutDuplicateTitle.replace(
    /<header\b[^>]*>([\s\S]*?)<\/header>/gi,
    '$1',
  );
  const articleWithToc = addHeadingIds(withoutArticleHeader);
  return {
    html: rewriteArticleUrls(articleWithToc.html, sourcePath).trim(),
    toc: articleWithToc.toc,
  };
}

function rewriteArticleUrls(html: string, sourcePath: string): string {
  return html
    .replace(
      /\s(href|src)=("|')([^"']+)\2/g,
      (_match, attribute: string, quote: string, value: string) => {
        return ` ${attribute}=${quote}${escapeHtml(normalizeArticleUrl(value, sourcePath))}${quote}`;
      },
    )
    .replace(/\ssrcset=("|')([^"']+)\1/g, (_match, quote: string, value: string) => {
      return ` srcset=${quote}${escapeHtml(normalizeSrcset(value, sourcePath))}${quote}`;
    });
}

function normalizeSrcset(value: string, sourcePath: string): string {
  return value
    .split(',')
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      const url = parts.shift();
      if (!url) return '';
      return [normalizeArticleUrl(url, sourcePath), ...parts].join(' ');
    })
    .filter(Boolean)
    .join(', ');
}

function normalizeArticleUrl(value: string, sourcePath: string): string {
  const text = String(value || '').trim();
  if (!text || text.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/i.test(text)) {
    return text;
  }

  if (text.startsWith('/blog-assets/')) return text;
  if (text.startsWith('/assets/')) return blogAssetPath(text);
  if (text.startsWith('/posts/')) return normalizePostUrl(text);

  const resolved = new URL(text, `https://corca.local/${sourcePath.replace(/^\/+/, '')}`);
  const assetIndex = resolved.pathname.indexOf('/assets/');
  if (assetIndex >= 0) return blogAssetPath(resolved.pathname.slice(assetIndex));

  const postIndex = resolved.pathname.indexOf('/posts/');
  if (postIndex >= 0) return normalizePostUrl(resolved.pathname.slice(postIndex));

  return text;
}

function normalizePostUrl(path: string): string {
  const match = path.match(/^\/?posts\/([^/.]+)\/?$/) ?? path.match(/^\/?posts\/([^/]+)\.html$/);
  return match ? `${BLOG_POSTS_BASE_PATH}/${encodeURIComponent(match[1] || '')}` : path;
}

function addHeadingIds(html: string): { html: string; toc: BlogTocItem[] } {
  const used = new Set<string>();
  const toc: BlogTocItem[] = [];
  const output = html.replace(
    /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelText: string, attrs: string, content: string) => {
      const text = normalizeText(stripTags(content));
      if (!text) return match;

      const existingId = attrs.match(/\sid=(["'])(.*?)\1/i)?.[2] || '';
      const id = uniqueHeadingId(existingId || slugify(text), used);
      const level = Number(levelText);
      toc.push({ id, text, level });

      const nextAttrs = existingId
        ? attrs.replace(/\sid=(["'])(.*?)\1/i, ` id="${id}"`)
        : `${attrs} id="${id}"`;
      return `<h${level}${nextAttrs}>${content}</h${level}>`;
    },
  );
  return { html: output, toc };
}

function uniqueHeadingId(base: string, used: Set<string>): string {
  const fallback = base || 'section';
  let candidate = fallback;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${fallback}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-') || 'section'
  );
}

function removeReaderUtilityBlocks(html: string): string {
  return html.replace(
    /<(section|div)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, _tag: string, attrs: string) =>
      /\sdata-quiz(?:\s|=|$)/i.test(attrs) || /\b(?:quiz|checkpoint)\b/i.test(attrs) ? '' : match,
  );
}

function stripPostMetadata(html: string): string {
  return html.replace(/^\s*<!--\s*corca-post\s*[\s\S]*?-->\s*/i, '');
}

function elementInnerHtml(html: string, tagName: string): string {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(pattern);
  return match ? (match[1] ?? '').trim() : '';
}

function estimateReadingTime(post: BlogPostIndexEntry): string {
  const words =
    [post.title, post.description, ...(post.tags || [])].join(' ').length +
    Number(post.wordCount || 800);
  return `${Math.max(1, Math.ceil(words / 600))}분 읽기`;
}

function stripTags(value: string): string {
  return decodeHtml(
    value
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\s*(script|style|noscript)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
