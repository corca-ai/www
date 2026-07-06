---
title: Deployment
---

# Deployment

The site runs on Cloudflare Workers (Static Assets) in the Corca account and
deploys **automatically on merge to `main`**. Cloudflare's GitHub integration
(Workers Builds) watches the repository: when a pull request merges, Cloudflare
builds the site from the repo and publishes the Worker and static assets that
`wrangler.jsonc` describes — the account, the `dist/` asset directory, the custom
domain, and the canonicalization Worker (`main` + `run_worker_first`, see
[architecture](architecture.md)). There is no manual step in the normal flow:
[merging a green pull request](contributing.md) is what ships.

Because merge is deploy, the branch-protection gates are also the release gates —
a change reaches production only after its pull request passes CI and merges, so
nothing goes live without the [full gate set](code-quality.md) passing first.

## Domains

The beta site is served at https://www.borca.ai, with the `workers.dev` preview
URL kept enabled as a fallback. The canonical origin in code currently matches the
beta host; when the site moves to a permanent Corca domain, use the
[canonical domain runbook](runbook.md) to update both `SITE_ORIGIN` and
`wrangler.jsonc` together.

## After a merge

1. Watch the build finish in the Cloudflare dashboard (Workers → the project →
   Builds), or via the deploy status surfaced on the merged commit.
2. Smoke-test the custom domain and the `workers.dev` fallback for the changed
   paths, including canonical redirects when URL behavior changed.
3. Share the deployed commit when a product or content owner needs to verify it.

## Manual deploy (fallback)

`pnpm run deploy` still builds the site and runs `wrangler deploy` directly, for a
local test build or an emergency publish when the Git integration is unavailable.
It requires `wrangler` to be authenticated against the Corca Cloudflare account.
Use `pnpm run deploy`, not `pnpm deploy`: the latter is pnpm's own workspace-deploy
command and will not run this script.

The stack that gets deployed is described in [architecture](architecture.md), and the local
build commands are listed in [development](development.md).
