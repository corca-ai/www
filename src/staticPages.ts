import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import About from './components/pages/About.astro';
import AboutIndex from './components/pages/AboutIndex.astro';
import Ax from './components/pages/Ax.astro';
import Colleagues from './components/pages/Colleagues.astro';
import Home from './components/pages/Home.astro';
import HowWeWork from './components/pages/HowWeWork.astro';
import News from './components/pages/News.astro';
import Products from './components/pages/Products.astro';
import { type Meta, pageMeta } from './i18n/pageMeta';
import { axServiceLd } from './i18n/structuredData';
import { type Lang, ui } from './i18n/ui';

type StaticPage = {
  basePath: string;
  Component: AstroComponentFactory;
  meta: (lang: Lang) => Meta;
  ogImage?: string;
  ogImageAlt?: (lang: Lang) => string;
  jsonLd?: (site: URL, lang: Lang, meta: Meta) => Record<string, unknown>[];
};

// The static (non-product) pages: id → live URL base, component and per-locale
// SEO copy. Product detail pages come from the product registry instead, so
// adding a product never touches this. `id` is stable even though the live URL
// may be nested (e.g. about-corca lives at /about/vision-mission). Imported by
// the [...slug] route, which needs it from getStaticPaths' isolated scope.
const staticPageDefinitions = {
  home: {
    basePath: '/',
    Component: Home,
    meta: (l) => ({ title: ui[l].home.metaTitle, description: ui[l].home.metaDescription }),
  },
  ax: {
    basePath: '/ax',
    Component: Ax,
    meta: (l) => pageMeta.ax[l],
    ogImage: '/og-ax.png',
    ogImageAlt: (l) =>
      ({
        ko: 'Corca 기업 AI 전환 컨설팅',
        en: 'Corca enterprise AI transformation consulting',
        ja: 'Corca 企業AI変革コンサルティング',
        zh: 'Corca 企业AI转型咨询',
      })[l],
    jsonLd: (site, lang, meta) => [
      axServiceLd(
        site,
        lang,
        '/ax',
        meta.title.split('|')[0]?.trim() || meta.title,
        meta.description,
      ),
    ],
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

export type StaticId = keyof typeof staticPageDefinitions;

// Widen every registry value to the shared shape so optional page capabilities
// (OG image and page-specific JSON-LD) remain safely readable after lookup.
export const staticPages: Record<StaticId, StaticPage> = staticPageDefinitions;
