# Corca AX Korean redesign — design QA

**Source visual truth**

- `/Users/tommy/Desktop/[260721] corca-ax-sales-deck-OpenAI 브리핑 버전-가격삭제.pdf`
- Generated Section 1-2 photography source: `/Users/tommy/.codex/generated_images/019f6982-a854-7d81-ac4f-359149c616e3/exec-d697b7b0-546f-4c64-b150-4a6b4b9056f3.png`
- Rendered source contact sheet: `/private/tmp/ax-deck-review/contact-sheet.jpg`
- Focused source renders: `/private/tmp/ax-deck-review/page-01.jpg`, `/private/tmp/ax-deck-review/page-05.jpg`

**Implementation evidence**

- Local route: `http://127.0.0.1:8787/ax-preview`
- Desktop hero: `/private/tmp/ax-v2-qa/desktop-1440-top-2.png`
- Low-height desktop hero: `/private/tmp/ax-v2-qa/desktop-1440x600.png`
- Mobile hero: `/private/tmp/ax-v2-qa/mobile-390-top-2.png`
- Mobile diagnosis: `/private/tmp/ax-v2-qa/mobile-390-diagnosis.png`
- Combined hero comparison: `/private/tmp/ax-v2-qa/compare-source-hero.jpg`
- Combined diagnosis comparison: `/private/tmp/ax-v2-qa/compare-source-diagnosis.jpg`
- Updated desktop hero: `/private/tmp/ax-v2-qa/hero-desktop-after.png`
- Updated tablet hero: `/private/tmp/ax-v2-qa/hero-tablet-viewport.png`
- Updated mobile hero: `/private/tmp/ax-v2-qa/hero-mobile-viewport.png`
- Section 1-2 desktop viewport: `/private/tmp/ax-v2-qa/compound-desktop-viewport.png`
- Section 1-2 mobile viewport: `/private/tmp/ax-v2-qa/compound-mobile-viewport.png`
- Section 1-2 source/implementation comparison: `/private/tmp/ax-v2-qa/compound-comparison.png`
- Round 4 environment table: `/private/tmp/ax-v2-qa/round4-environment-desktop.png`
- Round 4 Ceal desktop diagram: `/private/tmp/ax-v2-qa/round4-ceal-desktop.png`
- Round 4 Ceal mobile diagram: `/private/tmp/ax-v2-qa/round4-ceal-mobile.png`
- Round 4 package cards: `/private/tmp/ax-v2-qa/round4-packages-desktop.png`
- Round 4 combined comparisons: `/private/tmp/ax-v2-qa/round4-environment-comparison.png`, `/private/tmp/ax-v2-qa/round4-ceal-comparison.png`, `/private/tmp/ax-v2-qa/round4-packages-comparison.png`
- Round 5 Section 1-2 desktop composition: `/private/tmp/ax-v2-qa/round5-compound-desktop.png`

## Capture normalization

- Source pages were rendered at 1200 × 675 px from the PDF at 90 DPI.
- Desktop implementation CSS viewport was 1440 × 900 at device scale factor 1; browser content capture was 1425 × 891 px after scrollbar/browser viewport subtraction.
- Low-height implementation CSS viewport was 1440 × 600 at device scale factor 1; content capture was 1425 × 594 px.
- Mobile implementation CSS viewport was 390 × 844 at device scale factor 1; content capture was 375 × 812 px after scrollbar/browser viewport subtraction.
- The hero comparison normalizes both source and implementation to 700 px wide in a single side-by-side image.
- The diagnosis comparison normalizes the source to 700 px wide and the mobile implementation to 675 px high in a single side-by-side image. The source is a presentation landscape while the implementation is a responsive mobile page, so composition is compared by hierarchy, copy, density, and responsive order rather than identical geometry.

## State and responsive coverage

- Initial hero at 390 × 844, 685 × 886, 768 × 900, 1024 × 768, and 1440 × 900.
- Low-height hero at 1440 × 600.
- Customer carousel first and second slide states.
- Section 4 desktop tab second state and mobile accordion second expanded state.
- Consultation dialog open, close-button dismissal, focus return, privacy default selection, and disabled pre-approval submit state.
- Reduced-motion behavior is covered by the performance contract; mobile network evidence confirms an empty video `currentSrc` and the mobile AVIF poster.

## Required fidelity surfaces

### Fonts and typography

- Pretendard hierarchy matches the approved AX system and uses the mobile Korean subset at 720 px and below.
- The Notion H1/H2/H3 semantics and authored line breaks are preserved. Display type is intentionally larger and heavier than the presentation deck because the approved direction calls for an Apple-style full-screen web hierarchy.
- Korean copy uses `word-break: keep-all` across the AX v2 page. The Hero H3 keeps the authored four lines through 720 px and combines the final two lines at 721 px and above for the approved three-line tablet/desktop composition.
- No clipping, truncation, orphan punctuation, or horizontal overflow was found at the tested breakpoints.

### Spacing and layout rhythm

- The hero maintains the established media/copy placement and 10 px low-height gap beneath the 66 px header.
- Desktop comparison layouts collapse to a readable single-column sequence on mobile.
- Section spacing, card radii, panel density, and blue/navy section rhythm are consistent with the supplied deck and the requested Apple-style progressive disclosure.

### Colors and visual tokens

- The page retains Corca blue, light-blue washes, navy evidence sections, white surfaces, and subdued neutral borders.
- The approved white-to-sky-blue-to-Corca-blue gradient is applied to the second Hero H2 line and the second final CTA H2 line, matching the current `/ax` visual accent.
- Text/background combinations remain readable, and interactive states do not rely on color alone.

### Image quality and asset fidelity

- The existing dolphin hero media and approved OpenAI Select Partner badge are reused rather than approximated.
- Section 1-2 uses the approved photorealistic team image with bright sunlight and East Asian and non-Asian colleagues in casual business clothing. Its bright left-side negative space carries the navy heading without a gradient overlay. The 1796 × 876 source is served as a 38 KB AVIF, 55 KB WebP, and 90 KB JPEG fallback with intrinsic dimensions and lazy loading.
- The OpenAI–Corca lockup uses the supplied source asset, converted to a 600 px lossless WebP with PNG fallback and intrinsic dimensions.
- No source logo or photographic asset was replaced by an inline SVG, emoji, placeholder, or CSS drawing. The Ceal flow rails are an explicitly requested live information diagram rather than a replacement for a supplied raster asset.

### Copy and content

- The Korean copy, headings, numbers, quotes, CTA labels, and authored line breaks come from the locked Notion content data or explicit follow-up browser annotations.
- No unapproved copywriting or sentence compression was introduced.

## Full-view comparison evidence

- `/private/tmp/ax-v2-qa/compare-source-hero.jpg` shows the source page-1 hierarchy beside the rendered full-screen hero. The content order and emphasis match; the dark dolphin media treatment is the explicitly approved retained hero design.
- `/private/tmp/ax-deck-review/contact-sheet.jpg` was reviewed against the responsive section sequence and confirms that all eleven source sections are represented in the implementation.

## Focused region comparison evidence

- `/private/tmp/ax-v2-qa/compare-source-diagnosis.jpg` verifies the Section 5 heading, `61건` metric, explanatory copy, and mobile-first reading order against PDF page 5.
- `/private/tmp/ax-v2-qa/mobile-390-top-2.png` verifies the mobile hero crop, line breaks, CTA, badge, and text/media non-overlap.
- `/private/tmp/ax-v2-qa/desktop-1440x600.png` verifies the low-height hero rule and prevents the heading from moving behind the header.
- `/private/tmp/ax-v2-qa/compound-comparison.png` compares the generated team source and the rendered Section 1-2 in one image. The implementation preserves subject sharpness, warm sunlight, right-weighted people composition, and left-side text clearance.
- `/private/tmp/ax-v2-qa/round5-compound-desktop.png` verifies the approved three-line `첫 성과가 / 복리로 이어지는 조직, / Corca AX가 함께 만듭니다.` copy at a reduced 38.4 px desktop size. The rendered heading ends before the first person begins, with no overlay or horizontal overflow.
- `/private/tmp/ax-v2-qa/hero-tablet-viewport.png` and `/private/tmp/ax-v2-qa/hero-mobile-viewport.png` verify the three-line tablet and four-line mobile H3 rules respectively.
- `/private/tmp/ax-v2-qa/round4-environment-comparison.png` verifies the enlarged table labels and the faded blue-purple row connectors against PDF page 7.
- `/private/tmp/ax-v2-qa/round4-ceal-comparison.png` verifies the translated HTML node labels, before-state criss-cross network, after-state gateway rails, and compact panel height against PDF page 8.
- `/private/tmp/ax-v2-qa/round4-packages-comparison.png` verifies that package outlines were replaced by restrained elevation shadows while preserving the three-card hierarchy from PDF page 9.

## Findings

- No actionable P0, P1, or P2 visual mismatch remains.
- [P3] The source deck uses a compact presentation density while the site deliberately uses more vertical whitespace and larger display type. This is an expected web adaptation required by the approved Apple-style direction, not unresolved drift.

## Comparison history

1. First interactive pass found a P2 accessibility-state regression: after selecting the second testimonial, the live status returned to slide 1 because the intersection observer reported cards independently.
   - Fix: replaced independent intersection updates with a debounced nearest-card calculation based on the scroll viewport center.
   - Post-fix evidence: the browser reports `2 / 2 — 타이키 테크놀로지스 - AX 프로덕트 매니저`, previous enabled, next disabled.
2. First dialog pass found a P2 focus regression: the modal initially focused the hidden honeypot field.
   - Fix: changed initial modal focus to the visible `name` field.
   - Post-fix evidence: browser active element is `input[name="name"]`; close-button dismissal restores focus to the invoking CTA.
3. A duplicate functional H2 was found in the hidden dialog during the heading-map review.
   - Fix: retained `aria-labelledby` while changing the dialog title to styled non-heading text so the document outline contains only the authored Notion headings.
   - Post-fix evidence: Astro check/build pass and the modal retains its accessible name.
4. Browser annotation review requested Korean word preservation, a current-AX gradient accent, responsive Hero H3 line breaks, removal of the Section 1-2 CTA, and a premium team photograph.
   - Fix: applied `word-break: keep-all`, breakpoint-specific final H3 break behavior, shared gradient token, removed only the Section 1-2 button, and added an optimized responsive `<picture>` background.
   - Post-fix evidence: desktop/tablet/mobile captures show no horizontal overflow; DOM probes report `wordBreak: keep-all`, no Section 1-2 button, mobile poster `01-hero-mobile.avif`, and empty mobile video `currentSrc`.
5. Round 4 annotations found P2 fidelity gaps in the environment-table flow arrows, Ceal connector geometry, Ceal panel density, and package-card elevation.
   - Fix: increased the requested table labels by approximately 15%, replaced text arrows with faded blue-purple flow connectors, rebuilt both Ceal connector systems as translation-safe HTML/CSS rails, removed fixed Ceal panel heights, and replaced package outlines with layered shadows.
   - Post-fix evidence: the three round-4 comparison sheets match PDF pages 7–9; the 390 × 844 mobile check reports no horizontal overflow and keeps both Ceal diagrams fully readable without rasterized text.
6. Round 5 annotation found the Section 1-2 heading too large and overlapping the leftmost person.
   - Fix: changed the approved middle line to `복리로 이어지는 조직,`, reduced the responsive display size from a 54 px maximum to a 40 px maximum, and constrained desktop copy to the left 44% of the shell.
   - Post-fix evidence: the 1280 px browser capture renders exactly three lines at 38.4 px; the text box ends before the first person and the image remains uncropped.

## Interaction and console checks

- Carousel buttons, live status, and scroll state: passed.
- Desktop tabs and mobile accordion: passed.
- Dialog close button, body scroll lock, focus entry, and focus restoration: passed.
- Privacy checkbox defaults to selected and submit remains disabled until privacy, Turnstile, delivery, and email approvals exist: passed.
- Mobile WebM `currentSrc`: empty; mobile poster: `01-hero-mobile.avif`.
- Browser warnings/errors: none.

## Residual test gaps

- Native Escape dismissal is implemented with the dialog `cancel` event, but the in-app browser keyboard bridge did not emit the native Escape dialog event. The close button, backdrop handler, and focus restoration were verified; CI/browser regression coverage should exercise the native Escape path directly.
- Live Cloudflare email delivery, Turnstile failure, and reply-to behavior remain intentionally blocked until approved bindings and privacy URL are supplied.

## Implementation checklist

- [x] Preserve exact Notion copy and heading levels.
- [x] Preserve the established hero performance contract.
- [x] Verify responsive layout and low-height hero.
- [x] Verify keyboard-accessible carousel, tabs, accordion, and dialog structure.
- [x] Verify optimized partner asset and meaningful ALT.
- [x] Keep live cutover disabled until privacy and Cloudflare email approvals.

final result: passed
