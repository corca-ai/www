// Edge Worker in front of the static assets. It runs first on every request
// (`run_worker_first` in wrangler.jsonc) and enforces the canonical URL — https,
// the `www.` host and no trailing slash (issue #13) — with a 301, then hands
// everything else to the static assets (which apply `_redirects`, `html_handling`
// and `not_found_handling`). The canonical origin comes from src/site.ts, so a
// domain move is a one-line change there plus the `routes` host in wrangler.jsonc.
import { canonicalUrl } from '../src/canonical';
import { SITE_ORIGIN } from '../src/site';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

// Preview hosts must not be rewritten to the production domain, or the
// workers.dev preview and local `wrangler dev` would bounce to prod. Trailing-
// slash normalization still applies there, so previews behave like production.
function isPreviewHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.workers.dev');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { hostname } = new URL(request.url);
    const target = canonicalUrl(request.url, SITE_ORIGIN, !isPreviewHost(hostname));
    if (target) return Response.redirect(target, 301);
    return env.ASSETS.fetch(request);
  },
};
