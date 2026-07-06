import type { APIRoute } from 'astro';
import { blogPostPath, getBlogPosts } from '../../blog/data';
import { SITE_ORIGIN } from '../../site';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const asDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 3, 0, 0));
};

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE_ORIGIN);
  const posts = await getBlogPosts();
  const self = new URL('/blog/rss.xml', base).href;
  const entries = posts
    .map((post) => {
      const url = new URL(blogPostPath(post), base).href;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${asDate(post.date).toUTCString()}</pubDate>
      <category>${escapeXml(post.tags[0] || '코르카')}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Corca Blog</title>
    <link>${escapeXml(new URL('/blog', base).href)}</link>
    <description>Corca가 AI 제품, AX 워크플로, 개발 조직, 팀 운영에서 배운 내용을 기록하는 공식 블로그입니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
};
