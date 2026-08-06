const axLeadLocales = ['ko', 'en', 'ja', 'zh'] as const;
export type AxLeadLocale = (typeof axLeadLocales)[number];
export type AxLeadFieldErrors = Record<string, string>;
export type AxLeadUtmParameters = Partial<
  Record<'source' | 'medium' | 'campaign' | 'term' | 'content', string>
>;

export interface ValidAxAttribution {
  initialReferrerHost: string;
  landingPath: string;
}

export interface ValidAxPageContext {
  basePath: string;
  contentType: string;
  pageId: string;
  pagePath: string;
}

export const axLeadRecipient = 'contact+ax@corca.ai';
export const axLeadSender = 'ax@corca.ai';

const axLeadNoStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

export function isAxLeadLocale(value: string): value is AxLeadLocale {
  return (axLeadLocales as readonly string[]).includes(value);
}

export function normalizeAxUtm(value: unknown): {
  parameters: AxLeadUtmParameters;
  valid: boolean;
  value: string;
} {
  if (value === undefined || value === null || value === '') {
    return { parameters: {}, valid: true, value: '' };
  }
  if (typeof value === 'string') {
    const text = value.trim();
    return { parameters: {}, valid: text.length <= 1_000, value: text.slice(0, 1_000) };
  }
  if (!isRecord(value)) return { parameters: {}, valid: false, value: '' };

  const entries: string[] = [];
  const parameters: AxLeadUtmParameters = {};
  for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
    const entry = value[key];
    if (entry === undefined || entry === null || entry === '') continue;
    if (typeof entry !== 'string' || entry.length > 200) {
      return { parameters: {}, valid: false, value: '' };
    }
    const normalized = entry.trim();
    if (!normalized) continue;
    parameters[key as keyof AxLeadUtmParameters] = normalized;
    entries.push(`${key}=${normalized}`);
  }
  const text = entries.join(' · ');
  return {
    parameters,
    valid: text.length <= 1_000,
    value: text.slice(0, 1_000),
  };
}

export function normalizeAxAttribution(value: unknown): {
  valid: boolean;
  value: ValidAxAttribution;
} {
  const empty = { initialReferrerHost: '', landingPath: '' };
  if (value === undefined || value === null || value === '') {
    return { valid: true, value: empty };
  }
  if (!isRecord(value)) return { valid: false, value: empty };

  const initialReferrerHost = stringValue(value.initial_referrer_host).toLowerCase();
  const landingPath = stringValue(value.landing_path);
  const validHost =
    !initialReferrerHost ||
    (initialReferrerHost.length <= 253 &&
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(
        initialReferrerHost,
      ));
  const validPath = !landingPath || isSafeAxPath(landingPath);

  return {
    valid: validHost && validPath,
    value: validHost && validPath ? { initialReferrerHost, landingPath } : empty,
  };
}

export function normalizeAxPageContext(value: Record<string, unknown>): {
  valid: boolean;
  value?: ValidAxPageContext;
} {
  const keys = ['page_id', 'page_path', 'base_path', 'content_type'] as const;
  if (keys.every((key) => value[key] === undefined)) return { valid: true };

  const pageId = stringValue(value.page_id);
  const pagePath = stringValue(value.page_path);
  const basePath = stringValue(value.base_path);
  const contentType = stringValue(value.content_type);
  if (
    !isAxToken(pageId) ||
    !isAxToken(contentType) ||
    !isSafeAxPath(pagePath) ||
    !isSafeAxPath(basePath)
  ) {
    return { valid: false };
  }

  return { valid: true, value: { basePath, contentType, pageId, pagePath } };
}

export function sourceMedium(input: {
  attribution: ValidAxAttribution;
  utmParameters: AxLeadUtmParameters;
}) {
  if (Object.keys(input.utmParameters).length > 0) {
    return `${input.utmParameters.source || '(not set)'} / ${
      input.utmParameters.medium || '(not set)'
    }`;
  }

  const host = input.attribution.initialReferrerHost;
  if (!host) return '(direct) / (none)';
  if (/^(?:www\.)?google\.(?:[a-z]{2,3}|(?:co|com)\.[a-z]{2})$/u.test(host)) {
    return 'google / organic';
  }
  return `${host.replace(/^www\./u, '')} / referral`;
}

export function formatKoreaDateTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

export function formatAxLeadTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).formatToParts(date);
  return ['year', 'month', 'day', 'hour', 'minute', 'second']
    .map((type) => parts.find((part) => part.type === type)?.value ?? '')
    .join('');
}

export function renderAxEmailRows(rows: string[][]) {
  return rows
    .map(
      ([heading, value]) =>
        `<tr><th style="width:120px;text-align:left;vertical-align:top;padding:12px;border-top:1px solid #dce4ee">${heading}</th><td style="padding:12px;border-top:1px solid #dce4ee">${value}</td></tr>`,
    )
    .join('');
}

export function renderAxEmailShell(heading: string, rows: string) {
  return `<div style="font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#10213d;line-height:1.65;max-width:680px;margin:0 auto;padding:32px"><p style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#056eb9;margin:0 0 12px">CORCA AX</p><h1 style="font-size:28px;line-height:1.25;margin:0 0 28px">${heading}</h1><table style="width:100%;border-collapse:collapse;font-size:15px"><tbody>${rows}</tbody></table></div>`;
}

export async function readLimitedBody(
  request: Request,
  maxBodyBytes: number,
): Promise<{ status: 'ok'; text: string } | { status: 'too_large' } | { status: 'unreadable' }> {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    return { status: 'too_large' };
  }
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

export function jsonSuccess(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    headers: axLeadNoStoreHeaders,
    status: 200,
  });
}

export function jsonError(
  status: number,
  code: string,
  fields?: AxLeadFieldErrors,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({
      error: { code, ...(fields && Object.keys(fields).length ? { fields } : {}) },
      ok: false,
    }),
    { headers: { ...axLeadNoStoreHeaders, ...extraHeaders }, status },
  );
}

export function escapeHtml(value: string): string {
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

export function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isAxToken(value: string) {
  return value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value);
}

function isSafeAxPath(value: string) {
  return (
    value.length <= 512 &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('?') &&
    !value.includes('#')
  );
}
