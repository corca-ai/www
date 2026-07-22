interface EmailAddress {
  email: string;
  name?: string;
}

interface EmailMessageBuilder {
  to?: string | EmailAddress | (string | EmailAddress)[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
}

interface SendEmail {
  send(message: EmailMessageBuilder): Promise<{ messageId: string }>;
}

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface AxConsultationEnv {
  AX_CONSULTATION_DELIVERY_ENABLED?: string;
  AX_CONSULTATION_EMAIL?: SendEmail;
  AX_CONSULTATION_FROM?: string;
  AX_CONSULTATION_RATE_LIMITER?: RateLimiter;
  TURNSTILE_SECRET_KEY?: string;
}

const locales = ['ko', 'en', 'ja', 'zh'] as const;
type Locale = (typeof locales)[number];
type FieldErrors = Record<string, string>;

interface ValidConsultation {
  email: string;
  locale: Locale;
  message: string;
  name: string;
  phone: string;
  utm: string;
}

type ValidationResult =
  | { ok: true; value: ValidConsultation }
  | {
      code: 'FORM_EXPIRED' | 'FORM_SUBMITTED_TOO_QUICKLY' | 'VALIDATION_ERROR';
      fields?: FieldErrors;
      ok: false;
    };

const maxBodyBytes = 32 * 1024;
const maxFormAgeMs = 24 * 60 * 60 * 1000;
const minFormTimeMs = 2_000;
const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

export async function handleAxConsultation(
  request: Request,
  env: AxConsultationEnv,
): Promise<Response> {
  if (request.method.toUpperCase() !== 'POST') {
    return jsonError(405, 'METHOD_NOT_ALLOWED', undefined, { Allow: 'POST' });
  }

  const contentType = request.headers.get('Content-Type')?.toLowerCase() || '';
  if (!contentType.includes('application/json')) {
    return jsonError(415, 'UNSUPPORTED_MEDIA_TYPE');
  }

  const body = await readLimitedBody(request);
  if (body.status === 'too_large') return jsonError(413, 'PAYLOAD_TOO_LARGE');
  if (body.status === 'unreadable') return jsonError(400, 'INVALID_JSON');

  let payload: unknown;
  try {
    payload = JSON.parse(body.text);
  } catch {
    return jsonError(400, 'INVALID_JSON');
  }
  if (!isRecord(payload)) return jsonError(400, 'INVALID_JSON');

  if (stringValue(payload.website)) return jsonSuccess();

  const rateLimiter = env.AX_CONSULTATION_RATE_LIMITER;
  if (rateLimiter) {
    const clientKey = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await rateLimiter.limit({ key: clientKey });
    if (!rateLimit.success) return jsonError(429, 'RATE_LIMITED');
  }

  const validation = validateConsultation(payload, Date.now());
  if (!validation.ok) {
    return jsonError(
      validation.code === 'FORM_SUBMITTED_TOO_QUICKLY' ? 429 : 422,
      validation.code,
      validation.fields,
    );
  }

  const turnstileToken = stringValue(payload.turnstile_token ?? payload['cf-turnstile-response']);
  const turnstile = await verifyTurnstile(
    turnstileToken,
    String(env.TURNSTILE_SECRET_KEY || '').trim(),
    request.headers.get('CF-Connecting-IP') || '',
  );
  if (turnstile === 'not_configured') return jsonError(503, 'BOT_CHECK_NOT_CONFIGURED');
  if (turnstile === 'failed') return jsonError(422, 'BOT_CHECK_FAILED');
  if (turnstile === 'unavailable') return jsonError(503, 'BOT_CHECK_UNAVAILABLE');

  const delivery = await sendConsultationEmail(validation.value, env);
  if (delivery === 'not_configured') return jsonError(503, 'DELIVERY_NOT_CONFIGURED');
  if (delivery === 'failed') return jsonError(502, 'DELIVERY_FAILED');

  return jsonSuccess();
}

function validateConsultation(payload: Record<string, unknown>, now: number): ValidationResult {
  const name = stringValue(payload.name);
  const email = stringValue(payload.email).toLowerCase();
  const phone = stringValue(payload.phone);
  const message = stringValue(payload.message);
  const locale = stringValue(payload.locale);
  const startedAt = parseStartedAt(payload.started_at);
  const utm = normalizeUtm(payload.utm);
  const fields: FieldErrors = {};

  if (!name || name.length > 80) fields.name = 'INVALID_NAME';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    fields.email = 'INVALID_EMAIL';
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (
    phone.length > 30 ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15 ||
    !/^[+\d\s().-]+$/u.test(phone)
  ) {
    fields.phone = 'INVALID_PHONE';
  }
  if (message.length > 2_000) fields.message = 'MESSAGE_TOO_LONG';
  if (payload.privacy_consent !== true) fields.privacy_consent = 'PRIVACY_CONSENT_REQUIRED';
  if (!isLocale(locale)) fields.locale = 'INVALID_LOCALE';
  if (startedAt === null) fields.started_at = 'INVALID_STARTED_AT';
  if (!utm.valid) fields.utm = 'INVALID_UTM';

  if (Object.keys(fields).length > 0) {
    return { code: 'VALIDATION_ERROR', fields, ok: false };
  }
  if (startedAt === null || startedAt > now + 60_000 || now - startedAt > maxFormAgeMs) {
    return { code: 'FORM_EXPIRED', ok: false };
  }
  if (now - startedAt < minFormTimeMs) {
    return { code: 'FORM_SUBMITTED_TOO_QUICKLY', ok: false };
  }

  return {
    ok: true,
    value: {
      email,
      locale: locale as Locale,
      message,
      name,
      phone,
      utm: utm.value,
    },
  };
}

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

function parseStartedAt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1_000 : value;
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  if (/^\d+$/.test(text)) {
    const numericValue = Number(text);
    if (!Number.isFinite(numericValue)) return null;
    return numericValue < 1_000_000_000_000 ? numericValue * 1_000 : numericValue;
  }
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeUtm(value: unknown): { valid: boolean; value: string } {
  if (value === undefined || value === null || value === '') {
    return { valid: true, value: '' };
  }
  if (typeof value === 'string') {
    const text = value.trim();
    return { valid: text.length <= 1_000, value: text.slice(0, 1_000) };
  }
  if (!isRecord(value)) return { valid: false, value: '' };

  const entries: string[] = [];
  for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
    const entry = value[key];
    if (entry === undefined || entry === null || entry === '') continue;
    if (typeof entry !== 'string' || entry.length > 200) return { valid: false, value: '' };
    entries.push(`${key}=${entry.trim()}`);
  }
  const text = entries.join(' · ');
  return { valid: text.length <= 1_000, value: text.slice(0, 1_000) };
}

async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string,
): Promise<'failed' | 'not_configured' | 'unavailable' | 'verified'> {
  if (!secret) return 'not_configured';
  if (!token) return 'failed';

  const form = new URLSearchParams({ response: token, secret });
  if (remoteIp) form.set('remoteip', remoteIp);
  try {
    const response = await fetchWithTimeout(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        body: form,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
      },
      8_000,
    );
    if (!response.ok) return 'unavailable';
    const result: unknown = await response.json();
    return isRecord(result) && result.success === true ? 'verified' : 'failed';
  } catch {
    return 'unavailable';
  }
}

async function sendConsultationEmail(
  input: ValidConsultation,
  env: AxConsultationEnv,
): Promise<'failed' | 'not_configured' | 'sent'> {
  if (env.AX_CONSULTATION_DELIVERY_ENABLED !== 'true') return 'not_configured';
  const binding = env.AX_CONSULTATION_EMAIL;
  const sender = String(env.AX_CONSULTATION_FROM || '').trim();
  if (!binding || !sender) return 'not_configured';

  const submittedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date());
  const text = [
    'Corca AX 상담 요청',
    '',
    `이름: ${input.name}`,
    `이메일: ${input.email}`,
    `연락처: ${input.phone}`,
    `페이지 언어: ${input.locale}`,
    `문의 내용: ${input.message || '입력하지 않음'}`,
    `유입 정보: ${input.utm || '없음'}`,
    `접수 시각: ${submittedAt}`,
  ].join('\n');
  const rows = [
    ['이름', escapeHtml(input.name)],
    ['이메일', escapeHtml(input.email)],
    ['연락처', escapeHtml(input.phone)],
    ['페이지 언어', escapeHtml(input.locale)],
    ['문의 내용', escapeHtml(input.message || '입력하지 않음').replace(/\n/g, '<br />')],
    ['유입 정보', escapeHtml(input.utm || '없음')],
    ['접수 시각', escapeHtml(submittedAt)],
  ]
    .map(
      ([heading, value]) =>
        `<tr><th style="width:120px;text-align:left;vertical-align:top;padding:12px;border-top:1px solid #dce4ee">${heading}</th><td style="padding:12px;border-top:1px solid #dce4ee">${value}</td></tr>`,
    )
    .join('');
  const html = `<div style="font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#10213d;line-height:1.65;max-width:680px;margin:0 auto;padding:32px"><p style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#056eb9;margin:0 0 12px">CORCA AX</p><h1 style="font-size:28px;line-height:1.25;margin:0 0 28px">새 상담 요청이 접수되었습니다.</h1><table style="width:100%;border-collapse:collapse;font-size:15px"><tbody>${rows}</tbody></table></div>`;

  try {
    await binding.send({
      from: sender,
      subject: '[Corca AX 상담 요청] 새 상담 요청',
      html,
      text,
      replyTo: input.email,
    });
    return 'sent';
  } catch {
    return 'failed';
  }
}

async function readLimitedBody(
  request: Request,
): Promise<{ status: 'ok'; text: string } | { status: 'too_large' } | { status: 'unreadable' }> {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes)
    return { status: 'too_large' };
  if (!request.body) return { status: 'ok', text: '' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        return { status: 'too_large' };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { status: 'ok', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { status: 'unreadable' };
  } finally {
    reader.releaseLock();
  }
}

function jsonSuccess(): Response {
  return new Response(JSON.stringify({ ok: true }), { headers: noStoreHeaders, status: 200 });
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function jsonError(
  status: number,
  code: string,
  fields?: FieldErrors,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({
      error: { code, ...(fields && Object.keys(fields).length ? { fields } : {}) },
      ok: false,
    }),
    { headers: { ...noStoreHeaders, ...extraHeaders }, status },
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '"': '&quot;',
      '&': '&amp;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;',
    };
    return entities[character] || character;
  });
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
