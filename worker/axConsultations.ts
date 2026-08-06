import { type AxTopicId, axTopicIds } from '../src/components/pages/ax/contract.ts';
import {
  type AxLeadFieldErrors,
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

export type AxConsultationEnv = Pick<Env, 'AX_EMAIL'>;

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
interface ValidConsultation {
  attribution: ValidAxAttribution;
  interests: string[];
  email: string;
  locale: AxLeadLocale;
  name: string;
  otherInterest: string;
  pageContext?: ValidAxPageContext;
  reason: string;
  topic: AxTopicId | '';
  utm: string;
  utmParameters: AxLeadUtmParameters;
}

type ValidationResult =
  | { ok: true; value: ValidConsultation }
  | {
      code: 'FORM_EXPIRED' | 'FORM_SUBMITTED_TOO_QUICKLY' | 'VALIDATION_ERROR';
      fields?: AxLeadFieldErrors;
      ok: false;
    };

const maxBodyBytes = 32 * 1024;
const maxFormAgeMs = 24 * 60 * 60 * 1000;
const minFormTimeMs = 2_000;

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
  const utm = normalizeAxUtm(payload.utm);
  const attribution = normalizeAxAttribution(payload.attribution);
  const pageContext = normalizeAxPageContext(payload);
  const fields: AxLeadFieldErrors = {};

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
  if (!isAxLeadLocale(locale)) fields.locale = 'INVALID_LOCALE';
  if (startedAt === null) fields.started_at = 'INVALID_STARTED_AT';
  if (!utm.valid) fields.utm = 'INVALID_UTM';
  if (!attribution.valid) fields.attribution = 'INVALID_ATTRIBUTION';
  if (!pageContext.valid) fields.page_context = 'INVALID_PAGE_CONTEXT';

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
      attribution: attribution.value,
      email,
      interests,
      locale: locale as AxLeadLocale,
      name,
      otherInterest,
      ...(pageContext.value ? { pageContext: pageContext.value } : {}),
      reason: isV2Form ? reason : legacyMessage,
      topic: topic as AxTopicId | '',
      utm: utm.value,
      utmParameters: utm.parameters,
    },
  };
}

function isConsultationTopic(value: string): value is AxTopicId {
  return (axTopicIds as readonly string[]).includes(value);
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

async function sendConsultationEmail(
  input: ValidConsultation,
  env: AxConsultationEnv,
): Promise<'failed' | 'sent'> {
  const submittedDate = new Date();
  const submittedAt = formatKoreaDateTime(submittedDate);
  const topicLabel = input.topic ? topicLabels[input.topic] : '';
  const interestLabels = input.interests.map(
    (interest) => consultingInterestLabels[interest] ?? interest,
  );
  const interestSummary = interestLabels.join(', ');
  const consultationTimestamp = formatAxLeadTimestamp(submittedDate);
  const sourceMediumValue = sourceMedium(input);
  const previousSite = input.attribution.initialReferrerHost || '확인되지 않음';
  const pageContextLines = input.pageContext
    ? [
        `콘텐츠 ID: ${input.pageContext.pageId}`,
        `콘텐츠 유형: ${input.pageContext.contentType}`,
        `제출 페이지: ${input.pageContext.pagePath}`,
        `기준 경로: ${input.pageContext.basePath}`,
      ]
    : [];
  const text = [
    'Corca AX 상담 요청',
    '',
    `이름: ${input.name}`,
    `이메일: ${input.email}`,
    ...(interestSummary ? [`관심 컨설팅: ${interestSummary}`] : []),
    ...(input.otherInterest ? [`기타 관심 분야: ${input.otherInterest}`] : []),
    ...(input.topic ? [`문의 유형: ${topicLabel} (${input.topic})`] : []),
    ...pageContextLines,
    `페이지 언어: ${input.locale}`,
    `${interestSummary ? '선택 이유' : '문의 내용'}: ${input.reason || '입력하지 않음'}`,
    `유입 경로: ${sourceMediumValue}`,
    `이전 사이트: ${previousSite}`,
    ...(input.attribution.landingPath
      ? [`최초 방문 페이지: ${input.attribution.landingPath}`]
      : []),
    ...(input.utm ? [`UTM: ${input.utm}`] : []),
    `접수 시각: ${submittedAt}`,
  ].join('\n');
  const rows = [
    ['이름', escapeHtml(input.name)],
    ['이메일', escapeHtml(input.email)],
    ...(interestSummary ? [['관심 컨설팅', escapeHtml(interestSummary)]] : []),
    ...(input.otherInterest ? [['기타 관심 분야', escapeHtml(input.otherInterest)]] : []),
    ...(input.topic ? [['문의 유형', escapeHtml(`${topicLabel} (${input.topic})`)]] : []),
    ...(input.pageContext
      ? [
          ['콘텐츠 ID', escapeHtml(input.pageContext.pageId)],
          ['콘텐츠 유형', escapeHtml(input.pageContext.contentType)],
          ['제출 페이지', escapeHtml(input.pageContext.pagePath)],
          ['기준 경로', escapeHtml(input.pageContext.basePath)],
        ]
      : []),
    ['페이지 언어', escapeHtml(input.locale)],
    [
      interestSummary ? '선택 이유' : '문의 내용',
      escapeHtml(input.reason || '입력하지 않음').replace(/\n/g, '<br />'),
    ],
    ['유입 경로', escapeHtml(sourceMediumValue)],
    ['이전 사이트', escapeHtml(previousSite)],
    ...(input.attribution.landingPath
      ? [['최초 방문 페이지', escapeHtml(input.attribution.landingPath)]]
      : []),
    ...(input.utm ? [['UTM', escapeHtml(input.utm)]] : []),
    ['접수 시각', escapeHtml(submittedAt)],
  ];
  const html = renderAxEmailShell('새 상담 요청이 접수되었습니다.', renderAxEmailRows(rows));

  try {
    await env.AX_EMAIL.send({
      from: { email: axLeadSender, name: 'Corca AX' },
      html,
      ...(input.email ? { replyTo: input.email } : {}),
      subject: `[Corca AX 상담 요청 #${consultationTimestamp}] ${interestSummary || topicLabel || '새 상담 요청'}`,
      text,
      to: axLeadRecipient,
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

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return null;
  return value.map((item) => item.trim()).filter(Boolean);
}
