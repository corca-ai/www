---
title: Architecture
---

# Architecture

The site is built with [Astro](https://astro.build) in static (SSG) mode and
served by Cloudflare Workers Static Assets, so there is no server runtime.
Styling is Tailwind CSS v4 with a self-hosted Pretendard variable font.

## Project layout

- `src/pages/` — routes; a single dynamic route, `[...slug].astro`, generates
  every page in all four locales from one registry, alongside `404.astro` and the
  `robots.txt`, `sitemap.xml` and `rss.xml` endpoints.
- `src/components/` — the shared `Header` and `Footer`, plus one component per
  page under `components/pages/`.
- `src/layouts/BaseLayout.astro` — the HTML shell, meta/Open Graph/Twitter tags,
  hreflang alternates and a per-page JSON-LD `@graph`.
- `src/content/` — news and colleague entries as schema-validated YAML collections.
- `src/i18n/` — locale config, UI strings, per-page SEO metadata and the
  structured-data (schema.org) builders.
- `src/assets/` and `public/` — optimized images, the font, the OG image, the
  web app manifest, and the RSS feed. `public/_redirects` holds the Cloudflare
  edge redirect rules (e.g. `/rss` → `/rss.xml`).

For how to run and build the project see [[development]], and for how it reaches
production see [[deployment]]. Content translation is covered in the [[i18n]]
guide, and the [[runbook]] has step-by-step recipes for adding content, locales
and pages.
