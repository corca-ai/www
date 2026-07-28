---
title: Contributing
---

# Contributing

This is the contribution hub for the Corca website. The site is a static Astro
build served on Cloudflare Workers. Start at the [docs index](index.md) when you
need the full documentation map; use this page for the branch, pull request,
quality gate and merge-to-deploy handoff.

## Start from the right doc

Use [development](development.md) for local commands. Use [Code quality](code-quality.md)
for exact gate definitions. Content and configuration recipes live in the
[runbook](runbook.md). See [Product pages](products.md) for product page ownership.

## Local workflow

Install dependencies with `pnpm install`, then branch from an up-to-date `main`:

```sh
git switch main
git pull
git switch -c your-branch-name
```

Use a focused branch for each change. Keep unrelated refactors, generated assets
and content edits out of the branch unless they are needed for the same outcome.

## Make the change

Follow the existing ownership boundaries. Shared layouts and navigation live in
`src/layouts/` and `src/components/`; static and product routes are described in
[architecture](architecture.md) and [products](products.md); routine content
changes should follow the recipes in [runbook](runbook.md). When adding docs,
give the page frontmatter with a `title` and link it from this hub, the docs
index, or the nearest topic page so `awiki` keeps the documentation graph
connected.

## Continuity documentation

The copy-ready new-task prompts in the [site and AX V2 handoff](handoffs/2026-07-28-corca-site-handoff.md)
are a stable entry procedure, not a release log. Do not rewrite them for every
routine pull request. Each new task fetches `origin`, verifies the handoff
anchor and reads the relevant later Git diff instead.

Before opening a pull request, decide whether its change creates a durable
fact future work needs: route or component ownership, design-system behavior,
SEO or i18n policy, local setup, deployment behavior, or a regression risk.
Update the nearest canonical `docs/` page when it does; update the site handoff
when the fact affects starting or continuing site-wide work. Record the
documentation decision, changed paths, validation and any remaining risk in
the pull request summary. A pull request with no durable documentation impact
should explicitly say why no documentation update is needed.

When editing the canonical handoff Markdown, regenerate its adjacent HTML:

```sh
pnpm handoff:render docs/handoffs/2026-07-28-corca-site-handoff.md
```

Markdown and Git history remain authoritative. The generated HTML is for human
review, and full repository patches are local audit material rather than files
to commit.

## Run the gates

Before opening a pull request, run:

```sh
pnpm check
```

This runs Biome, `astro check`, knip, duplication checks and docs linting. For a
final static-build check, run `pnpm build`. Running `pnpm check` locally requires
the native `nose` and `awiki` binaries described in [Code quality](code-quality.md).
The local hooks can warn and continue when those binaries are missing, but CI
installs and enforces them. CI also runs `pnpm build`, so a branch that passes
`pnpm check` but breaks the static build can still fail CI.

## Open a pull request

Push the branch and open a pull request into `main`:

```sh
git push -u origin your-branch-name
```

`main` is protected, so direct pushes are rejected. A pull request can merge only
after the required CI jobs are green. The CI jobs call the same `check:*` scripts
as the local hooks, so a clean `pnpm check` is the best local predictor of a
green pull request.

For content, product or localization pull requests, include the relevant preview
URLs, note which locales changed, confirm where images live, and call out any SEO
title/description updates. Ask for product, content, localization or design input
when the change changes meaning, positioning or visual direction.

## Merge and deploy

Merge once the required gates pass. No separate reviewer is required unless the
change itself needs product, content or design approval. Merging to `main`
deploys automatically: Cloudflare's GitHub integration builds and publishes the
site, so a merged pull request is a release — treat it as one, and there is no
manual deploy step in the normal flow. See the [deployment guide](deployment.md)
for what to check after merge and for the manual `pnpm run deploy` fallback.
