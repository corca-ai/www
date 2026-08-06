# Corca website — agent guide

All project documentation lives in `docs/`; start at the hub in
[docs/index.md](docs/index.md).

Before adding a Lead Form or consultation-request section to any page, read
[docs/lead-form-agent-manual.md](docs/lead-form-agent-manual.md). Do not copy or
modify the shared Form markup, override its internal CSS, or manually place
page context in Form markup.

For page creation and refinement, use the repository-local
[`corca-site-page-pipeline`](.agents/skills/corca-site-page-pipeline/SKILL.md)
skill and follow the [Git-native Agent workflow](docs/agent-workflow.md).

> Note: `CLAUDE.md` is a symlink to this file (`AGENTS.md`).

## Context discipline

- Prefer repository files and Git diffs as the source of truth.
- Limit work to `corca-www`; do not search `XT/output` or other projects.
- Do not repeatedly reread entire files or rerun repository-wide searches.
- Summarize only the relevant parts of long output.
- Capture before and after screenshots only once per phase.
- At 60% context, close the current phase and persist durable facts in the
  nearest canonical document or focused commit; at 70%, switch to a new task.
- At 80% context, do not start new implementation, full checks, pushes, pull
  requests, or deployments.

## Continuation contract

- Treat current code, tests, focused Git commits and diffs as the exact record
  of each change. New tasks follow `docs/agent-workflow.md` and load only the
  topic documents routed from `docs/index.md`.
- Do not use dated handoffs, generated HTML, full transcripts or patch dumps as
  default startup context. Keep historical material in Git history and search
  it only when current code and canonical docs cannot explain a decision.
- For every pull request, decide whether it changes durable route ownership,
  shared components, design/SEO/i18n policy, deployment behavior, local setup,
  or a known regression risk. If it does, update the nearest canonical `docs/`
  page once when the fact matters to future tasks.
- Document the decision, affected paths, validation, and remaining regression
  risk in the pull request. If no documentation update is needed, say so and
  explain why in the pull request summary.

## GitHub authentication fallback

- A failing `gh auth status` alone does not block repository work. First check
  whether remote Git access works with `git ls-remote origin HEAD`.
- If remote Git works and connected GitHub tooling is available, do not ask the
  user to repeat `gh auth login`; use Git for push and the connected tooling for
  pull requests, CI status, and merging.
- Ask for an authentication refresh only when both remote Git and the connected
  GitHub tooling cannot perform the required operation.
