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

## Routing

Astro does not define `/blog` routes in `src/pages/`. Cloudflare Workers Static
Assets serves the files under `public/blog/` directly after the Astro build
places them in `dist/blog/`.

During `pnpm build`, `scripts/sync-blog-shell-assets.js` copies each locale's
rendered `src/components/Header.astro`, `src/components/Footer.astro` and
`src/components/CommonHead.astro` output into every deployable blog page. It
also syncs the current BaseLayout CSS and injects the GA4 measurement ID before
`public/blog/app.js` starts. The shared head block owns the site favicon, PWA
manifest and application metadata, publisher metadata and common font preload;
page-specific blog SEO and feed metadata stays in the static blog pages. The
public source HTML intentionally remains a static content-generation shell with
no measurement ID; the production shell, common head, CSS and analytics
configuration are single-sourced in the Astro site and applied to generated
build output.

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
  ready Notion pages that produce static file changes.
- `POST /api/notion/publish` validates `X-Corca-Webhook-Secret` or a bearer
  token against `CORCA_NOTION_WEBHOOK_SECRET`, then dispatches the
  `notion-post-publish` GitHub event.
- Required GitHub Action secret: `NOTION_TOKEN`.
- Required GitHub Action variable: `CORCA_SITE_URL`, for example
  `https://www.corca.ai`.
- Required Notion database variable: `NOTION_BLOG_DATABASE_URL` or
  `NOTION_BLOG_DATABASE_ID`. `NOTION_BLOG_DATA_SOURCE_ID` can be used when the
  newer Notion Data Source API is configured.
- Optional GitHub Action variables:
  `NOTION_POST_READY_STATUS`, `NOTION_POST_UPDATE_STATUS`,
  `NOTION_POST_DELETE_STATUS`, `NOTION_POST_PUBLISHING_STATUS`,
  `NOTION_POST_PUBLISHED_STATUS`, `NOTION_POST_DELETING_STATUS`,
  `NOTION_POST_DELETED_STATUS`, `NOTION_POST_ERROR_STATUS`,
  `NOTION_SKIP_UPDATES` and `NOTION_RECENT_READY_MINUTES`.
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

### Notion Edits And Deletes

Notion can be the editorial source of truth for publish, edit and delete
requests. The GitHub Action still creates a pull request; the public site only
changes after that pull request is merged and the normal Cloudflare deployment
finishes.

- Publish a new post by leaving `공개 URL` empty and setting the Notion status
  to `배포 완료`. Rows that already have `공개 URL` are treated as already
  published and are skipped while they remain `배포 완료`.
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

- `배포 완료`
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
  and recommended posts to the right. Mobile article pages combine both into
  the existing collapsible navigation inside the article header. Table of
  contents clicks scroll to the selected heading without leaving a section
  hash in the browser URL.
- Locale alias list and 404 pages should keep their language switcher links
  pointed at `/blog`, `/en/blog`, `/ja/blog` and `/zh/blog`; article pages
  should point at the same slug under each available locale alias.
- Generated source files under `/blog/admin/` must remain unavailable to direct
  browser requests.
- Analytics must initialize independently of the list UI because static article
  pages load `public/blog/app.js` without the blog-index DOM.
- `index.json`, `posts/index.json`, static post pages, RSS, JSON feed and
  sitemap should be updated together.
- Every post has exactly one public category in `section`: Product, AX or
  Corca. Topic filters use that category only. The single value in `tags`
  controls the label shown on list cards; Product posts keep their product
  family label, such as Moonlight, Trace, Ceal, Margin or Kraken, while their
  `section` remains Product. Product posts must provide one of those family
  labels rather than using Product itself as the card label.
- Localized post records inherit the resolved Korean cover when translation
  metadata contains the default cover; only a non-default localized cover may
  override it.
- Notion-driven post changes should be checked with `npm run notion:check` when
  changing the workflow or scripts.
- Run the normal project gates from [development](development.md) before
  shipping changes.
