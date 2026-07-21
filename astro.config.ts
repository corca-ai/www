import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { SITE_ORIGIN } from './src/site';

// Corca website — static output, deployed to Cloudflare Workers (Static Assets)
// behind a small canonicalization Worker (worker/index.ts). ko (default, "/")
// mirrors the original Wix site; en ("/en"), ja ("/ja") and zh ("/zh") are prefixed.
export default defineConfig({
  // Canonical production origin — drives sitemap, canonical, hreflang and og:url.
  // Single-sourced in src/site.ts (SITE_ORIGIN); override with SITE_URL for a
  // one-off build. See docs/runbook.md "Change the canonical domain".
  site: process.env.SITE_URL ?? SITE_ORIGIN,
  // No trailing slash on canonical URLs (issue #13). The edge Worker 301s the
  // slash variant and Cloudflare's `drop-trailing-slash` serves the directory
  // index (e.g. /about from about/index.html) directly.
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
