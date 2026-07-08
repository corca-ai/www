# Debug Review
Date: 2026-07-08

## Problem

In the blog admin Markdown editor, inserting a body image does not show the image in the Markdown preview/editor preview.

## Correct Behavior

Given an admin edits a Markdown post, when they insert an uploaded body image through the custom `+IMG` control or Toast UI image control, then the editor content should include image Markdown, the preview should display the selected local image before save, and the saved payload should still reference the deployable `assets/admin-posts/...` path.

## Observed Facts

- User reported that image insertion in Markdown format does not show images in Markdown preview.
- The admin UI has two editor surfaces: a hidden source textarea/manual preview and a Toast UI Markdown editor.
- Previous related incident in this PR fixed blog/admin post-index loading by moving read paths to `/blog/index.json`.

## Reproduction

- Source inspection showed `bodyImageInput` always called `insertOrReplaceImageMarkdown(...)`, which mutates `contentInput` and manual preview only.
- Source inspection showed `updateMarkdownPreview()` exits early when Toast UI is active, so the manual preview updated by `insertOrReplaceImageMarkdown(...)` is hidden/reset.
- Source inspection showed Toast UI's own `addImageBlobHook` inserted `/blog/assets/...` first and depended on a single async DOM refresh to replace that not-yet-uploaded URL with the local blob preview.

## Candidate Causes

- Confirmed: custom image upload path updated the hidden textarea while Toast UI was the visible Markdown editor.
- Confirmed: Toast preview image refresh was timing-sensitive and could run before Toast UI rendered its image DOM.
- Disconfirmed: final post generation image handling is not the immediate preview failure; `apply-admin-post-change.js` already accepts `bodyImages` and writes `assets/admin-posts/...`.

## Hypothesis

- Claim type: attribution.
- Candidate claim: the visible Toast UI preview misses uploaded images because custom uploads bypass Toast insertion, and Toast image DOM replacement only runs once.
- disconfirmer: inspect `bodyImageInput` and Toast image hook control flow, then verify the fix updates Toast content and retries preview image refresh while preserving source `assets/admin-posts/...` paths.
- Result: confirmed by source inspection and implemented control-flow change.

## Verification

- `node --check public/blog/admin/admin.js` passed.
- `python3 /Users/koleuka/.codex/plugins/cache/charness/charness/0.62.0/scripts/validate_debug_artifact.py --repo-root .` passed.
- `npm exec pnpm@10.22.0 -- run check` passed; only existing deprecation hints were reported.
- `npm run build` passed.

## Root Cause

The admin editor kept two Markdown surfaces in sync, but the custom image upload path only wrote to the hidden source textarea. When Toast UI was active, the visible editor and its preview did not receive the inserted image Markdown. Toast UI image insertion also rendered a deploy path before save, so the code had to replace rendered image nodes with local blob URLs; the refresh was scheduled only once and could miss Toast's render timing.

## Invariant Proof

- Invariant: inserted body images must update the currently visible Markdown editor and preview while preserving deployable source Markdown paths.
- Producer Proof: `prepareBodyImage(...)` still produces `path: assets/admin-posts/...` and `previewSrc: blob:...`.
- Final-Consumer Proof: custom upload now inserts into Toast UI when active; source sync still converts Toast `/blog/assets/...` or blob URLs back to `assets/...`.
- Interface-Shape Sibling Scan: Toast UI hook and custom `+IMG` now both schedule repeated preview image refreshes.
- Non-Claims: no authenticated production browser roundtrip was run in this session.

## Detection Gap

- `node --check`/build | syntax only, no editor interaction coverage | add focused UI/e2e coverage for Markdown image insertion if this surface keeps changing.
- Manual preview checks | custom textarea preview and Toast preview were treated as equivalent | fix updates the visible editor path directly.

## Sibling Search

- Mental model: updating the source textarea is equivalent to updating the visible Markdown editor.
- same layer: `bodyImageInput` custom upload path | decision: same bug, fix now | proof: source inspection.
- same layer: Toast `addImageBlobHook` preview replacement | decision: same class, diagnostic-only for this slice | proof: source inspection; fixed with retry refresh.
- abstraction up: saved payload extraction from `pendingBodyImages` | decision: intentional boundary, no change | proof: source path remains `assets/admin-posts/...`.
- cross-file: `scripts/apply-admin-post-change.js` body image handling inspected as final consumer.

## Seam Risk

- Interrupt ID: admin-markdown-image-preview
- Risk Class: none
- Seam: Toast UI editor DOM render timing
- Disproving Observation: source-level fix and syntax checks only
- What Local Reasoning Cannot Prove: exact production browser timing after Toast UI CDN load
- Generalization Pressure: none

## Interrupt Decision

- Resolution: resolved
- Critique Required: no
- Next Step: impl
- Handoff Artifact: none

## Prevention

- Keep editor mutations routed through the visible editor when Toast UI is active.
- Retry Toast preview blob substitution across short render delays instead of assuming one DOM pass is enough.
