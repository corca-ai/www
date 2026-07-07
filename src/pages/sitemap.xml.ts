import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../site';

// Serve the sitemap at the conventional /sitemap.xml. @astrojs/sitemap emits
// the static site map; the public blog renderer owns blog discovery files.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(SITE_ORIGIN)).href;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}sitemap-0.xml</loc></sitemap>
  <sitemap><loc>${base}blog/sitemap.xml</loc></sitemap>
  <sitemap><loc>${base}blog/rss.xml</loc></sitemap>
  <sitemap><loc>${base}rss.xml</loc></sitemap>
</sitemapindex>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
