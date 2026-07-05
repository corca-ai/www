import type { Lang } from './ui';
import { localizePath } from './utils';

// Page-level schema.org nodes, merged into BaseLayout's JSON-LD `@graph`
// alongside the site-wide Organization + WebSite. Everything here references the
// shared Organization by @id rather than repeating it, so the graph stays a
// single source of truth. See docs/architecture.md.

/** Reference to the site-wide Organization node emitted by BaseLayout. */
const orgRef = (site: URL) => ({ '@id': `${site.href}#organization` });

const homeLabel: Record<Lang, string> = { ko: '홈', en: 'Home', ja: 'ホーム', zh: '首页' };

/** A single breadcrumb node: display name + locale-agnostic base path. */
export type Crumb = { name: string; path: string };

/**
 * Home → …category… → current-page trail so pages show a breadcrumb in search
 * results. `crumbs` is the trail after Home (e.g. [제품 소개, 문라이트]).
 */
export function breadcrumbLd(site: URL, lang: Lang, crumbs: Crumb[]) {
  const trail: Crumb[] = [{ name: homeLabel[lang], path: '/' }, ...crumbs];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(localizePath(c.path, lang), site).href,
    })),
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
