import {
  type AxLeadLocale,
  type AxLeadUtmParameters,
  axLeadRecipient,
  axLeadSender,
  escapeHtml,
  formatAxLeadTimestamp,
  formatKoreaDateTime,
  isAxLeadLocale,
  isRecord,
  jsonError,
  jsonSuccess,
  normalizeAxAttribution,
  normalizeAxPageContext,
  normalizeAxUtm,
  readLimitedBody,
  renderAxEmailRows,
  renderAxEmailShell,
  sourceMedium,
  stringValue,
  type ValidAxAttribution,
  type ValidAxPageContext,
} from './axLeadShared.ts';

type AxLaunchTalkRateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

export type AxLaunchTalkEnv = Pick<Env, 'AX_EMAIL'> & {
  AX_LAUNCH_TALK_RATE_LIMITER: AxLaunchTalkRateLimiter;
};

type WidgetState = 'compact' | 'expanded' | 'mobile-mini';

interface ValidLaunchTalkLead {
  attribution: ValidAxAttribution;
  locale: AxLeadLocale;
  pageContext: ValidAxPageContext;
  utm: string;
  utmParameters: AxLeadUtmParameters;
  widgetState: WidgetState;
}

const maxBodyBytes = 8 * 1024;
const allowedKeys = new Set([
  'lead_type',
  'widget_state',
  'page_id',
  'page_path',
  'base_path',
  'locale',
  'content_type',
  'attribution',
  'utm',
]);

export async function handleAxLaunchTalkLead(
  request: Request,
  env: AxLaunchTalkEnv,
): Promise<Response> {
  if (request.method.toUpperCase() !== 'POST') {
    return jsonError(405, 'METHOD_NOT_ALLOWED', undefined, { Allow: 'POST' });
  }
  if (!isAllowedLaunchTalkRequest(request)) return jsonError(403, 'FORBIDDEN_ORIGIN');

  const contentType = request.headers.get('Content-Type')?.toLowerCase() || '';
  if (!contentType.includes('application/json')) {
    return jsonError(415, 'UNSUPPORTED_MEDIA_TYPE');
  }

  const body = await readLimitedBody(request, maxBodyBytes);
  if (body.status === 'too_large') return jsonError(413, 'PAYLOAD_TOO_LARGE');
  if (body.status === 'unreadable') return jsonError(400, 'INVALID_JSON');

  let payload: unknown;
  try {
    payload = JSON.parse(body.text);
  } catch {
    return jsonError(400, 'INVALID_JSON');
  }
  if (!isRecord(payload)) return jsonError(400, 'INVALID_JSON');

  const lead = validateLaunchTalkLead(payload);
  if (!lead) return jsonError(422, 'VALIDATION_ERROR');

  const rateLimitKey = await createRateLimitKey(request);
  const rateLimit = await env.AX_LAUNCH_TALK_RATE_LIMITER.limit({ key: rateLimitKey });
  if (!rateLimit.success) return jsonError(429, 'RATE_LIMITED', undefined, { 'Retry-After': '60' });

  const delivery = await sendLaunchTalkEmail(lead, env);
  if (delivery === 'failed') return jsonError(502, 'DELIVERY_FAILED');
  return jsonSuccess();
}

function validateLaunchTalkLead(payload: Record<string, unknown>): ValidLaunchTalkLead | null {
  if (Object.keys(payload).some((key) => !allowedKeys.has(key))) return null;
  if (payload.lead_type !== 'ax-launch-talk') return null;

  const widgetState = stringValue(payload.widget_state);
  if (!['compact', 'expanded', 'mobile-mini'].includes(widgetState)) return null;

  const locale = stringValue(payload.locale);
  if (!isAxLeadLocale(locale)) return null;

  const pageContext = normalizeAxPageContext(payload);
  if (!pageContext.valid || !pageContext.value) return null;
  if (!isConsistentAxContext(pageContext.value, locale)) return null;

  if (!isRecord(payload.attribution) || !isRecord(payload.utm)) return null;
  const attribution = normalizeAxAttribution(payload.attribution);
  const utm = normalizeAxUtm(payload.utm);
  if (!attribution.valid || !utm.valid) return null;

  return {
    attribution: attribution.value,
    locale,
    pageContext: pageContext.value,
    utm: utm.value,
    utmParameters: utm.parameters,
    widgetState: widgetState as WidgetState,
  };
}

function isConsistentAxContext(context: ValidAxPageContext, locale: AxLeadLocale) {
  if (!(context.basePath === '/ax' || context.basePath.startsWith('/ax/'))) return false;
  const expectedPagePath = locale === 'ko' ? context.basePath : `/${locale}${context.basePath}`;
  return context.pagePath === expectedPagePath;
}

function isAllowedLaunchTalkRequest(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (!origin || fetchSite !== 'same-origin') return false;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }
  if (originUrl.origin !== url.origin || !isAllowedHost(url.hostname)) return false;
  if (originUrl.protocol === 'https:' || isLocalHost(originUrl.hostname)) return true;
  return (
    originUrl.protocol === 'http:' &&
    request.headers.has('MF-Original-Hostname') &&
    isLocalDevClientIp(request.headers.get('CF-Connecting-IP') || '')
  );
}

function isAllowedHost(hostname: string) {
  return (
    hostname === 'corca.ai' ||
    hostname === 'www.corca.ai' ||
    hostname.endsWith('.workers.dev') ||
    hostname.endsWith('.pages.dev') ||
    isLocalHost(hostname)
  );
}

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isLocalDevClientIp(value: string) {
  return (
    value === '127.0.0.1' ||
    value === '::1' ||
    /^10\./u.test(value) ||
    /^192\.168\./u.test(value) ||
    /^172\.(1[6-9]|2\d|3[01])\./u.test(value) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./u.test(value)
  );
}

async function createRateLimitKey(request: Request) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = (request.headers.get('User-Agent') || 'unknown').slice(0, 256).toLowerCase();
  const bytes = new TextEncoder().encode(`${address}\n${userAgent}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sendLaunchTalkEmail(
  lead: ValidLaunchTalkLead,
  env: Pick<Env, 'AX_EMAIL'>,
): Promise<'failed' | 'sent'> {
  const submittedDate = new Date();
  const submittedAt = formatKoreaDateTime(submittedDate);
  const leadTimestamp = formatAxLeadTimestamp(submittedDate);
  const sourceMediumValue = sourceMedium(lead);
  const previousSite = lead.attribution.initialReferrerHost || '확인되지 않음';
  const text = [
    'Corca AX Launch Talk 리드',
    '',
    '리드 유형: AX Launch Talk',
    '상태: Google Calendar 예약 페이지 이동',
    `콘텐츠 ID: ${lead.pageContext.pageId}`,
    `콘텐츠 유형: ${lead.pageContext.contentType}`,
    `클릭 페이지: ${lead.pageContext.pagePath}`,
    `기준 경로: ${lead.pageContext.basePath}`,
    `페이지 언어: ${lead.locale}`,
    `팝업 상태: ${lead.widgetState}`,
    `유입 경로: ${sourceMediumValue}`,
    `이전 사이트: ${previousSite}`,
    ...(lead.attribution.landingPath ? [`최초 방문 페이지: ${lead.attribution.landingPath}`] : []),
    ...(lead.utm ? [`UTM: ${lead.utm}`] : []),
    `접수 시각: ${submittedAt}`,
    '',
    '이 알림은 예약 완료가 아니라 Google Calendar 예약 페이지로 이동한 클릭을 기록합니다.',
  ].join('\n');
  const rows = renderAxEmailRows([
    ['리드 유형', 'AX Launch Talk'],
    ['상태', 'Google Calendar 예약 페이지 이동'],
    ['콘텐츠 ID', escapeHtml(lead.pageContext.pageId)],
    ['콘텐츠 유형', escapeHtml(lead.pageContext.contentType)],
    ['클릭 페이지', escapeHtml(lead.pageContext.pagePath)],
    ['기준 경로', escapeHtml(lead.pageContext.basePath)],
    ['페이지 언어', escapeHtml(lead.locale)],
    ['팝업 상태', escapeHtml(lead.widgetState)],
    ['유입 경로', escapeHtml(sourceMediumValue)],
    ['이전 사이트', escapeHtml(previousSite)],
    ...(lead.attribution.landingPath
      ? [['최초 방문 페이지', escapeHtml(lead.attribution.landingPath)]]
      : []),
    ...(lead.utm ? [['UTM', escapeHtml(lead.utm)]] : []),
    ['접수 시각', escapeHtml(submittedAt)],
  ]);
  const html = `${renderAxEmailShell('새 AX Launch Talk 리드가 발생했습니다.', rows)}<p style="font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#667085;font-size:13px;line-height:1.6;max-width:680px;margin:0 auto;padding:0 32px 32px">이 알림은 예약 완료가 아니라 Google Calendar 예약 페이지로 이동한 클릭을 기록합니다.</p>`;

  try {
    await env.AX_EMAIL.send({
      from: { email: axLeadSender, name: 'Corca AX' },
      html,
      subject: `[Corca AX Launch Talk #${leadTimestamp}] 예약 페이지 이동`,
      text,
      to: axLeadRecipient,
    });
    return 'sent';
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'ax_launch_talk_email_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        lead_timestamp: leadTimestamp,
      }),
    );
    return 'failed';
  }
}
