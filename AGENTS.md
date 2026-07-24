# Corca website — agent guide

All project documentation lives in `docs/`; start at the hub in
[docs/index.md](docs/index.md).

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
