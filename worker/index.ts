// Edge Worker in front of the static assets. It runs first on every request
// (`run_worker_first` in wrangler.jsonc) and enforces the canonical URL — https,
// the `www.` host and no trailing slash (issue #13) — with a 301, then hands
// everything else to the static assets (which apply `_redirects`, `html_handling`
// and `not_found_handling`). The canonical origin comes from src/site.ts, so a
// domain move is a one-line change there plus the `routes` host in wrangler.jsonc.
import { canonicalUrl } from '../src/canonical';
import { SITE_ORIGIN } from '../src/site';
import { type AxConsultationEnv, handleAxConsultation } from './axConsultations';
import { withStaticAssetCacheHeaders } from './staticAssetHeaders.js';

interface Env extends AxConsultationEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CORCA_NOTION_WEBHOOK_SECRET?: string;
  GITHUB_DISPATCH_TOKEN?: string;
  GITHUB_DISPATCH_REPOSITORY?: string;
}

const notionPublishWebhookPattern = /^\/api\/notion\/publish\/?$/;
const axConsultationPattern = /^\/api\/ax\/consultations\/?$/;
const adminPathPattern = /^\/(?:api\/admin|blog\/admin)(?:\/|$)/;
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

    if (axConsultationPattern.test(url.pathname)) {
      return handleAxConsultation(request, env);
    }

    if (notionPublishWebhookPattern.test(url.pathname)) {
      return handleNotionPublishWebhook(request, env);
    }

    // Blog admin UI/API has been retired. Generated source/translation assets
    // may still exist under this path for the static blog renderer, but no
    // runtime route under /blog/admin or /api/admin should be browseable.
    if (adminPathPattern.test(url.pathname)) return json({ error: 'not_found' }, 404);

    const response = await env.ASSETS.fetch(request);
    return withStaticAssetCacheHeaders(request, response);
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
