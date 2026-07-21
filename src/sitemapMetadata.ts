// Stable content dates for the registry-backed public pages. These dates must
// describe meaningful page changes, not the build time; otherwise every deploy
// would incorrectly tell crawlers that every URL changed.
const pageLastModifiedByBasePath = {
  '/': '2026-07-15',
  '/about': '2026-07-15',
  '/about/colleagues': '2026-07-15',
  '/about/how-we-work': '2026-07-15',
  '/about/vision-mission': '2026-07-15',
  '/ax': '2026-07-21',
  '/blog': '2026-07-20',
  '/news': '2026-07-15',
  '/products': '2026-07-15',
  '/products/moonlight': '2026-07-15',
  '/products/trace': '2026-07-16',
} as const satisfies Record<string, string>;

export function pageLastModified(basePath: string): string {
  const lastModified =
    pageLastModifiedByBasePath[basePath as keyof typeof pageLastModifiedByBasePath];
  if (!lastModified) throw new Error(`Missing sitemap last-modified date for ${basePath}`);
  return lastModified;
}

function latestLastModified(values: Iterable<string>): string {
  const dates = [...values].filter(Boolean).sort();
  const latest = dates.at(-1);
  if (!latest) throw new Error('Cannot determine sitemap last-modified date');
  return latest;
}

export const pagesSitemapLastModified = latestLastModified(
  Object.values(pageLastModifiedByBasePath),
);

export function latestLastModifiedFromXml(xml: string): string {
  return latestLastModified(
    [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1] ?? ''),
  );
}
