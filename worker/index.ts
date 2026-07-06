// Edge Worker in front of the static assets. It runs first on every request
// (`run_worker_first` in wrangler.jsonc) and enforces the canonical URL — https,
// the `www.` host and no trailing slash (issue #13) — with a 301, then hands
// everything else to the static assets (which apply `_redirects`, `html_handling`
// and `not_found_handling`). The canonical origin comes from src/site.ts, so a
// domain move is a one-line change there plus the `routes` host in wrangler.jsonc.
import { canonicalUrl } from '../src/canonical';
import { SITE_ORIGIN } from '../src/site';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CORCA_ADMIN_PASSWORD_SHA256?: string;
  CORCA_NOTION_WEBHOOK_SECRET?: string;
  GITHUB_DISPATCH_TOKEN?: string;
  GITHUB_DISPATCH_REPOSITORY?: string;
}

const notionPublishWebhookPattern = /^\/api\/notion\/publish\/?$/;
const adminApiPattern = /^\/api\/admin(?:\/(.*))?$/;
const adminPostSourcePattern = /^\/blog\/admin\/post-sources\/[^/]+\.html$/;
const adminSessionCookie = 'corca_blog_admin';
const adminSessionMaxAge = 60 * 60 * 12;
const defaultAdminPasswordHash = '364c4b1132e54f92e32e55339d44679dda228d5073b0f6e77afabbf7ce088800';
const githubDispatchRepository = 'corca-ai/www';

// Preview hosts must not be rewritten to the production domain, or the
// workers.dev preview and local `wrangler dev` would bounce to prod. Trailing-
// slash normalization still applies there, so previews behave like production.
function isPreviewHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.workers.dev');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const target = canonicalUrl(request.url, SITE_ORIGIN, !isPreviewRequest(request, url));
    if (target) return Response.redirect(target, 301);

    if (notionPublishWebhookPattern.test(url.pathname)) {
      return handleNotionPublishWebhook(request, env);
    }

    const adminMatch = url.pathname.match(adminApiPattern);
    if (adminMatch) return handleAdminApi(request, env, safeDecode(adminMatch[1] || ''));

    // These source files are deployed as Cloudflare Static Assets so the admin
    // API can read them, but they should not be directly browseable.
    if (adminPostSourcePattern.test(url.pathname)) return json({ error: 'not_found' }, 404);

    return env.ASSETS.fetch(request);
  },
};

function isPreviewRequest(request: Request, url: URL): boolean {
  const forwardedHost = (request.headers.get('Host') || '').split(':')[0] || '';
  const isMiniflareRequest = request.headers.has('MF-Original-Hostname');
  return (
    isPreviewHost(url.hostname) ||
    isPreviewHost(forwardedHost) ||
    (isMiniflareRequest && isLocalDevClientIp(request.headers.get('CF-Connecting-IP') || ''))
  );
}

function isLocalDevClientIp(value: string): boolean {
  return (
    value === '127.0.0.1' ||
    value === '::1' ||
    /^10\./.test(value) ||
    /^192\.168\./.test(value) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(value) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(value)
  );
}

async function handleAdminApi(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method.toUpperCase();
  if (path === 'session' && method === 'POST') return createAdminSession(request, env);
  if (path === 'session' && method === 'DELETE') {
    return json({ ok: true }, 200, {
      'Set-Cookie': `${adminSessionCookie}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`,
    });
  }

  if (!(await hasValidAdminSession(request, env))) return json({ error: 'unauthorized' }, 401);

  if ((path === 'posts' || path === 'posts/') && method === 'GET') {
    return listAdminPosts(request, env);
  }
  if ((path === 'posts' || path === 'posts/') && method === 'POST') {
    return dispatchAdminPostChange(request, env);
  }

  const sourceMatch = path.match(/^posts\/([^/]+)\/source\/?$/);
  if (sourceMatch && method === 'GET') {
    return getAdminPostSource(request, env, safeDecode(sourceMatch[1] || ''));
  }

  const deleteMatch = path.match(/^posts\/([^/]+)\/?$/);
  if (deleteMatch && method === 'DELETE') {
    return dispatchAdminPostChange(request, env, {
      action: 'delete',
      slug: safeDecode(deleteMatch[1] || ''),
    });
  }

  return json({ error: 'method_not_allowed' }, 405);
}

async function handleNotionPublishWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method.toUpperCase() !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
  }

  const expectedSecret = String(env.CORCA_NOTION_WEBHOOK_SECRET || '');
  if (!expectedSecret) return json({ error: 'missing_webhook_secret' }, 503);
  if (!hasValidWebhookSecret(request, expectedSecret)) {
    return json({ error: 'unauthorized' }, 401);
  }

  const token = String(env.GITHUB_DISPATCH_TOKEN || '');
  if (!token) return json({ error: 'missing_github_dispatch_token' }, 503);

  const payload = await readJsonPayload(request);
  const pageId = extractNotionPageId(payload);
  const repository = String(env.GITHUB_DISPATCH_REPOSITORY || githubDispatchRepository);
  const dispatchResponse = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'corca-www-notion-relay',
      'X-GitHub-Api-Version': '2026-03-10',
    },
    body: JSON.stringify({
      event_type: 'notion-post-publish',
      client_payload: {
        source: 'notion-webhook',
        received_at: new Date().toISOString(),
        ...(pageId ? { page_id: pageId } : {}),
      },
    }),
  });

  if (!dispatchResponse.ok) {
    return json({ error: 'github_dispatch_failed', status: dispatchResponse.status }, 502);
  }

  return json({ ok: true, page_id: pageId || null }, 202);
}

async function createAdminSession(request: Request, env: Env): Promise<Response> {
  const body = await readJsonPayload(request);
  const passwordHash = await sha256Hex(String(body.password || ''));
  const expectedHash = adminPasswordHash(env);
  if (!constantTimeEqual(passwordHash, expectedHash)) return json({ error: 'unauthorized' }, 401);

  const expires = Math.floor(Date.now() / 1000) + adminSessionMaxAge;
  const signature = await adminSessionSignature(expires, expectedHash);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return json({ ok: true }, 200, {
    'Set-Cookie': `${adminSessionCookie}=${expires}.${signature}; Path=/; Max-Age=${adminSessionMaxAge}; HttpOnly; SameSite=Strict${secure}`,
  });
}

async function hasValidAdminSession(request: Request, env: Env): Promise<boolean> {
  const token = getCookieValue(request.headers.get('Cookie') || '', adminSessionCookie);
  const [expiresText, signature] = token.split('.');
  const expires = Number(expiresText);
  if (!Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }
  const expected = await adminSessionSignature(expires, adminPasswordHash(env));
  return constantTimeEqual(signature, expected);
}

async function adminSessionSignature(expires: number, secret: string): Promise<string> {
  return hmacSha256Hex(secret, `${expires}.${secret}`);
}

function adminPasswordHash(env: Env): string {
  return String(env.CORCA_ADMIN_PASSWORD_SHA256 || defaultAdminPasswordHash)
    .trim()
    .toLowerCase();
}

async function listAdminPosts(request: Request, env: Env): Promise<Response> {
  const response = await fetchAsset(env, request, '/blog/posts/index.json');
  if (!response.ok) return json({ error: 'posts_unavailable', status: response.status }, 502);
  return json({ posts: await response.json() }, 200);
}

async function getAdminPostSource(request: Request, env: Env, slug: string): Promise<Response> {
  if (!isSafePostSlug(slug)) return json({ error: 'invalid_slug' }, 400);

  const response = await fetchAsset(
    env,
    request,
    `/blog/admin/post-sources/${encodeURIComponent(slug)}.html`,
  );
  if (!response.ok) {
    return json(
      { error: 'post_source_unavailable', status: response.status },
      response.status === 404 ? 404 : 502,
    );
  }

  const html = await response.text();
  const metadata = parseEmbeddedPostMetadata(html);
  const sourceMarkdown = String(metadata.sourceMarkdown || '');
  const sourceFormat = metadata.sourceFormat === 'markdown' && sourceMarkdown ? 'markdown' : 'html';
  const publicMetadata = { ...metadata };
  delete publicMetadata.sourceMarkdown;

  return json(
    {
      slug,
      format: sourceFormat,
      content: sourceFormat === 'markdown' ? sourceMarkdown : html,
      metadata: publicMetadata,
    },
    200,
  );
}

async function dispatchAdminPostChange(
  request: Request,
  env: Env,
  overridePayload: Record<string, unknown> | null = null,
): Promise<Response> {
  const token = String(env.GITHUB_DISPATCH_TOKEN || '');
  if (!token) return json({ error: 'missing_github_dispatch_token' }, 503);

  const rawPayload = overridePayload || (await readJsonPayload(request));
  const payload = sanitizeAdminPostChangePayload(rawPayload);
  if ('error' in payload) return json({ error: payload.error }, 400);

  const repository = String(env.GITHUB_DISPATCH_REPOSITORY || githubDispatchRepository);
  const dispatchResponse = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'corca-www-blog-admin',
      'X-GitHub-Api-Version': '2026-03-10',
    },
    body: JSON.stringify({
      event_type: 'admin-post-change',
      client_payload: {
        ...payload.value,
        source: 'www-admin-ui',
        requested_at: new Date().toISOString(),
      },
    }),
  });

  if (!dispatchResponse.ok) {
    return json({ error: 'github_dispatch_failed', status: dispatchResponse.status }, 502);
  }

  return json({ ok: true, action: payload.value.action, slug: payload.value.slug }, 202);
}

function sanitizeAdminPostChangePayload(value: Record<string, unknown>):
  | {
      value: Record<string, unknown>;
    }
  | { error: string } {
  const metadataInput = isRecord(value.metadata) ? value.metadata : {};
  const action = String(value.action || 'upsert')
    .trim()
    .toLowerCase();
  const slug = normalizePostSlug(String(value.slug || metadataInput.slug || ''));
  if (!['upsert', 'delete'].includes(action)) return { error: 'invalid_action' };
  if (!isSafePostSlug(slug)) return { error: 'invalid_slug' };
  if (action === 'delete') return { value: { action, slug } };

  const format = normalizeAdminPostFormat(value.format);
  const contentBase64 = String(value.contentBase64 || '');
  if (!format) return { error: 'invalid_format' };
  if (!contentBase64 || contentBase64.length > 90000) return { error: 'invalid_content_size' };

  const metadata = sanitizeAdminMetadata(metadataInput);
  if (!metadata.title || !metadata.description || !metadata.date)
    return { error: 'missing_metadata' };

  const coverImage = sanitizeAdminCoverImage(value);
  if ('error' in coverImage) return { error: coverImage.error };

  return {
    value: {
      action,
      slug,
      format,
      fileName: String(value.fileName || '').slice(0, 120),
      metadata,
      contentBase64,
      ...coverImage,
    },
  };
}

function sanitizeAdminCoverImage(
  value: Record<string, unknown>,
): Record<string, string> | { error: string } {
  const contentBase64 = String(value.coverImageBase64 || '').trim();
  if (!contentBase64) return {};
  if (!/^[A-Za-z0-9+/=]+$/.test(contentBase64) || contentBase64.length > 95000) {
    return { error: 'invalid_cover_image_size' };
  }
  const mime = String(value.coverImageMime || '')
    .trim()
    .toLowerCase();
  const fileName = String(value.coverImageFileName || '')
    .trim()
    .slice(0, 120);
  if (!/^image\/(?:jpeg|png|webp)$/.test(mime) && !/\.(?:jpe?g|png|webp)$/i.test(fileName)) {
    return { error: 'invalid_cover_image_type' };
  }
  return {
    coverImageBase64: contentBase64,
    coverImageMime: mime,
    coverImageFileName: fileName,
  };
}

function sanitizeAdminMetadata(value: Record<string, unknown>): Record<string, unknown> {
  return {
    title: String(value.title || '')
      .trim()
      .slice(0, 160),
    description: String(value.description || '')
      .trim()
      .slice(0, 180),
    date: String(value.date || '').trim(),
    tags: String(value.tags || '')
      .trim()
      .slice(0, 160),
    author: String(value.author || 'Corca Team')
      .trim()
      .slice(0, 80),
    cover: String(value.cover || 'assets/editorial-cover.jpg')
      .trim()
      .slice(0, 160),
    language: String(value.language || 'ko')
      .trim()
      .slice(0, 12),
    coverAlt: String(value.coverAlt || '')
      .trim()
      .slice(0, 180),
    section: String(value.section || '')
      .trim()
      .slice(0, 40),
  };
}

function normalizeAdminPostFormat(value: unknown): string {
  const format = String(value || '')
    .trim()
    .toLowerCase();
  if (format === 'markdown' || format === 'md') return 'markdown';
  if (format === 'html' || format === 'htm') return 'html';
  return '';
}

async function fetchAsset(env: Env, request: Request, pathname: string): Promise<Response> {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  assetUrl.search = '';
  assetUrl.hash = '';
  return env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));
}

function parseEmbeddedPostMetadata(html: string): Record<string, unknown> {
  const match = String(html || '').match(/^\s*<!--\s*corca-post\s*([\s\S]*?)-->/i);
  if (!match) return {};
  try {
    const value = JSON.parse(match[1] || '{}');
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}

function isSafePostSlug(value: string): boolean {
  return /^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/.test(String(value || ''));
}

function normalizePostSlug(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '');
}

function getCookieValue(cookieHeader: string, name: string): string {
  return (
    String(cookieHeader || '')
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1) || ''
  );
}

async function readJsonPayload(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftText = String(left || '');
  const rightText = String(right || '');
  if (!leftText || !rightText || leftText.length !== rightText.length) return false;

  let diff = 0;
  for (let index = 0; index < leftText.length; index += 1) {
    diff |= leftText.charCodeAt(index) ^ rightText.charCodeAt(index);
  }
  return diff === 0;
}

function hasValidWebhookSecret(request: Request, expectedSecret: string): boolean {
  const headerSecret = request.headers.get('X-Corca-Webhook-Secret') || '';
  const authorization = request.headers.get('Authorization') || '';
  const bearerSecret = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || '';
  return (
    constantTimeEqual(headerSecret, expectedSecret) ||
    constantTimeEqual(bearerSecret, expectedSecret)
  );
}

function extractNotionPageId(value: Record<string, unknown>): string {
  const data = isRecord(value.data) ? value.data : {};
  const entity = isRecord(value.entity) ? value.entity : {};
  const candidates = [
    value.id,
    value.page_id,
    value.pageId,
    data.id,
    data.page_id,
    data.pageId,
    entity.id,
  ];

  for (const candidate of candidates) {
    const pageId = normalizeNotionId(candidate);
    if (pageId) return pageId;
  }

  return '';
}

function normalizeNotionId(value: unknown): string {
  const text = String(value || '').trim();
  if (!text) return '';
  const match = text.match(
    /[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  return match ? match[0].replace(/-/g, '') : '';
}

async function sha256Hex(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(String(value || '')),
  );
  return hex(buffer);
}

async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(String(secret || '')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(String(value || '')),
  );
  return hex(signature);
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return '';
  }
}

function json(
  payload: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
