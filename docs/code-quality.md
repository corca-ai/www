---
title: Code quality
---

# Code quality

Quality is enforced by a small set of tools wired into git hooks (via lefthook)
and the `pnpm check` script.

## Tools

- **Biome** formats and lints `.ts`, `.js` and `.json`. Type safety for `.astro`
  files comes from `astro check`, and Tailwind CSS is left to the framework.
- **nose** detects code duplication across `src/**/*.ts` as a jscpd replacement;
  its gate is configured in `nose.toml`. It does not analyze `.astro` files, so
  shared logic belongs in `.ts` modules where nose can see it.
- **awiki** is Corca's CLI for a flat-file Markdown wiki. It keeps these docs
  connected — failing on orphans, islands and context-free link-only lines — and
  formats them to one style, so every page carries prose and resolvable links.

Both nose and awiki are native binaries installed with `brew install
corca-ai/tap/nose corca-ai/tap/awiki`.

## Supply chain

New dependency versions are held back by a three-day cooldown
(`minimumReleaseAge` in `pnpm-workspace.yaml`), giving the ecosystem time to
catch malicious releases before they can reach our lockfile.

## Git hooks

`lefthook.yml` runs Biome on staged files at pre-commit and, when the binaries
are present, checks the docs with awiki. Pre-push runs the full `astro check`,
duplication and build gates. The matching scripts are listed in [development](development.md).

## Continuous integration

`.github/workflows/ci.yml` runs the core gates (Biome, `astro check` and the
build) on every push and pull request. A second job installs nose and awiki
from their public release binaries and runs the duplication and docs gates, so
every gate is enforced in CI with no extra configuration.
