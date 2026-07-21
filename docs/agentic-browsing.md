---
title: Agentic browsing and discovery
---

# Agentic browsing and discovery

The public site is designed for people, search crawlers and browsing agents to
discover the same canonical information. The site does not block external AI
crawlers. `robots.txt` excludes only the two administration route families, and
its ASCII identity is comment-only text with no crawler semantics.

## Discovery documents

`/sitemap.xml` is the canonical sitemap index. Its pages child contains every
public corporate, product and blog landing page in Korean, English, Japanese and
Chinese, with reciprocal `hreflang` links and `x-default`. The content pipeline
continues to own the categories, tags and posts children. There is deliberately
no `/sitemap-index.xml` compatibility alias because that URL was never a public
indexing contract.

`/llms.txt` is one canonical UTF-8 text document rather than four localized
copies. It begins with an English global description, then gives official links
and terminology in Korean, English, Japanese and Chinese. Korean remains the
primary site language; the language sections help agents select the appropriate
localized source without treating machine translation as official copy.

## Accessible AX interaction contract

The AX page has one `h1`, a sequential heading outline and one main landmark in
each locale. General carousel cards remain native `article` elements. Customer
testimonials remain native `figure` elements with `figcaption`; neither semantic
element is overridden with `role="group"`.

Every slide receives its accessible name from a hidden position label and its
visible heading or company name through `aria-labelledby`. Inactive slides alone
use `aria-hidden="true"`. Previous, next, selector and playback controls have
localized names. Manual navigation updates a polite live status; autoplay does
not announce every transition, avoiding repetitive screen-reader output.

## Automated gate and trace-only evidence

Run a production build before `pnpm check:agentic`. The gate checks the built
sitemap, robots and llms documents, resolves their public links, and validates
the four AX locale documents for landmarks, heading order, image alternatives,
carousel roles, label references, named controls and live status regions. CI
runs it immediately after the build so generated output is the evidence.

Layout stability and visual position are not inferred from static HTML. CLS is
accepted only from a browser trace or Lighthouse run at the target viewport.
Likewise, the site does not add placeholder WebMCP actions merely to gain an
agentic-browsing score. A future action API should be implemented only when a
real user operation has a stable input, confirmation and error contract.
