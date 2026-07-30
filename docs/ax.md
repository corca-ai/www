---
title: Corca AX page
---

# Corca AX page

Corca AX is a localized campaign page served from the shared Corca website at
`/ax`. Korean is the default locale; English, Japanese and Simplified Chinese
use `/en/ax`, `/ja/ax` and `/zh/ax`. The page is part of the normal Astro build,
so it inherits the shared header, footer, canonical URLs, language switcher,
analytics and deployment flow from `BaseLayout.astro`.

Any content or visual redesign must also satisfy the shared
[SEO and performance governance](seo-content-governance.md), including the AX
mobile critical-path and production measurement gates.

The Korean page that existed before AX V2 is preserved at
`/ax-backup`. It is intentionally `noindex, nofollow`, is absent from every
sitemap and canonicalizes to `/ax`. Its implementation lives in
`AxLegacy.astro` and `components/pages/ax/`; do not edit those files for the new
design. Read the [2026-07-28 site and AX V2
handoff](handoffs/2026-07-28-corca-site-handoff.md) for the current
implementation and verified Git history.

## Ownership map

| Concern | Source |
| --- | --- |
| Active route wrapper | `src/components/pages/Ax.astro` → `src/components/pages/AxV2.astro` |
| AX V2 Korean base copy and locale merge | `src/components/pages/ax-v2/content.ts` |
| AX V2 EN, JA and ZH overrides | `i18n/ax-v2-content-localized.ts` |
| AX V2 lead form | `src/components/pages/ax-v2/AxLeadForm.astro` |
| AX V2 client behavior and form submission | `src/components/pages/ax-v2/ax-v2-client.ts` |
| AX V2 page-scoped styles | `src/components/pages/ax-v2/ax-v2.css` |
| Frozen 2026-07-22 page composition | `src/components/pages/AxLegacy.astro` |
| Frozen Korean backup wrapper | `src/components/pages/AxBackup.astro` and `src/pages/ax-backup.astro` |
| Frozen legacy copy, contract, behavior and styles | `src/components/pages/ax/` |
| AX assets | `public/images/pages/ax/`, `public/video/ax/` and imports owned by AX V2 |
| Mobile Pretendard subsets | `public/fonts/ax-mobile/v1/` |
| SEO metadata and route registration | `src/i18n/pageMeta.ts` and `src/staticPages.ts` |
| Service structured data | `src/i18n/structuredData.ts` |
| Consultation endpoint | `worker/axConsultations.ts` |

The page deliberately does not render its own global header or footer. Add or
change shared navigation in the normal site sources; keep AX-only section links
inside `Ax.astro`.

At widths up to 720px, AX uses one self-hosted, route-specific Pretendard
variable subset instead of the full variable font or the old 92-slice dynamic
stylesheet. Regenerate the Korean, English, and Japanese files with
`scripts/build-ax-mobile-fonts.py` after a production build. Simplified Chinese
stays on the native system stack because the bundled Pretendard families do not
cover every glyph used by the Chinese AX page; a partial webfont would create
visible mixed-glyph rendering. The desktop font path remains
`/fonts/PretendardVariable.woff2`; do not make the mobile optimization global
without measuring the other routes first.

The mobile AX critical path also avoids initializing the hero video and scroll
parallax, leaving the lightweight poster as the stable LCP element. The mobile
poster keeps the approved wide composition, resized and encoded separately for
the mobile critical path, and positions it in the upper-right so the orca stays
clear of the centered headline; keep that composition and its bottom mask in
sync when replacing the hero artwork. Google
Analytics is queued immediately but its network script is delayed until five
seconds after `load` or the first interaction. Carousel images are only
preloaded after their carousel enters the viewport. Desktop behavior and other
routes keep their existing loading strategy.

At desktop and tablet widths above 720px, viewports no taller than 720px anchor
the hero copy 10px from the top of the hero instead of from the bottom. The hero
keeps a 654px minimum height so the heading stays visible and the remaining CTA
content can be reached by scrolling without shrinking the approved typography.
The mobile layout remains independent of this height rule.

## Update copy or assets

AX V2 keeps its Korean base copy in `ax-v2/content.ts` and merges English,
Japanese and Simplified Chinese overrides from
`i18n/ax-v2-content-localized.ts`. The durable Korean source ledger is
`docs/ax-content-plan-v2.md`. Do not edit the frozen `ax/content.ts` to change
AX V2, and do not duplicate copy inside presentational components.

The Hero consultation CTA is a crawlable same-page link with `href="#request"`.
It resolves to `/ax#request` in Korean and keeps the current locale for the
other AX pages. A normal activation updates the fragment, moves instantly to
the inline consultation section, and focuses its first field. Direct
`#request` entries and later `#request` hash changes focus that same field
without moving the browser's fragment position. An empty automatically focused
name field uses a pale-yellow guidance state that clears on the first input;
it is not an error state. Modified clicks retain the browser's native new-tab
behavior. The fragment is a navigation target only:
canonical URLs, hreflang, sitemap entries, Open Graph URLs and structured data
remain hash-free.

AX V2 keeps its asset URL registry in the `axV2Assets` export from
`ax-v2/content.ts`. Replace or version the corresponding public asset and update
that registry; do not route new AX V2 assets through the frozen
`ax/assetPaths.ts`. Responsive scene images have desktop and mobile variants;
preserve both so `<picture>` sources do not fall back to the wrong crop. Keep
descriptive localized alternative text with the visible content rather than
encoding it in the asset registry.

## Consultation form

The four localized AX V2 forms post JSON to
`POST /api/ax/consultations`. The Worker validates the payload, rejects
oversized or suspicious submissions and sends the result through the
Cloudflare Email Sending binding. It does not write submissions to an
application database. Cloudflare Email Service and recipient mailboxes process
and retain the message under Corca's configured retention practices and their
own policies. The forms show a required, concise processing notice. The
localized privacy pages remain published with `noindex` metadata but are not
linked from the current AX lead form.

The `AX_EMAIL` binding in `wrangler.jsonc` restricts delivery to the verified
`contact+ax@corca.ai` destination and restricts the sender to `ax@corca.ai`.
Those addresses are server-side constants and cannot be supplied by the
browser. The visitor's validated email address is used only as `Reply-To`, so a
recipient can reply normally without allowing sender spoofing. The localized
form's email fallback uses the same fixed recipient.

The shared layout records the tab's first Corca landing in
`sessionStorage` under `corca:ax-acquisition:v1`. It keeps only the landing
pathname, first external referrer hostname and first-landing UTM values. The
full referrer URL, query string and hash are not retained. This shared capture
means a visitor who enters on `/` and later opens `/ax` keeps the original
session acquisition evidence.

The AX client adds the saved hostname and landing path to the consultation
payload. The Worker validates both fields and adds a form-time source/medium
summary plus the browser evidence to the email as `유입 경로`, `이전 사이트`,
`최초 방문 페이지` and any UTM values. UTM source/medium takes priority; a
Google search referrer is shown as `google / organic`, another external host as
`host / referral`, and missing campaign/referrer evidence as
`(direct) / (none)`.

The clients emit only non-PII AX conversion events through the site's direct
Google tag (`gtag.js`); Google Tag Manager is not part of this flow.
`form_submit` is emitted before the consultation request and `generate_lead`
only after the email binding succeeds. Name, email, selected consulting
interests, other-interest detail, consultation reason and the email attribution
fields must never be sent to Google Analytics. Delivery failures return a
generic localized message to visitors; detailed API error codes remain
available in the network response for diagnosis.

The email value is an immediate form-time interpretation, not a readback of
GA4's processed report. Google Analytics remains the authority for its
source/medium and default channel group dimensions because its processing can
also account for advertising integrations and attribution settings. The raw
`이전 사이트` row stays beside the interpretation so missing or suppressed
referrer evidence remains visible.

Run `pnpm test:ax-attribution` for the pure acquisition and fake-email tests.
`pnpm cf:preview` uses Wrangler's local email simulation because the email
binding is not remote; messages are logged and saved locally rather than
delivered. Do not add `remote: true` merely for local form testing.

The published notice, three-year consultation retention practice, Cloudflare
Email Service processor setup, sender domain and final recipient must stay in
sync with this implementation. Add a Cloudflare rate-limiting or WAF rule for
`POST /api/ax/consultations` when the site moves to `corca.ai`, so automated
traffic cannot exhaust the delivery quota or recipient inbox.

Lead operations use the approved recipient mailbox and a Google Spreadsheet
plug-in rather than a site-hosted admin dashboard. Reporting and dashboard work
are outside the current public-site release.

## Verification

Run the normal gates from [Development](development.md), then preview through
the Worker so both the static routes and API dispatch are exercised:

```sh
pnpm test:ax-attribution
pnpm check
pnpm build
pnpm cf:preview
```

Verify `/ax`, `/en/ax`, `/ja/ax` and `/zh/ax` at desktop and mobile widths. Check
the shared header and footer, language switching, section navigation, carousel,
reduced-motion behavior, responsive images, video fallback, form validation,
canonical and hreflang tags, Open Graph image, JSON-LD and the Worker's API error
responses. Do not submit a live delivery test without the recipient's consent.
