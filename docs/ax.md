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

The Korean page that existed before the next content redesign is preserved at
`/ax-backup`. It is intentionally `noindex, nofollow`, is absent from every
sitemap and canonicalizes to `/ax`. Its implementation lives in
`AxLegacy.astro` and `components/pages/ax/`; do not edit those files for the new
design. Start the redesign from the [AX redesign handoff](ax-redesign-handoff.md)
and add a new component and versioned asset paths instead.

## Ownership map

| Concern | Source |
| --- | --- |
| Active route wrapper | `src/components/pages/Ax.astro` |
| Frozen 2026-07-22 page composition | `src/components/pages/AxLegacy.astro` |
| Frozen Korean backup wrapper | `src/components/pages/AxBackup.astro` and `src/pages/ax-backup.astro` |
| Localized page copy and form strings | `src/components/pages/ax/content.ts` |
| Stable consultation topic IDs | `src/components/pages/ax/contract.ts` |
| Carousel, consultation form and client behavior | `src/components/pages/ax/` |
| Page-scoped styles | `src/components/pages/ax/ax.css` |
| Image and video path registry | `src/components/pages/ax/assetPaths.ts` |
| Images and logos | `public/images/pages/ax/` |
| Hero video | `public/video/ax/` |
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

The frozen multilingual page keeps its visible copy in `content.ts`. The Korean
redesign keeps its approved Notion copy in `ax-v2/content.ts` and the durable
source ledger in `docs/ax-content-plan-v2.md`. Do not edit the frozen content
to change the redesign, and do not duplicate copy inside presentational
components.

For an asset replacement, keep the public URL in `assetPaths.ts` and replace the
corresponding file. Responsive scene images have desktop and mobile variants;
preserve both so `<picture>` sources do not fall back to the wrong crop. Use
descriptive localized alternative text in `content.ts` rather than encoding it
in the asset registry.

## Consultation form

The redesigned form posts JSON to `POST /api/ax/consultations`. The Worker
validates the payload, rejects oversized or suspicious submissions, verifies
Cloudflare Turnstile and sends the result through a native Cloudflare Email
Service binding. It does not write submissions to an application database.
The binding is restricted to one verified destination address, while the
recipient mailbox applies Corca's approved retention practice.

Configure these Cloudflare Worker secrets or variables before enabling live
submissions:

| Name | Required | Purpose |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | yes | Server-side Turnstile verification secret. |
| `AX_CONSULTATION_EMAIL` | yes | `send_email` binding restricted with `destination_address`. |
| `AX_CONSULTATION_FROM` | yes | Sender on a domain onboarded to Cloudflare Email Service. |
| `AX_CONSULTATION_DELIVERY_ENABLED` | yes | Must be exactly `true` after privacy and delivery approval. |
| `AX_CONSULTATION_RATE_LIMITER` | recommended | Cloudflare rate-limit binding for the endpoint. |

Set `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_AX_PRIVACY_POLICY_URL` and
`PUBLIC_AX_CONSULTATION_ENABLED=true` in the Astro build environment only after
the published privacy URL and delivery configuration are approved. Configure
the Worker's runtime secret and variables separately. The site key and public
URL may be included in static HTML; the Turnstile secret must never be exposed
to Astro or committed.

The client records UTM parameters and emits AX-specific `dataLayer` events when
Google Analytics is present. Delivery failures return a generic localized
message to visitors; detailed API error codes remain available in the network
response for diagnosis.

Before production delivery is enabled, the privacy owner must confirm the
published notice, selected-by-default consent behavior, collected fields,
retention period, processing responsibility and deletion procedure. Also
verify the onboarded sender domain, fixed destination address and Turnstile
host allowlist. Keep both delivery feature flags disabled until those checks
are complete. Configure the rate-limit binding or an equivalent WAF rule for
`POST /api/ax/consultations` before launch so valid-but-automated Turnstile
traffic cannot exhaust the delivery quota or recipient inbox.

## Verification

Run the normal gates from [Development](development.md), then preview through
the Worker so both the static routes and API dispatch are exercised:

```sh
pnpm check
pnpm build
pnpm cf:preview
```

Verify `/ax`, `/en/ax`, `/ja/ax` and `/zh/ax` at desktop and mobile widths. Check
the shared header and footer, language switching, section navigation, carousel,
reduced-motion behavior, responsive images, video fallback, form validation,
canonical and hreflang tags, Open Graph image, JSON-LD and the Worker's API error
responses. Do not submit a live delivery test without the recipient's consent.
