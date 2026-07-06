---
title: Development
---

# Development

Install dependencies with `pnpm install`, then use `pnpm dev` for the local dev
server and `pnpm build` to produce the static `dist/` directory. Type checking is
part of `pnpm check`, via `pnpm check:astro`.

## Common commands

- `pnpm dev` — start the Astro dev server with hot reload.
- `pnpm build` — build the static site into `dist/`.
- `pnpm preview` — serve the built `dist/` locally.
- `pnpm cf:preview` — build the site and run `wrangler dev`, exercising the
  Cloudflare Worker plus Static Assets handoff.
- `pnpm check` — run every quality gate at once (see below).
- `pnpm format` — apply Biome and awiki formatting in place.

The tooling behind `pnpm check` is described in [Code quality](code-quality.md), and the overall
structure it operates on is laid out in [architecture](architecture.md). Routine content and
configuration edits have step-by-step recipes in the [runbook](runbook.md).

## Contributing

The branch, pull request, quality gate and deployment handoff workflow lives in
[contributing](contributing.md). Keep this page focused on local development
commands; use [Code quality](code-quality.md) for the exact gate definitions.
