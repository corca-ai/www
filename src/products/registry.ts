import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { Product, ProductMeta } from './types';

// Auto-discovers every product folder — adding src/products/<slug>/ (manifest.ts
// + Page.astro) registers a new product with zero edits to shared files. The
// route, nav, category page, breadcrumbs, JSON-LD and sitemap all derive from
// `products`. Manifests hold data only; Page.astro components are paired here by
// folder so a manifest never has to import an .astro file.
const manifests = import.meta.glob<{ default: ProductMeta }>('./*/manifest.ts', { eager: true });
const pages = import.meta.glob<{ default: AstroComponentFactory }>('./*/Page.astro', {
  eager: true,
});

// './moonlight/manifest.ts' -> 'moonlight'
const folderOf = (path: string) => path.split('/')[1];

export const products: Product[] = Object.entries(manifests)
  .map(([path, mod]) => {
    const folder = folderOf(path);
    const page = Object.entries(pages).find(([p]) => folderOf(p) === folder)?.[1];
    if (!page)
      throw new Error(`Product "${folder}" is missing a Page.astro next to its manifest.ts`);
    return { ...mod.default, Page: page.default };
  })
  .sort((a, b) => a.order - b.order);

/** Look up a product by its slug (e.g. from a /products/<slug> route). */
export const productBySlug = new Map(products.map((p) => [p.slug, p]));
