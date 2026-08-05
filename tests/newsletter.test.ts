import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createUnsubscribeToken,
  handleNewsletterRequest,
  isNewsletterEmail,
  parseRssItems,
  sendSesEmail,
  verifyUnsubscribeToken,
} from '../worker/newsletter.ts';

test('accepts only plausible newsletter email addresses', () => {
  assert.equal(isNewsletterEmail('reader@example.com'), true);
  assert.equal(isNewsletterEmail(' reader@example.com '), true);
  assert.equal(isNewsletterEmail('reader.example.com'), false);
  assert.equal(isNewsletterEmail(''), false);
});

test('reads the canonical RSS fields without treating malformed items as editions', () => {
  const items = parseRssItems(`<?xml version="1.0"?><rss><channel>
    <item><guid>post-1</guid><title><![CDATA[새 글 &amp; 소식]]></title><link>https://www.corca.ai/blog/post-1</link><pubDate>Tue, 05 Aug 2026 00:00:00 GMT</pubDate></item>
    <item><guid>missing-link</guid><title>무시</title></item>
  </channel></rss>`);
  assert.deepEqual(items, [
    {
      guid: 'post-1',
      publishedAt: 'Tue, 05 Aug 2026 00:00:00 GMT',
      title: '새 글 & 소식',
      url: 'https://www.corca.ai/blog/post-1',
    },
  ]);
});

test('uses a tamper-evident per-delivery unsubscribe token', async () => {
  const token = await createUnsubscribeToken('test-secret', 'subscriber-1', 'delivery-1');
  assert.deepEqual(await verifyUnsubscribeToken('test-secret', token), {
    deliveryId: 'delivery-1',
    subscriberId: 'subscriber-1',
  });
  assert.equal(await verifyUnsubscribeToken('test-secret', `${token}x`), null);
});

test('does not accept subscriptions before D1 and mail settings exist', async () => {
  const response = await handleNewsletterRequest(
    new Request('https://www.corca.ai/api/newsletter/subscribe', {
      body: JSON.stringify({ consent: true, email: 'reader@example.com', website: '' }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }),
    {},
  );
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'newsletter_not_configured' });
});

test('keeps the public form disabled until its complete delivery configuration exists', async () => {
  const response = await handleNewsletterRequest(
    new Request('https://www.corca.ai/api/newsletter/status'),
    {},
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { enabled: false });
});

test('signs the SES v2 request before sending it', async () => {
  let request: Request | undefined;
  const messageId = await sendSesEmail(
    {
      NEWSLETTER_AWS_ACCESS_KEY_ID: 'AKIDEXAMPLE',
      NEWSLETTER_AWS_REGION: 'ap-northeast-2',
      NEWSLETTER_AWS_SECRET_ACCESS_KEY: 'secret',
      NEWSLETTER_FROM_EMAIL: 'newsletter@corca.ai',
    },
    { html: '<p>안녕하세요</p>', subject: '테스트', text: '안녕하세요', to: 'reader@example.com' },
    {
      fetcher: async (input, init) => {
        request = new Request(input, init);
        return new Response(JSON.stringify({ MessageId: 'ses-message-1' }), { status: 200 });
      },
      now: new Date('2026-08-05T00:00:00.000Z'),
    },
  );
  assert.equal(messageId, 'ses-message-1');
  assert.equal(request?.url, 'https://email.ap-northeast-2.amazonaws.com/v2/email/outbound-emails');
  assert.match(
    request?.headers.get('Authorization') || '',
    /^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/20260805\/ap-northeast-2\/ses\/aws4_request,/,
  );
  assert.equal(request?.headers.get('x-amz-date'), '20260805T000000Z');
  assert.match(await request?.text(), /"FromEmailAddress":"newsletter@corca\.ai"/);
});
