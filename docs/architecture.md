---
title: Architecture
---

# Architecture

The site is built with [Astro](https://astro.build) in static (SSG) mode and
served by Cloudflare Workers Static Assets, so there is no server runtime.
Styling is Tailwind CSS v4 with a self-hosted Pretendard variable font.

## Project layout

- `src/pages/` — file-based routes; locale folders `en/`, `ja/` and `zh/` mirror the
  Korean routes that live at the site root.
- `src/components/` — the shared `Header` and `Footer`, plus one component per
  page under `components/pages/`.
- `src/layouts/BaseLayout.astro` — the HTML shell, SEO tags and JSON-LD.
- `src/i18n/` — locale config, UI strings and per-page content.
- `src/assets/` and `public/` — optimized images, the font and the OG image.

For how to run and build the project see [[development]], and for how it reaches
production see [[deployment]]. Content translation is covered in the [[i18n]]
guide.
