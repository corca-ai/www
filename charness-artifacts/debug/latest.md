# Debug Review
Date: 2026-07-10

## Problem

At 350–640px wide, post-list thumbnails are cropped vertically instead of showing the full image.

## Correct Behavior

Given a 350–640px viewport, when a reader views the post list, then each thumbnail follows its intrinsic image ratio and shows the full image without side gutters or vertical cropping.

## Observed Facts

- `public/blog/app.js` supplies 1672×941 post images, approximately 16:9.
- The base `.post-card img` rule uses a 16:9 frame with `object-fit: contain`.
- The 640px media rule overrides that to 16:7, caps the height at 168px, and uses `object-fit: cover`.

## Reproduction

- View a post-list card at any width from 350px to 640px; the 16:7 frame crops a 16:9 source vertically.

## Candidate Causes

- The mobile-only 16:7 aspect ratio is wider than the post-image source frame.
- The mobile-only `object-fit: cover` crops the source to fill that wider frame.
- A stale stylesheet cache could preserve an old rule after deployment.

## Hypothesis

- Initial claim: removing the mobile-only crop override is sufficient. | result: disconfirmed by the existing 1360×326 cover, which still letterboxes in a fixed 16:9 frame.
- Refined claim: a final 640px rule with `height: auto` and `aspect-ratio: auto` lets each mobile list image use its intrinsic ratio. | disconfirmer: inspect the final cascade and the known wide cover dimensions.

## Verification

- Confirmed: the old 16:7 crop rule is gone and the final 640px media block overrides later fixed-ratio declarations with `height: auto` and `aspect-ratio: auto`.
- Confirmed: `corca-team-page-figure-01.webp` is 1360×326, exercising the non-16:9 case that would otherwise letterbox.
- Confirmed: every public HTML page now references the updated stylesheet cache version.
- `npm exec pnpm@10.22.0 -- run blog:content:check` passed.
- `npm exec pnpm@10.22.0 -- run check` and `npm exec pnpm@10.22.0 -- run build` passed.

## Root Cause

The mobile card override optimized for a shorter visual frame instead of the cover asset's actual shape. Its 16:7 ratio and `cover` fit cropped normal covers; merely falling back to the shared fixed 16:9 frame left side gutters for permitted wide covers.

## Invariant Proof

- Invariant: mobile post-list image height follows each cover's intrinsic ratio.
- Producer Proof: deployed covers include both normal 16:9 images and a 1360×326 wide image.
- Final-Consumer Proof: the final mobile rule applies `height: auto` and `aspect-ratio: auto` after all fixed-ratio post-card declarations.
- Interface-Shape Sibling Scan: adjacent-post thumbnails and hero images are separate components with their own intentional frames.
- Non-Claims: visual browser proof has not run in this host.

## Detection Gap

- Responsive CSS | syntax and static-generation gates did not assess image geometry at the 350–640px breakpoint | the smallest durable guard is a browser visual regression scenario for a non-16:9 cover.

## Sibling Search

- Mental model: a shorter mobile thumbnail frame is harmless when every cover is treated as interchangeable.
- same layer: `public/blog/styles.css` post-card image rules | decision: same bug, fix now | proof: static cascade scan confirms the final mobile intrinsic-ratio override wins.
- abstraction up: `public/blog/styles.css` hero image 16:7 crop | decision: intentional plain-text or non-rendering boundary | proof: static scan; it is a hero, not a list thumbnail.
- specialization down: `public/blog/styles.css` adjacent-post thumbnail | decision: same class, diagnostic-only for this slice | proof: static scan; it already uses a 16:9 card frame and is outside the reported list view.
- cross-file: `public/blog/app.js` post-list image dimensions | decision: same class, diagnostic-only for this slice | proof: static scan; the attributes reserve fallback geometry, while the loaded image's intrinsic ratio owns the final mobile display.

## Seam Risk

- Interrupt ID: mobile-thumbnail-aspect-ratio
- Risk Class: none
- Seam: post metadata image dimensions to responsive card CSS
- Disproving Observation: a fixed 16:9 fallback still letterboxes the existing wide cover, so the final mobile intrinsic-ratio override is required.
- What Local Reasoning Cannot Prove: actual rendered image framing in a browser.
- Generalization Pressure: none

## Interrupt Decision

- Resolution: resolved
- Critique Required: yes
- Next Step: impl
- Handoff Artifact: none

## Prevention

Let mobile post-list thumbnails follow the intrinsic cover ratio. Treat any future fixed mobile crop as an explicit visual-design decision with a viewport render check. Parent-delegated problem-framing, mobile-UI and counterweight reviews confirmed the intrinsic-ratio fix and kept featured/related imagery out of scope.
