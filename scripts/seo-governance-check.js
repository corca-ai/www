import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

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

const attributeValue = (tag, name) =>
  tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] ?? '';

const alternateLinks = (source, tagName = 'link') =>
  [...source.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))]
    .map((match) => match[0])
    .filter((tag) => attributeValue(tag, 'rel').toLowerCase() === 'alternate')
    .filter((tag) => attributeValue(tag, 'hreflang'))
    .map((tag) => ({
      hreflang: attributeValue(tag, 'hreflang'),
      href: attributeValue(tag, 'href'),
    }));

const sitemapRecords = (xml) =>
  [...xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map((match) => {
    const body = match[1] ?? '';
    return {
      loc: body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
      alternates: alternateLinks(body, 'xhtml:link'),
    };
  });

const sitemapEntries = (xml) => sitemapRecords(xml).map(({ loc }) => loc);

const canonicalHref = (html) =>
  [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => attributeValue(tag, 'rel').toLowerCase() === 'canonical')
    ?.match(/\bhref=["']([^"']*)["']/i)?.[1] ?? '';

const alternateSet = (alternates) =>
  alternates.map(({ hreflang, href }) => `${hreflang}\u0000${href}`).sort();

const assertSameAlternates = (actual, expected, source) => {
  assert(
    new Set(alternateSet(actual)).size === actual.length,
    `${source} contains duplicate hreflang links`,
  );
  assert(
    JSON.stringify(alternateSet(actual)) === JSON.stringify(alternateSet(expected)),
    `${source} hreflang set does not match its localized cluster`,
  );
};

const localizedRoute = (url) => {
  const pathname = new URL(url).pathname || '/';
  for (const locale of ['en', 'ja', 'zh']) {
    if (pathname === `/${locale}`) return { locale, group: '/' };
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, group: pathname.slice(locale.length + 1) || '/' };
    }
  }
  return { locale: 'ko', group: pathname };
};

const htmlFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });

const routeUrlForFile = (file, origin) => {
  const path = relative(dist, file).replaceAll('\\', '/');
  const pathname = path.endsWith('/index.html')
    ? `/${path.slice(0, -'/index.html'.length)}`
    : `/${path.slice(0, -'.html'.length)}`;
  return `${origin}${pathname === '/' ? '' : pathname}`;
};

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

const hreflangByLocale = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh: 'zh-Hans',
};
const legacyHreflang = new Set(['ko-KR', 'en-US', 'ja-JP', 'zh-CN']);
const pageSitemapRecords = sitemapRecords(readDist('sitemap-pages.xml'));
const postSitemapRecords = sitemapRecords(readDist('sitemap-posts.xml'));
const localizedRecords = [
  ...pageSitemapRecords.map((record) => ({ ...record, source: 'pages' })),
  ...postSitemapRecords.map((record) => ({ ...record, source: 'posts' })),
];
const localizedUrls = new Set(localizedRecords.map(({ loc }) => loc));
const noindexUrls = new Set();

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  const robots = metaContent(html, 'name', 'robots')
    .toLowerCase()
    .split(',')
    .map((token) => token.trim());
  if (!robots.includes('noindex')) continue;

  const routeUrl = routeUrlForFile(file, new URL(localizedRecords[0].loc).origin);
  noindexUrls.add(routeUrl);
  assert(
    alternateLinks(html).length === 0,
    `${relative(dist, file)} is noindex and must not emit hreflang`,
  );
  assert(!localizedUrls.has(routeUrl), `${routeUrl} is noindex but appears in a public sitemap`);
}

const localizedGroups = new Map();
for (const record of localizedRecords) {
  const route = localizedRoute(record.loc);
  const group = localizedGroups.get(route.group) || [];
  group.push({ ...record, locale: route.locale });
  localizedGroups.set(route.group, group);
}

const translationDistribution = new Map();
for (const [groupPath, records] of localizedGroups) {
  const byLocale = new Map();
  for (const record of records) {
    assert(!byLocale.has(record.locale), `${groupPath} has duplicate ${record.locale} URLs`);
    byLocale.set(record.locale, record);
  }
  assert(byLocale.has('ko'), `${groupPath} has no indexable Korean x-default target`);

  const expectedAlternates = [...byLocale.entries()].map(([locale, record]) => ({
    hreflang: hreflangByLocale[locale],
    href: record.loc,
  }));
  expectedAlternates.push({ hreflang: 'x-default', href: byLocale.get('ko').loc });

  for (const record of records) {
    const path = routeFile(record.loc);
    const html = readDist(path).replaceAll(/<!--[\s\S]*?-->/g, '');
    const htmlAlternates = alternateLinks(html);
    assert(
      canonicalHref(html) === record.loc,
      `${path} canonical must match its sitemap URL ${record.loc}`,
    );
    assert(
      htmlAlternates.length === records.length + 1,
      `${path} must emit ${records.length + 1} hreflang links`,
    );
    assertSameAlternates(htmlAlternates, expectedAlternates, path);
    assert(
      htmlAlternates.every(({ hreflang }) => !legacyHreflang.has(hreflang)),
      `${path} contains a legacy regional hreflang`,
    );
    for (const alternate of htmlAlternates) {
      assert(
        alternate.href.startsWith(`${new URL(record.loc).origin}/`) ||
          alternate.href === new URL(record.loc).origin,
        `${path} contains a non-canonical hreflang URL: ${alternate.href}`,
      );
      assert(!noindexUrls.has(alternate.href), `${path} references noindex URL ${alternate.href}`);
      assert(
        existsSync(join(dist, routeFile(alternate.href))),
        `${path} hreflang target has no built page: ${alternate.href}`,
      );
    }

    if (record.source === 'pages') {
      assertSameAlternates(record.alternates, htmlAlternates, `sitemap-pages.xml ${record.loc}`);
    } else {
      assert(
        record.alternates.length === 0,
        `sitemap-posts.xml must remain URL-only for ${record.loc}`,
      );
    }
  }

  const current = translationDistribution.get(records.length) || { groups: 0, urls: 0 };
  current.groups += 1;
  current.urls += records.length;
  translationDistribution.set(records.length, current);
}

const publicOrigin = new URL(localizedRecords[0].loc).origin;
const expectedHomeAlternates = [
  { hreflang: 'ko', href: publicOrigin },
  { hreflang: 'en', href: `${publicOrigin}/en` },
  { hreflang: 'ja', href: `${publicOrigin}/ja` },
  { hreflang: 'zh-Hans', href: `${publicOrigin}/zh` },
  { hreflang: 'x-default', href: publicOrigin },
];
for (const url of [
  publicOrigin,
  `${publicOrigin}/en`,
  `${publicOrigin}/ja`,
  `${publicOrigin}/zh`,
]) {
  const html = readDist(routeFile(url));
  assert(canonicalHref(html) === url, `${url} home canonical is incorrect`);
  assertSameAlternates(alternateLinks(html), expectedHomeAlternates, `${url} home`);
}

const redirects = redirectRules(readDist('_redirects'));
const expectedLegacyRedirects = new Map([
  ['/272d67d7-5de7-4a39-8563-a87e0de46ed1', '/'],
  ['/blank', '/privacy'],
  ['/blank-1-1', '/'],
  ['/blank-2', '/'],
  ['/en/blank', '/'],
  ['/en/blank-1', '/'],
  ['/en/blank-1-1', '/'],
  ['/ja/blank-1', '/'],
  ['/home-1', '/'],
  ['/home-2', '/'],
  ['/home-3', '/'],
  ['/home-3-2', '/'],
  ['/home-4', '/'],
  ['/home-4-1-1', '/'],
  ['/home-4-2', '/'],
  ['/en/home-1', '/en'],
  ['/en/home-2', '/'],
  ['/en/home-4-1-1', '/'],
  ['/ja/home-1', '/'],
  ['/ja/home-2', '/ja'],
  ['/zh/home-1', '/zh'],
  ['/zh/home-2', '/zh'],
  ['/ko', '/'],
  ['/ko/about-us', '/'],
  ['/en/colleagues-1', '/'],
  ['/research-recsys', '/products'],
  ['/en/research-recsys', '/products'],
  ['/corca-ads', '/products'],
  ['/ceal', '/products'],
  ['/ko/trace', '/products'],
  ['/research-llm', '/products'],
  ['/en/research-llm', '/products'],
  ['/memory-agent', '/products'],
  ['/en/memory-agent', '/products'],
  ['/ja/memory-agent', '/products'],
  ['/en/aboutus', '/en/about/colleagues'],
]);
const legacyHomeRedirects = redirects.filter(({ from }) =>
  /^\/(?:(?:en|ja|zh)\/)?home-/.test(from),
);
const expectedLegacyHomeRedirectCount = [...expectedLegacyRedirects.keys()].filter((from) =>
  /^\/(?:(?:en|ja|zh)\/)?home-/.test(from),
).length;
assert(
  legacyHomeRedirects.length === expectedLegacyHomeRedirectCount,
  'legacy homepage redirects must cover only the known aliases',
);
for (const [from, to] of expectedLegacyRedirects) {
  const matches = redirects.filter((redirect) => redirect.from === from);
  assert(matches.length === 1, `${from} must have exactly one redirect rule`);
  assert(matches[0].to === to, `${from} must redirect to ${to}`);
  assert(matches[0].status === '301', `${from} must use a permanent redirect`);
}

for (const path of [
  'privacy/index.html',
  'en/privacy/index.html',
  'ja/privacy/index.html',
  'zh/privacy/index.html',
]) {
  const privacyHtml = readDist(path);
  const privacyRobots = metaContent(privacyHtml, 'name', 'robots')
    .toLowerCase()
    .split(',')
    .map((token) => token.trim());
  assert(
    privacyRobots.includes('noindex') && privacyRobots.includes('nofollow'),
    `${path} must remain noindex, nofollow`,
  );
  assert(alternateLinks(privacyHtml).length === 0, `${path} must not emit hreflang`);
}
assert(
  !entries.some(({ url }) => new URL(url).pathname.endsWith('/privacy')),
  'localized privacy pages must stay out of public sitemaps',
);

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

const distribution = [...translationDistribution.entries()]
  .sort(([first], [second]) => first - second)
  .map(
    ([languages, counts]) =>
      `${languages} language(s): ${counts.groups} group(s), ${counts.urls} URL(s)`,
  )
  .join('; ');
console.log(
  `SEO governance checks passed for ${entries.length} public URLs; localized distribution: ${distribution}.`,
);
