---
title: Architecture
---

# Architecture

The site is built with [Astro](https://astro.build) in static (SSG) mode and
served by Cloudflare Workers Static Assets. A thin Worker (`worker/index.ts`)
runs in front of the assets to canonicalize URLs and dispatch the small set of
edge API endpoints, including AX consultations and Notion publishing. Page
rendering and blog pages stay fully static, with no server data store. Styling is Tailwind CSS v4
with a self-hosted Pretendard variable font. Google Analytics runs through the
shared layout as a client-side `gtag.js` snippet. The production build copies
that snippet's measurement ID into the static blog shell so both surfaces use
the same GA4 property.

## Project layout

- `src/pages/` — routes; a single dynamic route, `[...slug].astro`, generates
  every localized marketing and product page from two registries — static pages
  from `src/staticPages.ts` and product pages from the product registry (see
  [products](products.md)) — alongside `404.astro` and the `robots.txt`,
  `sitemap.xml` and `rss.xml` endpoints.
- `src/components/` — the shared `Header` and `Footer`, plus one component per
  page under `components/pages/`.
- `src/products/` — one self-contained folder per product (Moonlight, Trace, …),
  auto-discovered by the shared shell; see [products](products.md).
- `src/layouts/BaseLayout.astro` — the HTML shell, meta/Open Graph/Twitter tags,
  hreflang alternates, the canonical Google Analytics measurement ID and a
  per-page JSON-LD `@graph`.
- `src/content/` — news and colleague entries as schema-validated YAML collections.
- `public/blog/` — the integrated Corca Blog static subsite, generated from the
  separate `corca-blog-pages` project with `/blog` as its base path. It carries
  the original blog HTML, CSS, client app, assets, post pages, RSS feed and JSON
  feed so the embedded `/blog` experience stays UI/UX-compatible with the
  source project.
- `src/i18n/` — locale config, UI strings, per-page SEO metadata and the
  structured-data (schema.org) builders.
- `src/assets/` and `public/` — optimized images, the font, the OG image, the
  web app manifest, blog assets, and feed/static files. `public/_redirects`
  holds the per-path relocation rules (old flat URLs → the `/products` and
  `/about` structure, `/rss` → `/rss.xml`, and legacy blog post redirects).
- `worker/index.ts` — edge canonicalization and API dispatch. AX consultation
  validation and delivery live in `worker/axConsultations.ts`; see the
  [AX guide](ax.md). `src/site.ts` is the single source for the canonical origin
  (`SITE_ORIGIN`), and `src/canonical.ts` is the pure URL-normalization it applies.

The Worker also owns cache policy for static assets. Content-hashed `/_astro/*`
files and versioned AX font/logo directories receive a one-year immutable TTL.
Mutable images, scripts, styles, and fonts receive a one-day browser TTL with a
seven-day stale-while-revalidate window. HTML remains revalidated on every
visit, while API and retired admin responses remain `no-store`.

## URLs and canonicalization

Canonical URLs use `https`, a `www.` host, and **no trailing slash** — the root
`/` is the only exception (issue #13). One origin, `SITE_ORIGIN` in `src/site.ts`,
drives everything: it is the Astro `site` (so canonical, `hreflang`, `og:url` and
the sitemap all emit slash-less URLs) and the Worker's redirect target.

Two layers enforce it at the edge:

- The Worker runs first on every request (`run_worker_first`) and `301`s any URL
  that is not canonical — wrong scheme, apex/non-`www` host, or a trailing slash —
  to the canonical form, then hands the rest to the assets. Preview hosts
  (`localhost`, `*.workers.dev`) skip the host/scheme rewrite so they don't bounce
  to production.
- Cloudflare's `html_handling: "drop-trailing-slash"` serves the directory index
  directly (e.g. `/about` from `about/index.html`), so canonical URLs return `200`
  with no redirect hop.

For how to run and build the project see [development](development.md), and for how it reaches
production see [deployment](deployment.md). Content translation is covered in the [i18n](i18n.md)
guide, and the [runbook](runbook.md) has step-by-step recipes for adding content, locales
and pages, including the analytics measurement ID.
