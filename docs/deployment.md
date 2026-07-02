---
title: Deployment
---

# Deployment

The site deploys to Cloudflare Workers (Static Assets) in the Corca account.
Running `pnpm deploy` builds the site and then runs `wrangler deploy`, and all of
the configuration lives in `wrangler.jsonc` — the account, the `dist/` asset
directory and the custom domain.

## Domains

The beta site is served at https://www.borca.ai, with the `workers.dev` preview
URL kept enabled as a fallback. Deploying requires `wrangler` to be authenticated
against the Corca Cloudflare account.

The stack that gets deployed is described in [[architecture]], and the local
build commands used before a deploy are listed in [[development]].
