import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leadRequestCopyKeys, leadRequestVariants } from '../src/lead/leadRequestContract.js';
import {
  extractLeadRequestSection,
  injectBlogLeadRequestSection,
  resolveBlogLeadDeclaration,
  validateBlogLeadManifest,
} from './blog-lead-section.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(repoRoot, 'dist');
const leadRequestBuildRoot = join(distRoot, 'lead-request-fragment');
// Astro names the shared shell stylesheet after the component that owns the
// extracted CSS. It used to be BaseLayout and is currently CommonHead. Match
// either name so a harmless bundling-name change does not break production
// builds after Astro has already emitted valid pages.
const astroCssPattern = /\/_astro\/(?:BaseLayout|CommonHead)\.[^"')\s]+\.css/g;
const analyticsConfigPattern = /<script id="corca-analytics-config">.*?<\/script>/g;
const blogAppScriptPattern = /<script type="module" src="\/blog\/app\.js[^"']*"><\/script>/;
const commonHeadPattern = /<!-- corca-common-head:start -->[\s\S]*?<!-- corca-common-head:end -->/g;
const localeConfigs = [
  {
    locale: 'ko',
    root: 'blog',
    page: 'index.html',
    blogPath: '/blog',
    hreflang: 'ko',
    homeLabel: '홈',
    blogLabel: '블로그',
    breadcrumbLabel: '현재 위치',
    latestPostsTitle: '최신 글 더보기',
  },
  {
    locale: 'en',
    root: 'en/blog',
    page: 'en/index.html',
    blogPath: '/en/blog',
    hreflang: 'en',
    homeLabel: 'Home',
    blogLabel: 'Blog',
    breadcrumbLabel: 'Breadcrumb',
    latestPostsTitle: 'Latest posts',
  },
  {
    locale: 'ja',
    root: 'ja/blog',
    page: 'ja/index.html',
    blogPath: '/ja/blog',
    hreflang: 'ja',
    homeLabel: 'ホーム',
    blogLabel: 'ブログ',
    breadcrumbLabel: 'パンくずリスト',
    latestPostsTitle: '最新の記事',
  },
  {
    locale: 'zh',
    root: 'zh/blog',
    page: 'zh/index.html',
    blogPath: '/zh/blog',
    hreflang: 'zh-Hans',
    homeLabel: '首页',
    blogLabel: '博客',
    breadcrumbLabel: '面包屑导航',
    latestPostsTitle: '最新文章',
  },
];

const rootHtml = await readFile(join(distRoot, 'index.html'), 'utf8');
const currentBaseLayoutCss = rootHtml.match(astroCssPattern)?.[0] || '';
const measurementId =
  rootHtml.match(/\bGA_MEASUREMENT_ID\s*=\s*["'](G-[A-Z0-9-]{4,32})["']/i)?.[1] ||
  rootHtml.match(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9-]{4,32})/i)?.[1] ||
  '';
const blogAppSource = await readFile(join(distRoot, 'blog/app.js'), 'utf8');
const blogLeadPolicy = validateBlogLeadManifest(
  JSON.parse(await readFile(join(repoRoot, 'src/lead/blogLeadPages.json'), 'utf8')),
);
const analyticsBootstrapIndex = blogAppSource.indexOf('\ninitAnalytics();');
const uiBootstrapIndex = blogAppSource.indexOf('\n  init();');
if (!currentBaseLayoutCss) {
  fail('Could not find the current BaseLayout CSS link in dist/index.html.');
}
if (!measurementId) {
  fail('Could not find the GA4 measurement ID in dist/index.html.');
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
const leadRequestFragments = new Map();
for (const config of localeConfigs) {
  const pageHtml = await readFile(join(distRoot, config.page), 'utf8');
  headerFragments.set(config.locale, extractBeforeMain(pageHtml, config.page));
  footerFragments.set(config.locale, extractFooter(pageHtml, config.page));
  commonHeadFragments.set(config.locale, extractCommonHead(pageHtml, config.page));
  for (const variant of leadRequestVariants) {
    for (const copyKey of leadRequestCopyKeys) {
      const fragmentPage = `lead-request-fragment/${config.locale}/${variant}/${copyKey}/index.html`;
      const fragmentHtml = await readFile(join(distRoot, fragmentPage), 'utf8');
      leadRequestFragments.set(
        leadRequestFragmentKey(config.locale, variant, copyKey),
        extractLeadRequestSection(fragmentHtml, fragmentPage),
      );
    }
  }
}

let updated = 0;
let headersSynced = 0;
let headerTargets = 0;
let footersSynced = 0;
let commonHeadsSynced = 0;
let breadcrumbsSynced = 0;
let analyticsConfigured = 0;
let analyticsTargets = 0;
let leadSectionsSynced = 0;
const leadSectionLocales = new Map();
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
    const footer = markBlogFooter(footerFragments.get(config.locale), config, slug, next);
    next = replaceFooter(next, footer, relative(repoRoot, file));
    next = syncBlogBreadcrumbLd(next, config, slug, relative(repoRoot, file));
    next = replaceCommonHead(
      next,
      commonHeadFragments.get(config.locale),
      relative(repoRoot, file),
    );
    const leadDeclaration = slug ? resolveBlogLeadDeclaration(blogLeadPolicy, slug) : undefined;
    next = injectBlogLeadRequestSection(next, {
      fragment: leadDeclaration
        ? leadRequestFragments.get(
            leadRequestFragmentKey(
              config.locale,
              leadDeclaration.variant,
              leadDeclaration.copy_key,
            ),
          )
        : '',
      slug,
      locale: config.locale,
      declaration: leadDeclaration,
      source: relative(repoRoot, file),
    });
    next = addLatestPostNavigationIntro(next, config, relative(repoRoot, file));
    if (leadDeclaration) {
      validateStaticArticleLeadLayout(next, relative(repoRoot, file));
      leadSectionsSynced += 1;
      const locales = leadSectionLocales.get(slug) ?? new Set();
      locales.add(config.locale);
      leadSectionLocales.set(slug, locales);
    }
    headersSynced += 1;
    footersSynced += 1;
    commonHeadsSynced += 1;
    breadcrumbsSynced += 1;
    if (next.includes('/blog/app.js')) {
      analyticsTargets += 1;
      if (!blogAppScriptPattern.test(next)) {
        fail(`Could not locate the blog app script tag in ${relative(repoRoot, file)}.`);
      }
      next = next.replace(analyticsConfigPattern, '');
      const analyticsConfig = `<script id="corca-analytics-config">window.CORCA_GA_MEASUREMENT_ID=${JSON.stringify(measurementId)};</script>`;
      next = next.replace(blogAppScriptPattern, `${analyticsConfig}$&`);
      if ((next.match(analyticsConfigPattern) || []).length !== 1) {
        fail(`Expected one analytics configuration in ${relative(repoRoot, file)}.`);
      }
      analyticsConfigured += 1;
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

function validateStaticArticleLeadLayout(html, source) {
  const staticContentStart = html.indexOf('class="static-post-content"');
  const leadStart = html.indexOf('<!-- corca-lead-request:start -->');
  const leadEnd = html.indexOf('<!-- corca-lead-request:end -->');
  const staticContentEnd = html.lastIndexOf('</div>', leadStart);
  if (staticContentStart < 0 || staticContentEnd < 0 || leadStart < 0 || leadEnd < 0) {
    fail(`Missing static article/sidebar or Lead Request structure in ${source}.`);
  }
  if (
    !(staticContentStart < staticContentEnd && staticContentEnd < leadStart && leadStart < leadEnd)
  ) {
    fail(`Expected article sidebars to end before the Lead Request Section in ${source}.`);
  }

  const latestPostsStart = html.indexOf('class="article-more-posts"');
  if (html.includes('class="post-list"') && !(leadEnd < latestPostsStart)) {
    fail(`Expected latest-post navigation after the Lead Request Section in ${source}.`);
  }
}

if (analyticsConfigured !== analyticsTargets) {
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
for (const [slug, locales] of leadSectionLocales) {
  if (locales.size !== localeConfigs.length) {
    fail(
      `Blog Lead Form slug ${slug} was found in ${locales.size} of ${localeConfigs.length} locales.`,
    );
  }
}

await rm(leadRequestBuildRoot, { recursive: true, force: true });
await assertPathMissing(leadRequestBuildRoot);

console.log(`Synced blog shell CSS ${currentBaseLayoutCss} in ${updated} file(s).`);
console.log(`Synced ${headersSynced} blog page header(s) from src/components/Header.astro.`);
console.log(`Synced ${footersSynced} blog page footer(s) from src/components/Footer.astro.`);
console.log(
  `Synced ${commonHeadsSynced} blog page common head(s) from src/components/CommonHead.astro.`,
);
console.log(`Synced ${breadcrumbsSynced} blog page visual and JSON-LD breadcrumb trail(s).`);
console.log(`Synced ${leadSectionsSynced} public blog Lead Request Section(s).`);
console.log('Removed build-only Lead Request fragment routes from dist/.');
console.log(
  `Configured ${analyticsConfigured} blog page(s) with GA4 measurement ID ${measurementId}.`,
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

function leadRequestFragmentKey(locale, variant, copyKey) {
  return `${locale}:${variant}:${copyKey}`;
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

function markBlogFooter(sourceFooter, config, slug, document) {
  if (!sourceFooter) fail(`Missing shared footer for ${config.locale}.`);
  // The rendered site home now has an icon-only breadcrumb row. Blog pages
  // replace that home row with their own localized trail, so remove it before
  // adding the blog-specific row rather than duplicating the badge and trail.
  const footerWithoutBreadcrumb = removeFooterBreadcrumb(sourceFooter, config.locale);
  const footerWithMarker = footerWithoutBreadcrumb.replace(
    /<footer class="([^"]*)"/,
    (_match, classes) => {
      const classNames = new Set(classes.split(/\s+/).filter(Boolean));
      classNames.add('corca-main-footer');
      return `<footer class="${[...classNames].join(' ')}"`;
    },
  );
  if ((footerWithMarker.match(/corca-main-footer/g) || []).length !== 1) {
    fail(`Expected one blog footer marker in the ${config.locale} shared footer.`);
  }
  const footer = markBlogFooterVisualPartner(footerWithMarker, config.locale);
  const footerOpen = footer.match(/<footer\b[^>]*>/)?.[0];
  if (!footerOpen) fail(`Could not locate the ${config.locale} shared footer opening tag.`);
  return footer.replace(footerOpen, `${footerOpen}${renderBlogBreadcrumb(config, slug, document)}`);
}

function removeFooterBreadcrumb(footer, locale) {
  const breadcrumbPattern = /<div class="corca-footer-breadcrumb container-c">[\s\S]*?<\/div>/g;
  const matches = footer.match(breadcrumbPattern) || [];
  if (matches.length > 1) {
    fail(`Expected at most one shared footer breadcrumb in the ${locale} shell.`);
  }
  return footer.replace(breadcrumbPattern, '');
}

function markBlogFooterVisualPartner(footer, locale) {
  let partnerCount = 0;
  const next = footer.replace(/<img\b[^>]*\bclass="([^"]*)"[^>]*>/g, (image, classes) => {
    const classNames = new Set(classes.split(/\s+/).filter(Boolean));
    if (!classNames.has('corca-footer-partner')) return image;
    partnerCount += 1;
    classNames.add('corca-footer-partner-with-breadcrumb');
    return image.replace(`class="${classes}"`, `class="${[...classNames].join(' ')}"`);
  });
  if (partnerCount !== 1) {
    fail(`Expected one visual partner badge in the ${locale} shared footer.`);
  }
  return next;
}

function renderBlogBreadcrumb(config, slug, document) {
  const homePath = config.locale === 'ko' ? '/' : `/${config.locale}`;
  const currentName = slug ? blogPostTitle(document, config.blogLabel) : config.blogLabel;
  const homeIcon =
    '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" focusable="false"><path d="m2.25 7.03 5.1-4.35a1 1 0 0 1 1.3 0l5.1 4.35v6.22a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V7.03Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.35"/><path d="M6.25 14V9.75h3.5V14" stroke="currentColor" stroke-linejoin="round" stroke-width="1.35"/></svg>';
  const blogNode = slug
    ? `<a href="${config.blogPath}">${escapeHtml(config.blogLabel)}</a>`
    : `<span class="corca-breadcrumb-current" aria-current="page">${escapeHtml(config.blogLabel)}</span>`;
  const currentNode = slug
    ? `<li><span class="corca-breadcrumb-separator" aria-hidden="true">/</span><span class="corca-breadcrumb-current" aria-current="page">${escapeHtml(currentName)}</span></li>`
    : '';
  const partnerBadge =
    '<img class="corca-footer-partner-desktop" src="/images/brand/openai-select-partner.svg" alt="" width="156" height="74" loading="lazy" decoding="async">';
  return `<div class="corca-footer-breadcrumb container-c"><nav class="corca-breadcrumb" aria-label="${escapeHtml(config.breadcrumbLabel)}"><ol><li><a href="${homePath}" aria-label="${escapeHtml(config.homeLabel)}">${homeIcon}<span>${escapeHtml(config.homeLabel)}</span></a></li><li><span class="corca-breadcrumb-separator" aria-hidden="true">/</span>${blogNode}</li>${currentNode}</ol></nav>${partnerBadge}</div>`;
}

function blogPostTitle(document, fallback) {
  const title = document.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || fallback;
  return (
    decodeEntities(title)
      .replace(/\s*\|\s*Corca Blog\s*$/i, '')
      .trim() || fallback
  );
}

function syncBlogBreadcrumbLd(html, config, slug, source) {
  const homePath = config.locale === 'ko' ? '/' : `/${config.locale}`;
  const homeUrl = `https://www.corca.ai${homePath === '/' ? '' : homePath}`;
  const blogUrl = `https://www.corca.ai${config.blogPath}`;
  const structuredScript =
    /<script type="application\/ld\+json" data-corca-managed="post-structured-data">([\s\S]*?)<\/script>/;
  if (structuredScript.test(html)) {
    return html.replace(structuredScript, (_match, json) => {
      const data = parseJsonLd(json, source);
      const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
      const post = graph.find((node) => node?.['@type'] === 'BlogPosting');
      if (!post) fail(`Could not locate BlogPosting schema in ${source}.`);
      const currentName = post.headline || blogPostTitle(html, config.blogLabel);
      const currentUrl = post.url || `${blogUrl}/${slug}`;
      data['@graph'] = [
        ...graph.filter((node) => node?.['@type'] !== 'BreadcrumbList'),
        breadcrumbJsonLd(config, homeUrl, blogUrl, currentName, currentUrl),
      ];
      return `<script type="application/ld+json" data-corca-managed="post-structured-data">${JSON.stringify(data)}</script>`;
    });
  }

  const indexScript =
    /<script id="structuredData" type="application\/ld\+json">([\s\S]*?)<\/script>/;
  if (!indexScript.test(html)) return html;
  return html.replace(indexScript, (_match, json) => {
    const blog = parseJsonLd(json, source);
    const data = {
      '@context': 'https://schema.org',
      '@graph': [blog, breadcrumbJsonLd(config, homeUrl, blogUrl, config.blogLabel, blogUrl)],
    };
    return `<script id="structuredData" type="application/ld+json">${JSON.stringify(data)}</script>`;
  });
}

function breadcrumbJsonLd(config, homeUrl, blogUrl, currentName, currentUrl) {
  const nodes = [
    { '@type': 'ListItem', position: 1, name: config.homeLabel, item: homeUrl },
    { '@type': 'ListItem', position: 2, name: config.blogLabel, item: blogUrl },
  ];
  if (currentUrl !== blogUrl) {
    nodes.push({ '@type': 'ListItem', position: 3, name: currentName, item: currentUrl });
  }
  return { '@type': 'BreadcrumbList', itemListElement: nodes };
}

function parseJsonLd(value, source) {
  try {
    return JSON.parse(value);
  } catch {
    fail(`Could not parse JSON-LD in ${source}.`);
  }
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addLatestPostNavigationIntro(html, config, source) {
  if (html.includes('class="article-more-posts"')) return html;

  const navigation = /<nav\b[^>]*\bclass=["'][^"']*\bpost-list\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i;
  const match = html.match(navigation);
  if (!match) return html;

  const headingId = 'article-more-posts-title';
  const wrapped = `<section class="article-more-posts" aria-labelledby="${headingId}">
          <header class="article-more-posts-heading">
            <h2 id="${headingId}">${escapeHtml(config.latestPostsTitle)}</h2>
          </header>
${match[0]}
        </section>`;
  const next = html.replace(navigation, wrapped);
  if ((next.match(/class="article-more-posts"/g) || []).length !== 1) {
    fail(`Expected one adjacent-post navigation section in ${source}.`);
  }
  return next;
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
    if (['shortcut icon', 'icon', 'apple-touch-icon', 'manifest'].includes(rel)) return '';
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
      'absolute canonical favicon',
      /<link\b(?=[^>]*\brel=["']icon["'])(?=[^>]*\bhref=["']https:\/\/www\.corca\.ai\/favicons\/corca-ai-48\.png["'])[^>]*>/gi,
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
    ['Microsoft Clarity project ID', /xuw7puf7d6/g],
    ['Microsoft Clarity loader', /https:\/\/www\.clarity\.ms\/tag\//g],
  ];
  for (const [label, pattern] of expectedOnce) {
    const count = (html.match(pattern) || []).length;
    if (count !== 1) fail(`Expected one ${label} in ${source}, found ${count}.`);
  }
  for (const rel of ['icon', 'apple-touch-icon']) {
    const count = (
      html.match(new RegExp(`<link\\b(?=[^>]*\\brel=["']${rel}["'])[^>]*>`, 'gi')) || []
    ).length;
    if (count !== 1) fail(`Expected exactly one rel="${rel}" in ${source}, found ${count}.`);
  }
  if (/<link\b(?=[^>]*\brel=["']shortcut icon["'])[^>]*>/i.test(html)) {
    fail(`Legacy rel="shortcut icon" remains in ${source}.`);
  }
  if (html.includes('/blog/assets/favicon.png')) {
    fail(`Legacy blog favicon remains in ${source}.`);
  }
  if (html.includes('ref=bwt')) {
    fail(`Legacy Microsoft Clarity ref query remains in ${source}.`);
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

async function assertPathMissing(path) {
  try {
    await stat(path);
  } catch {
    return;
  }
  fail(`Build-only Lead Request route remains in dist: ${relative(repoRoot, path)}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
