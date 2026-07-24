# AI Colleague Localization Debug Review
Date: 2026-07-24

## Problem

The `we-make-ai-colleague` detail page appears in Korean under the English,
Japanese, and Chinese routes instead of showing localized article content.

## Correct Behavior

Given a published Korean Notion post and successful locale generation, when a
reader opens the EN, JA, or ZH detail route, then the page should render that
locale's translated title, description, and article body.

## Observed Facts

- User report: EN, JA, and ZH routes for `we-make-ai-colleague` show Korean.
- The target branch is `agent/fix-ai-colleague-localization`, created from the
  current local and remote `main` at `6fdab920`.
- All three translation artifacts contain localized title, description, and
  trailing article HTML, so the translation provider completed its work.
- All three artifacts also carry `sourceFormat: markdown` and the original
  Korean `sourceMarkdown`.
- `parsePostSource` preferred `sourceMarkdown` over the artifact's translated
  HTML, which recreated Korean article bodies and localized search text.
- This is the only post whose translation artifacts have the Markdown metadata
  shape; the same-layer scan found no second post with this exact failure mode.
- The Notion workflow runs `pnpm notion:publish`; its upsert path calls
  `writePostTranslations` with automatic translation enabled by default.

## Reproduction

- Compared `public/blog/admin/post-sources/we-make-ai-colleague.html`,
  all three files under `post-translations`, and their generated detail pages.
- Translation artifact article HTML contained zero Hangul characters, while
  each generated locale page body contained about 1,060 Hangul characters.
- A fixture upsert of a Markdown post reproduced the metadata leak: generated
  translations retained `sourceFormat` and source-language `sourceMarkdown`.

## Candidate Causes

- Target translation artifacts are absent or contain copied Korean content.
- Correct translation artifacts exist, but localized static rendering reads the
  Korean source for this slug.
- The post predates or bypassed the Notion translation automation, so later
  synchronization preserved a legacy Korean fallback.
- Translation generation was disabled or failed through an environment/provider
  branch without a gate detecting untranslated output.

## Hypothesis

- Confirmed: copied Markdown metadata on translated artifacts overrides the
  correctly translated HTML at the translation-artifact/parser boundary.
- The original candidate that translation artifacts contained Korean fallback
  content was falsified by inspecting their translated trailing HTML.

## Verification

- Result: confirmed and fixed.
- Added a fixture assertion that translated Markdown artifacts omit
  `sourceFormat` and `sourceMarkdown`.
- Added a final-consumer assertion scoped to `.article-content` so each
  localized static page must render the translated fixture heading.
- Added an English-source Markdown fixture to cover the source-locale branch.
- Added a repository regression assertion that the target EN/JA/ZH pages do not
  contain the Korean opening sentence.
- `npm run blog:content:check` passes after the change.

## Root Cause

`translatePostSource` spread the original post metadata into every translated
post. For a Markdown-origin Notion post, that copied the Korean
`sourceMarkdown`. `renderPostSource` then persisted both that Korean Markdown
and the translated HTML. Later, `parsePostSource` treated the Markdown metadata
as authoritative and discarded the translated HTML for static rendering.

## Invariant Proof

- Invariant: when translation generation produces locale content, each locale
  source must reach its corresponding index and static detail-page consumer.
- Producer Proof: future translated posts strip original Markdown metadata and
  persist translated HTML as the locale source, including when the post's
  original language already matches a target locale.
- Final-Consumer Proof: translation artifacts are always parsed from their
  reader-facing HTML; sync also migrated the three existing target artifacts
  to that canonical metadata shape.
- Interface-Shape Sibling Scan: only `we-make-ai-colleague` has Markdown-format
  translation metadata across EN, JA, and ZH.
- Non-Claims: no live Notion provider request or deployed production route was
  exercised; the local automation fixture and generated artifacts were tested.

## Detection Gap

The content check asserted localized titles but only searched the page for an
unqualified title substring. It did not assert translated article content or
the locale-artifact metadata contract, so a localized shell and title masked a
Korean article body.

## Sibling Search

- Mental model: a localized route was assumed to prove localized content.
- same layer: scanned every EN/JA/ZH translation artifact for Markdown metadata.
- abstraction up: verified Notion publishing reaches automatic translation.
- specialization down: checked title, description, artifact HTML, generated
  body, and locale search text separately.
- cross-file: added producer metadata and static final-consumer checks.

## Seam Risk

- Interrupt ID: ai-colleague-localization
- Risk Class: none
- Seam: Notion source to translation artifact to localized static page
- Disproving Observation: translated target artifacts paired with Korean output.
- What Local Reasoning Cannot Prove: live provider behavior until an automation
  fixture or provider-backed run is executed.
- Generalization Pressure: monitor

## Interrupt Decision

- Resolution: resolved
- Critique Required: yes
- Next Step: prove
- Handoff Artifact: none

## Prevention

- Keep editable Markdown on the original post only.
- Treat translated HTML as the locale artifact's authoritative reader source.
- Test both the producer metadata shape and final rendered localized article.
