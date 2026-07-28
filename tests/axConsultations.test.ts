import assert from 'node:assert/strict';
import test from 'node:test';
import { type AxConsultationEnv, handleAxConsultation } from '../worker/axConsultations.ts';

function validPayload() {
  return {
    attribution: {
      initial_referrer_host: 'www.google.com',
      landing_path: '/ax',
    },
    consulting_interests: ['strategy_diagnosis'],
    cross_border_consent: false,
    email: 'lead@example.com',
    locale: 'ko',
    name: '테스트 리드',
    other_interest: '',
    reason: '유입 정보 테스트',
    started_at: Date.now() - 3_000,
    utm: {},
    website: '',
  };
}

function capturingEnv(messages: unknown[]): AxConsultationEnv {
  return {
    AX_EMAIL: {
      async send(message: unknown) {
        messages.push(message);
        return { messageId: 'local-test' };
      },
    },
  } as unknown as AxConsultationEnv;
}

async function submit(payload: Record<string, unknown>, messages: unknown[]) {
  return handleAxConsultation(
    new Request('https://www.corca.ai/api/ax/consultations', {
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }),
    capturingEnv(messages),
  );
}

function emailContent(message: unknown): { html: string; text: string } {
  assert.ok(message && typeof message === 'object');
  const candidate = message as { html?: unknown; text?: unknown };
  assert.equal(typeof candidate.html, 'string');
  assert.equal(typeof candidate.text, 'string');
  return { html: candidate.html as string, text: candidate.text as string };
}

test('renders raw Google referrer evidence without inventing a channel', async () => {
  const messages: unknown[] = [];
  const response = await submit(validPayload(), messages);

  assert.equal(response.status, 200);
  assert.equal(messages.length, 1);
  const email = emailContent(messages[0]);
  assert.match(email.text, /이전 사이트: www\.google\.com/u);
  assert.match(email.text, /최초 방문 페이지: \/ax/u);
  assert.doesNotMatch(email.text, /Organic Search|referral|direct/u);
  assert.match(email.html, />이전 사이트<\/th><td[^>]*>www\.google\.com</u);
});

test('shows UTM and browser referrer as separate evidence', async () => {
  const messages: unknown[] = [];
  const payload = {
    ...validPayload(),
    utm: {
      campaign: 'enterprise',
      medium: 'paid-social',
      source: 'linkedin-campaign',
    },
  };
  const response = await submit(payload, messages);

  assert.equal(response.status, 200);
  const email = emailContent(messages[0]);
  assert.match(
    email.text,
    /UTM: source=linkedin-campaign · medium=paid-social · campaign=enterprise/u,
  );
  assert.match(email.text, /이전 사이트: www\.google\.com/u);
});

test('renders every customer-visible form value, including conditional other interest', async () => {
  const messages: unknown[] = [];
  const payload = {
    ...validPayload(),
    consulting_interests: ['strategy_diagnosis', 'other'],
    other_interest: '해외 법인 AX 확산',
    reason: '여러 국가의 실무자가 함께 쓸 수 있는 운영 체계가 필요합니다.',
  };
  const response = await submit(payload, messages);

  assert.equal(response.status, 200);
  const email = emailContent(messages[0]);
  assert.match(email.text, /이름: 테스트 리드/u);
  assert.match(email.text, /이메일: lead@example\.com/u);
  assert.match(email.text, /관심 컨설팅: AX 과제 진단, 기타/u);
  assert.match(email.text, /기타 관심 분야: 해외 법인 AX 확산/u);
  assert.match(
    email.text,
    /선택 이유: 여러 국가의 실무자가 함께 쓸 수 있는 운영 체계가 필요합니다\./u,
  );
  assert.match(email.text, /페이지 언어: ko/u);
  assert.match(email.text, /이전 사이트: www\.google\.com/u);
  assert.match(email.text, /최초 방문 페이지: \/ax/u);
});

test('does not label a missing referrer as direct traffic', async () => {
  const messages: unknown[] = [];
  const payload = {
    ...validPayload(),
    attribution: { initial_referrer_host: '', landing_path: '/zh/ax' },
  };
  const response = await submit(payload, messages);

  assert.equal(response.status, 200);
  const email = emailContent(messages[0]);
  assert.match(email.text, /이전 사이트: 확인되지 않음/u);
  assert.doesNotMatch(email.text, /direct \/ none/u);
});

test('keeps attribution optional for older clients', async () => {
  const messages: unknown[] = [];
  const { attribution: _attribution, ...payload } = validPayload();
  const response = await submit(payload, messages);

  assert.equal(response.status, 200);
  const email = emailContent(messages[0]);
  assert.match(email.text, /이전 사이트: 확인되지 않음/u);
  assert.doesNotMatch(email.text, /최초 방문 페이지:/u);
});

for (const [name, attribution] of [
  [
    'rejects a referrer containing user information',
    { initial_referrer_host: 'user@example.com', landing_path: '/ax' },
  ],
  [
    'rejects an overlong referrer hostname',
    { initial_referrer_host: `${'a'.repeat(250)}.com`, landing_path: '/ax' },
  ],
  [
    'rejects a landing path containing a query',
    { initial_referrer_host: 'linkedin.com', landing_path: '/ax?secret=value' },
  ],
] as const) {
  test(name, async () => {
    const messages: unknown[] = [];
    const response = await submit({ ...validPayload(), attribution }, messages);
    const result = (await response.json()) as {
      error?: { fields?: Record<string, string> };
    };

    assert.equal(response.status, 422);
    assert.equal(result.error?.fields?.attribution, 'INVALID_ATTRIBUTION');
    assert.equal(messages.length, 0);
  });
}
