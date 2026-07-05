import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import About from './components/pages/About.astro';
import AboutIndex from './components/pages/AboutIndex.astro';
import Colleagues from './components/pages/Colleagues.astro';
import Home from './components/pages/Home.astro';
import HowWeWork from './components/pages/HowWeWork.astro';
import News from './components/pages/News.astro';
import Products from './components/pages/Products.astro';
import { pageMeta } from './i18n/pageMeta';
import { type Lang, ui } from './i18n/ui';

export type Meta = { title: string; description: string };
type StaticPage = {
  basePath: string;
  Component: AstroComponentFactory;
  meta: (lang: Lang) => Meta;
};

// The static (non-product) pages: id → live URL base, component and per-locale
// SEO copy. Product detail pages come from the product registry instead, so
// adding a product never touches this. `id` is stable even though the live URL
// may be nested (e.g. about-corca lives at /about/vision-mission). Imported by
// the [...slug] route, which needs it from getStaticPaths' isolated scope.
export const staticPages = {
  home: {
    basePath: '/',
    Component: Home,
    meta: (l) => ({ title: ui[l].home.metaTitle, description: ui[l].home.metaDescription }),
  },
  products: { basePath: '/products', Component: Products, meta: (l) => pageMeta.products[l] },
  about: { basePath: '/about', Component: AboutIndex, meta: (l) => pageMeta.about[l] },
  'about-corca': {
    basePath: '/about/vision-mission',
    Component: About,
    meta: (l) => pageMeta['about-corca'][l],
  },
  'how-we-work': {
    basePath: '/about/how-we-work',
    Component: HowWeWork,
    meta: (l) => pageMeta['how-we-work'][l],
  },
  news: { basePath: '/news', Component: News, meta: (l) => pageMeta.news[l] },
  colleagues: {
    basePath: '/about/colleagues',
    Component: Colleagues,
    meta: (l) => pageMeta.colleagues[l],
  },
} satisfies Record<string, StaticPage>;

export type StaticId = keyof typeof staticPages;
