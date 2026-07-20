import type { Lang } from './ui';
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
    inLanguage: ['ko', 'en', 'ja', 'zh'],
    installUrl: info.appUrl,
    downloadUrl: info.appUrl,
    // Both products are free to download / start using (freemium).
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: orgRef(site),
  };
}

const axServiceType: Record<Lang, string> = {
  ko: '기업 AI 전환(AX) 컨설팅',
  en: 'Enterprise AI transformation consulting',
  ja: '企業AI変革（AX）コンサルティング',
  zh: '企业AI转型（AX）咨询',
};

const axOfferNames: Record<Lang, [string, string, string]> = {
  ko: ['AX 의사결정 지도', '첫 업무 운영 전환', '업무·부서 확장'],
  en: ['AX Decision Map', 'First Workflow to Production', 'Workflow & Department Expansion'],
  ja: ['AX意思決定マップ', '最初の業務の運用移行', '業務・部門への展開'],
  zh: ['AX决策地图', '首个业务上线运营', '业务与部门扩展'],
};

/** Service and offers for Corca's AX consulting page. */
export function axServiceLd(
  site: URL,
  lang: Lang,
  basePath: string,
  name: string,
  description: string,
) {
  const offerNames = axOfferNames[lang];
  return {
    '@type': 'Service',
    name,
    description,
    url: absoluteUrl(basePath, lang, site.origin),
    serviceType: axServiceType[lang],
    areaServed: { '@type': 'Country', name: 'KR' },
    provider: orgRef(site),
    offers: [
      { '@type': 'Offer', name: offerNames[0], price: '35000000', priceCurrency: 'KRW' },
      { '@type': 'Offer', name: offerNames[1], price: '100000000', priceCurrency: 'KRW' },
      {
        '@type': 'Offer',
        name: offerNames[2],
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: '200000000',
          priceCurrency: 'KRW',
        },
      },
    ],
  };
}
