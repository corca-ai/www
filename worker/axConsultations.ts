import { type AxTopicId, axTopicIds } from '../src/components/pages/ax/contract';

export type AxConsultationEnv = Pick<Env, 'AX_EMAIL'>;

const locales = ['ko', 'en', 'ja', 'zh'] as const;
const topicLabels: Record<AxTopicId, string> = {
  strategy_discovery: 'AX 전략·과제 발굴',
  decision_map: '2주 의사결정 지도',
  operations_transition: '6주 운영 전환',
  organization_adoption: '조직 확산·AX Champion',
  openai_adoption: 'OpenAI 도입·활성화',
  other: '기타',
};
const consultingInterestLabels: Record<string, string> = {
  strategy_diagnosis: 'AX 과제 진단',
  champion_coaching: 'AX 챔피언 양성 코칭',
  environment_solution: 'AX 환경 구축 솔루션 도입',
  custom_ai_solution: '조직 맞춤 AI 솔루션 제작',
  enterprise_adoption: 'ChatGPT Enterprise 도입 및 활용률 증대',
  ai_native_team: 'AI 네이티브 팀 빌딩',
  ai_capability_training: 'AI 역량 향상 교육',
  other: '기타',
};
const consultingInterestIds = Object.keys(consultingInterestLabels);
type Locale = (typeof locales)[number];
type FieldErrors = Record<string, string>;

interface ValidConsultation {
  interests: string[];
  email: string;
  locale: Locale;
  name: string;
  otherInterest: string;
  reason: string;
  topic: AxTopicId | '';
  utm: string;
}

type ValidationResult =
  | { ok: true; value: ValidConsultation }
  | {
      code: 'FORM_EXPIRED' | 'FORM_SUBMITTED_TOO_QUICKLY' | 'VALIDATION_ERROR';
      fields?: FieldErrors;
      ok: false;
    };

const consultationRecipient = 'contact+ax@corca.ai';
const consultationSender = 'ax@corca.ai';
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

  const validation = validateConsultation(payload, Date.now());
  if (!validation.ok) {
    return jsonError(
      validation.code === 'FORM_SUBMITTED_TOO_QUICKLY' ? 429 : 422,
      validation.code,
      validation.fields,
    );
  }

  const delivery = await sendConsultationEmail(validation.value, env);
  if (delivery === 'failed') return jsonError(502, 'DELIVERY_FAILED');

  return jsonSuccess();
}

function validateConsultation(payload: Record<string, unknown>, now: number): ValidationResult {
  const name = stringValue(payload.name);
  const email = stringValue(payload.email).toLowerCase();
  const isV2Form =
    payload.consulting_interests !== undefined ||
    payload.other_interest !== undefined ||
    payload.reason !== undefined;
  const interests = stringArray(payload.consulting_interests) ?? [];
  const otherInterest = stringValue(payload.other_interest);
  const reason = stringValue(payload.reason);
  const legacyMessage = stringValue(payload.message);
  const topic = stringValue(payload.topic);
  const locale = stringValue(payload.locale);
  const startedAt = parseStartedAt(payload.started_at);
  const utm = normalizeUtm(payload.utm);
  const fields: FieldErrors = {};

  if (!name || name.length > 80) fields.name = 'INVALID_NAME';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    fields.email = 'INVALID_EMAIL';
  }
  if (isV2Form) {
    if (
      interests.length === 0 ||
      interests.length > consultingInterestIds.length ||
      new Set(interests).size !== interests.length ||
      interests.some((interest) => !consultingInterestIds.includes(interest))
    ) {
      fields.consulting_interests = 'INTEREST_REQUIRED';
    }
    if (interests.includes('other') && !otherInterest) {
      fields.other_interest = 'OTHER_INTEREST_REQUIRED';
    } else if (otherInterest.length > 240) {
      fields.other_interest = 'OTHER_INTEREST_TOO_LONG';
    } else if (!interests.includes('other') && otherInterest) {
      fields.other_interest = 'INVALID_INTEREST';
    }
    if (!reason) fields.reason = 'REASON_REQUIRED';
    if (reason.length > 2_000) fields.reason = 'REASON_TOO_LONG';
  } else {
    if (topic && !isConsultationTopic(topic)) fields.topic = 'INVALID_TOPIC';
    if (legacyMessage.length > 2_000) fields.message = 'MESSAGE_TOO_LONG';
  }
  if (locale === 'zh' && payload.cross_border_consent !== true) {
    fields.cross_border_consent = 'CROSS_BORDER_CONSENT_REQUIRED';
  }
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
      interests,
      locale: locale as Locale,
      name,
      otherInterest,
      reason: isV2Form ? reason : legacyMessage,
      topic: topic as AxTopicId | '',
      utm: utm.value,
    },
  };
}

function isConsultationTopic(value: string): value is AxTopicId {
  return (axTopicIds as readonly string[]).includes(value);
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

async function sendConsultationEmail(
  input: ValidConsultation,
  env: AxConsultationEnv,
): Promise<'failed' | 'sent'> {
  const submittedDate = new Date();
  const submittedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(submittedDate);
  const topicLabel = input.topic ? topicLabels[input.topic] : '';
  const interestLabels = input.interests.map(
    (interest) => consultingInterestLabels[interest] ?? interest,
  );
  const interestSummary = interestLabels.join(', ');
  const consultationTimestamp = formatConsultationTimestamp(submittedDate);
  const text = [
    'Corca AX 상담 요청',
    '',
    `이름: ${input.name}`,
    `이메일: ${input.email}`,
    ...(interestSummary ? [`관심 컨설팅: ${interestSummary}`] : []),
    ...(input.otherInterest ? [`기타 관심 분야: ${input.otherInterest}`] : []),
    ...(input.topic ? [`문의 유형: ${topicLabel} (${input.topic})`] : []),
    `페이지 언어: ${input.locale}`,
    `${interestSummary ? '선택 이유' : '문의 내용'}: ${input.reason || '입력하지 않음'}`,
    `유입 정보: ${input.utm || '없음'}`,
    `접수 시각: ${submittedAt}`,
  ].join('\n');
  const rows = [
    ['이름', escapeHtml(input.name)],
    ['이메일', escapeHtml(input.email)],
    ...(interestSummary ? [['관심 컨설팅', escapeHtml(interestSummary)]] : []),
    ...(input.otherInterest ? [['기타 관심 분야', escapeHtml(input.otherInterest)]] : []),
    ...(input.topic ? [['문의 유형', escapeHtml(`${topicLabel} (${input.topic})`)]] : []),
    ['페이지 언어', escapeHtml(input.locale)],
    [
      interestSummary ? '선택 이유' : '문의 내용',
      escapeHtml(input.reason || '입력하지 않음').replace(/\n/g, '<br />'),
    ],
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
    await env.AX_EMAIL.send({
      from: { email: consultationSender, name: 'Corca AX' },
      html,
      ...(input.email ? { replyTo: input.email } : {}),
      subject: `[Corca AX 상담 요청 #${consultationTimestamp}] ${interestSummary || topicLabel || '새 상담 요청'}`,
      text,
      to: consultationRecipient,
    });
    return 'sent';
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'ax_consultation_email_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        consultation_timestamp: consultationTimestamp,
      }),
    );
    return 'failed';
  }
}

function formatConsultationTimestamp(date: Date): string {
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
  const timestampParts = ['year', 'month', 'day', 'hour', 'minute', 'second'];

  return timestampParts
    .map((type) => parts.find((part) => part.type === type)?.value ?? '')
    .join('');
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

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return null;
  return value.map((item) => item.trim()).filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
