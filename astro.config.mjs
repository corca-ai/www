// @ts-check

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Corca marketing site — static output, deployed to Cloudflare Workers (Static Assets).
// ko (default, "/") mirrors the original Wix site; en ("/en"), ja ("/ja") and
// zh ("/zh") are prefixed.
export default defineConfig({
  site: 'https://www.corca.ai',
  // Trailing slash everywhere so canonical/hreflang/sitemap match how
  // Cloudflare Static Assets serves directory index files (no redirect hop).
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh'],
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
          zh: 'zh-CN',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
