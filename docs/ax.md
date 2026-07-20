---
title: Corca AX page
---

# Corca AX page

Corca AX is a localized campaign page served from the shared Corca website at
`/ax`. Korean is the default locale; English, Japanese and Simplified Chinese
use `/en/ax`, `/ja/ax` and `/zh/ax`. The page is part of the normal Astro build,
so it inherits the shared header, footer, canonical URLs, language switcher,
analytics and deployment flow from `BaseLayout.astro`.

## Ownership map

| Concern | Source |
| --- | --- |
| Page composition | `src/components/pages/Ax.astro` |
| Localized page copy and form strings | `src/components/pages/ax/content.ts` |
| Stable consultation topic IDs | `src/components/pages/ax/contract.ts` |
| Carousel, consultation form and client behavior | `src/components/pages/ax/` |
| Page-scoped styles | `src/components/pages/ax/ax.css` |
| Image and video path registry | `src/components/pages/ax/assetPaths.ts` |
| Images and logos | `public/images/pages/ax/` |
| Hero video | `public/video/ax/` |
| Mobile Pretendard subsets | `public/fonts/pretendard-mobile/` |
| SEO metadata and route registration | `src/i18n/pageMeta.ts` and `src/staticPages.ts` |
| Service structured data | `src/i18n/structuredData.ts` |
| Consultation endpoint | `worker/axConsultations.ts` |

The page deliberately does not render its own global header or footer. Add or
change shared navigation in the normal site sources; keep AX-only section links
inside `Ax.astro`.

At widths up to 720px, AX uses the self-hosted Pretendard variable dynamic
subset instead of preloading the full variable font. Keep the subset stylesheet,
its `unicode-range` declarations and all referenced WOFF2 slices together. The
desktop font path remains `/fonts/PretendardVariable.woff2`; do not make the
mobile optimization global without measuring the other routes first.

The mobile AX critical path also avoids initializing the hero video and scroll
parallax, leaving the lightweight poster as the stable LCP element. Google
Analytics is queued immediately but its network script is delayed until five
seconds after `load` or the first interaction. Carousel images are only
preloaded after their carousel enters the viewport. Desktop behavior and other
routes keep their existing loading strategy.

## Update copy or assets

All visible AX copy is represented in `content.ts` for all four locales. Keep
the content object's shape identical across locales and keep form topic IDs
stable: `strategy_discovery`, `decision_map`, `operations_transition`,
`organization_adoption`, `openai_adoption` and `other`. The Worker uses those
IDs as an API contract; translated labels may change without changing an ID.

For an asset replacement, keep the public URL in `assetPaths.ts` and replace the
corresponding file. Responsive scene images have desktop and mobile variants;
preserve both so `<picture>` sources do not fall back to the wrong crop. Use
descriptive localized alternative text in `content.ts` rather than encoding it
in the asset registry.

## Consultation form

The form posts JSON to `POST /api/ax/consultations`. The Worker validates the
payload, rejects oversized or suspicious submissions, verifies Cloudflare
Turnstile and sends the result through Resend. It does not write submissions to
an application database. Resend and recipient mailboxes process and retain the
message under Corca's configured retention practices and their own policies;
the form links to Corca's published privacy policy.

Configure these Cloudflare Worker secrets or variables before enabling live
submissions:

| Name | Required | Purpose |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | yes | Server-side Turnstile verification secret. |
| `RESEND_API_KEY` | yes | Resend API credential used for delivery. |
| `RESEND_FROM` | recommended | Verified sender, for example `Corca AX <ax@corca.ai>`. |
| `AX_CONSULTATION_TO` | optional | Comma-separated recipients; defaults to the AX contact owner. |

Set `PUBLIC_TURNSTILE_SITE_KEY` in the Astro build environment so the static page
can render the public Turnstile widget. In local development that means an
ignored `.env` file or a shell environment variable; in Cloudflare Workers
Builds it means a build variable. Put the Worker runtime values
(`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_FROM` and
`AX_CONSULTATION_TO`) in the ignored `.dev.vars` file for local end-to-end tests
and in Worker secrets or variables for production. The site key is public; the
secret key must never be exposed to Astro or committed.

The client records UTM parameters and emits AX-specific `dataLayer` events when
Google Analytics is present. Delivery failures return a generic localized
message to visitors; detailed API error codes remain available in the network
response for diagnosis.

Before production delivery is enabled, the privacy owner must confirm that the
published notice, the one-year consultation retention practice and the Resend
processor setup are current. That review must include any required processing
agreement, overseas transfer disclosure and deletion procedure. Also verify the
sender domain, final recipients and Turnstile host allowlist; keep the endpoint
unconfigured until those checks are complete. Add a Cloudflare rate-limiting or
WAF rule for `POST /api/ax/consultations` before launch so valid-but-automated
Turnstile traffic cannot exhaust the delivery quota or recipient inbox.

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
