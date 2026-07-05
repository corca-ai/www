---
title: Deployment
---

# Deployment

The site deploys to Cloudflare Workers (Static Assets) in the Corca account.
Running `pnpm run deploy` builds the site and then runs `wrangler deploy`, and all
of the configuration lives in `wrangler.jsonc` — the account, the `dist/` asset
directory and the custom domain. Use `pnpm run deploy`, not `pnpm deploy`: the
latter is pnpm's own workspace-deploy command and will not run this script.

## Domains

The beta site is served at https://www.borca.ai, with the `workers.dev` preview
URL kept enabled as a fallback. Deploying requires `wrangler` to be authenticated
against the Corca Cloudflare account.

The stack that gets deployed is described in [architecture](architecture.md), and the local
build commands used before a deploy are listed in [development](development.md).
