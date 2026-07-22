---
title: SEO and performance governance
---

# SEO and performance governance

This document is the release contract for public Corca pages. Content and
visual-design work may change what a page says and how it looks, but it must not
silently remove the technical SEO, accessibility or performance behavior
described here. Treat the rules below as acceptance criteria for every future
page redesign.

## Shared SEO contract

- Keep Astro's static output and the Cloudflare Workers Static Assets delivery
  model. Public pages must not gain request-time data fetching without a
  measured, reviewed need.
- Every indexable page emits `index, follow`. Utility, administration and error
  pages keep their explicit `noindex` policy.
- General marketing pages do not emit an author. A blog article may emit an
  author only when the source content identifies one explicitly.
- Keep the existing canonical and `hreflang` implementation unless a separate
  URL migration explicitly changes it.
- Document languages are Korean `ko`, English `en`, Japanese `ja` and
  Simplified Chinese `zh-CN`. Locale-specific metadata and structured data must
  use the same language as the visible page.
- Organization, WebSite, BreadcrumbList, SoftwareApplication and Service
  structured data must describe facts visible on or supported by the page.
  Prices, availability and product terms must not remain in JSON-LD after they
  disappear from visible content.

## Image and accessibility contract

Follow Google's descriptive image-alt guidance while preserving the HTML
accessibility contract:

- Meaningful images use an HTML `img` element and concise, localized alt text
  that explains the image in the surrounding page context.
- Do not omit the `alt` attribute, repeat filenames or list keywords.
- Decorative images use `alt=""`. This is the required exception to the
  descriptive-alt rule, not missing content.
- When a parent labels a collection of customer logos, individual repeated
  logos may remain decorative so assistive technology does not announce the
  same information twice.
- A responsive `picture` is checked at its final `img`: the fallback `src`, alt
  text and intrinsic dimensions must remain valid.
- A meaningful CSS background should be evaluated for conversion to an HTML
  image. Decorative scene backgrounds may remain CSS or empty-alt images.
- Image `title` attributes are optional and are not a substitute for alt text.

Reference: [Google Images SEO best practices](https://developers.google.com/search/docs/appearance/google-images?hl=ko#descriptive-alt-text-descriptive-titles-captions-filenames).

## Performance invariants

The mobile PageSpeed Insights release threshold for `/ax` is 90. Higher results
such as the previously observed 98 are useful measurements, not a permanent
requirement: lab scores vary with network, test location and shared test
infrastructure. Preserve the following implementation choices unless a
replacement is measured and approved:

- The AX mobile breakpoint is 720px. At or below it, the hero video is never
  connected, downloaded, played or decoded; the dedicated mobile AVIF/WebP
  poster is the LCP element.
- The mobile hero image stays eager and high priority. Desktop video remains
  `preload="none"` and connects only while the hero is visible.
- Switching from desktop to mobile unloads the video source. Reduced-motion
  users always receive the poster without video or parallax motion.
- AX mobile uses one route-specific Pretendard subset for Korean, English and
  Japanese. Chinese uses the validated system stack. The full Pretendard
  variable font is not requested by AX mobile.
- Below-fold and carousel images remain lazy. Carousel look-ahead starts only
  after its carousel enters the viewport.
- Images keep intrinsic dimensions or an explicit aspect ratio so content does
  not shift while assets load.
- Mobile does not initialize the AX scroll-parallax loop. Google Analytics on
  AX mobile loads after first interaction or five seconds after `load`.
- Content-hashed and versioned assets retain a one-year immutable cache.
  Mutable static assets retain the short cache with stale-while-revalidate;
  HTML, feeds and discovery documents revalidate; APIs remain `no-store`.
- Desktop and tablet AX viewports wider than 720px and no taller than 720px
  anchor hero copy 10px from the top of a 654px minimum-height hero instead of
  shrinking the approved typography.

## Release gates

Run the source gates, production build, discovery check and performance
contract before review. The performance contract statically checks the browser
critical-path invariants; it does not claim to be a network trace.

Before and after a production release, verify `/ax` at 390px and 685px and a
desktop width above 720px. Mobile DevTools must show zero AX WebM requests, zero
full Pretendard variable-font requests, the mobile AVIF/WebP as the hero
`currentSrc`, and no font 404, CORS, MIME or decoding errors.

Run mobile PageSpeed Insights three times against the same production URL and
record the median Performance score plus LCP, CLS, TBT, TTFB and total transfer
size. A median below 90 blocks the release. One noisy run does not block a
release when the three-run median is at least 90. The individual metrics are
diagnostic rather than independent numeric blockers, but functional invariants
such as zero mobile WebM requests always block a release.

## Content redesign checklist

For future AX content and image work:

1. Confirm the intended heading outline, localized copy, meaningful images and
   structured-data claims before implementation.
2. Preserve the canonical, responsive image sources, mobile font split,
   loading priorities, cache paths and motion preferences.
3. Run `pnpm check`, `pnpm build`, `pnpm check:agentic`,
   `pnpm check:performance-contract` and `pnpm check:seo-governance`.
4. Complete keyboard, screen-reader, reduced-motion and responsive browser
   checks, then record the three-run production PageSpeed result.
