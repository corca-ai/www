// @ts-check

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Corca marketing site — static output, deployed to Cloudflare Workers (Static Assets).
// Locales mirror the original Wix site: ko (default, "/"), en ("/en"), ja ("/ja").
export default defineConfig({
  site: 'https://www.corca.ai',
  // Trailing slash everywhere so canonical/hreflang/sitemap match how
  // Cloudflare Static Assets serves directory index files (no redirect hop).
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ko',
        locales: {
          ko: 'ko-KR',
          en: 'en-US',
          ja: 'ja-JP',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
