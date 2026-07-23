import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(repoRoot, 'dist');
// Astro names the shared shell stylesheet after the component that owns the
// extracted CSS. It used to be BaseLayout and is currently CommonHead. Match
// either name so a harmless bundling-name change does not break production
// builds after Astro has already emitted valid pages.
const astroCssPattern = /\/_astro\/(?:BaseLayout|CommonHead)\.[^"')\s]+\.css/g;
const analyticsConfigPattern = /<script id="corca-analytics-config">.*?<\/script>/g;
const blogAppScriptPattern = /<script type="module" src="\/blog\/app\.js[^"']*"><\/script>/;
const commonHeadPattern = /<!-- corca-common-head:start -->[\s\S]*?<!-- corca-common-head:end -->/g;
const localeConfigs = [
  { locale: 'ko', root: 'blog', page: 'index.html', blogPath: '/blog', hreflang: 'ko-KR' },
  { locale: 'en', root: 'en/blog', page: 'en/index.html', blogPath: '/en/blog', hreflang: 'en-US' },
  { locale: 'ja', root: 'ja/blog', page: 'ja/index.html', blogPath: '/ja/blog', hreflang: 'ja-JP' },
  { locale: 'zh', root: 'zh/blog', page: 'zh/index.html', blogPath: '/zh/blog', hreflang: 'zh-CN' },
];

const rootHtml = await readFile(join(distRoot, 'index.html'), 'utf8');
const currentBaseLayoutCss = rootHtml.match(astroCssPattern)?.[0] || '';
const measurementId =
  rootHtml.match(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9-]{4,32})/i)?.[1] || '';
const blogAppSource = await readFile(join(distRoot, 'blog/app.js'), 'utf8');
const analyticsBootstrapIndex = blogAppSource.indexOf('\ninitAnalytics();');
const uiBootstrapIndex = blogAppSource.indexOf('\n  init();');
if (!currentBaseLayoutCss) {
  fail('Could not find the current BaseLayout CSS link in dist/index.html.');
}
if (
  analyticsBootstrapIndex < 0 ||
  uiBootstrapIndex < 0 ||
  analyticsBootstrapIndex > uiBootstrapIndex
) {
  fail('Blog analytics must initialize before the list UI bootstrap.');
}

await assertFileExists(join(distRoot, currentBaseLayoutCss));

const headerFragments = new Map();
const footerFragments = new Map();
const commonHeadFragments = new Map();
for (const config of localeConfigs) {
  const pageHtml = await readFile(join(distRoot, config.page), 'utf8');
  headerFragments.set(config.locale, extractBeforeMain(pageHtml, config.page));
  footerFragments.set(config.locale, extractFooter(pageHtml, config.page));
  commonHeadFragments.set(config.locale, extractCommonHead(pageHtml, config.page));
}

let updated = 0;
let headersSynced = 0;
let headerTargets = 0;
let footersSynced = 0;
let commonHeadsSynced = 0;
let analyticsConfigured = 0;
let analyticsTargets = 0;
for (const config of localeConfigs) {
  const root = join(distRoot, config.root);
  const files = (await htmlFiles(root)).filter((file) => isDeployableBlogPage(root, file));
  headerTargets += files.length;
  for (const file of files) {
    const html = await readFile(file, 'utf8');

    let next = html.replace(astroCssPattern, currentBaseLayoutCss);
    const slug = blogSlug(root, file);
    const header = localizeBlogHeader(headerFragments.get(config.locale), config, slug);
    next = replaceBeforeMain(next, header, relative(repoRoot, file));
    const footer = markBlogFooter(footerFragments.get(config.locale), config.locale);
    next = replaceFooter(next, footer, relative(repoRoot, file));
    next = replaceCommonHead(
      next,
      commonHeadFragments.get(config.locale),
      relative(repoRoot, file),
    );
    headersSynced += 1;
    footersSynced += 1;
    commonHeadsSynced += 1;
    if (next.includes('/blog/app.js')) {
      analyticsTargets += 1;
      if (!blogAppScriptPattern.test(next)) {
        fail(`Could not locate the blog app script tag in ${relative(repoRoot, file)}.`);
      }
      next = next.replace(analyticsConfigPattern, '');
      if (measurementId) {
        const analyticsConfig = `<script id="corca-analytics-config">window.CORCA_GA_MEASUREMENT_ID=${JSON.stringify(measurementId)};</script>`;
        next = next.replace(blogAppScriptPattern, `${analyticsConfig}$&`);
        if ((next.match(analyticsConfigPattern) || []).length !== 1) {
          fail(`Expected one analytics configuration in ${relative(repoRoot, file)}.`);
        }
        analyticsConfigured += 1;
      }
    }

    if (next !== html) {
      await writeFile(file, next);
      updated += 1;
    }

    if (!next.includes(currentBaseLayoutCss)) {
      fail(`${relative(repoRoot, file)} does not reference ${currentBaseLayoutCss}.`);
    }
    validateCommonHead(next, relative(repoRoot, file));
  }
}

if (measurementId && analyticsConfigured !== analyticsTargets) {
  fail(`Configured analytics for ${analyticsConfigured} of ${analyticsTargets} blog page(s).`);
}
if (headersSynced !== headerTargets) {
  fail(`Synced ${headersSynced} of ${headerTargets} deployable blog page header(s).`);
}
if (footersSynced !== headerTargets) {
  fail(`Synced ${footersSynced} of ${headerTargets} deployable blog page footer(s).`);
}
if (commonHeadsSynced !== headerTargets) {
  fail(`Synced ${commonHeadsSynced} of ${headerTargets} deployable blog page common head(s).`);
}

console.log(`Synced blog shell CSS ${currentBaseLayoutCss} in ${updated} file(s).`);
console.log(`Synced ${headersSynced} blog page header(s) from src/components/Header.astro.`);
console.log(`Synced ${footersSynced} blog page footer(s) from src/components/Footer.astro.`);
console.log(
  `Synced ${commonHeadsSynced} blog page common head(s) from src/components/CommonHead.astro.`,
);
console.log(
  measurementId
    ? `Configured ${analyticsConfigured} blog page(s) with GA4 measurement ID ${measurementId}.`
    : 'Google Analytics is disabled; no blog analytics configuration was emitted.',
);

function extractBeforeMain(html, source) {
  const bodyStart = html.indexOf('<body');
  const bodyOpenEnd = bodyStart < 0 ? -1 : html.indexOf('>', bodyStart);
  const mainStart = bodyOpenEnd < 0 ? -1 : html.indexOf('<main id="main"', bodyOpenEnd);
  if (bodyStart < 0 || bodyOpenEnd < 0 || mainStart < 0) {
    fail(`Could not locate the shared header in ${source}.`);
  }
  return html.slice(bodyOpenEnd + 1, mainStart);
}

function replaceBeforeMain(html, header, source) {
  const bodyStart = html.indexOf('<body');
  const bodyOpenEnd = bodyStart < 0 ? -1 : html.indexOf('>', bodyStart);
  const mainStart = bodyOpenEnd < 0 ? -1 : html.indexOf('<main id="main"', bodyOpenEnd);
  if (bodyStart < 0 || bodyOpenEnd < 0 || mainStart < 0) {
    fail(`Could not locate the blog header in ${source}.`);
  }
  return `${html.slice(0, bodyOpenEnd + 1)}${header}${html.slice(mainStart)}`;
}

function extractFooter(html, source) {
  const mainClose = html.indexOf('</main>');
  const footerStart = mainClose < 0 ? -1 : html.indexOf('<footer', mainClose);
  const footerClose = footerStart < 0 ? -1 : html.indexOf('</footer>', footerStart);
  if (mainClose < 0 || footerStart < 0 || footerClose < 0) {
    fail(`Could not locate the shared footer in ${source}.`);
  }
  return html.slice(footerStart, footerClose + '</footer>'.length);
}

function markBlogFooter(sourceFooter, locale) {
  if (!sourceFooter) fail(`Missing shared footer for ${locale}.`);
  const footer = sourceFooter.replace(/<footer class="([^"]*)"/, (_match, classes) => {
    const classNames = new Set(classes.split(/\s+/).filter(Boolean));
    classNames.add('corca-main-footer');
    return `<footer class="${[...classNames].join(' ')}"`;
  });
  if ((footer.match(/corca-main-footer/g) || []).length !== 1) {
    fail(`Expected one blog footer marker in the ${locale} shared footer.`);
  }
  return footer;
}

function replaceFooter(html, footer, source) {
  const mainClose = html.indexOf('</main>');
  const footerStart = mainClose < 0 ? -1 : html.indexOf('<footer', mainClose);
  const footerClose = footerStart < 0 ? -1 : html.indexOf('</footer>', footerStart);
  if (mainClose < 0 || footerStart < 0 || footerClose < 0) {
    fail(`Could not locate the blog footer in ${source}.`);
  }
  return `${html.slice(0, footerStart)}${footer}${html.slice(footerClose + '</footer>'.length)}`;
}

function extractCommonHead(html, source) {
  const matches = html.match(commonHeadPattern) || [];
  if (matches.length !== 1) {
    fail(`Expected one shared common head block in ${source}, found ${matches.length}.`);
  }
  return matches[0];
}

function replaceCommonHead(html, commonHead, source) {
  if (!commonHead) fail(`Missing shared common head for ${source}.`);

  let next = html.replace(commonHeadPattern, '');
  next = next.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = attributeValue(tag, 'rel');
    const href = attributeValue(tag, 'href');
    if (['icon', 'apple-touch-icon', 'manifest'].includes(rel)) return '';
    if (rel === 'preload' && href === '/fonts/PretendardVariable.woff2') return '';
    return tag;
  });
  next = next.replace(/<meta\b[^>]*>/gi, (tag) => {
    const name = attributeValue(tag, 'name');
    return ['theme-color', 'application-name', 'apple-mobile-web-app-title', 'publisher'].includes(
      name,
    )
      ? ''
      : tag;
  });

  const stylesheetStart = next.search(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/i);
  const headClose = next.indexOf('</head>');
  const insertAt = stylesheetStart >= 0 ? stylesheetStart : headClose;
  if (insertAt < 0) fail(`Could not locate the blog head insertion point in ${source}.`);
  const before = next.slice(0, insertAt).replace(/\s*$/, '\n    ');
  const after = next.slice(insertAt).replace(/^\s*/, '');
  return `${before}${commonHead}\n    ${after}`;
}

function attributeValue(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
}

function validateCommonHead(html, source) {
  const expectedOnce = [
    ['common head start marker', /<!-- corca-common-head:start -->/g],
    ['common head end marker', /<!-- corca-common-head:end -->/g],
    [
      'site favicon',
      /<link\b(?=[^>]*\brel=["']icon["'])(?=[^>]*\bhref=["']\/favicon\.png["'])[^>]*>/gi,
    ],
    ['apple touch icon', /<link\b(?=[^>]*\brel=["']apple-touch-icon["'])[^>]*>/gi],
    [
      'web manifest',
      /<link\b(?=[^>]*\brel=["']manifest["'])(?=[^>]*\bhref=["']\/site\.webmanifest["'])[^>]*>/gi,
    ],
    ['theme color', /<meta\b(?=[^>]*\bname=["']theme-color["'])[^>]*>/gi],
    ['application name', /<meta\b(?=[^>]*\bname=["']application-name["'])[^>]*>/gi],
    ['apple app title', /<meta\b(?=[^>]*\bname=["']apple-mobile-web-app-title["'])[^>]*>/gi],
    ['publisher', /<meta\b(?=[^>]*\bname=["']publisher["'])[^>]*>/gi],
    [
      'Pretendard preload',
      /<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bhref=["']\/fonts\/PretendardVariable\.woff2["'])[^>]*>/gi,
    ],
  ];
  for (const [label, pattern] of expectedOnce) {
    const count = (html.match(pattern) || []).length;
    if (count !== 1) fail(`Expected one ${label} in ${source}, found ${count}.`);
  }
  if (html.includes('/blog/assets/favicon.png')) {
    fail(`Legacy blog favicon remains in ${source}.`);
  }
}

function localizeBlogHeader(sourceHeader, config, slug) {
  if (!sourceHeader) fail(`Missing shared header for ${config.locale}.`);

  let header = sourceHeader
    .replace(/<header class="([^"]*)"/, (_match, classes) => {
      const classNames = new Set(classes.split(/\s+/).filter(Boolean));
      classNames.add('corca-main-header');
      return `<header class="${[...classNames].join(' ')}"`;
    })
    .replace(/ aria-current="page"/g, '')
    .replace(
      new RegExp(`<a href="${escapeRegExp(config.blogPath)}" (?!hreflang=)`, 'g'),
      `<a href="${config.blogPath}" aria-current="page" `,
    );

  for (const locale of localeConfigs) {
    const path = slug ? `${locale.blogPath}/${slug}` : locale.blogPath;
    header = header.replace(
      new RegExp(`href="[^"]*" hreflang="${locale.hreflang}"`, 'g'),
      `href="${path}" hreflang="${locale.hreflang}"`,
    );
  }

  const axPath = config.locale === 'ko' ? '/ax' : `/${config.locale}/ax`;
  if (countAnchors(header, { href: axPath }) !== 2) {
    fail(`Expected desktop and mobile AX links in the ${config.locale} shared header.`);
  }
  if (countAnchors(header, { href: config.blogPath, 'aria-current': 'page' }) !== 2) {
    fail(`Expected desktop and mobile current Blog links in the ${config.locale} shared header.`);
  }
  for (const locale of localeConfigs) {
    const path = slug ? `${locale.blogPath}/${slug}` : locale.blogPath;
    if (countAnchors(header, { href: path, hreflang: locale.hreflang }) !== 2) {
      fail(`Expected desktop and mobile ${locale.locale} language links to ${path}.`);
    }
  }
  if ((header.match(/corca-main-header/g) || []).length !== 1) {
    fail(`Expected one blog header marker in the ${config.locale} shared header.`);
  }
  return header;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countAnchors(html, attributes) {
  return (html.match(/<a\b[^>]*>/g) || []).filter((anchor) =>
    Object.entries(attributes).every(([name, value]) => anchor.includes(`${name}="${value}"`)),
  ).length;
}

function blogSlug(root, file) {
  const path = relative(root, file);
  if (path === 'index.html' || path === '404.html') return '';
  return path.endsWith('/index.html') ? path.slice(0, -'/index.html'.length) : '';
}

function isDeployableBlogPage(root, file) {
  const path = relative(root, file);
  return path !== 'admin' && !path.startsWith(`admin${sep}`);
}

async function htmlFiles(root) {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path);
    }
  }
  return files;
}

async function assertFileExists(path) {
  try {
    const info = await stat(path);
    if (info.isFile()) return;
  } catch {
    // handled below
  }
  fail(`Expected Astro CSS asset does not exist: ${relative(repoRoot, path)}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
