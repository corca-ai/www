const newsletterRssUrl = 'https://www.corca.ai/rss';
const maxBodyBytes = 8 * 1024;
const maxPendingDeliveriesPerRun = 100;
const confirmationCooldownMs = 10 * 60 * 1000;
const deliveryClaimTimeoutMs = 15 * 60 * 1000;
const textEncoder = new TextEncoder();

export interface NewsletterEnv {
  NEWSLETTER_AWS_ACCESS_KEY_ID?: string;
  NEWSLETTER_AWS_REGION?: string;
  NEWSLETTER_AWS_SECRET_ACCESS_KEY?: string;
  NEWSLETTER_AWS_SESSION_TOKEN?: string;
  NEWSLETTER_DB?: D1Database;
  NEWSLETTER_FROM_EMAIL?: string;
  NEWSLETTER_REPLY_TO_EMAIL?: string;
  NEWSLETTER_RSS_URL?: string;
  NEWSLETTER_SITE_ORIGIN?: string;
  NEWSLETTER_TOKEN_SECRET?: string;
}

interface NewsletterSubscriber {
  email: string;
  id: string;
  state: 'active' | 'pending' | 'unsubscribed';
}

interface NewsletterEdition {
  id: string;
  post_title: string;
  post_url: string;
}

interface PendingDelivery extends NewsletterEdition {
  email: string;
  subscriber_id: string;
  delivery_id: string;
}

export interface RssItem {
  guid: string;
  publishedAt: string;
  title: string;
  url: string;
}

export interface NewsletterMessage {
  html: string;
  subject: string;
  text: string;
  to: string;
}

export interface NewsletterRunResult {
  baseline?: boolean;
  delivered: number;
  discovered: number;
  queued: number;
  reason?: 'database_not_configured' | 'mailer_not_configured' | 'token_secret_not_configured';
}

export async function handleNewsletterRequest(
  request: Request,
  env: NewsletterEnv,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '/api/newsletter/status') return newsletterStatus(env);
  if (url.pathname === '/api/newsletter/subscribe') return subscribe(request, env);
  if (url.pathname === '/api/newsletter/confirm') return confirm(url, env);
  if (url.pathname === '/api/newsletter/unsubscribe') return unsubscribe(url, env);
  return json({ error: 'not_found' }, 404);
}

export async function runNewsletterDaily(
  env: NewsletterEnv,
  options: { fetcher?: typeof fetch; now?: Date } = {},
): Promise<NewsletterRunResult> {
  const database = env.NEWSLETTER_DB;
  const tokenSecret = requiredTokenSecret(env);
  if (!database) {
    return { delivered: 0, discovered: 0, queued: 0, reason: 'database_not_configured' };
  }
  if (!tokenSecret) {
    return { delivered: 0, discovered: 0, queued: 0, reason: 'token_secret_not_configured' };
  }

  const now = options.now || new Date();
  const rssResponse = await (options.fetcher || fetch)(env.NEWSLETTER_RSS_URL || newsletterRssUrl, {
    headers: { Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8' },
  });
  if (!rssResponse.ok) throw new Error(`Newsletter RSS fetch failed (${rssResponse.status})`);
  const items = parseRssItems(await rssResponse.text());
  const timestamp = now.toISOString();
  const initialized = await getSetting(database, 'rss_baseline_initialized_at');

  if (!initialized) {
    if (!items.length) throw new Error('Newsletter RSS baseline contains no valid items');
    for (const item of items) {
      await insertEdition(database, item, 'baseline', timestamp);
    }
    await setSetting(database, 'rss_baseline_initialized_at', timestamp, timestamp);
    return { baseline: true, delivered: 0, discovered: 0, queued: 0 };
  }

  await database
    .prepare(
      `UPDATE newsletter_deliveries
       SET status = 'pending', claimed_at = NULL, updated_at = ?
       WHERE status = 'sending' AND claimed_at < ?`,
    )
    .bind(timestamp, new Date(now.getTime() - deliveryClaimTimeoutMs).toISOString())
    .run();

  const newEditions: NewsletterEdition[] = [];
  for (const item of items) {
    const existing = await database
      .prepare('SELECT id FROM newsletter_editions WHERE rss_guid = ?')
      .bind(item.guid)
      .first<{ id: string }>();
    if (existing) continue;
    const edition = await insertEdition(database, item, 'queued', timestamp);
    newEditions.push(edition);
  }

  const subscribers = await queryAll<NewsletterSubscriber>(
    database,
    'SELECT id, email, state FROM newsletter_subscribers WHERE state = ?',
    ['active'],
  );
  let queued = 0;
  for (const edition of newEditions) {
    for (const subscriber of subscribers) {
      const deliveryId = crypto.randomUUID();
      const token = await createUnsubscribeToken(tokenSecret, subscriber.id, deliveryId);
      const result = await database
        .prepare(
          `INSERT OR IGNORE INTO newsletter_deliveries (
            id, edition_id, subscriber_id, unsubscribe_token_hash, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
        )
        .bind(
          deliveryId,
          edition.id,
          subscriber.id,
          await hashToken(tokenSecret, token),
          timestamp,
          timestamp,
        )
        .run();
      queued += Number(result.meta.changes || 0);
    }
  }

  if (!hasMailerConfiguration(env)) {
    return {
      delivered: 0,
      discovered: newEditions.length,
      queued,
      reason: 'mailer_not_configured',
    };
  }

  const pending = await queryAll<PendingDelivery>(
    database,
    `SELECT d.id AS delivery_id, d.subscriber_id, s.email, e.id, e.post_title, e.post_url
     FROM newsletter_deliveries d
     JOIN newsletter_subscribers s ON s.id = d.subscriber_id
     JOIN newsletter_editions e ON e.id = d.edition_id
     WHERE d.status = 'pending' AND s.state = 'active'
     ORDER BY d.created_at ASC
     LIMIT ?`,
    [maxPendingDeliveriesPerRun],
  );
  let delivered = 0;
  for (const delivery of pending) {
    const claim = await database
      .prepare(
        `UPDATE newsletter_deliveries
         SET status = 'sending', claimed_at = ?, attempts = attempts + 1, updated_at = ?
         WHERE id = ? AND status = 'pending'`,
      )
      .bind(timestamp, timestamp, delivery.delivery_id)
      .run();
    if (!Number(claim.meta.changes || 0)) continue;
    const unsubscribeToken = await createUnsubscribeToken(
      tokenSecret,
      delivery.subscriber_id,
      delivery.delivery_id,
    );
    try {
      const messageId = await sendSesEmail(
        env,
        buildPostMessage(env, delivery, unsubscribeToken),
        options,
      );
      await database
        .prepare(
          `UPDATE newsletter_deliveries
           SET status = 'sent', claimed_at = NULL, provider_message_id = ?, sent_at = ?,
               last_error = NULL, updated_at = ?
           WHERE id = ?`,
        )
        .bind(messageId, timestamp, timestamp, delivery.delivery_id)
        .run();
      delivered += 1;
    } catch (error) {
      await database
        .prepare(
          `UPDATE newsletter_deliveries
           SET status = 'failed', claimed_at = NULL, last_error = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(errorMessage(error), timestamp, delivery.delivery_id)
        .run();
    }
  }
  return { delivered, discovered: newEditions.length, queued };
}

export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const block of xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) || []) {
    const guid = rssText(block, 'guid');
    const url = rssText(block, 'link');
    const title = rssText(block, 'title');
    if (!guid || !url || !title) continue;
    items.push({ guid, publishedAt: rssText(block, 'pubDate'), title, url });
  }
  return items;
}

export function isNewsletterEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value.trim())
  );
}

export async function createUnsubscribeToken(
  secret: string,
  subscriberId: string,
  deliveryId: string,
): Promise<string> {
  const payload = `${subscriberId}.${deliveryId}`;
  return `${payload}.${await hmacHex(secret, payload)}`;
}

export async function verifyUnsubscribeToken(
  secret: string,
  token: string,
): Promise<{
  deliveryId: string;
  subscriberId: string;
} | null> {
  const [subscriberId, deliveryId, signature, ...rest] = token.split('.');
  if (!subscriberId || !deliveryId || !signature || rest.length) return null;
  const expected = await hmacHex(secret, `${subscriberId}.${deliveryId}`);
  if (!constantTimeEqual(signature, expected)) return null;
  return { deliveryId, subscriberId };
}

export async function sendSesEmail(
  env: NewsletterEnv,
  message: NewsletterMessage,
  options: { fetcher?: typeof fetch; now?: Date } = {},
): Promise<string> {
  if (!hasMailerConfiguration(env)) throw new NewsletterSetupError('SES mailer is not configured');
  const region = String(env.NEWSLETTER_AWS_REGION);
  const host = `email.${region}.amazonaws.com`;
  const body = JSON.stringify({
    Content: {
      Simple: {
        Body: {
          Html: { Charset: 'UTF-8', Data: message.html },
          Text: { Charset: 'UTF-8', Data: message.text },
        },
        Subject: { Charset: 'UTF-8', Data: message.subject },
      },
    },
    Destination: { ToAddresses: [message.to] },
    FromEmailAddress: env.NEWSLETTER_FROM_EMAIL,
    ...(env.NEWSLETTER_REPLY_TO_EMAIL ? { ReplyToAddresses: [env.NEWSLETTER_REPLY_TO_EMAIL] } : {}),
  });
  const now = options.now || new Date();
  const amzDate = awsTimestamp(now);
  const shortDate = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body);
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  if (env.NEWSLETTER_AWS_SESSION_TOKEN) {
    headers['x-amz-security-token'] = env.NEWSLETTER_AWS_SESSION_TOKEN;
  }
  const signedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaders
    .map((key) => `${key}:${normalizeHeader(headers[key] || '')}\n`)
    .join('');
  const canonicalRequest = [
    'POST',
    '/v2/email/outbound-emails',
    '',
    canonicalHeaders,
    signedHeaders.join(';'),
    payloadHash,
  ].join('\n');
  const credentialScope = `${shortDate}/${region}/ses/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');
  const signingKey = await awsSigningKey(
    env.NEWSLETTER_AWS_SECRET_ACCESS_KEY || '',
    shortDate,
    region,
  );
  const signature = await hmacHex(signingKey, stringToSign);
  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${env.NEWSLETTER_AWS_ACCESS_KEY_ID}/${credentialScope}`,
    `SignedHeaders=${signedHeaders.join(';')}`,
    `Signature=${signature}`,
  ].join(', ');
  const response = await (options.fetcher || fetch)(`https://${host}/v2/email/outbound-emails`, {
    body,
    headers: { ...headers, Authorization: authorization },
    method: 'POST',
  });
  if (!response.ok) throw new Error(`SES SendEmail failed (${response.status})`);
  const payload = (await response.json()) as { MessageId?: unknown };
  const messageId = String(payload.MessageId || '');
  if (!messageId) throw new Error('SES SendEmail returned no MessageId');
  return messageId;
}

async function subscribe(request: Request, env: NewsletterEnv): Promise<Response> {
  if (request.method.toUpperCase() !== 'POST')
    return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' });
  if (!request.headers.get('Content-Type')?.toLowerCase().includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }
  const text = await request.text();
  if (textEncoder.encode(text).byteLength > maxBodyBytes)
    return json({ error: 'payload_too_large' }, 413);
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed)) throw new Error('Invalid payload');
    payload = parsed;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (String(payload.website || '').trim()) return json({ ok: true }, 202);
  const email = String(payload.email || '')
    .trim()
    .toLowerCase();
  if (!isNewsletterEmail(email)) return json({ error: 'invalid_email' }, 422);
  if (payload.consent !== true) return json({ error: 'consent_required' }, 422);
  const database = env.NEWSLETTER_DB;
  const secret = requiredTokenSecret(env);
  if (!database) return json({ error: 'newsletter_not_configured' }, 503);
  if (!secret || !hasMailerConfiguration(env))
    return json({ error: 'newsletter_delivery_not_configured' }, 503);

  const existing = await database
    .prepare('SELECT id, state FROM newsletter_subscribers WHERE email = ?')
    .bind(email)
    .first<NewsletterSubscriber>();
  if (existing?.state === 'active') return json({ ok: true, status: 'already_subscribed' }, 202);

  const now = new Date().toISOString();
  const token = randomToken();
  const subscriberId = existing?.id || crypto.randomUUID();
  const reservation = await database
    .prepare(
      `INSERT INTO newsletter_subscribers (
        id, email, state, consented_at, confirmation_token_hash, confirmation_sent_at,
        confirmed_at, unsubscribed_at, created_at, updated_at
      ) VALUES (?, ?, 'pending', ?, ?, ?, NULL, NULL, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        state = 'pending', consented_at = excluded.consented_at,
        confirmation_token_hash = excluded.confirmation_token_hash,
        confirmation_sent_at = excluded.confirmation_sent_at, confirmed_at = NULL,
        unsubscribed_at = NULL, updated_at = excluded.updated_at
      WHERE newsletter_subscribers.state = 'unsubscribed'
        OR (
          newsletter_subscribers.state = 'pending'
          AND (
            newsletter_subscribers.confirmation_sent_at IS NULL
            OR newsletter_subscribers.confirmation_sent_at < ?
          )
        )`,
    )
    .bind(
      subscriberId,
      email,
      now,
      await hashToken(secret, token),
      now,
      now,
      now,
      new Date(Date.now() - confirmationCooldownMs).toISOString(),
    )
    .run();
  if (!Number(reservation.meta.changes || 0)) {
    return json({ ok: true, status: 'confirmation_recently_sent' }, 202);
  }
  try {
    await sendSesEmail(env, buildConfirmationMessage(env, email, token));
  } catch {
    return json({ error: 'confirmation_delivery_failed' }, 502);
  }
  return json({ ok: true, status: 'confirmation_sent' }, 202);
}

async function newsletterStatus(env: NewsletterEnv): Promise<Response> {
  const configured = Boolean(
    env.NEWSLETTER_DB && requiredTokenSecret(env) && hasMailerConfiguration(env),
  );
  if (!configured || !env.NEWSLETTER_DB) return json({ enabled: false }, 200);
  const publicEnabled = await getSetting(env.NEWSLETTER_DB, 'public_enabled');
  return json({ enabled: publicEnabled === 'true' }, 200);
}

async function confirm(url: URL, env: NewsletterEnv): Promise<Response> {
  if (!env.NEWSLETTER_DB || !requiredTokenSecret(env))
    return newsletterPage('뉴스레터 설정이 아직 완료되지 않았습니다.', 503);
  const token = url.searchParams.get('token') || '';
  if (!token) return newsletterPage('확인 링크가 올바르지 않습니다.', 400);
  const result = await env.NEWSLETTER_DB.prepare(
    `UPDATE newsletter_subscribers
     SET state = 'active', confirmed_at = ?, confirmation_token_hash = NULL, updated_at = ?
     WHERE confirmation_token_hash = ? AND state = 'pending'`,
  )
    .bind(
      new Date().toISOString(),
      new Date().toISOString(),
      await hashToken(requiredTokenSecret(env), token),
    )
    .run();
  return Number(result.meta.changes || 0)
    ? newsletterPage('구독이 완료되었습니다. 다음 코르카 블로그 글부터 메일로 보내드릴게요.')
    : newsletterPage('이 링크는 이미 사용되었거나 올바르지 않습니다.', 400);
}

async function unsubscribe(url: URL, env: NewsletterEnv): Promise<Response> {
  if (!env.NEWSLETTER_DB || !requiredTokenSecret(env))
    return newsletterPage('뉴스레터 설정이 아직 완료되지 않았습니다.', 503);
  const verified = await verifyUnsubscribeToken(
    requiredTokenSecret(env),
    url.searchParams.get('token') || '',
  );
  if (!verified) return newsletterPage('수신 거부 링크가 올바르지 않습니다.', 400);
  const token = url.searchParams.get('token') || '';
  const delivery = await env.NEWSLETTER_DB.prepare(
    `SELECT id FROM newsletter_deliveries
     WHERE id = ? AND subscriber_id = ? AND unsubscribe_token_hash = ?`,
  )
    .bind(
      verified.deliveryId,
      verified.subscriberId,
      await hashToken(requiredTokenSecret(env), token),
    )
    .first<{ id: string }>();
  if (!delivery) return newsletterPage('수신 거부 링크가 올바르지 않습니다.', 400);
  const now = new Date().toISOString();
  await env.NEWSLETTER_DB.prepare(
    `UPDATE newsletter_subscribers
     SET state = 'unsubscribed', unsubscribed_at = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(now, now, verified.subscriberId)
    .run();
  return newsletterPage('뉴스레터 수신을 중단했습니다.');
}

async function insertEdition(
  database: D1Database,
  item: RssItem,
  state: 'baseline' | 'queued',
  createdAt: string,
): Promise<NewsletterEdition> {
  const edition = { id: crypto.randomUUID(), post_title: item.title, post_url: item.url };
  await database
    .prepare(
      `INSERT OR IGNORE INTO newsletter_editions (
        id, rss_guid, post_url, post_title, published_at, state, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(edition.id, item.guid, item.url, item.title, item.publishedAt || null, state, createdAt)
    .run();
  return edition;
}

async function getSetting(database: D1Database, key: string): Promise<string> {
  const result = await database
    .prepare('SELECT value FROM newsletter_settings WHERE key = ?')
    .bind(key)
    .first<{ value: string }>();
  return String(result?.value || '');
}

async function setSetting(database: D1Database, key: string, value: string, updatedAt: string) {
  return database
    .prepare(
      `INSERT INTO newsletter_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(key, value, updatedAt)
    .run();
}

async function queryAll<T>(database: D1Database, query: string, values: unknown[]): Promise<T[]> {
  const result = await database
    .prepare(query)
    .bind(...values)
    .all<T>();
  return result.results || [];
}

function buildConfirmationMessage(
  env: NewsletterEnv,
  email: string,
  token: string,
): NewsletterMessage {
  const confirmUrl = newsletterUrl(env, '/api/newsletter/confirm', token);
  return {
    html: `<p>코르카 블로그 뉴스레터 구독을 확인해 주세요.</p><p><a href="${escapeHtml(confirmUrl)}">구독 확인하기</a></p>`,
    subject: '[Corca] 블로그 뉴스레터 구독 확인',
    text: `코르카 블로그 뉴스레터 구독을 확인해 주세요.\n${confirmUrl}`,
    to: email,
  };
}

function buildPostMessage(
  env: NewsletterEnv,
  delivery: PendingDelivery,
  unsubscribeToken: string,
): NewsletterMessage {
  const unsubscribeUrl = newsletterUrl(env, '/api/newsletter/unsubscribe', unsubscribeToken);
  const title = escapeHtml(delivery.post_title);
  const postUrl = escapeHtml(delivery.post_url);
  return {
    html: `<p>코르카 블로그에 새 글이 발행되었습니다.</p><h1>${title}</h1><p><a href="${postUrl}">글 읽기</a></p><hr><p><a href="${escapeHtml(unsubscribeUrl)}">뉴스레터 수신 거부</a></p>`,
    subject: `[Corca Blog] ${delivery.post_title}`,
    text: `코르카 블로그에 새 글이 발행되었습니다.\n\n${delivery.post_title}\n${delivery.post_url}\n\n수신 거부: ${unsubscribeUrl}`,
    to: delivery.email,
  };
}

function newsletterUrl(env: NewsletterEnv, pathname: string, token: string): string {
  const origin = String(env.NEWSLETTER_SITE_ORIGIN || 'https://www.corca.ai').replace(/\/$/, '');
  return `${origin}${pathname}?token=${encodeURIComponent(token)}`;
}

function hasMailerConfiguration(env: NewsletterEnv): boolean {
  return Boolean(
    env.NEWSLETTER_AWS_ACCESS_KEY_ID &&
      env.NEWSLETTER_AWS_REGION &&
      env.NEWSLETTER_AWS_SECRET_ACCESS_KEY &&
      env.NEWSLETTER_FROM_EMAIL,
  );
}

function requiredTokenSecret(env: NewsletterEnv): string {
  return String(env.NEWSLETTER_TOKEN_SECRET || '').trim();
}

function rssText(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return decodeXml(
    String(match?.[1] || '')
      .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1')
      .trim(),
  );
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function randomToken(): string {
  const values = new Uint8Array(32);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');
}

async function hashToken(secret: string, token: string): Promise<string> {
  return sha256Hex(`${secret}:${token}`);
}

async function awsSigningKey(secret: string, date: string, region: string): Promise<ArrayBuffer> {
  const dateKey = await hmac(`AWS4${secret}`, date);
  const regionKey = await hmac(dateKey, region);
  const serviceKey = await hmac(regionKey, 'ses');
  return hmac(serviceKey, 'aws4_request');
}

async function hmac(key: string | ArrayBuffer, value: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? textEncoder.encode(key) : key,
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(value));
}

async function hmacHex(key: string | ArrayBuffer, value: string): Promise<string> {
  return toHex(await hmac(key, value));
}

async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', textEncoder.encode(value)));
}

function toHex(value: ArrayBuffer): string {
  return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function awsTimestamp(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function normalizeHeader(value: string): string {
  return String(value).trim().replace(/\s+/g, ' ');
}

function constantTimeEqual(left: string, right: string): boolean {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character] || character;
  });
}

function newsletterPage(message: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Corca 뉴스레터</title><main><p>${escapeHtml(message)}</p><p><a href="/blog">블로그로 돌아가기</a></p></main></html>`,
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      status,
    },
  );
}

function json(
  payload: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
    status,
  });
}

function errorMessage(error: unknown): string {
  return String(error instanceof Error ? error.message : error).slice(0, 1_000);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

class NewsletterSetupError extends Error {}
