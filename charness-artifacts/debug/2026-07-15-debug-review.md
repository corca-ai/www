# Blog GA Slug Page Views Debug Review
Date: 2026-07-15

## Problem

After PR #89 was merged and applied, visits to `/blog/{slug}` increase only the `/blog` page-view count in GA instead of the per-slug path.

## Correct Behavior

Given a reader opens `/blog/{slug}`, when the blog initializes analytics, then GA receives one `page_view` whose `page_path` is `/blog/{slug}`.

## Observed Facts

- User report: visiting individual posts increases `/blog` views, while `/blog/{slug}` does not increase.
- Local and remote `main` both point to merge commit `89507cd`, which contains PR #89.
- The deployed post HTML contains `corca-analytics-config` and `/blog/app.js`, but no `#postList` element.
- The deployed app calls `renderPosts()` before `initAnalytics()`; `renderPostList()` dereferences `postList.classList` without a null guard.
- Live GA ingestion has not been inspected; the browser never reaches the code that would initialize it on a static post page.

## Reproduction

- Confirmed on deployed `/blog/we-make-ai-colleague`: the static page lacks `#postList`; the app calls `renderPosts()` first, which dereferences that missing element before `initAnalytics()`.

## Candidate Causes

- Analytics initialization is coupled behind list-only rendering that throws on static post DOM. (confirmed)
- Static post HTML or history normalization rewrites the browser path to `/blog` before tracking. (disconfirmed: tracking is never initialized)
- GA reporting canonicalizes or groups a correctly emitted slug. (disconfirmed as primary cause: no slug event is emitted)

## Hypothesis

- Confirmed: static post initialization throws in `renderPosts()` before `initAnalytics()`. | disconfirmer: deployed HTML and app-source probe showing the post has `#postList`, or that analytics initializes first; neither was true.

## Verification

- Confirmed by deployed HTML/source inspection and a local deterministic precondition probe: `hasList=false`, `renderBeforeAnalytics=true`, `renderPostListDereferences=true`.

## Root Cause

Analytics was placed inside an async UI bootstrap after index-only rendering. Static post pages reuse `app.js` but not the index DOM, so an unrelated list-rendering exception prevented the analytics subsystem from initializing.

## Invariant Proof

- Invariant: when the blog router selects a slug, its final analytics consumer must receive that slug path before the workflow claims the page view was tracked.
- Producer Proof: the built static post emits `CORCA_GA_MEASUREMENT_ID=G-SZY1B11LXS` before loading `app.js`, and the app now calls `initAnalytics()` before any list UI work.
- Final-Consumer Proof: an executed VM harness for `/blog/we-make-ai-colleague` captured one queued `page_view` with the exact slug in `page_path` and `page_location`.
- Interface-Shape Sibling Scan: all 60 generated app pages share the bootstrap; the build validates analytics initialization precedes list UI initialization.
- Non-Claims: the browser plugin failed to initialize in this host, and live GA provider ingestion/report aggregation was not proven.

## Detection Gap

- `scripts/sync-blog-shell-assets.js` build gate | it proved config injection but not that the consumer could reach analytics initialization | assert the analytics bootstrap precedes list UI bootstrap.
- Full project checks | syntax/types cannot detect a shared script dereferencing DOM absent from static pages | keep the build-order assertion plus the static-post payload harness evidence.

## Sibling Search

- Mental model: enabling analytics proves route attribution without testing direct-load and client-navigation paths separately.
- same layer: `public/{blog,en/blog,ja/blog,zh/blog}/<slug>/index.html` | decision: same bug, fix now | proof: build configured 60 pages and the shared guard applies before UI bootstrap.
- abstraction up: `scripts/apply-admin-post-change.js:1298` static-post renderer | decision: same class, diagnostic-only for this slice | proof: static scan confirms it emits a static post shell without the index list DOM | no action needed: already covered by the shared app guard for every generated static post.
- specialization down: `public/blog/index.html:121` list shell | decision: same class, diagnostic-only for this slice | proof: local build confirms it retains `#postList`, runs `init()`, and path de-duplication prevents a second `/blog` event.
- cross-file: `scripts/sync-blog-shell-assets.js:16-27` owns the deploy-time consumer reachability assertion.

## Seam Risk

- Interrupt ID: blog-ga-slug-attribution
- Risk Class: none
- Seam: blog route state to GA event payload
- Disproving Observation: deployed HTML had the GA config but the shared app threw before analytics initialization, disproving config presence as end-to-end evidence.
- What Local Reasoning Cannot Prove: live GA provider ingestion and report aggregation.
- Generalization Pressure: none

## Interrupt Decision

- Resolution: resolved
- Critique Required: yes
- Next Step: impl
- Handoff Artifact: none

## Prevention

Initialize analytics before page-specific UI, skip list bootstrap when `#postList` is absent, and fail production builds if that ordering regresses. The blog runbook now records the static-post/list-shell boundary.
