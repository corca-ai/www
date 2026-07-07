import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute } from 'astro';

const rssPath = join(process.cwd(), 'public/blog/rss.xml');

export const GET: APIRoute = async () => {
  const xml = await readFile(rssPath, 'utf8');
  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
};
