import assert from 'node:assert/strict';
import test from 'node:test';
import { type AxLaunchTalkEnv, handleAxLaunchTalkLead } from '../worker/axLaunchTalkLeads.ts';

function validPayload(locale: 'ko' | 'en' | 'ja' | 'zh' = 'ko') {
  const prefix = locale === 'ko' ? '' : `/${locale}`;
  return {
    lead_type: 'ax-launch-talk',
    widget_state: 'expanded',
    page_id: 'ax',
    page_path: `${prefix}/ax`,
    base_path: '/ax',
    locale,
    content_type: 'ax-solution',
    attribution: {
      initial_referrer_host: 'www.google.com',
      landing_path: `${prefix}/ax`,
    },
    utm: {},
  };
}

function launchRequest(
  payload: Record<string, unknown>,
  url = 'https://www.corca.ai/api/ax/launch-talk-leads',
) {
  const origin = new URL(url).origin;
  return new Request(url, {
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
      origin,
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Corca launch test',
      'cf-connecting-ip': '203.0.113.8',
    },
    method: 'POST',
  });
}

function capturingEnv(
  messages: unknown[],
  options: { deliveryFails?: boolean; rateLimitAfter?: number } = {},
): AxLaunchTalkEnv {
  let calls = 0;
  return {
    AX_EMAIL: {
      async send(message: unknown) {
        if (options.deliveryFails) throw new Error('simulated email failure');
        messages.push(message);
        return { messageId: 'local-launch-talk-test' };
      },
    },
    AX_LAUNCH_TALK_RATE_LIMITER: {
      async limit() {
        calls += 1;
        return { success: calls <= (options.rateLimitAfter ?? Number.POSITIVE_INFINITY) };
      },
    },
  } as unknown as AxLaunchTalkEnv;
}

function email(message: unknown) {
  assert.ok(message && typeof message === 'object');
  return message as {
    from?: { email?: string };
    html?: string;
    replyTo?: string;
    subject?: string;
    text?: string;
    to?: string;
  };
}

for (const locale of ['ko', 'en', 'ja', 'zh'] as const) {
  test(`sends one non-PII Launch Talk email for ${locale}`, async () => {
    const messages: unknown[] = [];
    const response = await handleAxLaunchTalkLead(
      launchRequest(validPayload(locale)),
      capturingEnv(messages),
    );

    assert.equal(response.status, 200);
    assert.equal(messages.length, 1);
    const message = email(messages[0]);
    assert.equal(message.from?.email, 'ax@corca.ai');
    assert.equal(message.to, 'contact+ax@corca.ai');
    assert.equal(message.replyTo, undefined);
    assert.match(message.subject ?? '', /^\[Corca AX Launch Talk #\d{14}\] 예약 페이지 이동$/u);
    assert.match(message.text ?? '', /리드 유형: AX Launch Talk/u);
    assert.match(message.text ?? '', /상태: Google Calendar 예약 페이지 이동/u);
    assert.match(message.text ?? '', new RegExp(`페이지 언어: ${locale}`, 'u'));
    assert.match(message.text ?? '', /유입 경로: google \/ organic/u);
    assert.match(message.html ?? '', /새 AX Launch Talk 리드가 발생했습니다/u);
    assert.doesNotMatch(message.text ?? '', /이름:|이메일:|선택 이유:/u);
  });
}

test('sends one email for every one of the first six valid clicks and blocks the seventh', async () => {
  const messages: unknown[] = [];
  const env = capturingEnv(messages, { rateLimitAfter: 6 });
  for (let index = 0; index < 6; index += 1) {
    const response = await handleAxLaunchTalkLead(launchRequest(validPayload()), env);
    assert.equal(response.status, 200);
  }
  const blocked = await handleAxLaunchTalkLead(launchRequest(validPayload()), env);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('retry-after'), '60');
  assert.equal(messages.length, 6);
});

for (const [name, mutate] of [
  ['wrong lead type', (payload: Record<string, unknown>) => (payload.lead_type = 'consultation')],
  ['unknown widget state', (payload: Record<string, unknown>) => (payload.widget_state = 'hidden')],
  ['query-bearing path', (payload: Record<string, unknown>) => (payload.page_path = '/ax?email=x')],
  ['locale and path mismatch', (payload: Record<string, unknown>) => (payload.locale = 'en')],
  ['non-AX base path', (payload: Record<string, unknown>) => (payload.base_path = '/blog/post')],
  ['PII field', (payload: Record<string, unknown>) => (payload.email = 'person@example.com')],
] as const) {
  test(`rejects ${name} without sending email`, async () => {
    const messages: unknown[] = [];
    const payload = validPayload() as Record<string, unknown>;
    mutate(payload);
    const response = await handleAxLaunchTalkLead(launchRequest(payload), capturingEnv(messages));
    assert.equal(response.status, 422);
    assert.equal(messages.length, 0);
  });
}

test('rejects cross-origin and missing browser fetch metadata', async () => {
  const messages: unknown[] = [];
  const request = launchRequest(validPayload());
  const headers = new Headers(request.headers);
  headers.set('origin', 'https://evil.example');
  const response = await handleAxLaunchTalkLead(
    new Request(request, { headers }),
    capturingEnv(messages),
  );
  assert.equal(response.status, 403);
  assert.equal(messages.length, 0);
});

test('accepts Wrangler local simulator metadata without weakening production HTTPS', async () => {
  const messages: unknown[] = [];
  const request = launchRequest(validPayload(), 'http://www.corca.ai/api/ax/launch-talk-leads');
  const headers = new Headers(request.headers);
  headers.set('cf-connecting-ip', '127.0.0.1');
  headers.set('mf-original-hostname', '127.0.0.1');
  const response = await handleAxLaunchTalkLead(
    new Request(request, { headers }),
    capturingEnv(messages),
  );
  assert.equal(response.status, 200);
  assert.equal(messages.length, 1);
});

test('returns delivery failure without leaking email details', async () => {
  const response = await handleAxLaunchTalkLead(
    launchRequest(validPayload()),
    capturingEnv([], { deliveryFails: true }),
  );
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: { code: 'DELIVERY_FAILED' }, ok: false });
});
