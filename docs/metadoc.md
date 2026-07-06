---
title: Meta-documentation
---

# How we document

This page is documentation about the documentation — the few principles that keep
`docs/` useful to both the people and the coding agents working on this site. It
exists because the conventions below are decisions, not defaults, and are worth
stating once so they do not quietly erode.

## Docs are code

The docs get the same care as the source. Say a thing once and link to it rather
than restating it, so there is a single source of truth and no second copy to
drift out of sync — the same rule the gates follow in [code quality](code-quality.md).
Keep each page a cohesive unit with a name that says what it holds, prefer linking
over embedding, and delete a page when its topic is gone.

`awiki` enforces the mechanical half of this: it fails on orphans and islands and
on context-free, link-only lines, and formats every page to one style, so the set
stays a connected graph where every page carries prose and resolvable links (the
`check:docs` gate in [code quality](code-quality.md)). Generated output is not
documentation and is not committed — `dist/` and `.astro/` are build artifacts,
and the source they come from is the real reference.

## One entry point, discovered on demand

`AGENTS.md` (symlinked as `CLAUDE.md`) is deliberately tiny: it points at the
[docs index](index.md) and little else. The index is a compact map — a "when you
need to…, start with…" table — and the detail lives on the nearest topic page. A
reader, human or agent, then follows only the links the task needs, discovering
context incrementally instead of loading everything up front. That is why the
index stays a map rather than a second copy of the whole set, and why topic detail
belongs on its topic page.

Human and agent documentation are the same documentation here. There is no
separate agent manual; one `docs/` set serves both, and it would only split if a
real need ever forced it.

## Write the non-obvious, skip the obvious

Assume the reader is capable. Give enough context to judge whether something
applies rather than spelling out steps anyone working in the codebase already
knows. Conversely, write down the decisions a reader cannot infer from the code —
the ones that would otherwise surprise someone:

- the [architecture](architecture.md) page records the canonical URL policy and the Worker that enforces it;
- the [deployment](deployment.md) page records that merging to `main` deploys automatically;
- sharp edges such as `pnpm run deploy` versus pnpm's own `pnpm deploy` are called out where they bite.

When a footgun keeps catching people, the durable fix is usually in the code or
the process, not a warning buried in prose: documentation should explain the
system, not paper over a rough one.

## When you add a doc

Give the page `title` frontmatter, put its details on the most specific page that
fits, and link it into the graph — from this page, the [docs index](index.md), or
the nearest topic page — so `awiki` keeps everything reachable. The
[contributing](contributing.md) guide has the end-to-end authoring, gate and
review flow.
