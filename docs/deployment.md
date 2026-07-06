---
title: Deployment
---

# Deployment

The site deploys to Cloudflare Workers (Static Assets) in the Corca account.
Running `pnpm run deploy` builds the site and then runs `wrangler deploy`, and all
of the configuration lives in `wrangler.jsonc` — the account, the `dist/` asset
directory, the custom domain, and the canonicalization Worker (`main` +
`run_worker_first`, see [architecture](architecture.md)). Use `pnpm run deploy`,
not `pnpm deploy`: the latter is pnpm's own workspace-deploy command and will not
run this script.

## Domains

The beta site is served at https://www.borca.ai, with the `workers.dev` preview
URL kept enabled as a fallback. Deploying requires `wrangler` to be authenticated
against the Corca Cloudflare account. The canonical origin in code currently
matches the beta host; when the site moves to a permanent Corca domain, use the
[canonical domain runbook](runbook.md) to update both `SITE_ORIGIN` and
`wrangler.jsonc` together.

## Deployment checklist

1. Start from an up-to-date `main` after the pull request has merged.
2. Confirm `wrangler` is authenticated against the Corca Cloudflare account.
3. Run `pnpm run deploy`; this builds the static site and publishes the Worker.
4. Record or share the deployed commit when the change needs a product or content
   owner to verify it.
5. Smoke-test the custom domain and the `workers.dev` fallback for the changed
   paths, including canonical redirects when URL behavior changed.

The stack that gets deployed is described in [architecture](architecture.md), and the local
build commands used before a deploy are listed in [development](development.md).
