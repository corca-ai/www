---
title: Blog
---

# Blog

The `/blog` section is the Corca website's Korean blog. It is served as static
files from `public/blog/`, behind the same Cloudflare Worker and canonical URL
rules as the rest of the site. The blog uses the main website header and footer
so navigation, branding and the bottom contact area stay consistent with the
top-level pages.

## Structure

- `public/blog/index.html` — the blog home page and article-list shell.
- `public/blog/app.js` and `public/blog/styles.css` — the client-side blog
  experience: search, sorting, pagination, saved posts, recent reads, reading
  settings, reading progress, reactions, sharing, download actions and GA4
  events.
- `public/blog/<slug>/` — static article pages.
- `public/blog/index.json` — the public post index consumed by the blog app.
- `public/blog/posts/index.json` — the legacy-compatible public post index used
  by older clients.
- `public/en/blog/`, `public/ja/blog/` and `public/zh/blog/` — localized public
  blog shells that reuse the same Korean article content while matching the
  main site's language-specific header, footer and language switcher.
- `public/blog/assets/` — images, icons and post media used by the blog.
- `public/blog/admin/post-sources/` and
  `public/blog/admin/post-translations/` — generated source artifacts used by
  the static blog renderer. These are not public editing surfaces.
- `public/blog/rss.xml`, `public/blog/feed.json`, `public/blog/sitemap.xml` and
  `public/blog/robots.txt` — blog discovery and feed files.
- `public/sitemap-posts.xml` — canonical localized article URLs. Topic and
  search filter query states are UI views, not sitemap entries.

## Routing

Astro does not define `/blog` routes in `src/pages/`. Cloudflare Workers Static
Assets serves the files under `public/blog/` directly after the Astro build
places them in `dist/blog/`.

During `pnpm build`, `scripts/sync-blog-shell-assets.js` copies each locale's
rendered `src/components/Header.astro`, `src/components/Footer.astro` and
`src/components/CommonHead.astro` output into every deployable blog page. It
also syncs the current BaseLayout CSS and injects the GA4 measurement ID before
`public/blog/app.js` starts. The shared head block owns the site favicon, PWA
manifest and application metadata, publisher metadata, common font preload and
Microsoft Clarity loader; page-specific blog SEO and feed metadata stays in the
static blog pages. The public source HTML intentionally remains a static
content-generation shell with no analytics identifiers; the production shell,
common head, CSS and analytics configuration are single-sourced in the Astro
site and applied to generated build output. For pages with a breadcrumb, the
generated footer also places the desktop OpenAI Select Partner badge in the same
breadcrumb row as the Astro Footer so their shared container and top alignment
remain consistent. The generator first removes the home shell's icon-only
breadcrumb row, then adds exactly one blog-specific trail and desktop badge.

The shared head emits one search favicon declaration: the standard absolute
`rel="icon"` PNG URL `https://www.corca.ai/favicons/corca-ai-48.png`, plus an
Apple touch icon generated from the same Figma brand source. Do not add another
page-specific icon or `shortcut icon` to generated blog HTML. The root ICO and
older PNG names remain compatibility fallbacks but are not additional head
candidates. The final build scans every public HTML file and fails when another
search favicon candidate remains.

Every public blog article receives the shared immutable `article` Lead Request
Section. `src/lead/blogLeadPages.json` owns this global policy: its
`page_id_prefix` combines with each locale-neutral slug to create a stable
`blog-<slug>` ID, and its `content_type`, `variant` and `copy_key` apply to all
articles. The current `copy_key` is `blog-article`, which keeps the blog-only
friendly AX prompt separate from the AX page's `ax-consultation` copy. Never paste
Form HTML into a post. A build-only Astro route renders a
neutral locale/variant/copy fragment, the blog sync inserts it before `</main>`,
and then removes the internal route from `dist`. The build rejects duplicate
`#request` targets, invalid policy values, missing clients and missing locale
aliases. A future Notion post receives the same section when its static article
page is generated. Follow the Korean [Lead Form Agent manual](lead-form-agent-manual.md)
for the exact procedure and contract checks.

- `/blog` loads the blog home page.
- `/en/blog`, `/ja/blog` and `/zh/blog` load the same public blog content with
  the corresponding main-site navigation language.
- Main-site Blog navigation preserves the active locale, so English, Japanese
  and Chinese pages link to `/en/blog`, `/ja/blog` and `/zh/blog` respectively.
- `/blog/<slug>` loads the corresponding static article page.
- `/en/blog/<slug>`, `/ja/blog/<slug>` and `/zh/blog/<slug>` provide
  localized-shell aliases for public articles.
- `/blog/index.json` powers the public article list. `/blog/posts/index.json`
  remains available for older clients.
- `/blog/admin/*` and `/api/admin/*` are retired and return 404 from
  `worker/index.ts`.
- `/blog/rss.xml` and `/blog/feed.json` expose the blog feeds.

The shared Worker still applies the site's canonical URL policy: HTTPS, `www.`
host and no trailing slash except for the root path.

## Data And Assets

Blog data is deployed as Cloudflare Workers Static Assets. There is no runtime
database for published posts.

The newsletter is the deliberate exception: it never stores post content, but
uses a dedicated D1 database for opt-in subscribers and delivery history. Its
daily Worker job reads the production Korean RSS feed after a post has passed
the normal Notion → pull request → deployment flow. See [Blog newsletter](newsletter.md)
for the setup boundary and operational procedure.

- Public reads use static files such as `/blog/index.json` and
  `/blog/<slug>/index.html`.
- The old `/blog/admin` editor and `/api/admin/*` routes are retired. Notion is
  the only supported editorial surface for publish, edit and delete requests.
- Generated source and translation artifacts under `/blog/admin/` remain in the
  deployed asset bundle because the static blog renderer uses them to rebuild
  indexes, feeds, sitemaps and localized aliases. The Worker blocks direct
  access to the whole `/blog/admin/*` path.
- Notion publishing uses `.github/workflows/notion-publish.yml` and
  `scripts/sync-notion-posts.js`. The script reads ready pages from Notion,
  converts page body blocks or attached HTML files into the static renderer
  input format, writes files under `public/blog/` and localized blog aliases,
  then opens a pull request instead of pushing directly to protected `main`.

## Notion Publishing

The Notion publishing path can be run manually from GitHub Actions or triggered
by a Notion automation webhook.

- `workflow_dispatch` on `Publish Notion Posts` opens a pull request for all
  ready Notion pages that produce static file changes. Select
  `commit_to_source_branch` only when deliberately backfilling an existing
  content or feature PR: it commits the generated static files directly to the
  branch selected in the manual-run form instead.
- `POST /api/notion/publish` validates `X-Corca-Webhook-Secret` or a bearer
  token against `CORCA_NOTION_WEBHOOK_SECRET`, then dispatches the
  `notion-post-publish` GitHub event.
- Required GitHub Action secret: `NOTION_TOKEN`.
- Required GitHub Action variable: `CORCA_SITE_URL`, for example
  `https://www.corca.ai`.
- Required Notion database variable: `NOTION_BLOG_DATABASE_URL` or
  `NOTION_BLOG_DATABASE_ID`. `NOTION_BLOG_DATA_SOURCE_ID` can be used when the
  newer Notion Data Source API is configured.
- Optional team-interview database variable: set one of
  `NOTION_TEAM_INTERVIEW_DATABASE_URL`, `NOTION_TEAM_INTERVIEW_DATABASE_ID` or
  `NOTION_TEAM_INTERVIEW_DATA_SOURCE_ID`. When present, it is queried alongside
  the primary blog database and uses the identical static-blog publication
  path. Leaving all three unset preserves the single-database behavior.
- Optional GitHub Action variables:
  `NOTION_POST_READY_STATUS`, `NOTION_POST_UPDATE_STATUS`,
  `NOTION_POST_DELETE_STATUS`, `NOTION_POST_PUBLISHING_STATUS`,
  `NOTION_POST_PUBLISHED_STATUS`, `NOTION_POST_DELETING_STATUS`,
  `NOTION_POST_DELETED_STATUS`, `NOTION_POST_ERROR_STATUS`,
  `NOTION_SKIP_UPDATES`, `NOTION_RECENT_READY_MINUTES` and
  `NOTION_POST_LIMIT` (default: `50`).
- Required Worker secrets for webhook-triggered publishing:
  `CORCA_NOTION_WEBHOOK_SECRET` and `GITHUB_DISPATCH_TOKEN`.
- Optional GitHub Actions secret: `CONTENT_CHANGE_TOKEN`, used instead of the
  repository `GITHUB_TOKEN` for creating content-change branches and pull
  requests when CI should run without an automation approval prompt.

Keep `NOTION_SKIP_UPDATES=1` when publishing through pull requests. With
protected branches, generated static files are not live until the PR is merged
and the main-branch Cloudflare deployment completes.

`NOTION_BLOG_DATABASE` is not read by this repository. Use
`NOTION_BLOG_DATABASE_URL` or `NOTION_BLOG_DATABASE_ID` instead.

### Team Interview Database

The team-interview table may live anywhere in Notion, including as a database
embedded under a toggle on the same Notion page as the primary blog table. It
is still a separate Notion database/data source and must be shared with the
same Notion integration.

Use the same properties, property types and status labels as the primary blog
database. Configure its URL, database ID or data source ID with one optional
`NOTION_TEAM_INTERVIEW_*` variable above, then send its Notion automation to
the existing `/api/notion/publish` endpoint with the existing webhook secret.
No second Worker endpoint, route or blog template is required: the webhook page
ID is matched across both configured sources and the generated article joins
the normal `/blog` index, feeds, locale aliases and sitemap.

Every row needs a `Slug`/`슬러그` or Notion title; that effective published slug
must be unique across both databases. The sync reads the configured sources
completely and rejects a missing or duplicate value before it updates Notion or
writes static blog files, so resolve the source rows before retrying publication.

For an initial bulk migration, add all source rows to the team-interview table,
mark the intended rows `배포 신청`, then run `Publish Notion Posts` manually.
That manual run processes ready rows from both databases and creates one normal
content-sync pull request. It processes up to `NOTION_POST_LIMIT` rows (default
`50`); set that GitHub Actions variable high enough for a one-pass migration or
run the workflow again for remaining rows. After the migration, use the existing
Notion webhook and status-change process for each new or edited interview.

### Notion Edits And Deletes

Notion can be the editorial source of truth for publish, edit and delete
requests. The GitHub Action still creates a pull request; the public site only
changes after that pull request is merged and the normal Cloudflare deployment
finishes.

- Request a new deployment by leaving `공개 URL` empty and setting the Notion
  status to `배포 신청`. Rows that already have `공개 URL` are treated as
  already published and are skipped while they remain `배포 신청`.
- Edit an existing post by keeping the same `Slug`/`슬러그`, changing the Notion
  page body or metadata, then setting the status to `수정 요청`. The sync script
  treats this as an upsert and regenerates the static files for that slug.
- Delete an existing post by keeping the `Slug`/`슬러그` value on the Notion row
  and setting the status to `삭제 요청`. The sync script dispatches the same
  static renderer delete path, removing the public article page, localized
  aliases, source files, translations, RSS, JSON feed and sitemap entries.
- Do not move the Notion row to trash before the delete pull request is created.
  Notion database queries return normal database rows; a trashed row is harder
  to map back to the deployed static slug.

Minimal status options:

- `배포 신청`
- `수정 요청`
- `삭제 요청`

Required publication marker:

- `공개 URL` — URL property. Leave it empty for a new post. Fill it with the
  live blog URL after the publish PR is merged, for example
  `https://www.corca.ai/blog/my-slug`.

No GitHub Action variables are required when the Notion status labels use those
exact names; they are included in the script defaults. Only set these variables
when the Notion database uses different labels:

- `NOTION_POST_READY_STATUS`
- `NOTION_POST_UPDATE_STATUS`
- `NOTION_POST_DELETE_STATUS`

If `NOTION_POST_READY_STATUS` is explicitly set to the former `배포 완료`
label, change it to `배포 신청` or remove the variable so the default applies.
For a `배포 신청` row, publishing-status overrides cannot mark the row complete
or fill `공개 URL`; the sync only prepares a pull request. Fill the live URL
after that pull request is merged and Cloudflare deployment succeeds.

When `NOTION_SKIP_UPDATES=1`, the workflow will not write status or result fields
back to Notion. In that mode, editors should use the generated pull request as
the source of truth until it is merged.

## Maintenance

When changing blog files, keep these invariants:

- Generated blog links and asset URLs must start with `/blog/`.
- The public blog pages should keep the main website header and footer.
- Header navigation changes belong in `src/components/Header.astro`; the build
  sync applies that component to blog list, article and localized alias pages.
- Blog-specific element resets and typography must use low-specificity
  `:where(#main)` scoping so they neither leak into the shared header/footer nor
  override more specific blog component styles. Document-level primitives such
  as page background and overflow may remain global.
- Desktop article pages keep the table of contents to the left of the article
  and recommended posts to the right, inside `.static-post-content`. This
  containment makes their sticky range end with the article, before the
  full-width Lead Request Section and latest-post cards. The latest-post cards
  use the same `post-list` and `post-card` markup as the blog index; do not add
  a detail-page-specific card variant. At widths up to 1024px,
  the table of contents becomes a collapsible control between the article header
  and body; recommended posts remain after the article. Table of contents clicks
  scroll to the selected heading without leaving a section hash in the browser
  URL.
- Locale alias list and 404 pages should keep their language switcher links
  pointed at `/blog`, `/en/blog`, `/ja/blog` and `/zh/blog`; article pages
  should point at the same slug under each available locale alias.
- Every generated article page should emit an absolute self-canonical URL,
  hreflang links for each available locale alias and an `x-default` link to the
  Korean article URL.
- Each localized blog list page should emit an absolute self-canonical URL and
  the same `ko`, `en`, `ja`, `zh-Hans` and Korean `x-default` hreflang set as
  `sitemap-pages.xml`.
- Localized blog list pages keep locale-specific titles and descriptions.
  `?topic=` and `?q=` filter states canonicalize to that list page and must not
  appear in a sitemap.
- Generated source files under `/blog/admin/` must remain unavailable to direct
  browser requests.
- Analytics must initialize independently of the list UI because static article
  pages load `public/blog/app.js` without the blog-index DOM.
- `index.json`, `posts/index.json`, static post pages, RSS, JSON feed and the
  canonical post sitemap should be updated together.
- Every post has exactly one public category in `section`: Product, AX or
  Corca. Topic filters use that category only. The single value in `tags`
  controls the label shown on list cards; Product posts keep their product
  family label, such as Moonlight, Trace, Ceal, Margin or Kraken, while their
  `section` remains Product. Product posts must provide one of those family
  labels rather than using Product itself as the card label.
- Localized post records inherit the resolved Korean cover when translation
  metadata contains the default cover; only a non-default localized cover may
  override it.
- Markdown is retained only on the original post source for later editing.
  Generated locale artifacts use their translated HTML as the reader-facing
  source and must not retain source-language `sourceMarkdown` metadata.
- Notion-driven post changes should be checked with `npm run notion:check` when
  changing the workflow or scripts.
- Run the normal project gates from [development](development.md) before
  shipping changes.
