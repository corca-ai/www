---
title: Architecture
---

# Architecture

The site is built with [Astro](https://astro.build) in static (SSG) mode and
served by Cloudflare Workers Static Assets, so there is no server runtime.
Styling is Tailwind CSS v4 with a self-hosted Pretendard variable font.

## Project layout

- `src/pages/` — routes; a single dynamic route, `[...slug].astro`, generates
  every page in all four locales from one registry, alongside `404.astro`.
- `src/components/` — the shared `Header` and `Footer`, plus one component per
  page under `components/pages/`.
- `src/layouts/BaseLayout.astro` — the HTML shell, SEO tags and JSON-LD.
- `src/content/` — news and colleague entries as schema-validated YAML collections.
- `src/i18n/` — locale config, UI strings and per-page SEO metadata.
- `src/assets/` and `public/` — optimized images, the font and the OG image.

For how to run and build the project see [[development]], and for how it reaches
production see [[deployment]]. Content translation is covered in the [[i18n]]
guide, and the [[runbook]] has step-by-step recipes for adding content, locales
and pages.
