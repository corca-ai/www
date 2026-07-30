---
title: Blog newsletter plan
---

# Corca Blog newsletter plan

> Status: planning only — no subscription UI, API, subscriber store, email
> provider integration, or sending automation is introduced by this plan.

## Goal

Let a reader subscribe from the Corca Blog and receive one email when a **new**
blog post is publicly available. The first release sends a post notification,
not a separately curated newsletter issue; it must not send for a metadata edit,
translation update, deletion, or a re-run of the publishing workflow.

## Evidence and current state

### Relevant Slack history

- In the [July 4 AX discussion](https://corcaai.slack.com/archives/C09EGR5P422/p1783162590729689?thread_ts=1783014324.193309&cid=C09EGR5P422), the team explicitly connected AX lead-facing web content with a newsletter. This is the newest public discussion that directly connects content distribution and the website.
- A [2024 mailing implementation thread](https://corcaai.slack.com/archives/C06MSDYND6G/p1731476654544629?thread_ts=1731476654.544629&cid=C06MSDYND6G) recorded an operational pattern worth preserving: test delivery before release, verify subscriber add/remove behavior against the database, and check the scheduled send after deployment. That system was for a different product and must not be copied as an architectural assumption.

### Repository facts

- `/blog` is a static subsite under `public/blog/`; posts, indexes, RSS and JSON
  Feed are generated together. Its only editorial source is Notion, whose
  workflow opens a PR rather than deploying directly.
- The site has no runtime database for public blog content or subscribers. The
  Worker currently exposes only AX consultation and Notion-publish APIs.
- Cloudflare Email Routing is configured only for AX consultation delivery. Its
  sender and recipient restrictions make it unsuitable to assume as a
  newsletter-sending solution.
- A post becomes public only after its content PR merges and the main-branch
  Cloudflare deployment completes. Creating the Notion publication PR is too
  early to notify readers.

## Product contract to approve before building

The implementation starts only after an owner records the following decisions.
They are deliberately not guessed in this plan.

| Decision | Options to decide | Why it matters |
| --- | --- | --- |
| Audience and locales | Korean-only launch or locale-specific lists | Determines form copy, language preference, and which post variants are sent. |
| Subscription confirmation | Double opt-in or a documented alternative | Defines consent proof and the email state machine. |
| Email service | Managed newsletter provider, transactional provider plus a Corca-managed store, or another approved service | Determines data residency, sender-domain setup, delivery events, unsubscribe handling, and operating cost. |
| Sender identity | From name, reply-to inbox, and verified sending domain | Readers need a recognizable sender and the team needs an owned reply path. |
| Legal and retention policy | Privacy notice owner, retention period, regional availability, and deletion/export procedure | Email addresses are personal data; the policy must be agreed before collection. |
| Publication scope | All public posts, selected sections, or editorial opt-in per post | Prevents unintended notifications for routine corrections or unsuitable content. |
| Launch cohort | Internal seed list, invite-only beta, or public launch | Bounds deliverability and support risk while the flow is observed. |

## Proposed architecture, subject to those decisions

```text
Blog subscription form
        │ POST /api/blog/subscriptions
        ▼
Worker validation, abuse controls, consent state
        │
        ▼
Approved subscriber system ─────► confirmation / unsubscribe email

Notion post request → content PR → main merge → deployment succeeds
                                                │
                                                ▼
                              post-notification job and send ledger
                                                │
                                                ▼
                         email provider sends one message per eligible post
```

### Subscription boundary

1. Add a server endpoint separate from the retired `/api/admin/*` surface,
   for example `POST /api/blog/subscriptions` and a confirmation/unsubscribe
   callback path chosen with the email service.
2. Accept only the minimum data required for the approved product contract:
   email, locale preference when needed, consent version and timestamps. Never
   put raw addresses in static files, Git history, analytics events, or logs.
3. Validate input on the server; add a honeypot, request-size limit, rate limit
   and generic success responses that do not reveal whether an address exists.
4. Keep a subscriber state machine: `pending` → `active` → `unsubscribed`.
   Confirmation, unsubscribe, resubscribe and suppression events must be
   idempotent and auditable.
5. Render accessible form states in every supported blog locale: labelled email
   field, clear consent/notice link, keyboard-visible errors and a non-JavaScript
   fallback where the selected provider supports it.

### New-post notification boundary

1. Trigger only after the public deployment is confirmed, not when Notion marks
   a row ready and not merely when a PR is opened or merged.
2. Use the generated post index and the production URL as the delivery input;
   require the target page to return successfully before sending.
3. Classify a post as new from an immutable publication identifier and keep a
   send ledger keyed by that identifier plus audience/locale. The job must be
   safe to retry without duplicate mail.
4. Treat edits, translations, re-renders and deletions as no-send by default.
   A later “updated post” campaign, if wanted, needs its own explicit product
   rule and approval.
5. Build a compact, accessible email from title, description, cover alt text
   and canonical article link. The provider's unsubscribe mechanism must be
   present in every marketing message.

### Operations boundary

1. Keep provider credentials and webhook secrets in Cloudflare/GitHub secret
   storage; never commit them or expose them to the static blog client.
2. Receive delivery, bounce, complaint and unsubscribe webhooks through a
   verified, signature-checked endpoint. Suppress future sends immediately for
   terminal delivery failures and opt-outs.
3. Create an operator view or provider-backed procedure for subscriber lookup,
   consent evidence, resubscribe, deletion request and failed-send triage.
4. Define alerting for job failures, webhook verification failures and an
   abnormal bounce/complaint rate. A failed notification must be retryable from
   the ledger without republishing the post.

## Delivery plan

### Phase 0 — approve the product and data contract

- Record the seven decisions above with named owners.
- Obtain privacy/legal review of collection notice, consent wording, retention,
  geographic scope and unsubscribe policy.
- Choose the service and verify its sender-domain, webhook, suppression and
  export/deletion capabilities in a sandbox.

**Exit:** an approved decision record and a test sender identity; no production
email is collected or sent.

### Phase 1 — build and prove subscription lifecycle

- Add the public blog subscription call-to-action and locale-aware form copy.
- Implement the Worker endpoint, data boundary and confirmation flow selected
  in Phase 0.
- Implement unsubscribe, resubscribe and deletion paths before enabling the
  public form.
- Add unit/API tests for validation, privacy-safe duplicate responses, rate
  limits and all subscription state transitions.

**Exit:** a seeded internal test list can confirm, unsubscribe and resubscribe;
no automatic post notification is enabled.

### Phase 2 — build and prove publication-to-email automation

- Add the post-publication trigger only after deployment confirmation.
- Implement the post eligibility check, production URL probe and idempotent
  send ledger.
- Generate the email from the canonical post record and send only to the
  internal seed list.
- Test retries, a failed provider request, an already-sent post, an edited
  post, a translated post and a deleted post.

**Exit:** exactly one test notification arrives for one newly published test
post, and every no-send case is proven in automated tests.

### Phase 3 — controlled launch and observability

- Run an invite-only cohort first; monitor delivery, bounces, complaints,
  unsubscribes and support responses.
- Verify the public page, canonical links, email rendering and analytics event
  names for the first real post.
- Publish an operator runbook covering paused sends, retry, suppression,
  subscriber data requests and rollback.

**Exit:** owners approve expansion to the public form based on observed delivery
and support results.

## Validation matrix for implementation PRs

| Area | Evidence required |
| --- | --- |
| Accessibility and i18n | Keyboard and screen-reader form check in each launched locale; localized consent and error copy reviewed. |
| Security and privacy | No email in client analytics/logs; webhook signature, rate limit, input limits and secret handling tested. |
| Consent lifecycle | Confirmation, unsubscribe, resubscribe, duplicate submission and deletion request have deterministic outcomes. |
| Publication trigger | A public post sends once only after production availability; edits, translations, deletes and retries do not duplicate sends. |
| Delivery | Provider sandbox/inbox rendering, bounce/complaint webhook and suppression behavior are recorded. |
| Site regression | Existing `pnpm check`, build, blog content checks and Worker API tests pass; static blog feeds and publication workflow remain intact. |

## Explicit non-goals for the first release

- Daily or weekly digests, segmentation by topic, personalization and A/B tests.
- Importing an existing mailing list without a separate consent and migration
  decision.
- Sending on unpublished PRs, previews or content edits.
- Reusing the AX consultation inbox or its restricted email binding as a bulk
  newsletter sender.

## Documentation follow-up

When implementation begins, update [Blog](blog.md) with the public form,
subscription API and publication trigger; update [Architecture](architecture.md)
with the new state and email boundaries; add an operator runbook near the
deployment and content-publishing guidance. Keep this document as the planning
record until those implementation facts are known.
