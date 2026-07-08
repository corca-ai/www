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
  settings, reading progress, reactions, sharing and download actions.
- `public/blog/<slug>/` — static article pages.
- `public/blog/index.json` — the public post index consumed by the blog app.
- `public/blog/posts/index.json` — the legacy-compatible public post index used
  by admin APIs and older clients.
- `public/en/blog/`, `public/ja/blog/` and `public/zh/blog/` — localized public
  blog shells that reuse the same Korean article content while matching the
  main site's language-specific header, footer and language switcher.
- `public/blog/assets/` — images, icons and post media used by the blog.
- `public/blog/admin/` — the private admin UI served at `/blog/admin`.
- `public/blog/rss.xml`, `public/blog/feed.json`, `public/blog/sitemap.xml` and
  `public/blog/robots.txt` — blog discovery and feed files.

## Routing

Astro does not define `/blog` routes in `src/pages/`. Cloudflare Workers Static
Assets serves the files under `public/blog/` directly after the Astro build
places them in `dist/blog/`.

- `/blog` loads the blog home page.
- `/en/blog`, `/ja/blog` and `/zh/blog` load the same public blog content with
  the corresponding main-site navigation language.
- `/blog/<slug>` loads the corresponding static article page.
- `/en/blog/<slug>`, `/ja/blog/<slug>` and `/zh/blog/<slug>` provide
  localized-shell aliases for public articles.
- `/blog/index.json` powers the public article list. `/blog/posts/index.json`
  remains available for admin APIs and older clients.
- `/blog/admin` loads the admin UI.
- `/api/admin/*` is handled by `worker/index.ts`.
- `/blog/rss.xml` and `/blog/feed.json` expose the blog feeds.

The shared Worker still applies the site's canonical URL policy: HTTPS, `www.`
host and no trailing slash except for the root path.

## Data And Assets

Blog data is deployed as Cloudflare Workers Static Assets. There is no runtime
database for published posts.

- Public reads use static files such as `/blog/index.json` and
  `/blog/<slug>/index.html`.
- Admin read APIs use the `ASSETS` binding to read `/blog/posts/index.json` and
  `/blog/admin/post-sources/<slug>.html`.
- Direct browser access to `/blog/admin/post-sources/*.html` is blocked by the
  Worker; those files exist so authenticated admin APIs can load editable source
  content.
- Admin write and delete requests dispatch a GitHub workflow when
  `GITHUB_DISPATCH_TOKEN` is configured. The workflow updates the static blog
  files on a generated branch and opens a pull request against `main`.
- The dispatch target is `.github/workflows/admin-post-change.yml`. It runs
  `scripts/apply-admin-post-change.js`, then commits changes under
  `public/blog/`, `public/en/blog/`, `public/ja/blog/` and `public/zh/blog/`.
  The pull request must be merged for the normal main-branch Cloudflare
  deployment flow to publish those static assets.
- By default these pull requests use the repository `GITHUB_TOKEN`. Set the
  optional GitHub Actions secret `CONTENT_CHANGE_TOKEN` to a GitHub App token or
  PAT with content and pull request write access when automation-created PRs
  should start CI without the GitHub approval prompt.
- Notion publishing uses `.github/workflows/notion-publish.yml` and
  `scripts/sync-notion-posts.js`. The script reads ready pages from Notion,
  converts page body blocks or attached HTML files into the shared admin post
  format, writes the same static files under `public/blog/` and localized blog
  aliases, then opens a pull request instead of pushing directly to protected
  `main`.

Because `/blog/admin` lives under the blog base path, admin HTML references
admin scripts and styles with `/blog/admin/*` and shared blog images with
`/blog/assets/*`.

## Admin

The admin UI is intentionally separate from the public blog shell. It is a
noindex page at `/blog/admin` and talks only to `/api/admin/*`.

- `POST /api/admin/session` creates the admin session cookie.
- `DELETE /api/admin/session` clears the session cookie.
- `GET /api/admin/posts` returns the static post index from Cloudflare assets.
- `GET /api/admin/posts/<slug>/source` returns editable source content for one
  post from Cloudflare assets.
- `POST /api/admin/posts` requests an upsert through GitHub dispatch.
- `DELETE /api/admin/posts/<slug>` requests a deletion through GitHub dispatch.
- `scripts/admin-post-change-check.js` exercises the admin upsert/delete path
  against a temporary blog fixture.

Local static servers can show the admin page, but admin login and post editing
require the Worker runtime because the API routes are implemented in
`worker/index.ts`.

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
  `https://www.borca.ai`.
- Required Notion database variable: `NOTION_BLOG_DATABASE_URL` or
  `NOTION_BLOG_DATABASE_ID`. `NOTION_BLOG_DATA_SOURCE_ID` can be used when the
  newer Notion Data Source API is configured.
- Optional GitHub Action variables:
  `NOTION_POST_READY_STATUS`, `NOTION_POST_PUBLISHING_STATUS`,
  `NOTION_POST_PUBLISHED_STATUS`, `NOTION_POST_ERROR_STATUS`,
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

## Maintenance

When changing blog files, keep these invariants:

- Generated blog links and asset URLs must start with `/blog/`.
- The public blog pages should keep the main website header and footer.
- Locale alias pages under `public/en/blog/`, `public/ja/blog/` and
  `public/zh/blog/` should keep their language switcher links pointed at
  `/blog`, `/en/blog`, `/ja/blog` and `/zh/blog`.
- Admin source files under `/blog/admin/post-sources/` must remain unavailable
  to direct browser requests.
- `index.json`, `posts/index.json`, static post pages, RSS, JSON feed and
  sitemap should be updated together.
- Admin-driven post changes should be checked with `npm run blog:admin:check`
  when changing the workflow or scripts.
- Run the normal project gates from [development](development.md) before
  shipping changes.
