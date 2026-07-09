import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../site';

// robots.txt (issue #18): open the whole public site to every crawler (LLM bots
// included, via the wildcard), keep the future admin/privacy paths out, and
// point at the sitemap on the configured `site` domain.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(SITE_ORIGIN)).href;
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /blog/admin
Disallow: /blog/admin/
Disallow: /privacy
Disallow: /privacy/

Sitemap: ${base}sitemap.xml
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
