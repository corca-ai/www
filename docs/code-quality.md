---
title: Code quality
---

# Code quality

Quality is enforced by a small set of tools wired into git hooks (via lefthook)
and the `pnpm check` script (see [development](development.md)).

## Tools

- **Biome** formats and lints `.ts`, `.js` and `.json`. Type safety for `.astro`
  files comes from `astro check`, and Tailwind CSS is left to the framework.
- **knip** finds dead code — unused files, exports and dependencies. Product
  pages load through `registry.ts`'s `import.meta.glob`, which knip cannot
  follow, so `knip.json` lists `src/products/*/{manifest.ts,Page.astro}` as entry
  points (the wildcard covers any new product) and ignores the native
  `nose`/`awiki` binaries.
- **nose** detects code duplication across `src/**/*.ts` as a jscpd replacement;
  its gate is configured in `nose.toml`. It does not analyze `.astro` files, so
  shared logic belongs in `.ts` modules where nose can see it.
- **awiki** is Corca's CLI for a flat-file Markdown wiki. It keeps these docs
  connected — failing on orphans, islands and context-free link-only lines — and
  formats them to one style, so every page carries prose and resolvable links.

Both nose and awiki are native binaries installed with `brew install
corca-ai/tap/nose corca-ai/tap/awiki`.

## One definition per gate

Each gate's command lives once, as a `check:*` script in `package.json`
(`check:biome`, `check:astro`, `check:knip`, `check:dup` and `check:docs`); the
`check` script runs all five in sequence. The git hooks and continuous
integration both call these scripts, so a gate's command is never spelled out in
more than one place and the two cannot drift apart — changing how a gate runs is
a one-line edit in `package.json`.

## Supply chain

New dependency versions are held back by a three-day cooldown
(`minimumReleaseAge` in `pnpm-workspace.yaml`), giving the ecosystem time to
catch malicious releases before they can reach our lockfile.

## Git hooks

`lefthook.yml` runs Biome on staged files at pre-commit and, when awiki is
present, formats and checks the docs. Pre-push runs the full gate set in
parallel — `check:biome`, `check:astro`, `check:knip`, `check:dup` and
`check:docs`. The two native-binary gates skip with a warning when nose or awiki
is missing, so a contributor without them is never blocked; CI installs both and
enforces them hard.

## Continuous integration

`.github/workflows/ci.yml` calls the same `check:*` scripts on every push and
pull request, so CI enforces exactly what the pre-push hook does. A `quality`
job runs the pnpm-installed gates (Biome, `astro check`, knip) and `pnpm build`;
a `duplication-and-docs` job installs nose and awiki from their public release
binaries and runs the duplication and docs gates.

## Protected main

`main` is a protected branch: changes land through a pull request, and both CI
jobs — `quality` and `duplication-and-docs` — must pass before it can merge.
Direct pushes are rejected, so the pre-push hook is the fast local preview of the
gates CI will run on the pull request. The end-to-end branch and pull request
workflow is covered in [contributing](contributing.md), and deployment stays a
manual step after merge, covered in [deployment](deployment.md).
