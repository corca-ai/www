# Corca website (`www`)

Marketing site for **Corca** (코르카), migrated from Wix to a static
[Astro](https://astro.build) build served on **Cloudflare Workers** (Static Assets).

- **Beta:** https://www.borca.ai
- Trilingual: Korean (default, `/`), English (`/en/`), Japanese (`/ja/`)

## Stack

- **Astro** — static output (SSG), zero client JS except a small mobile-menu enhancement
- **Tailwind CSS v4** — via `@tailwindcss/vite`
- **Pretendard** (self-hosted, variable woff2) as the primary typeface
- **@astrojs/sitemap** — i18n sitemap with hreflang alternates
- **Cloudflare Workers** (Static Assets) — deployed with `wrangler`

## Pages

`/` · `/moonlight` · `/trace` · `/about-corca` · `/how-we-work` · `/news` · `/colleagues`
— each available in `ko` / `en` / `ja`.

External destinations (careers → `corca.team`, blog → Medium, press articles,
App Store, colleague stories on `corca.team`) are kept as external links, not replicated.

## Develop

```bash
pnpm install
pnpm dev            # local dev server
pnpm build          # static build -> dist/
pnpm preview        # preview the built site
```

## Deploy (Cloudflare Workers)

```bash
pnpm deploy         # astro build && wrangler deploy
```

Deployment config lives in `wrangler.jsonc` (account, `assets/`, and the
`www.borca.ai` custom domain). Requires `wrangler` auth for the Corca account.

## i18n & content

- UI strings and home content: `src/i18n/ui.ts`
- Per-page SEO metadata: `src/i18n/pageMeta.ts`
- News / colleagues data (trilingual): `src/i18n/content/`
- Locale helpers: `src/i18n/utils.ts`

## Accessibility

Audited with axe-core (WCAG 2.1 AA) across all pages × locales × breakpoints —
0 violations. Includes skip link, keyboard-accessible menu, `prefers-reduced-motion`,
and AA-contrast brand color.
