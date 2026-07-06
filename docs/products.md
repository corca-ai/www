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
- `assets/` — every image and video the page uses (hero art, screenshots, logos),
  kept with the product and `import`ed by `Page.astro`/`manifest.ts` so Astro
  fingerprints them and the build fails if one goes missing. A product's own media
  lives here, never in `public/` — `public/images/pages/` is only for assets shared
  across static pages. (Cross-product previews on the home page are the one
  exception: those live in `src/assets/images/` because the shared homepage owns them.)

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
are part of the shared shell described in [architecture](architecture.md) and rarely change.

## Updating a product

Product updates stay inside the owning product folder unless the shared shell
itself needs to change. Edit `manifest.ts` for product ordering, category-card
copy, SEO title/description, logos and `SoftwareApplication` schema data. Edit
`Page.astro` for page body copy, layout and product-specific interactions. Add
or replace product-owned media under `assets/` and import it from the manifest or
page so the build fingerprints it and fails if the asset is missing.

Before opening a product pull request, preview `/products/<slug>` and the
localized variants (`/en/products/<slug>`, `/ja/products/<slug>`,
`/zh/products/<slug>`). Confirm the nav dropdown, `/products` category card,
metadata, schema data and visible page copy all match the changed product story.
