import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

const fail = (message) => {
  throw new Error(`[seo-governance] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const readDist = (path) => {
  const file = join(dist, path);
  assert(existsSync(file), `missing dist/${path}; run the production build first`);
  return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file));
};

const redirectRules = (source) =>
  source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });

const sitemapEntries = (xml) =>
  [...xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map(
    (match) => match[1]?.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
  );

const routeFile = (url) => {
  const pathname = new URL(url).pathname;
  return pathname === '/'
    ? 'index.html'
    : `${pathname.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
};

const expectedLanguage = (url) => {
  const pathname = new URL(url).pathname;
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
  if (pathname === '/ja' || pathname.startsWith('/ja/')) return 'ja';
  if (pathname === '/zh' || pathname.startsWith('/zh/')) return 'zh-CN';
  return 'ko';
};

const metaContent = (html, key, value) => {
  for (const match of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = match[0];
    if (!new RegExp(`\\b${key}=["']${value}["']`, 'i').test(tag)) continue;
    return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? '';
  }
  return '';
};

const sourceHasAuthor = (url) => {
  const pathname = new URL(url).pathname.replace(/\/$/, '');
  const slug = pathname.split('/').at(-1);
  if (!slug) return false;
  const source = join(root, 'public', 'blog', 'admin', 'post-sources', `${slug}.html`);
  return existsSync(source) && /"author"\s*:\s*"[^"]+"/.test(readFileSync(source, 'utf8'));
};

const sitemapFiles = [
  'sitemap-pages.xml',
  'sitemap-categories.xml',
  'sitemap-tags.xml',
  'sitemap-posts.xml',
];
const entries = sitemapFiles.flatMap((filename) =>
  sitemapEntries(readDist(filename)).map((url) => ({
    url,
    kind: filename.replace('sitemap-', '').replace('.xml', ''),
  })),
);

assert(entries.length > 0, 'no public URLs found in the sitemap set');
assert(new Set(entries.map(({ url }) => url)).size === entries.length, 'duplicate public URL');
assert(
  !entries.some(({ url }) => new URL(url).pathname === '/ax-backup'),
  'AX backup must stay out of public sitemaps',
);

const redirects = redirectRules(readDist('_redirects'));
const expectedLegacyRedirects = new Map([
  ['/blank', '/'],
  ['/blank-2', '/'],
  ['/en/blank-1-1', '/'],
  ['/home-1', '/'],
  ['/home-2', '/'],
  ['/en/home-1', '/en'],
  ['/en/home-2', '/'],
  ['/ja/home-1', '/'],
  ['/ja/home-2', '/ja'],
  ['/zh/home-1', '/zh'],
  ['/zh/home-2', '/zh'],
  ['/research-recsys', '/products'],
  ['/en/research-recsys', '/products'],
  ['/corca-ads', '/products'],
  ['/research-llm', '/products'],
  ['/en/research-llm', '/products'],
  ['/memory-agent', '/products'],
  ['/en/memory-agent', '/products'],
  ['/ja/memory-agent', '/products'],
]);
const legacyHomeRedirects = redirects.filter(({ from }) =>
  /^\/(?:(?:en|ja|zh)\/)?home-/.test(from),
);
assert(
  legacyHomeRedirects.length === 8,
  'legacy homepage redirects must cover only the eight known aliases',
);
for (const [from, to] of expectedLegacyRedirects) {
  const matches = redirects.filter((redirect) => redirect.from === from);
  assert(matches.length === 1, `${from} must have exactly one redirect rule`);
  assert(matches[0].to === to, `${from} must redirect to ${to}`);
  assert(matches[0].status === '301', `${from} must use a permanent redirect`);
}

for (const { url, kind } of entries) {
  const path = routeFile(url);
  const html = readDist(path).replaceAll(/<!--[\s\S]*?-->/g, '');
  const expectedLang = expectedLanguage(url);
  assert(
    new RegExp(`<html\\b[^>]*\\blang=["']${expectedLang}["']`, 'i').test(html),
    `${path} must use lang=${expectedLang}`,
  );

  const robots = metaContent(html, 'name', 'robots')
    .toLowerCase()
    .split(',')
    .map((token) => token.trim());
  assert(robots.includes('index') && robots.includes('follow'), `${path} must be index, follow`);
  assert(!robots.includes('noindex') && !robots.includes('nofollow'), `${path} is noindex`);

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    // Astro serializes alt="" as the valid HTML boolean form `alt`.
    assert(
      /\balt(?:=(?:"[^"]*"|'[^']*'))?(?:\s|>)/i.test(match[0]),
      `${path} has an img without alt`,
    );
  }

  let structuredAuthor = false;
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let data;
    try {
      data = JSON.parse(match[1] ?? '');
    } catch (error) {
      fail(`${path} has invalid JSON-LD: ${error instanceof Error ? error.message : error}`);
    }

    const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
    for (const node of nodes) {
      if (node && 'author' in node) structuredAuthor = true;
      if (node?.['@type'] === 'WebSite') {
        assert(node.inLanguage === expectedLang, `${path} WebSite language does not match`);
      }
      if (node?.['@type'] === 'SoftwareApplication' || node?.['@type'] === 'Service') {
        assert(node.inLanguage === expectedLang, `${path} schema language does not match`);
        assert(!('offers' in node), `${path} exposes an offer absent from the page`);
      }
      if (kind !== 'posts') {
        assert(!('author' in (node ?? {})), `${path} has an author on a general-page schema`);
      }
    }
  }

  const author =
    metaContent(html, 'name', 'author') || metaContent(html, 'property', 'article:author');
  if (kind === 'posts') {
    const explicitAuthor = sourceHasAuthor(url);
    assert(
      explicitAuthor ? author.length > 0 : author.length === 0,
      `${path} author metadata does not match its explicit source author`,
    );
    assert(
      explicitAuthor ? structuredAuthor : !structuredAuthor,
      `${path} structured author does not match its explicit source author`,
    );
  } else {
    assert(author.length === 0, `${path} is a general page and must not emit author metadata`);
    assert(!structuredAuthor, `${path} is a general page and must not emit a structured author`);
  }
}

for (const [language, path] of [
  ['ko', 'ax/index.html'],
  ['en', 'en/ax/index.html'],
  ['ja', 'ja/ax/index.html'],
  ['zh-CN', 'zh/ax/index.html'],
]) {
  const html = readDist(path);
  const schemas = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((match) => JSON.parse(match[1] ?? ''));
  const nodes = schemas.flatMap((schema) => schema?.['@graph'] ?? [schema]);
  const website = nodes.find((node) => node?.['@type'] === 'WebSite');
  const service = nodes.find((node) => node?.['@type'] === 'Service');
  assert(website?.inLanguage === language, `${path} WebSite language is wrong`);
  assert(service?.inLanguage === language, `${path} Service language is wrong`);
  assert(!('offers' in service), `${path} still contains hidden AX pricing`);
}

const axBackup = readDist('ax-backup/index.html');
const publicOrigin = new URL(entries[0].url).origin;
const backupRobots = metaContent(axBackup, 'name', 'robots')
  .toLowerCase()
  .split(',')
  .map((token) => token.trim());
assert(
  backupRobots.includes('noindex') && backupRobots.includes('nofollow'),
  'AX backup must be noindex, nofollow',
);
assert(
  /<html\b[^>]*\blang=["']ko["']/i.test(axBackup),
  'AX backup must retain the Korean document language',
);
assert(
  axBackup
    .match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0]
    ?.match(/\bhref=["']([^"']+)["']/i)?.[1] === `${publicOrigin}/ax`,
  'AX backup must canonicalize to the live AX route',
);

console.log(`SEO governance checks passed for ${entries.length} public URLs.`);
