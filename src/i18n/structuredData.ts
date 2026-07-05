import type { Lang } from './ui';
import { localizePath } from './utils';

// Page-level schema.org nodes, merged into BaseLayout's JSON-LD `@graph`
// alongside the site-wide Organization + WebSite. Everything here references the
// shared Organization by @id rather than repeating it, so the graph stays a
// single source of truth. See docs/architecture.md.

/** Reference to the site-wide Organization node emitted by BaseLayout. */
const orgRef = (site: URL) => ({ '@id': `${site.href}#organization` });

const homeLabel: Record<Lang, string> = { ko: '홈', en: 'Home', ja: 'ホーム', zh: '首页' };

/** Home → current-page trail so subpages show a breadcrumb in search results. */
export function breadcrumbLd(site: URL, lang: Lang, basePath: string, name: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel[lang],
        item: new URL(localizePath('/', lang), site).href,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: new URL(localizePath(basePath, lang), site).href,
      },
    ],
  };
}

export type AppInfo = { category: string; os: string; appUrl: string };

/** SoftwareApplication node for a product page (Moonlight, Trace). */
export function softwareAppLd(
  site: URL,
  lang: Lang,
  basePath: string,
  name: string,
  description: string,
  info: AppInfo,
) {
  return {
    '@type': 'SoftwareApplication',
    name,
    description,
    url: new URL(localizePath(basePath, lang), site).href,
    applicationCategory: info.category,
    operatingSystem: info.os,
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    installUrl: info.appUrl,
    downloadUrl: info.appUrl,
    // Both products are free to download / start using (freemium).
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: orgRef(site),
  };
}
