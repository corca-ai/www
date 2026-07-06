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
- `public/blog/posts/` — static article pages and `posts/index.json`, the public
  post index consumed by the blog app.
- `public/blog/assets/` — images, icons and post media used by the blog.
- `public/blog/admin/` — the private admin UI served at `/blog/admin`.
- `public/blog/rss.xml`, `public/blog/feed.json`, `public/blog/sitemap.xml` and
  `public/blog/robots.txt` — blog discovery and feed files.

## Routing

Astro does not define `/blog` routes in `src/pages/`. Cloudflare Workers Static
Assets serves the files under `public/blog/` directly after the Astro build
places them in `dist/blog/`.

- `/blog` loads the blog home page.
- `/blog/posts/<slug>` loads the corresponding static article page.
- `/blog/posts/index.json` powers the public article list.
- `/blog/admin` loads the admin UI.
- `/api/admin/*` is handled by `worker/index.ts`.
- `/blog/rss.xml` and `/blog/feed.json` expose the blog feeds.

The shared Worker still applies the site's canonical URL policy: HTTPS, `www.`
host and no trailing slash except for the root path.

## Data And Assets

Blog data is deployed as Cloudflare Workers Static Assets. There is no runtime
database for published posts.

- Public reads use static files such as `/blog/posts/index.json` and
  `/blog/posts/<slug>/index.html`.
- Admin read APIs use the `ASSETS` binding to read `/blog/posts/index.json` and
  `/blog/admin/post-sources/<slug>.html`.
- Direct browser access to `/blog/admin/post-sources/*.html` is blocked by the
  Worker; those files exist so authenticated admin APIs can load editable source
  content.
- Admin write and delete requests dispatch a GitHub workflow when
  `GITHUB_DISPATCH_TOKEN` is configured. The workflow updates the static blog
  files and redeploys them as assets.

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

Local static servers can show the admin page, but admin login and post editing
require the Worker runtime because the API routes are implemented in
`worker/index.ts`.

## Maintenance

When changing blog files, keep these invariants:

- Generated blog links and asset URLs must start with `/blog/`.
- The public blog pages should keep the main website header and footer.
- Admin source files under `/blog/admin/post-sources/` must remain unavailable
  to direct browser requests.
- `posts/index.json`, static post pages, RSS, JSON feed and sitemap should be
  updated together.
- Run the normal project gates from [development](development.md) before
  shipping changes.
