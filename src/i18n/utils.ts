import { ui, defaultLang, locales, type Lang } from './ui';

/** Detect the active locale from a request/page URL. */
export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  return (locales as readonly string[]).includes(seg) ? (seg as Lang) : defaultLang;
}

/** Translation dictionary for a locale. */
export function useTranslations(lang: Lang) {
  return ui[lang];
}

/**
 * Build a locale-prefixed path from a base path (which must start with "/").
 * ko (default) has no prefix; en → /en, ja → /ja. Mirrors the original URLs.
 */
export function localizePath(base: string, lang: Lang): string {
  const clean = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  const path = `${prefix}${clean}`;
  // Always end with a trailing slash (root stays "/").
  return path === '' ? '/' : `${path}/`;
}

/** Remove any locale prefix from a pathname, returning the base path. */
export function stripLocale(pathname: string): string {
  const parts = pathname.split('/');
  if ((locales as readonly string[]).includes(parts[1])) parts.splice(1, 1);
  const joined = parts.join('/').replace(/\/+$/, '');
  return joined === '' ? '/' : joined;
}

/** All locales with their localized URL for the current base path (for hreflang). */
export function getAlternates(base: string) {
  return locales.map((lang) => ({ lang, path: localizePath(base, lang) }));
}
