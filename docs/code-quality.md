---
title: Code quality
---

# Code quality

Quality is enforced by a small set of tools wired into git hooks (via lefthook)
and the `pnpm check` script (see [development](development.md)).

## Tools

- **Biome** formats and lints `.ts`, `.js` and `.json`. Type safety for `.astro`
  files comes from `astro check`, and Tailwind CSS is left to the framework.
- **knip** finds dead code — unused files, exports and dependencies. Routes and
  product pages load through framework conventions and `import.meta.glob`, so
  `knip.json` lists `src/pages/**/*.astro`, `src/pages/**/*.ts`,
  `src/products/*/manifest.ts` and `src/products/*/Page.astro` as entry points.
  It also ignores `public/blog/**` and `public/blog-assets/**` because those
  static blog files are deployed as assets rather than imported from TypeScript.
  The native `nose`/`awiki` binaries are ignored as external tools.
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
enforces them hard. Running `pnpm check` directly does not skip missing native
binaries; install them before using it as the local pre-PR check.

## Continuous integration

`.github/workflows/ci.yml` calls the same `check:*` scripts on every push and
pull request, so CI enforces the same gate definitions as the pre-push hook. A
`quality` job runs the pnpm-installed gates (Biome, `astro check`, knip) and
`pnpm build`; that build step is CI-only, so run `pnpm build` locally when you
want the closest preview of the `quality` job. A `duplication-and-docs` job
installs nose and awiki from their public release binaries and runs the
duplication and docs gates.

## Protected main

`main` is a protected branch: changes land through a pull request, and both CI
jobs — `quality` and `duplication-and-docs` — must pass before it can merge.
Direct pushes are rejected, so the pre-push hook is the fast local preview of the
gates CI will run on the pull request. The end-to-end branch and pull request
workflow is covered in [contributing](contributing.md), and deployment stays a
manual step after merge, covered in [deployment](deployment.md).
