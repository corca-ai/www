---
title: Contributing
---

# Contributing

This is the contribution hub for the Corca website. The site is a static Astro
build served on Cloudflare Workers, and the rest of the project docs live under
`docs/`; start at [the docs index](index.md) when you need wider context.

## Start from the right doc

Use [development](development.md) for local commands, [architecture](architecture.md)
for the route and Worker layout, [runbook](runbook.md) for routine news, blog
and page edits, [products](products.md) for product page ownership, and
[i18n](i18n.md) for translations and localized content. Quality gates and hook
details are centralized in [code quality](code-quality.md).

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

## Run the gates

Before opening a pull request, run:

```sh
pnpm check
```

This runs Biome, `astro check`, knip, duplication checks and docs linting. For a
final static-build check, run `pnpm build`. The local pre-commit hook formats and
checks staged code/docs, while the pre-push hook runs the same gate set that CI
uses. If the native `nose` or `awiki` binaries are missing locally, the hook can
warn and continue; CI installs them and enforces those gates. See
[code quality](code-quality.md) for the full gate definitions.

## Open a pull request

Push the branch and open a pull request into `main`:

```sh
git push -u origin your-branch-name
```

`main` is protected, so direct pushes are rejected. A pull request can merge only
after the required CI jobs are green. The CI jobs call the same `check:*` scripts
as the local hooks, so a clean `pnpm check` is the best local predictor of a
green pull request.

## Merge and deploy

Merge once the required gates pass. No separate reviewer is required unless the
change itself needs product, content or design approval. Deployment is a manual
step after merge; use `pnpm run deploy` and make sure Wrangler is authenticated
for the Corca Cloudflare account. See the [deployment guide](deployment.md) for
details.
