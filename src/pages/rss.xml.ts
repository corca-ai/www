import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

// RSS feed (issue #17): a press/news feed built from the news collection so
// search engines and subscription tools can follow Corca's coverage. Served at
// the conventional /rss.xml (correct content-type via the extension); /rss
// redirects here through public/_redirects. Discoverable via the
// <link rel="alternate" type="application/rss+xml"> in BaseLayout.
const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// News `date` is a day-granularity display string like "2026/3/25" (KST press
// dates). Anchor to noon KST (03:00 UTC) so the feed's pubDate keeps the same
// calendar day in every reader's time zone instead of slipping to the day before.
const asDate = (d: string) => {
  const [y, m, day] = d.split('/').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, day ?? 1, 3, 0, 0));
};

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://www.borca.ai')).href;
  const self = `${base}rss.xml`;
  const items = (await getCollection('news'))
    .map((e) => e.data)
    .sort((a, b) => asDate(b.date).getTime() - asDate(a.date).getTime());

  // The default locale (ko) drives the root feed, mirroring the un-prefixed site.
  const feed = {
    title: 'Corca 뉴스 · News',
    description: '언론이 주목한 코르카의 소식과 성과. · Corca in the press.',
  };

  const entries = items
    .map(
      (n) => `    <item>
      <title>${escapeXml(n.title.ko)}</title>
      <link>${escapeXml(n.href)}</link>
      <guid isPermaLink="true">${escapeXml(n.href)}</guid>
      <pubDate>${asDate(n.date).toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${base}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>ko-KR</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
};
