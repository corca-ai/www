import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  return readFileSync(file, 'utf8');
};

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
const childSitemaps = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
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
assert(
  !existsSync(join(dist, 'sitemap-index.xml')),
  'legacy sitemap-index.xml must not be emitted',
);

const pageSitemap = readDist('sitemap-pages.xml');
const pageUrls = [...pageSitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(pageUrls.length === 44, `expected 44 public page URLs, found ${pageUrls.length}`);
assert(new Set(pageUrls).size === pageUrls.length, 'sitemap-pages.xml contains duplicate URLs');
for (const url of pageUrls) assertPublicUrl(url, 'sitemap-pages.xml');
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
  'llms.txt needs the English global summary first',
);
for (const heading of ['## 한국어', '## English', '## 日本語', '## 中文', '## Optional']) {
  assert(llms.includes(heading), `llms.txt is missing ${heading}`);
}
const llmsUrls = [...llms.matchAll(/\]\((https:\/\/www\.borca\.ai\/[^)]*)\)/g)].map(
  (match) => match[1],
);
assert(llmsUrls.length === 21, `expected 21 official llms.txt links, found ${llmsUrls.length}`);
for (const url of llmsUrls) assertPublicUrl(url, 'llms.txt');

const localePages = [
  ['ko-KR', 'ax/index.html'],
  ['en-US', 'en/ax/index.html'],
  ['ja-JP', 'ja/ax/index.html'],
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
  assert(slides.length === 5, `${path} must expose five semantic carousel slides`);
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
  assert(controls.length === 11, `${path} must expose eleven carousel controls`);
  assert(
    controls.every((control) => /\baria-label="[^"]+"/.test(control)),
    `${path} has an unnamed carousel control`,
  );
  assert(
    count(/aria-live="polite"[^>]*data-carousel-status/g) === 2,
    `${path} needs two polite carousel status regions`,
  );
}

console.log(
  `Agentic discovery checks passed: ${pageUrls.length} sitemap URLs, ${llmsUrls.length} llms links, ${localePages.length} AX locales.`,
);
