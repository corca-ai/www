import type { APIRoute } from 'astro';
import { defaultLang, type Lang, locales, localeTag } from '../i18n/ui';
import { products } from '../products/registry';
import { SITE_ORIGIN } from '../site';
import { pageLastModified } from '../sitemapMetadata';
import { staticPages } from '../staticPages';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const localizedPath = (basePath: string, lang: Lang) => {
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  if (basePath === '/') return prefix || '/';
  return `${prefix}${basePath}`;
};

// Corporate/product routes are registry-backed. Blog landing pages are static
// assets rendered by the publishing pipeline, so they are added explicitly.
const basePaths = [
  ...Object.values(staticPages).map((page) => page.basePath),
  ...products.map((product) => `/products/${product.slug}`),
  '/blog',
];

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE_ORIGIN);
  const uniqueBasePaths = [...new Set(basePaths)];
  const urls = uniqueBasePaths.flatMap((basePath) => {
    const alternates = locales
      .map((lang) => {
        const href = new URL(localizedPath(basePath, lang), origin).href;
        return `    <xhtml:link rel="alternate" hreflang="${localeTag[lang]}" href="${escapeXml(href)}" />`;
      })
      .join('\n');
    const defaultHref = new URL(localizedPath(basePath, defaultLang), origin).href;

    return locales.map((lang) => {
      const loc = new URL(localizedPath(basePath, lang), origin).href;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${pageLastModified(basePath)}</lastmod>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(defaultHref)}" />
  </url>`;
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl?v=20260721-blue"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
