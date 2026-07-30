import type { Lang } from '../i18n/ui';

export type LeadPageDeclaration = {
  contentType: string;
  pageId: string;
};

export type LeadPageContext = LeadPageDeclaration & {
  basePath: string;
};

type LeadPayloadContext = {
  base_path: string;
  content_type: string;
  locale: Lang;
  page_id: string;
  page_path: string;
};

const supportedLocales = ['ko', 'en', 'ja', 'zh'] as const;
const tokenPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function normalizedPath(value: string) {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('?') ||
    value.includes('#')
  ) {
    return '/';
  }
  return value || '/';
}

function localeFromPath(pathname: string): Lang {
  const segment = pathname.split('/')[1];
  return supportedLocales.includes(segment as Lang) ? (segment as Lang) : 'ko';
}

function basePathFromPagePath(pathname: string, locale: Lang) {
  if (locale === 'ko') return pathname;
  const prefix = `/${locale}`;
  if (!pathname.startsWith(prefix)) return pathname;
  const withoutPrefix = pathname.slice(prefix.length);
  return withoutPrefix || '/';
}

function validDeclaration(
  pageId: string | undefined,
  contentType: string | undefined,
  basePath: string | undefined,
) {
  return Boolean(
    pageId &&
      contentType &&
      basePath &&
      pageId.length <= 120 &&
      contentType.length <= 120 &&
      basePath.length <= 512 &&
      tokenPattern.test(pageId) &&
      tokenPattern.test(contentType) &&
      normalizedPath(basePath) === basePath,
  );
}

/**
 * Builds the non-PII page identity included with a lead submission. The
 * browser pathname is deliberately used for page_path; query and hash never
 * enter this contract.
 */
export function resolveLeadPayloadContext(
  data: DOMStringMap,
  browserPathname: string,
): LeadPayloadContext {
  const pagePath = normalizedPath(browserPathname);
  const declaredLocale = data.locale;
  const locale = supportedLocales.includes(declaredLocale as Lang)
    ? (declaredLocale as Lang)
    : localeFromPath(pagePath);
  const pageId = data.leadPage;
  const contentType = data.contentType;
  const basePath = data.pageBasePath;

  if (validDeclaration(pageId, contentType, basePath)) {
    return {
      base_path: basePath as string,
      content_type: contentType as string,
      locale,
      page_id: pageId as string,
      page_path: pagePath,
    };
  }

  return {
    base_path: basePathFromPagePath(pagePath, locale),
    content_type: 'unknown',
    locale,
    page_id: 'unknown',
    page_path: pagePath,
  };
}
