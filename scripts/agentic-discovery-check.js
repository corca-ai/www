import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withStaticAssetCacheHeaders } from '../worker/staticAssetHeaders.js';

const root = process.cwd();
const dist = join(root, 'dist');

const fail = (message) => {
  throw new Error(`[agentic-discovery] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const readDist = (path) => {
  const file = join(dist, path);
  assert(existsSync(file), `missing dist/${path}; run the production build first`);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(file));
  } catch {
    fail(`dist/${path} is not valid UTF-8`);
  }
};

const validLastModified = (value) =>
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value) &&
  !Number.isNaN(Date.parse(value));

const sitemapEntries = (xml, element) =>
  [...xml.matchAll(new RegExp(`<${element}>\\s*([\\s\\S]*?)<\\/${element}>`, 'g'))].map((match) => {
    const body = match[1] ?? '';
    return {
      loc: body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
      lastmod: body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '',
    };
  });

const routeFile = (url) => {
  const pathname = new URL(url).pathname;
  return pathname === '/'
    ? 'index.html'
    : `${pathname.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
};

const assertPublicUrl = (url, source) => {
  const parsed = new URL(url);
  assert(
    parsed.origin === 'https://www.borca.ai',
    `${source} contains a non-canonical URL: ${url}`,
  );
  assert(existsSync(join(dist, routeFile(url))), `${source} URL has no built page: ${url}`);
};

const sitemap = readDist('sitemap.xml');
const sitemapIndexEntries = sitemapEntries(sitemap, 'sitemap');
const childSitemaps = sitemapIndexEntries.map((entry) => entry.loc);
const expectedSitemaps = ['pages', 'categories', 'tags', 'posts'].map(
  (name) => `https://www.borca.ai/sitemap-${name}.xml`,
);
assert(
  JSON.stringify(childSitemaps) === JSON.stringify(expectedSitemaps),
  'sitemap.xml child sitemap list changed',
);
for (const url of childSitemaps) {
  assert(existsSync(join(dist, new URL(url).pathname.slice(1))), `missing child sitemap: ${url}`);
}
for (const entry of sitemapIndexEntries) {
  assert(validLastModified(entry.lastmod), `sitemap.xml has invalid lastmod for ${entry.loc}`);
  const child = readDist(new URL(entry.loc).pathname.slice(1));
  const childDates = sitemapEntries(child, 'url')
    .map(({ lastmod }) => lastmod)
    .sort();
  assert(childDates.length > 0, `${entry.loc} contains no URL entries`);
  assert(
    entry.lastmod === childDates.at(-1),
    `sitemap.xml lastmod does not match the newest URL in ${entry.loc}`,
  );
}
for (const filename of [
  'sitemap.xml',
  'sitemap-pages.xml',
  'sitemap-categories.xml',
  'sitemap-tags.xml',
  'sitemap-posts.xml',
]) {
  assert(
    readDist(filename).includes('href="/sitemap.xsl?v=20260721-blue"'),
    `${filename} must reference the current sitemap presentation`,
  );
}
assert(
  !existsSync(join(dist, 'sitemap-index.xml')),
  'legacy sitemap-index.xml must not be emitted',
);

const sitemapPresentation = readDist('sitemap.xsl');
assert(
  sitemapPresentation.includes('class="latest"') &&
    sitemapPresentation.includes('URL Last Modified'),
  'child sitemap pages must distinguish the sitemap date from URL dates',
);
assert(
  sitemapPresentation.includes('/fonts/ax-mobile/v1/pretendard-ko.woff2'),
  'sitemap presentation must use the lightweight Pretendard subset',
);

const pageSitemap = readDist('sitemap-pages.xml');
const pageEntries = sitemapEntries(pageSitemap, 'url');
const pageUrls = pageEntries.map((entry) => entry.loc);
assert(pageUrls.length === 44, `expected 44 public page URLs, found ${pageUrls.length}`);
assert(new Set(pageUrls).size === pageUrls.length, 'sitemap-pages.xml contains duplicate URLs');
for (const url of pageUrls) assertPublicUrl(url, 'sitemap-pages.xml');
for (const entry of pageEntries) {
  assert(
    validLastModified(entry.lastmod),
    `sitemap-pages.xml has invalid lastmod for ${entry.loc}`,
  );
}
assert(
  (pageSitemap.match(/hreflang="x-default"/g) ?? []).length === pageUrls.length,
  'every public page URL must include x-default',
);

const robots = readDist('robots.txt');
const disallowed = robots
  .split('\n')
  .filter((line) => line.startsWith('Disallow:'))
  .map((line) => line.slice('Disallow:'.length).trim());
assert(robots.startsWith('User-agent: *\nAllow: /\n'), 'robots.txt must allow public crawling');
assert(
  JSON.stringify(disallowed) ===
    JSON.stringify(['/admin', '/admin/', '/blog/admin', '/blog/admin/']),
  'robots.txt must block only administration routes',
);
assert(!robots.includes('Disallow: /privacy'), 'privacy pages must remain crawlable');
assert(
  robots.includes('Sitemap: https://www.borca.ai/sitemap.xml'),
  'robots.txt sitemap is missing',
);
assert(robots.includes('.+omnNNNNh.'), 'robots.txt Corca ASCII Identity is missing');

const llms = readDist('llms.txt');
assert(
  llms.startsWith('# Corca\n\n> Corca is a Korean AI company'),
  'llms.txt needs the canonical Corca introduction first',
);
for (const heading of ['## 한국어', '## English', '## 日本語', '## 中文', '## Optional']) {
  assert(llms.includes(heading), `llms.txt is missing ${heading}`);
}
assert(
  /- \[[^\]]+\]\(https:\/\/www\.corca\.ai\//.test(llms),
  'llms.txt H2 sections must contain Markdown links',
);
assert(
  !llms.includes('Corca Ads'),
  'llms.txt must not advertise the discontinued Corca Ads service',
);
assert(!llms.includes('www.borca.ai'), 'llms.txt must not expose the retiring borca.ai hostname');
for (const path of [
  '/',
  '/products',
  '/ax',
  '/about',
  '/en/',
  '/en/products',
  '/en/ax',
  '/en/about',
  '/ja/',
  '/ja/products',
  '/ja/ax',
  '/ja/about',
  '/zh/',
  '/zh/products',
  '/zh/ax',
  '/zh/about',
  '/news',
  '/blog',
  '/en/blog',
  '/ja/blog',
  '/zh/blog',
]) {
  assert(llms.includes(`https://www.corca.ai${path}`), `llms.txt is missing ${path}`);
}

for (const filename of [
  'sitemap-pages.xml',
  'sitemap-categories.xml',
  'sitemap-tags.xml',
  'sitemap-posts.xml',
]) {
  const entries = sitemapEntries(readDist(filename), 'url');
  assert(entries.length > 0, `${filename} contains no URL entries`);
  for (const entry of entries) {
    assert(entry.loc, `${filename} contains a URL without loc`);
    assert(validLastModified(entry.lastmod), `${filename} has invalid lastmod for ${entry.loc}`);
    assertPublicUrl(entry.loc, filename);
  }
}

const applyStaticHeaders = (pathname, contentType) =>
  withStaticAssetCacheHeaders(
    new Request(`https://www.borca.ai${pathname}`),
    new Response('fixture', { headers: { 'Content-Type': contentType } }),
  );

for (const [pathname, input, expected] of [
  ['/llms.txt', 'text/plain', 'text/plain; charset=utf-8'],
  ['/robots.txt', 'text/plain', 'text/plain; charset=utf-8'],
  ['/sitemap.xml', 'application/xml', 'application/xml; charset=utf-8'],
  ['/sitemap.xsl', 'text/xsl', 'text/xsl; charset=utf-8'],
  ['/rss', '', 'application/rss+xml; charset=utf-8'],
  ['/rss.xml', 'application/rss+xml', 'application/rss+xml; charset=utf-8'],
]) {
  const response = applyStaticHeaders(pathname, input);
  assert(
    response.headers.get('Content-Type') === expected,
    `${pathname} must be served as ${expected}`,
  );
  assert(
    response.headers.get('Cache-Control') === 'public, max-age=0, must-revalidate',
    `${pathname} must revalidate instead of serving stale discovery data`,
  );
}

const localePages = [
  ['ko', 'ax/index.html'],
  ['en', 'en/ax/index.html'],
  ['ja', 'ja/ax/index.html'],
  ['zh-CN', 'zh/ax/index.html'],
];

for (const [lang, path] of localePages) {
  const html = readDist(path).replaceAll(/<!--[\s\S]*?-->/g, '');
  const count = (pattern) => html.match(pattern)?.length ?? 0;
  assert(
    new RegExp(`<html[^>]+lang="${lang}"`).test(html),
    `${path} has the wrong document language`,
  );
  assert(count(/<main\b/g) === 1, `${path} must have exactly one main landmark`);
  assert(count(/<header\b/g) === 1, `${path} must have exactly one header landmark`);
  assert(count(/<footer\b/g) === 1, `${path} must have exactly one footer landmark`);
  assert(count(/<h1\b/g) === 1, `${path} must have exactly one h1`);

  const headings = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
  assert(headings[0] === 1, `${path} heading outline must start with h1`);
  assert(
    headings.every((level, index) => index === 0 || level <= headings[index - 1] + 1),
    `${path} heading outline skips a level`,
  );

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert(new Set(ids).size === ids.length, `${path} contains duplicate IDs`);
  const idSet = new Set(ids);
  for (const match of html.matchAll(/\baria-labelledby="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) {
      assert(idSet.has(id), `${path} aria-labelledby references missing #${id}`);
    }
  }

  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  assert(
    images.every((image) => /\balt="[^"]*"/.test(image)),
    `${path} contains an image without alt`,
  );

  const slides = [...html.matchAll(/<(?:article|figure)\b[^>]*data-carousel-slide[^>]*>/g)].map(
    (match) => match[0],
  );
  const expectedSlides = lang === 'ko' ? 2 : 5;
  assert(
    slides.length === expectedSlides,
    `${path} must expose ${expectedSlides} semantic carousel slides`,
  );
  for (const slide of slides) {
    assert(!/\brole="group"/.test(slide), `${path} overrides a semantic slide with role=group`);
    assert(!/\baria-label=/.test(slide), `${path} uses aria-label as carousel data`);
    assert(/\baria-labelledby=/.test(slide), `${path} slide is missing aria-labelledby`);
    assert(
      /\bdata-carousel-announcement=/.test(slide),
      `${path} slide announcement data is missing`,
    );
    if (/\bdata-active="false"/.test(slide)) {
      assert(/\baria-hidden="true"/.test(slide), `${path} inactive slide is exposed`);
    } else {
      assert(!/\baria-hidden=/.test(slide), `${path} active slide is hidden`);
    }
  }

  const controls = [
    ...html.matchAll(/<button\b[^>]*data-carousel-(?:previous|next|select|playback)[^>]*>/g),
  ].map((match) => match[0]);
  const expectedControls = lang === 'ko' ? 2 : 11;
  assert(
    controls.length === expectedControls,
    `${path} must expose ${expectedControls} carousel controls`,
  );
  assert(
    controls.every((control) => /\baria-label="[^"]+"/.test(control)),
    `${path} has an unnamed carousel control`,
  );
  assert(
    count(/aria-live="polite"[^>]*data-carousel-status/g) === (lang === 'ko' ? 1 : 2),
    `${path} has the wrong number of polite carousel status regions`,
  );
}

console.log(
  `Agentic discovery checks passed: ${pageUrls.length} sitemap URLs, a linked four-language llms directory without Corca Ads, ${localePages.length} AX locales.`,
);
