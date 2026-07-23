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

The current Korean AX form is a UI-only preview while Corca's CTO prepares the
approved consultation API and destination contract. It validates the four
visible fields (`name`, `email`, `phone`, `message`) and privacy consent in the
browser, presents field-level guidance, and opens a completion dialog after a
valid native form submit. It makes no network request and does not send or
store the entered values.

Do not add a temporary mailbox binding, database, admin route, or analytics
payload containing form values. The future integration must use the API
contract supplied by the CTO. Its endpoint, authentication, anti-abuse rules,
destination and retention behavior remain intentionally unspecified until
that contract is approved.

The published privacy-policy URL is `/privacy`. Before enabling transmission,
update the policy with the approved processor, overseas-transfer and retention
details, and repeat the privacy/security review. Name, email, phone number and
message content must never be sent to Google Analytics or `dataLayer`.

Lead operations will use the approved recipient mailbox and a Google
Spreadsheet plug-in rather than a site-hosted admin dashboard. Reporting and
dashboard work are outside the current public-site release.

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
