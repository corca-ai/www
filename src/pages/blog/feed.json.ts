import type { APIRoute } from 'astro';
import { BLOG_JSON_FEED_PATH, blogPostPath, getBlogPosts } from '../../blog/data';
import { SITE_ORIGIN } from '../../site';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE_ORIGIN);
  const posts = await getBlogPosts();
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Corca Blog',
    home_page_url: new URL('/blog', base).href,
    feed_url: new URL(BLOG_JSON_FEED_PATH, base).href,
    description:
      'Corca가 AI 제품, AX 워크플로, 개발 조직, 팀 운영에서 배운 내용을 기록하는 공식 블로그입니다.',
    language: 'ko',
    items: posts.map((post) => {
      const url = new URL(blogPostPath(post), base).href;
      return {
        id: url,
        url,
        title: post.title,
        content_html: absolutizeHtmlUrls(post.articleHtml, base),
        summary: post.description,
        date_published: new Date(post.date).toISOString(),
        authors: [{ name: post.author }],
        tags: post.tags,
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'content-type': 'application/feed+json; charset=utf-8' },
  });
};

function absolutizeHtmlUrls(html: string, base: URL): string {
  return html.replace(/\s(href|src)=("|')([^"']+)\2/g, (match, attribute, quote, path) => {
    const value = String(path || '').trim();
    if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/i.test(value)) {
      return match;
    }
    return ` ${attribute}=${quote}${new URL(value, base).href}${quote}`;
  });
}
