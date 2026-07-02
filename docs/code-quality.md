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
- **awiki** lints and formats these docs. Every page must connect into the doc
  graph and avoid link-only lines, which is why entries here carry prose.

Both nose and awiki are native binaries installed with `brew install
corca-ai/tap/nose corca-ai/tap/awiki`.

## Supply chain

New dependency versions are held back by a three-day cooldown
(`minimumReleaseAge` in `pnpm-workspace.yaml`), giving the ecosystem time to
catch malicious releases before they can reach our lockfile.

## Git hooks

`lefthook.yml` runs Biome on staged files at pre-commit and, when the binaries
are present, checks the docs with awiki. Pre-push runs the full `astro check`,
duplication and build gates. The matching scripts are listed in [[development]].

## Continuous integration

`.github/workflows/ci.yml` runs the core gates (Biome, `astro check` and the
build) on every push and pull request. The nose and awiki gates also run there
when the `CORCA_GH_TOKEN` secret — a token that can read the private tool repos —
is configured, and skip with a warning otherwise.
