import { documentLanguage, type Lang } from './ui';
import { absoluteUrl } from './utils';

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
      item: absoluteUrl(c.path, lang, site.origin),
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
    url: absoluteUrl(basePath, lang, site.origin),
    applicationCategory: info.category,
    operatingSystem: info.os,
    inLanguage: documentLanguage[lang],
    installUrl: info.appUrl,
    downloadUrl: info.appUrl,
    publisher: orgRef(site),
  };
}

const axServiceType: Record<Lang, string> = {
  ko: '기업 AI 전환(AX) 컨설팅',
  en: 'Enterprise AI transformation consulting',
  ja: '企業AI変革（AX）コンサルティング',
  zh: '企业AI转型（AX）咨询',
};

/** Service for the Corca AX consulting page. */
export function axServiceLd(
  site: URL,
  lang: Lang,
  basePath: string,
  name: string,
  description: string,
) {
  return {
    '@type': 'Service',
    name,
    description,
    url: absoluteUrl(basePath, lang, site.origin),
    serviceType: axServiceType[lang],
    inLanguage: documentLanguage[lang],
    areaServed: { '@type': 'Country', name: 'KR' },
    provider: orgRef(site),
  };
}
