// Pure URL canonicalization for the edge Worker (worker/index.ts). Enforces
// issue #13's URL rules: https, the canonical `www.` host, and no trailing
// slash. Dependency-free and side-effect-free so it can be unit-tested directly.

/**
 * The canonical URL for `requestUrl`, or `null` when it is already canonical
 * (so the caller serves the asset instead of redirecting). Rules, in order:
 *   1. protocol → the origin's (http → https)
 *   2. host → the origin's (apex / non-www → www)
 *   3. drop a trailing slash from any non-root path
 *
 * The root "/" keeps its slash: a browser always requests "/", so redirecting it
 * to a slash-less form would loop. The home page's canonical <link> carries the
 * slash-less origin instead (see src/i18n/utils.ts `absoluteUrl`).
 *
 * `origin` is the canonical origin (e.g. "https://www.corca.ai"); its protocol
 * and host are the redirect target. With `rewriteHost` false only rule 3 runs —
 * used for preview hosts (localhost, *.workers.dev) that must not bounce to prod.
 */
export function canonicalUrl(
  requestUrl: string,
  origin: string,
  rewriteHost = true,
): string | null {
  const url = new URL(requestUrl);
  let changed = false;

  if (rewriteHost) {
    const canonical = new URL(origin);
    if (url.protocol !== canonical.protocol) {
      url.protocol = canonical.protocol;
      changed = true;
    }
    if (url.host !== canonical.host) {
      url.host = canonical.host;
      changed = true;
    }
  }

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
    changed = true;
  }

  return changed ? url.href : null;
}
