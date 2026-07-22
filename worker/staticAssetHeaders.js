const immutableAssetPatterns = [
  /^\/_astro\//,
  /^\/fonts\/ax-mobile\/v\d+\//,
  /^\/images\/pages\/ax\/logos\/v\d+\//,
];
const mutableStaticAssetPattern =
  /\.(?:avif|css|gif|ico|jpe?g|js|json|png|svg|webmanifest|webp|woff2)$/i;
const discoveryDocumentPattern = /\.(?:txt|xml|xsl)$/i;
const immutableCacheControl = 'public, max-age=31536000, immutable';
const mutableAssetCacheControl = 'public, max-age=86400, stale-while-revalidate=604800';
const revalidateCacheControl = 'public, max-age=0, must-revalidate';

function utf8ContentType(pathname, contentType) {
  if (pathname === '/rss') return 'application/rss+xml; charset=utf-8';
  if (/\.txt$/i.test(pathname)) return 'text/plain; charset=utf-8';
  if (/\/rss\.xml$/i.test(pathname)) return 'application/rss+xml; charset=utf-8';
  if (/\.xml$/i.test(pathname)) return 'application/xml; charset=utf-8';
  if (/\.xsl$/i.test(pathname)) return 'text/xsl; charset=utf-8';
  if (/^text\//i.test(contentType) && !/charset=/i.test(contentType)) {
    return `${contentType}; charset=utf-8`;
  }
  return contentType;
}

/**
 * Applies the response contract for Cloudflare static assets. Cloudflare
 * infers MIME types after Astro has emitted files, so text discovery documents
 * need their UTF-8 charset restored here instead of relying on route headers.
 *
 * @param {Request} request
 * @param {Response} response
 * @returns {Response}
 */
export function withStaticAssetCacheHeaders(request, response) {
  if (!response.ok || !['GET', 'HEAD'].includes(request.method.toUpperCase())) return response;

  const pathname = new URL(request.url).pathname;
  const contentType = response.headers.get('Content-Type') || '';
  const headers = new Headers(response.headers);
  const correctedContentType = utf8ContentType(pathname, contentType);
  let changed = correctedContentType !== contentType;

  if (changed) headers.set('Content-Type', correctedContentType);

  if (immutableAssetPatterns.some((pattern) => pattern.test(pathname))) {
    headers.set('Cache-Control', immutableCacheControl);
    changed = true;
  } else if (
    contentType.includes('text/html') ||
    pathname === '/rss' ||
    discoveryDocumentPattern.test(pathname)
  ) {
    headers.set('Cache-Control', revalidateCacheControl);
    changed = true;
  } else if (mutableStaticAssetPattern.test(pathname)) {
    headers.set('Cache-Control', mutableAssetCacheControl);
    changed = true;
  }

  if (!changed) return response;
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
