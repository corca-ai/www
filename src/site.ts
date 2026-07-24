// The one place the canonical production origin is defined. Everything that
// needs the site's absolute URL — the Astro `site` config (which drives the
// sitemap, canonical, hreflang and og:url), the sitemap/robots/rss endpoints,
// and the edge-canonicalization Worker — reads from here, so moving the site to
// a new domain is a one-line change (plus the Cloudflare `routes` host in
// wrangler.jsonc, which tells Cloudflare which hostname to answer on).
//
// Rules (issue #13): https, a `www.` host, and no trailing slash. Keep it a
// bare origin — protocol + host, no path, no trailing slash.
export const SITE_ORIGIN = 'https://www.corca.ai';
