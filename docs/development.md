---
title: Development
---

# Development

Install dependencies with `pnpm install`, then use `pnpm dev` for the local dev
server and `pnpm build` to produce the static `dist/` directory.

## Common commands

- `pnpm dev` — start the Astro dev server with hot reload.
- `pnpm build` — type-check and build the static site into `dist/`.
- `pnpm preview` — serve the built `dist/` locally.
- `pnpm check` — run every quality gate at once (see below).
- `pnpm format` — apply Biome and awiki formatting in place.

The tooling behind `pnpm check` is described in [[code-quality]], and the overall
structure it operates on is laid out in [[architecture]]. Routine content and
configuration edits have step-by-step recipes in the [[runbook]].
