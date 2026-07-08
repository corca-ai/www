# Debug Review
Date: 2026-07-08

## Problem

www.borca.ai blog list loading fails with a 404 and `Uncaught (in promise) TypeError: Cannot set properties of null (setting 'href')` at `showList` in `public/blog/app.js`; the blog admin post list also fails after login with `Failed to load resource: the server responded with a status of 502 ()`.

## Correct Behavior

Given a visitor opens `/blog`, when the blog script initializes, then it should load the static post index, render posts, and update optional feed/share links only when the corresponding DOM nodes exist. Given an authenticated admin opens `/blog/admin`, when the admin UI requests `/api/admin/posts`, then the Worker should read the same static post index without hitting legacy article redirects.

## Observed Facts

- User reported console errors: `Failed to load resource: the server responded with a status of 404 ()` and `app.js:1599 Uncaught (in promise) TypeError: Cannot set properties of null (setting 'href')`.
- User then reported the admin page still has no post list and logs `Failed to load resource: the server responded with a status of 502 ()`.
- Blog architecture expects public reads from static `/blog/posts/index.json`.
- Investigation is on `agent/fix-blog-loading` branched from updated `main`.

## Reproduction

- Production `curl -I https://www.borca.ai/blog/posts/index.json` returned `301` to `/blog/index.json`.
- Production `curl -L https://www.borca.ai/blog/posts/index.json` returned the blog 404 HTML, not JSON.
- Source inspection showed `_redirects` maps `/blog/posts/:slug` to `/blog/:slug`, so `index.json` was treated as a slug.
- Source inspection showed `showList()` assigns `skipLink.href`, but the generated shell skip link has no `.skip-link` class.
- Source inspection showed `worker/index.ts` still read `/blog/posts/index.json` for authenticated `GET /api/admin/posts`, and returns `502` when the asset response is not OK.

## Candidate Causes

- Confirmed: static post index path was redirected incorrectly, producing the 404 before rendering.
- Confirmed: `showList()` assumed `.skip-link` exists, but the generated shell exposes only `body > a[href="#main"]`.
- Confirmed: admin post list used the same redirect-conflicted post index path through the Worker ASSETS binding.
- Disconfirmed for the primary failure: locale shell divergence was not required; the Korean `/blog/posts/index.json` path also redirected to a missing alias.

## Hypothesis

- Claim type: attribution.
- Candidate claim: `/blog/posts/:slug` redirects capture `index.json`, and the missing redirect target plus missing skip-link class cause the observed public 404/null error; the Worker admin list endpoint reuses the same conflicted asset path and therefore can return 502 after authentication.
- disconfirmer: production `curl -I`/`curl -L` for `/blog/posts/index.json`, source grep for `.skip-link` and generated blog shell skip link, source grep for Worker admin asset reads, then local alias HEAD checks after the fix.
- Result: confirmed.

## Verification

- `npm run blog:admin:check` passed.
- `npm run notion:check` passed.
- `node --check public/blog/app.js` passed.
- `curl -I http://127.0.0.1:8097/{blog,en/blog,ja/blog,zh/blog}/index.json` returned `200 OK` for all four aliases.
- `npm run build` passed and produced `dist/{blog,en/blog,ja/blog,zh/blog}/index.json`.
- `npm exec pnpm@10.22.0 -- run check` passed; only existing deprecation hints were reported.
- Follow-up admin fix changed `worker/index.ts` to read `/blog/index.json` for `GET /api/admin/posts`.

## Root Cause

The public app and admin Worker list endpoint fetched `/blog/posts/index.json`, but production redirect rules treat `/blog/posts/:slug` as legacy article URLs. That rule captured `index.json` and redirected to `/blog/index.json`, which did not exist. The public init catch path then called `showList()`, where `skipLink` was `null` because generated blog HTML did not include `.skip-link`, causing the reported uncaught promise rejection. The admin endpoint returned `502` because its asset read was not OK.

## Invariant Proof

- Invariant: public post-list data URLs must not share the legacy article redirect namespace.
- Producer Proof: `scripts/apply-admin-post-change.js` now writes both `posts/index.json` and `index.json` for all locales.
- Final-Consumer Proof: `public/blog/app.js` now reads `appPath("/index.json")` first, and `worker/index.ts` now reads `/blog/index.json` for admin lists; local server HEAD checks proved all four aliases exist.
- Interface-Shape Sibling Scan: blog shell skip links are selected by `.skip-link` or `body > a[href="#main"]`, and assignment is guarded.
- Non-Claims: in-app browser automation was unavailable in this session; no visual browser screenshot is claimed.

## Detection Gap

- `scripts/admin-post-change-check.js` and `scripts/notion-publish-check.js` | checked `posts/index.json` but not the public app alias path that avoids `_redirects` | added deep equality assertions for root and locale `index.json` aliases.
- `worker/index.ts` admin path | reused the legacy public post index path after the public app moved to the alias | updated admin API to consume `/blog/index.json`.
- Static route check | no check caught `_redirects` capturing a data file path | prevention is to keep the app's primary fetch under `index.json`, outside the legacy article namespace.

## Sibling Search

- Mental model: public data files can live under the same path segment as legacy article redirects without being captured.
- same layer: `public/_redirects:13-16` legacy `/blog/posts/:slug` rules | decision: same bug, fix now through non-conflicting public alias | proof: production curl plus source inspection.
- abstraction up: generated post index writers in `scripts/apply-admin-post-change.js` | decision: same bug, fix now by writing alias files for all locales | proof: admin and Notion checks.
- mental-model sibling: `public/blog/app.js` assumed optional shell DOM existed on failure | decision: same bug, fix now by selecting the generated skip link and guarding writes | proof: static shell inspection and JS syntax check.
- same layer: `worker/index.ts` admin list asset read | decision: same bug, fix now by switching to `/blog/index.json` | proof: source grep and user-reported 502 matches the endpoint's non-OK asset response branch.
- cross-file: `scripts/admin-post-change-check.js` and `scripts/notion-publish-check.js` now assert alias parity outside the subject file.

## Seam Risk

- Interrupt ID: blog-static-dom-contract
- Risk Class: none
- Seam: static HTML shell to client script selectors
- Disproving Observation: none
- What Local Reasoning Cannot Prove: none
- Generalization Pressure: none

## Interrupt Decision

- Resolution: resolved
- Critique Required: yes
- Next Step: impl
- Handoff Artifact: none

## Prevention

- Keep public app data reads on `/blog/index.json` and locale equivalents, outside `/blog/posts/:slug`.
- Keep admin Worker list reads on `/blog/index.json` too, so public and admin consumers share the redirect-safe post index.
- Generate and test `index.json` aliases together with `posts/index.json` for admin and Notion publishing flows.
- Guard optional shell DOM writes in failure paths so the recovery UI cannot mask the original network failure with a second exception.
- Repair-risk critique completed inline: alias drift and cached app.js were the main risks; generator assertions and script URL cache busting mitigate them.
