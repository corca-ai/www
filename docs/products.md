---
title: Product pages
---

# Product pages

Each product (Moonlight, Trace, …) is a self-contained folder under
`src/products/<slug>/`, owned by that product's team. Adding a product is
essentially dropping a folder: the route, the nav dropdown, the `/products`
category page, breadcrumbs, the `SoftwareApplication` JSON-LD and the sitemap are
all generated from it — no shared file needs editing.

## Anatomy of a product

- `manifest.ts` — data only, default-exporting a `ProductMeta` (the one
  convention, defined in `src/products/types.ts`): `slug`, `order`, `name`,
  `logo`, per-locale `meta` (SEO title/description) and `blurb` (category card),
  and an optional `app` (for the `SoftwareApplication` schema).
- `Page.astro` — the page body, free to be as bespoke as the product wants. It
  takes a `lang` prop and holds its own localized copy.
- `assets/` — the product's images, imported so Astro optimizes and hashes them.

The shared shell owns the URL structure (`/products/<slug>/`) and every SEO tag,
so pages stay consistent no matter who authors them — teams supply values, not
formats.

## Adding a product

1. Create `src/products/<slug>/` with `manifest.ts`, `Page.astro` and `assets/`.
2. Fill `manifest.ts` against `ProductMeta`; TypeScript (`pnpm check`) flags
   anything missing or malformed in that file.
3. Run `pnpm dev` — `/products/<slug>/`, the nav entry and the category card
   appear automatically.

The route registry is `src/pages/[...slug].astro` and the auto-discovery (a
`import.meta.glob` over the product folders) is `src/products/registry.ts`; both
are part of the shared shell described in [[architecture]] and rarely change.
