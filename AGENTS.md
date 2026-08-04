# Corca website — agent guide

All project documentation lives in `docs/`; start at the hub in
[docs/index.md](docs/index.md).

Before adding a Lead Form or consultation-request section to any page, read
[docs/lead-form-agent-manual.md](docs/lead-form-agent-manual.md). Do not copy or
modify the shared Form markup, override its internal CSS, or manually place
page context in Form markup.

> Note: `CLAUDE.md` is a symlink to this file (`AGENTS.md`).

## Context discipline

- Prefer repository files and Git diffs as the source of truth.
- Limit work to `corca-www`; do not search `XT/output` or other projects.
- Do not repeatedly reread entire files or rerun repository-wide searches.
- Summarize only the relevant parts of long output.
- Capture before and after screenshots only once per phase.
- At 60% context, close the current phase and prepare a handoff; at 70%, switch
  to a new task.
- At 80% context, do not start new implementation, full checks, pushes, pull
  requests, or deployments.

## Continuation contract

- Keep the copy-ready new-conversation prompts in the canonical handoff stable
  for routine site work. Change them only when the start procedure, safety
  requirements, or required local tooling genuinely changes.
- Treat Git commits and diffs as the exact record of each change. A new task
  fetches `origin`, verifies the handoff anchor, and summarizes later relevant
  diffs instead of rewriting its starting prompt for every merged pull request.
- For every pull request, decide whether it changes durable route ownership,
  shared components, design/SEO/i18n policy, deployment behavior, local setup,
  or a known regression risk. If it does, update the nearest canonical `docs/`
  page and the site handoff when the fact matters to future tasks.
- Document the decision, affected paths, validation, and remaining regression
  risk in the pull request. If no documentation update is needed, say so and
  explain why in the pull request summary.
- Whenever the canonical handoff Markdown changes, regenerate its companion
  HTML with `pnpm handoff:render`. The Markdown and Git history are the source
  of truth; the HTML is a review aid and full patches remain local audit data.

## GitHub authentication fallback

- A failing `gh auth status` alone does not block repository work. First check
  whether remote Git access works with `git ls-remote origin HEAD`.
- If remote Git works and connected GitHub tooling is available, do not ask the
  user to repeat `gh auth login`; use Git for push and the connected tooling for
  pull requests, CI status, and merging.
- Ask for an authentication refresh only when both remote Git and the connected
  GitHub tooling cannot perform the required operation.
