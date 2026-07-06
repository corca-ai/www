import { defaultLang, type Lang, ui } from './ui';

/** Translation dictionary for a locale. */
export function useTranslations(lang: Lang) {
  return ui[lang];
}

/**
 * Build a locale-prefixed path from a base path (which must start with "/").
 * ko (default) has no prefix; en → /en, ja → /ja, zh → /zh. Never ends with a
 * trailing slash — the canonical URL rule (issue #13) — except the root, which
 * stays "/" so it remains a usable link.
 */
export function localizePath(base: string, lang: Lang): string {
  const clean = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  const path = `${prefix}${clean}`;
  return path === '' ? '/' : path;
}

/**
 * Absolute canonical URL for a page: `origin` + the localized path, with no
 * trailing slash. The home page is the bare origin (e.g. "https://www.corca.ai")
 * so even the root carries no trailing slash in canonical/hreflang tags.
 * `origin` must be a bare origin (no trailing slash), e.g. `Astro.site.origin`.
 */
export function absoluteUrl(base: string, lang: Lang, origin: string): string {
  const path = localizePath(base, lang);
  return path === '/' ? origin : `${origin}${path}`;
}
