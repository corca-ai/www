# Debug Review
Date: 2026-07-09

## Problem

Notion HTML uploads can publish, but standalone HTML visual blocks such as callout frames, notes, highlighted questions and code-like `pre` blocks look flattened in the Corca blog shell.

## Correct Behavior

Given a trusted Notion `.html` upload contains article-local HTML patterns, when the blog renderer extracts and publishes the article body, then the meaningful body structure should remain visible in the public blog style system without requiring arbitrary document-level CSS injection.

## Observed Facts

- The uploaded sample at `/Users/koleuka/Downloads/ceal-terview-moon-jungmin-newcomer-adaptation-classic.html` has document-level CSS for `.frame`, `.intro-question`, `.note`, `.closing`, `.eyebrow`, `.meta` and raw `<pre>`.
- The live page `https://www.borca.ai/blog/corca-newbie-trip` contains those classes and `<pre>` blocks, so the body HTML was not lost.
- `parsePostHtml()` and `parsePostSource()` intentionally extract `<article>`/`<main>`/`<body>` content; the original `<head><style>` is not carried into the public article.

## Reproduction

- Inspect the uploaded HTML and live page output: the semantic classes and raw `<pre>` are present, but the uploaded stylesheet is absent.
- Inspect `public/blog/styles.css`: generic article styles existed, but no compatibility styles for the uploaded standalone HTML classes.
- Inspect CSS cascade: the late `.article-content code` rule could override `pre code` reset styling for generated Markdown code blocks.

## Candidate Causes

- Confirmed: article extraction drops the uploaded document stylesheet, leaving recognized classes without matching blog styles.
- Confirmed: code block styling had an ordering issue where inline-code styling could leak into `pre code`.
- Disconfirmed: Notion HTML upload parsing did not remove the relevant body markup; the live/static HTML still includes it.

## Hypothesis

- Claim: adding a constrained blog CSS compatibility layer for trusted HTML-upload body patterns will restore visible structure while avoiding arbitrary `<style>` injection.
- Disconfirmer: run Notion HTML fixture through the publish path and assert the structure is preserved plus the public stylesheet contains the compatibility rules.
- Result: confirmed.

## Verification

- `npm run notion:check` passed.
- `npm run blog:content:check` passed.
- `npm exec pnpm@10.22.0 -- run check` passed with existing Astro deprecation hints only.
- `npm run build` passed.
- `git diff --check` passed.

## Root Cause

The publishing pipeline treated standalone HTML uploads as article body HTML, not as a complete self-contained document. That is the right public-site boundary, but the blog stylesheet did not provide equivalents for common authored HTML patterns from the uploaded document, so the visual grouping and code-block affordances were flattened.

## Invariant Proof

- Invariant: trusted HTML upload structure stays in the article body, while public styling comes from the Corca blog stylesheet.
- Producer Proof: the Notion fixture now includes `.frame`, `.intro-question`, `.note` and raw `<pre>` in the HTML upload path.
- Final-Consumer Proof: the generated static page preserves those classes and `public/blog/styles.css` defines corresponding article styles.
- Interface-Shape Sibling Scan: Markdown `pre code` styling is also reset after the late inline-code rule.
- Non-Claims: no production deploy or visual browser screenshot was completed in this slice.

## Detection Gap

- `notion:check` | previously covered HTML upload publication but not styled standalone HTML patterns | fixture now includes authored callout and code-like blocks.
- CSS cascade | no automated visual assertion | added structural/style-selector assertions as the cheapest durable guard.

## Sibling Search

- Mental model: preserving HTML tags is enough to preserve authored presentation.
- same file: `.article-content pre code` cascade | decision: fix now | proof: late reset added after inline-code rule.
- same path: `.frame`/`.note`/`.intro-question` classes | decision: fix now | proof: fixture and CSS selector assertions.
- cross-file: `scripts/notion-publish-check.js` | decision: broaden fixture | proof: Notion check passes with HTML-upload compatibility assertions.

## Seam Risk

- Interrupt ID: notion-html-upload-visual-compat
- Risk Class: none
- Seam: standalone document CSS to public blog stylesheet
- Disproving Observation: the body markup existed in live/static output; missing public styles explain the visible flattening.
- What Local Reasoning Cannot Prove: exact post-deploy visual appearance on the production CDN before merge.
- Generalization Pressure: none

## Interrupt Decision

- Resolution: resolved
- Critique Required: no
- Next Step: impl
- Handoff Artifact: none

## Prevention

Keep Notion HTML upload fixtures representative of authored standalone HTML blocks, and prefer constrained blog CSS compatibility over injecting arbitrary uploaded document styles.
