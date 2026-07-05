import type { ImageMetadata } from 'astro';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { Lang } from '../i18n/ui';

// The one convention a product team follows: each src/products/<slug>/ folder
// has a manifest.ts default-exporting a `ProductMeta`, plus a Page.astro. The
// shared shell (route, nav, category page, SEO, JSON-LD, sitemap) is generated
// from these — teams supply values, the shell owns the URL/SEO format.

/** What a product's manifest.ts default-exports. */
export interface ProductMeta {
  /** URL is /products/<slug>/ — the shell owns the structure, the team the slug. */
  slug: string;
  /** Sort order in the nav dropdown and the /products category page. */
  order: number;
  /** Brand name, shown in nav + category card (same across locales). */
  name: string;
  /** Logo for the nav/card, imported so Astro optimizes + hashes it. */
  logo: ImageMetadata;
  /** SEO title + description per locale (rendered by BaseLayout). */
  meta: Record<Lang, { title: string; description: string }>;
  /** One-line blurb on the /products category card, per locale. */
  blurb: Record<Lang, string>;
  /** Optional SoftwareApplication JSON-LD data. */
  app?: { category: string; os: string; appUrl: string };
}

/** A product as the registry exposes it: its manifest plus its Page component. */
export interface Product extends ProductMeta {
  Page: AstroComponentFactory;
}
