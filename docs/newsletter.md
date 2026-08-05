---
title: Blog newsletter
---

# Blog newsletter

The Korean `/blog` home has a double-opt-in newsletter form. The Worker stores
subscribers and delivery history in D1, reads the production Korean RSS feed on
a daily Cron Trigger, and sends one email for each newly discovered post. It
does not send the existing RSS archive on its first run: that run only records
a baseline, then later RSS GUIDs become editions and delivery rows.

## Ownership

- `worker/newsletter.ts` owns subscribe, confirmation, unsubscribe, RSS
  discovery, delivery queueing and AWS SES SigV4 mail delivery.
- `migrations/0001_newsletter.sql` owns D1 tables for subscribers, editions,
  deliveries and the RSS baseline marker. The unique edition/subscriber pair is
  the duplicate-send guard.
- `public/blog/index.html`, `public/blog/app.js` and `public/blog/styles.css`
  own the Korean blog-home form. `scripts/apply-admin-post-change.js` regenerates
  that same form when blog content is rebuilt.

The code is deliberately inert until the platform bindings and secrets below
exist. The public form first calls `/api/newsletter/status` and remains hidden
until all of them are available *and* the operator explicitly enables it after
the Cron baseline check. Merging this code therefore cannot expose a broken
subscription form. Do not add placeholders to `wrangler.jsonc`: an invalid D1
ID or a Cron Trigger there would change production deployment behavior.

## Required setup after this PR merges

1. Create a dedicated Cloudflare D1 database, apply
   `migrations/0001_newsletter.sql`, then bind it to this Worker as
   `NEWSLETTER_DB`.
2. Add one daily Cloudflare Cron Trigger. `0 0 * * *` is 09:00 in Korea while
   Cloudflare interprets the expression in UTC. The first successful run only
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
   `NEWSLETTER_SITE_ORIGIN` are optional.
5. Run the Cron manually once to establish its RSS baseline, then publish one
   test post and run it again. Check D1 `newsletter_deliveries` for a single
   `sent` row and use the email's one-click unsubscribe link.
6. Only after the test succeeds, set `newsletter_settings.public_enabled` to
   `true` in D1 (with the current ISO timestamp). This is the explicit release
   switch for the public form; leave it absent or `false` to keep the form
   hidden.

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
- SES failures mark the delivery `failed` with an attempt count and bounded
  error text. Retry policy and bounce/complaint webhooks are intentionally not
  automated yet; add them only after SES event destinations are agreed.
- The source is `https://www.corca.ai/rss`. Phase one is Korean-only; localized
  feeds and digests need an explicit product decision before expanding it.
