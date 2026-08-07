import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildConfirmationMessage,
  buildPostMessage,
  createUnsubscribeToken,
  extractSesSuppressedEmails,
  handleNewsletterRequest,
  isNewsletterEmail,
  nextDeliveryRetryAt,
  parseRssItems,
  runNewsletterDaily,
  sendSesEmail,
  verifyUnsubscribeToken,
} from '../worker/newsletter.ts';

test('builds branded, responsive confirmation and edition email bodies from dynamic data', () => {
  const confirmation = buildConfirmationMessage(
    { NEWSLETTER_SITE_ORIGIN: 'https://preview.corca.ai' },
    'reader@example.com',
    'confirm-token',
  );
  assert.match(confirmation.html, /https:\/\/preview\.corca\.ai\/corca-logo-email\.png/);
  assert.match(confirmation.html, /뉴스레터 구독을 확인해 주세요/);
  assert.match(confirmation.html, /구독 확인하기/);
  assert.match(
    confirmation.html,
    /https:\/\/preview\.corca\.ai\/api\/newsletter\/confirm\?token=confirm-token/,
  );
  assert.match(confirmation.html, /@media only screen/);

  const edition = buildPostMessage(
    { NEWSLETTER_SITE_ORIGIN: 'https://preview.corca.ai' },
    {
      attempts: 0,
      delivery_id: 'delivery-1',
      email: 'reader@example.com',
      id: 'edition-1',
      post_title: 'AI & <사람>',
      post_url: 'https://www.corca.ai/blog/ai?source=newsletter&edition=1',
      subscriber_id: 'subscriber-1',
    },
    'unsubscribe-token',
  );
  assert.match(edition.html, /AI &amp; &lt;사람&gt;/);
  assert.match(edition.html, /글 읽기/);
  assert.match(edition.html, /source=newsletter&amp;edition=1/);
  assert.match(edition.html, /뉴스레터 수신 거부/);
  assert.match(
    edition.html,
    /https:\/\/preview\.corca\.ai\/api\/newsletter\/unsubscribe\?token=unsubscribe-token/,
  );
  assert.doesNotMatch(edition.html, /AI & <사람>/);
});

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

test('schedules no more than three total newsletter delivery attempts', () => {
  const now = new Date('2026-08-06T00:00:00.000Z');
  assert.equal(nextDeliveryRetryAt(1, now), '2026-08-06T00:15:00.000Z');
  assert.equal(nextDeliveryRetryAt(2, now), '2026-08-06T01:00:00.000Z');
  assert.equal(nextDeliveryRetryAt(3, now), null);
  assert.equal(nextDeliveryRetryAt(4, now), null);
});

test('does not requeue a stale claim after its final delivery attempt', async () => {
  const calls: Array<{ query: string; values: unknown[] }> = [];
  const database = {
    prepare(query: string) {
      return {
        bind(...values: unknown[]) {
          calls.push({ query, values });
          return {
            all: async () => ({ results: [] }),
            first: async () =>
              query.includes('newsletter_settings')
                ? { value: '2026-08-05T00:00:00.000Z' }
                : { id: 'old-edition' },
            run: async () => ({ meta: { changes: 0 } }),
          };
        },
      };
    },
  } as unknown as D1Database;
  const now = new Date('2026-08-06T00:00:00.000Z');
  await runNewsletterDaily(
    { NEWSLETTER_DB: database, NEWSLETTER_TOKEN_SECRET: 'test-secret' },
    {
      rssFetcher: async () =>
        new Response(
          '<rss><channel><item><guid>old</guid><title>Old</title><link>https://www.corca.ai/blog/old</link></item></channel></rss>',
        ),
      now,
    },
  );
  const expireFinalClaim = calls.find((call) =>
    call.query.includes('Delivery claim expired after the final allowed attempt'),
  );
  const recoverRetryableClaim = calls.find(
    (call) => call.query.includes("SET status = 'pending'") && call.query.includes('attempts < ?'),
  );
  assert.deepEqual(expireFinalClaim?.values.slice(-1), [3]);
  assert.deepEqual(recoverRetryableClaim?.values.slice(-1), [3]);
});

test('uses the global mailer fetcher instead of the Assets RSS fetcher', async () => {
  const delivery = {
    attempts: 0,
    delivery_id: 'delivery-1',
    email: 'reader@example.com',
    id: 'edition-1',
    post_title: '새 글',
    post_url: 'https://www.corca.ai/blog/new-post',
    subscriber_id: 'subscriber-1',
  };
  const database = {
    prepare(query: string) {
      return {
        bind(..._values: unknown[]) {
          return {
            all: async () => ({
              results: query.includes('JOIN newsletter_subscribers') ? [delivery] : [],
            }),
            first: async () => {
              if (query.includes('newsletter_settings'))
                return { value: '2026-08-05T00:00:00.000Z' };
              if (query.includes('SELECT id FROM newsletter_editions')) return { id: 'edition-1' };
              return null;
            },
            run: async () => ({
              meta: {
                changes: query.includes("SET status = 'sending'") ? 1 : 0,
              },
            }),
          };
        },
      };
    },
  } as unknown as D1Database;
  const calls: { mailer: string[]; rss: string[] } = { mailer: [], rss: [] };
  let sesBody = '';

  const result = await runNewsletterDaily(
    {
      NEWSLETTER_AWS_ACCESS_KEY_ID: 'AKIDEXAMPLE',
      NEWSLETTER_AWS_REGION: 'ap-northeast-2',
      NEWSLETTER_AWS_SECRET_ACCESS_KEY: 'secret',
      NEWSLETTER_DB: database,
      NEWSLETTER_FROM_EMAIL: 'newsletter@corca.ai',
      NEWSLETTER_TOKEN_SECRET: 'test-secret',
    },
    {
      mailerFetcher: async (input, init) => {
        calls.mailer.push(String(input));
        sesBody = String(init?.body || '');
        return new Response(JSON.stringify({ MessageId: 'ses-message-1' }), { status: 200 });
      },
      now: new Date('2026-08-06T00:00:00.000Z'),
      rssFetcher: async (input) => {
        calls.rss.push(String(input));
        return new Response(
          '<rss><channel><item><guid>old</guid><title>Old</title><link>https://www.corca.ai/blog/old</link></item></channel></rss>',
        );
      },
    },
  );

  assert.deepEqual(calls.rss, ['https://www.corca.ai/rss']);
  assert.deepEqual(calls.mailer, [
    'https://email.ap-northeast-2.amazonaws.com/v2/email/outbound-emails',
  ]);
  assert.equal(result.delivered, 1);
  const sesPayload = JSON.parse(sesBody);
  assert.match(sesPayload.Content.Simple.Body.Html.Data, /새 글/);
  assert.match(sesPayload.Content.Simple.Body.Html.Data, /글 읽기/);
  assert.match(sesPayload.Content.Simple.Body.Html.Data, /뉴스레터 수신 거부/);
});

test('extracts distinct bounced and complained addresses from SES events', () => {
  assert.deepEqual(
    extractSesSuppressedEmails({
      'detail-type': 'Email Bounced',
      detail: {
        bounce: {
          bouncedRecipients: [
            { emailAddress: 'Reader@Example.com' },
            { emailAddress: 'reader@example.com' },
          ],
        },
      },
    }),
    ['reader@example.com'],
  );
  assert.deepEqual(
    extractSesSuppressedEmails({
      Message: JSON.stringify({
        eventType: 'Complaint',
        complaint: { complainedRecipients: [{ emailAddress: 'stop@example.com' }] },
      }),
    }),
    ['stop@example.com'],
  );
  assert.deepEqual(extractSesSuppressedEmails({ eventType: 'Delivery' }), []);
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

test('retains safe SES response diagnostics when delivery is rejected', async () => {
  await assert.rejects(
    () =>
      sendSesEmail(
        {
          NEWSLETTER_AWS_ACCESS_KEY_ID: 'AKIDEXAMPLE',
          NEWSLETTER_AWS_REGION: 'ap-northeast-2',
          NEWSLETTER_AWS_SECRET_ACCESS_KEY: 'secret',
          NEWSLETTER_FROM_EMAIL: 'newsletter@corca.ai',
        },
        {
          html: '<p>안녕하세요</p>',
          subject: '테스트',
          text: '안녕하세요',
          to: 'reader@example.com',
        },
        {
          fetcher: async () =>
            new Response('', {
              headers: {
                server: 'awselb/2.0',
                'x-amzn-requestid': 'request-123',
              },
              status: 405,
              statusText: 'Method Not Allowed',
            }),
        },
      ),
    /SES SendEmail failed \(405\).*x-amzn-requestid=request-123.*server=awselb\/2\.0/,
  );
});
