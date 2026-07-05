import { defaultLang, type Lang, ui } from './ui';

/** Translation dictionary for a locale. */
export function useTranslations(lang: Lang) {
  return ui[lang];
}

/**
 * Build a locale-prefixed path from a base path (which must start with "/").
 * ko (default) has no prefix; en → /en, ja → /ja, zh → /zh. Mirrors the
 * original URLs. Always ends with a trailing slash (root stays "/").
 */
export function localizePath(base: string, lang: Lang): string {
  const clean = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  const path = `${prefix}${clean}`;
  return path === '' ? '/' : `${path}/`;
}
