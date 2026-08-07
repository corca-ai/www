---
title: Blog newsletter
---

# Blog newsletter

Every Korean static article has a double-opt-in newsletter form. The `/blog`
listing intentionally has no newsletter form. The Worker stores subscribers and delivery history in D1,
reads the production Korean RSS feed on a daily Cron Trigger, and sends one
email for each newly discovered post. It does not send the existing RSS archive
on its first run: that run only records a baseline, then later RSS GUIDs become
editions and delivery rows.

## Ownership

- `worker/newsletter.ts` owns subscribe, confirmation, unsubscribe, RSS
  discovery, delivery queueing, bounded delivery retry, SES feedback handling,
  and AWS SES SigV4 mail delivery.
- `worker/index.ts` reads the default `/rss` feed directly from the Worker
  Assets binding during scheduled runs, avoiding a self-request through the
  public custom domain. `NEWSLETTER_RSS_URL` remains the explicit override for
  an external feed. This RSS fetcher is not used for SES delivery: mail always
  uses the Worker global `fetch` to reach AWS.
- `migrations/0001_newsletter.sql` owns D1 tables for subscribers, editions,
  deliveries and the RSS baseline marker. The unique edition/subscriber pair is
  the duplicate-send guard.
- `public/blog/app.js` and `public/blog/styles.css` own the shared newsletter
  behavior and presentation. The static-post generator inserts the form after
  each Korean article whenever blog content is rebuilt; it never inserts one
  on the listing page.

The dedicated APAC D1 database is configured in `wrangler.jsonc` as
`NEWSLETTER_DB`, and the same file schedules the daily Cron Trigger at 09:00
KST (`0 0 * * *` in UTC). The public form first calls
`/api/newsletter/status` and remains hidden until the mail secrets exist *and*
the operator explicitly enables it after the Cron baseline check. Merging this
code therefore cannot expose a broken subscription form.

The `*.workers.dev` Worker preview is intentionally an exception: it always
reveals the form for release testing while the canonical `www.corca.ai` host
continues to obey `public_enabled`.

## Required setup after this PR merges

1. Before deploying a new or replacement database, apply the schema remotely:
   `wrangler d1 execute corca-www-newsletter --remote --file=migrations/0001_newsletter.sql`.
   The production `corca-www-newsletter` database has already received this
   migration; this command is the required recovery/setup step before a Cron
   can query `newsletter_settings`.
2. Deploy this PR so the committed D1 binding and daily Cron Trigger become
   active. The first successful Cron run only
   establishes the RSS baseline; verify its log before treating a later run as
   live sending.
3. In AWS SES, verify the existing company sender or create
   `newsletter@corca.ai`; configure its SPF/DKIM DNS records and request SES
   production access when the account is still in the sandbox. Create a
   least-privilege IAM credential allowed to send email through that identity.
4. Store these values as Cloudflare Worker secrets, not in Git:
   `NEWSLETTER_TOKEN_SECRET`, `NEWSLETTER_AWS_ACCESS_KEY_ID`,
   `NEWSLETTER_AWS_SECRET_ACCESS_KEY`, `NEWSLETTER_AWS_REGION`, and
   `NEWSLETTER_FROM_EMAIL`. Set `NEWSLETTER_AWS_SESSION_TOKEN` only for
   temporary AWS credentials. `NEWSLETTER_REPLY_TO_EMAIL` and
   `NEWSLETTER_SITE_ORIGIN` are optional. Also create and store a random
   `NEWSLETTER_SES_EVENT_SECRET`; it authenticates the SES feedback endpoint.
5. Run the Cron manually once to establish its RSS baseline, then publish one
   test post and run it again. Check D1 `newsletter_deliveries` for a single
   `sent` row and use the email's one-click unsubscribe link.
6. Apply `migrations/0003_enable_newsletter_public.sql` with the newsletter
   release deployment. It is the explicit release switch for the public form;
   until that migration is applied, the form remains hidden.
7. Apply `migrations/0002_newsletter_delivery_retries.sql` to add the delivery
   retry timestamp before deploying this code in a new environment. It is
   already applied to the production `corca-www-newsletter` database. In AWS,
   create an EventBridge rule for SES **Email Bounced**
   and **Email Complained** events. Its API Destination is
   `https://www.corca.ai/api/newsletter/events`; configure the connection to
   send `X-Newsletter-Event-Secret` with the exact Worker secret. That endpoint
   immediately marks matching subscribers unsubscribed, so later editions do
   not send to a bounced or complained address.

## Safety and operating behavior

- Unconfirmed addresses never receive blog editions. Confirmation tokens are
  stored only as hashes; delivery unsubscribe tokens are signed and their hashes
  are checked before changing subscriber state.
- A confirmation request for the same pending address is accepted without
  another email for 10 minutes. Delivery rows are atomically claimed before SES
  is called; a stranded claim returns to `pending` after 15 minutes.
- A missing D1 binding, token secret or SES configuration returns a safe `503`
  from the subscribe endpoint. A scheduled run can still discover and queue
  new editions, but leaves deliveries pending until SES is configured.
- SES failures retry automatically at 15 minutes and 1 hour (three total
  attempts), then remain failed with a bounded error message for review.
- The SES feedback endpoint accepts only authenticated EventBridge API
  Destination requests. Once the AWS rule above is enabled, bounce and
  complaint recipients are automatically suppressed from future delivery.
- The source is `https://www.corca.ai/rss`. Phase one is Korean-only; localized
  feeds and digests need an explicit product decision before expanding it.
