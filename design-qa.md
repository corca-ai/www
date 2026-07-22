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
- Round 6 Section 1-2 parallax state: `/private/tmp/ax-v2-qa/round6-compound-parallax.png`
- Round 6 testimonial shadow: `/private/tmp/ax-v2-qa/round6-proof-shadow-bottom.png`
- Round 6 Section 4 final tab state: `/private/tmp/ax-v2-qa/round6-tabs-final-01.png`
- Round 6 environment closing: `/private/tmp/ax-v2-qa/round6-environment-closing.png`
- Round 6 mobile static fallback: `/private/tmp/ax-v2-qa/round6-compound-mobile-static.png`
- Round 7 active tab-panel outline: `/private/tmp/ax-v2-qa/round7-tab-panel-outline-champion.png`
- Round 10 gradient accents: `/private/tmp/ax-v2-qa/round10-gradient-accents.png`
- Round 10 dark-section gradient accents: `/private/tmp/ax-v2-qa/round10-dark-gradient-accents.png`
- Round 10 static Ceal rails: `/private/tmp/ax-v2-qa/round10-ceal-static-rails.png`
- Round 12 dark Hero-gradient accent: `/private/tmp/ax-v2-qa/round12-dark-hero-gradient.png`
- Round 16 Section 1-2 native-scroll state: `/private/tmp/ax-v2-qa/round16-compound-static-scroll.png`
- Round 17 testimonial shadow runway: `/private/tmp/ax-v2-qa/round17-testimonial-shadow-runway.png`
- Round 24 responsive browser probes: 887 × 994 tablet, 721 × 900 boundary, 720 × 900 mobile boundary, and 390 × 844 mobile.

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
- The OpenAI Select Partner badge now follows the existing `/ax` contract exactly: fixed at `131px` on desktop, eased upward fade at the Hero boundary, and static absolute positioning on mobile.
- Testimonial carousel controls sit above the masked track hit area, move reliably in both directions, and share the same smooth snap positions as native touch swiping. Mobile and tablet tracks retain momentum scrolling, horizontal pan gestures, and per-card snap stops.
- Environment-table arrows use a larger `22 × 34px` triangle whose base is aligned exactly to the center divider; the fading rectangular rail is enlarged to `35 × 16px` across all four rows.
- The Ceal before/after transition reuses the AX diagnosis comparison arrow component, including its light-to-blue gradient and the responsive 90° rotation on stacked layouts.
- Section 1-2 uses the approved photorealistic team image with bright sunlight and East Asian and non-Asian colleagues in casual business clothing. Its bright left-side negative space carries the navy heading without a gradient overlay. The 1796 × 876 source is served as a 38 KB AVIF, 55 KB WebP, and 90 KB JPEG fallback with intrinsic dimensions and lazy loading. The section now follows only the native document scroll; no scroll-linked image or copy transform remains.
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
- `/private/tmp/ax-v2-qa/round6-compound-parallax.png` records the superseded parallax iteration. The final `/private/tmp/ax-v2-qa/round16-compound-static-scroll.png` capture verifies the requested native-scroll replacement: the image remains sharp and text-safe without being pulled toward the sticky header.
- `/private/tmp/ax-v2-qa/round6-proof-shadow-bottom.png` verifies that the testimonial elevation diffuses into the section background without a clipped lower edge.
- `/private/tmp/ax-v2-qa/round6-tabs-final-01.png` records the final stopped state after the measured `01 → 02 → 03 → 01` sequence. Browser timestamps measured approximately 2.67 seconds between states, and a further 2.76-second observation remained on 01.
- `/private/tmp/ax-v2-qa/round6-environment-closing.png` verifies the exact approved two-line closing copy.
- `/private/tmp/ax-v2-qa/round8-proof-gradient-and-type.png` verifies the PDF-referenced blue gradient on `조직의 체질을 바꿉니다.`, the bold second lead line, and the 80% supporting-body scale without changing the authored copy or breaks.
- `/private/tmp/ax-v2-qa/round8-carousel-controls-and-marquee.png` verifies centered white carousel buttons and the unchanged logo-mask composition; the browser probe reports a 52.5-second marquee duration and zero horizontal overflow.
- `/private/tmp/ax-v2-qa/round9-section-scroll-arrival.png` records the earlier snapped-scroll iteration; the final round-11 browser probe supersedes that behavior and reports fully native vertical scrolling with no section anchoring.
- `/private/tmp/ax-v2-qa/round10-gradient-accents.png` verifies the shared navy-to-Corca-blue-to-violet accent on the approved internal-proof line and all three circle titles, together with the enlarged gray cadence labels.
- `/private/tmp/ax-v2-qa/round10-dark-gradient-accents.png` verifies the same accent treatment remains legible on the approved two-line slowdown emphasis against the navy section.
- `/private/tmp/ax-v2-qa/round10-ceal-static-rails.png` verifies that the Ceal-before diagram remains translation-safe HTML while its nine cross-connections are static, dashed, glow-free, and visually aligned with the supplied PDF crop.
- `/private/tmp/ax-v2-qa/round12-dark-hero-gradient.png` verifies that the slowdown emphasis uses the Hero's white-to-sky-blue-to-blue gradient for clear contrast on the navy background without changing the corresponding light-section accent token.
- `/private/tmp/ax-v2-qa/hero-tablet-viewport.png` and `/private/tmp/ax-v2-qa/hero-mobile-viewport.png` verify the three-line tablet and four-line mobile H3 rules respectively.
- `/private/tmp/ax-v2-qa/round4-environment-comparison.png` verifies the enlarged table labels and the faded blue-purple row connectors against PDF page 7.
- `/private/tmp/ax-v2-qa/round4-ceal-comparison.png` verifies the translated HTML node labels, before-state criss-cross network, after-state gateway rails, and compact panel height against PDF page 8.
- `/private/tmp/ax-v2-qa/round4-packages-comparison.png` verifies that package outlines were replaced by restrained elevation shadows while preserving the three-card hierarchy from PDF page 9.
- `/private/tmp/ax-v2-qa/round15-diagnosis-blue-shadow.png` verifies that the Corca diagnosis result card gains a broad, layered light-blue elevation without reading as an outline or reducing white-text contrast.
- `/private/tmp/ax-v2-qa/round15-environment-gray-header.png` verifies that the environment-table header is separated from the blue body rows by a cool neutral-gray surface and readable gray labels.

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
7. Round 6 annotations requested layered scroll depth, tighter proof copy, diffuse testimonial elevation, a bounded tab demonstration, subtle coaching-card outlines, and an exact environment closing break.
   - Fix: added a desktop-only eased parallax with mobile/reduced-motion reset; set the Section 2 line height to 108%; expanded the testimonial shadow runway; changed tabs to a single 2.6-second `01 → 02 → 03 → 01` cycle with user-interaction cancellation; reduced coaching-card borders to 20% opacity; and locked the requested two-line closing.
   - Post-fix evidence: browser probes report distinct media/copy transforms on desktop, no transform or video source on mobile, zero horizontal overflow, the expected timed tab sequence and stopped final state, and no console warning or error.
8. Round 7 annotation requested a 2 px outline on the active desktop tab panel using the same blue as the selected tab button.
   - Fix: applied the shared `#70b8ff` active color as a stable 2 px panel border across tab states.
   - Post-fix evidence: the selected `02 AX 챔피언 양성 코칭` panel reports a 2 px solid `rgb(112, 184, 255)` border, zero horizontal overflow, and no console warning or error.
9. Round 8 annotations requested the PDF's emphasized blue title treatment, stronger lead hierarchy, smaller supporting copy, centered white testimonial controls, and a 20% slower logo marquee.
   - Fix: applied a navy-to-Corca-blue gradient only to the authored second heading line, bolded only the second lead line, scaled the following paragraph to 80%, centered the existing controls with white surfaces, and changed the marquee cycle from 42 seconds to 52.5 seconds.
   - Post-fix evidence: the rendered heading and type hierarchy match the supplied crop, both controls compute to white 48 px circles in a centered footer, the marquee computes to 52.5 seconds, horizontal overflow remains zero, and browser logs contain no warning or error.
10. Round 9 requested premium acceleration and deceleration when moving between page sections.
   - Fix: added desktop-only native `proximity` section snapping with 66 px sticky-header padding, smooth scrolling, and a restrained `cubic-bezier(0.65, 0, 0.35, 1)` reveal arrival. Mobile and reduced-motion users retain ordinary, non-forced scrolling.
   - Post-fix evidence: a browser timing probe moved from 0 to the 1,268 px target through measured intermediate positions `51 → 388 → 956 → 1,197 → 1,268`, confirming a gentle start and decelerated arrival. Computed styles report section `scroll-snap-align: start`, 0.95/1.05-second reveal durations, zero horizontal overflow, and no console warning or error.
11. Round 10 requested consistent gradient emphasis across the approved phrase fragments, larger neutral cadence labels, a final punctuation correction, and a static Ceal-before connection map.
   - Fix: promoted the approved proof-title gradient to a shared accent class and applied it only to the annotated lines and card leads; increased cadence labels from 14 px to 17 px in gray; added the requested period to `필요합니다.`; and removed the residual blue rail fill, glow, animation, and transition from the dashed Ceal-before connections.
   - Post-fix evidence: browser probes report the shared gradient image, 17 px `rgb(123, 135, 151)` cadence labels, nine `animation-name: none` transparent rails with no box shadow, the corrected sentence-ending period, zero horizontal overflow, and no semantic heading changes.
12. Round 11 found desktop section snapping visually intrusive because sections were pulled toward the sticky header during ordinary wheel scrolling.
   - Fix: removed vertical `scroll-snap-type`, per-section snap alignment, snap-stop, scroll padding, and page-level forced smooth scrolling while retaining the restrained reveal animation inside each section.
   - Post-fix evidence: the browser reports `scroll-snap-type: none`, section `scroll-snap-align: none`, `scroll-padding-top: auto`, an exact requested `scrollY` position without automatic correction, and zero horizontal overflow.
13. Round 12 found the light-section navy accent too dark against the slowdown section's navy surface.
   - Fix: scoped the existing Hero white-to-sky-blue-to-blue text gradient to the annotated slowdown emphasis while preserving the navy-to-blue-to-violet accent everywhere else.
   - Post-fix evidence: computed styles report `#f5f5f7 → #b8e2ff → #2997ff`, the rendered two-line emphasis remains fully legible, and horizontal overflow remains zero.
14. Round 13 found that the wide team-photo composition could let its statement approach the people at tablet and narrow-desktop widths, and that tab-panel changes still felt abrupt.
   - Fix: introduced a 721–1150 px protected composition that keeps the complete team image bottom-centered and moves the authored three-line statement into the open area above it; extended the panel crossfade with a restrained vertical drift, scale, blur, and Apple-style deceleration curve.
   - Post-fix evidence: responsive browser probes verify separate copy/image safe areas through the intermediate breakpoint, while tab transitions interpolate opacity, transform, and blur without layout movement; reduced-motion continues to remove both effects.
15. Round 14 requested stronger visual emphasis for the `61건` diagnosis metric.
   - Fix: reused the established light-section navy-to-Corca-blue-to-violet point-gradient token on the metric value without changing its copy, size, or layout.
16. Round 15 requested clearer hierarchy for the diagnosis result card and the environment-table header.
   - Fix: replaced the result card's compact dark-blue shadow with a wider, layered light-blue diffusion and changed the table header from white to a restrained cool gray with readable gray text, without changing either component's layout or copy.
   - Post-fix evidence: the browser reports the two-layer blue shadow, `rgb(232, 235, 239)` header surface, `rgb(77, 88, 104)` header text, zero horizontal overflow, and no console warning or error; the focused round-15 captures record both final rendered states.
17. Round 16 found the Section 1-2 parallax visually abrupt because its image appeared to jump upward toward the sticky header during ordinary scrolling.
   - Fix: removed the section's scroll listener, animation frame loop, parallax data hooks, runtime CSS variables, and scroll-linked `translateY` transforms while preserving its responsive photograph crop and copy placement.
   - Post-fix evidence: four browser scroll samples move the section top linearly with `scrollY`; the section has no parallax data attributes or inline motion variables, the image transform remains static, horizontal overflow is zero, and the browser console contains no warning or error.
18. Round 17 found the testimonial card's diffuse upper shadow visually clipped by the carousel viewport.
   - Fix: increased the track's internal top shadow runway from 20 px to 88 px and reduced the equivalent outer margin from 72 px to 4 px, preserving the card's exact vertical position while allowing the shadow to fade before the overflow boundary.
   - Post-fix evidence: the browser reports an 88 px card-to-track-top runway, unchanged zero horizontal overflow, and the focused capture shows the upper shadow diffusing continuously into the section background.
19. Round 18 found the tablet contact form appearing after the direct email, phone, and brochure links instead of immediately after the section introduction.
   - Fix: separated the direct-contact block into its own grid area and set the 900 px-and-below sequence to `copy → form → direct`, while retaining the desktop `copy/direct + form` two-column composition.
   - Post-fix evidence: the responsive grid contract defines the requested tablet reading order; the desktop browser probe retains the existing two-column areas with zero horizontal overflow, and the Astro/build checks pass.
20. Round 19 found the fixed OpenAI Select Partner badge colliding with the Hero title around the 880 px tablet breakpoint, especially in low-height viewports.
   - Fix: added a 900 px-and-below intermediate badge rule that moves it from 131 px to 66 px below the viewport top and reduces its width from 100 px to 90 px; the existing 720 px-and-below in-Hero mobile placement still overrides it.
   - Post-fix evidence: the focused 880 × 396 browser capture shows the badge ending before the second title line begins, with zero horizontal overflow and no change to the desktop or mobile breakpoint contracts.
21. Round 20 requested a 20% larger consultation dialog title without changing the surrounding two-column form composition.
   - Fix: increased only the dialog title's rendered size from 16 px to 19.2 px with a selector that cleanly separates it from the adjacent 16 px explanatory copy, while preserving the authored two-line copy and all form dimensions.
   - Post-fix evidence: the 923 × 998 focused modal capture reports the requested 19.2 px title, the original two-line break, no overlap with the form column, a fully contained 723 px panel, and zero horizontal overflow.
22. Round 21 found the testimonial card's lower diffuse shadow clipped where the carousel viewport met the following gray content area.
   - Fix: increased the track's lower shadow runway from 88 px to 160 px, extended the clipping parent's lower boundary by the matching 76 px, and offset both additions with equal negative-margin adjustments; the card and following statement positions stay unchanged while the shadow can fade naturally.
   - Post-fix evidence: the 923 × 998 focused capture shows the shadow diffusing continuously below the card and controls; measured card-to-clip space increases from 84 px to 160 px, while horizontal overflow remains zero.
23. Round 22 found the 900 px-and-below single-column circle layout creating oversized cards and excessive vertical whitespace near the tablet breakpoint.
   - Fix: introduced a 721–900 px triangle composition with one centered upper circle and two lower circles, capped every tablet circle at 348 px, replaced percentage padding with bounded responsive padding, and reduced the 720 px-and-below single-column maximum from 540 px to 440 px.
   - Post-fix evidence: at 887 × 994 all three circles measure approximately 347 px and form the requested centered triangle; at 721 px all three remain equal at approximately 315 px; at 390 px the single-column circles resolve to 350 px. Every checked card reports matching client and scroll heights, horizontal overflow remains zero, and the browser console contains no warning or error.
24. Round 24 found the diagnosis comparison and coaching cards stretching to the full content width at tablet sizes, while the Ceal-before connector geometry depended on fixed mobile dimensions.
   - Fix: split the responsive contract into a 721–900 px tablet band and a 720 px-and-below mobile band. Tablet diagnosis cards now retain capped 430/620 px widths, coaching cards retain the desktop-scale 348 px two-plus-one composition, and the Ceal diagrams remain centered within a 680 px maximum. Mobile explicitly resets those caps to a single fluid column with the existing side gutters. The Ceal-before rails now scale as one proportional 3.125:1 geometric unit so their dashed endpoints stay attached to the translated HTML labels instead of relying on raster artwork or fixed-height calculations.
   - Post-fix evidence: at 887 × 994 the diagnosis cards measure approximately 430/620 px, all coaching cards measure approximately 348 px in a two-plus-one layout, and each Ceal figure measures approximately 679 px. At 390 × 844 the diagnosis cards, coaching cards, and Ceal figures all resolve to the 350 px content width with 20 px side gutters. The 721/720 px boundary switches cleanly from capped tablet layouts to full-width mobile layouts, and every checked viewport reports `scrollWidth === innerWidth`.
25. Round 25 found the Section 1-2 statement approaching the first team member on MacBook-class desktop viewports.
   - Fix: introduced a 1151–1800 px portrait-safe band that reduces the statement from 40 px to a responsive 30–36 px, tightens its fixed three-line measure to 420 px, reserves 60% of the shell for the photograph, and shifts the photograph right by a bounded 18–32 px. The existing wide-desktop, protected tablet, and stacked mobile compositions remain unchanged.
   - Post-fix evidence: at 1728 × 1000 the statement resolves to 36 px with a 371 px rendered width and ends at x=635, while the first portrait begins to its right with a visible safety gutter; at 1280 × 720 it resolves to 30.08 px and ends at x=350 with substantially more open space before the portrait. Both captures preserve the authored three lines and report zero horizontal overflow; the 538 px mobile composition remains stacked with the photograph and copy fully separated.
26. Round 26 found the highlighted slowdown phrase wrapping unpredictably on mobile instead of following the authored four-line rhythm.
   - Fix: split only the two highlighted desktop lines into canonical phrase segments and switch their separating spaces to explicit line breaks at 720 px and below. The copy, heading level, desktop four-line layout, and gradient treatment remain unchanged.
   - Post-fix evidence: at 538 × 998 the highlighted phrase renders exactly `적절한 과제 선정,` / `구성원 역량 향상,` / `조직 환경 구축이` / `모두 필요합니다.`; at 1280 × 720 the same content remains the existing two highlighted lines. Both viewports report zero horizontal overflow.
27. Round 27 requested mobile-specific reading rhythms for the champion-coaching description and the environment heading.
   - Fix: introduced one shared responsive-line renderer that switches only authored phrase separators at 720 px and below. The coaching copy now separates `실무자는 AX 코치로부터` before merging the remaining sentence with the final outcome, while the environment emphasis expands from two desktop lines to the requested four mobile lines. Copy, heading semantics, gradient emphasis, and desktop line breaks remain unchanged.
   - Post-fix evidence: at 580 × 998 the coaching description and environment heading expose the requested logical line breaks with zero horizontal overflow; at 1280 × 720 both blocks retain their existing four-line desktop text contract exactly.

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
