import { readFileSync } from 'node:fs';
import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../site';
import { latestLastModifiedFromXml, pagesSitemapLastModified } from '../sitemapMetadata';

const sitemapNames = ['pages', 'categories', 'tags', 'posts'];

const childLastModified = (name: string) => {
  if (name === 'pages') return pagesSitemapLastModified;
  const source = readFileSync(`public/sitemap-${name}.xml`, 'utf8');
  return latestLastModifiedFromXml(source);
};

// Reference-style sitemap index for crawler entrypoints. The blog renderer
// owns the child XML files because admin and Notion publishing update them.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(SITE_ORIGIN)).href;
  const entries = sitemapNames
    .map(
      (name) => `  <sitemap>
    <loc>${base}sitemap-${name}.xml</loc>
    <lastmod>${childLastModified(name)}</lastmod>
  </sitemap>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
