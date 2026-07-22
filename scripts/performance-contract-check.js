import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { withStaticAssetCacheHeaders } from '../worker/staticAssetHeaders.js';

const root = process.cwd();
const dist = join(root, 'dist');

const fail = (message) => {
  throw new Error(`[performance-contract] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const read = (path) => readFileSync(join(root, path), 'utf8');
const readDist = (path) => {
  const file = join(dist, path);
  assert(existsSync(file), `missing dist/${path}; run the production build first`);
  return readFileSync(file, 'utf8');
};

const axHtml = readDist('ax/index.html');
const axClient = read('src/components/pages/ax/ax-client.ts');
const axCss = read('src/components/pages/ax/ax.css');
const baseLayout = read('src/layouts/BaseLayout.astro');

const videoSource = axHtml.match(/<source\b[^>]*data-src="[^"]+\.webm"[^>]*>/)?.[0] ?? '';
assert(videoSource, 'AX hero must retain a deferred WebM data-src for desktop');
assert(!/\ssrc=/.test(videoSource), 'AX hero WebM must not have an eager src attribute');
assert(/<video\b[^>]*preload="none"/.test(axHtml), 'AX hero video must use preload="none"');
assert(
  /<source\b[^>]*media="\(max-width: 720px\)"[^>]*type="image\/avif"/.test(axHtml) &&
    /<source\b[^>]*media="\(max-width: 720px\)"[^>]*type="image\/webp"/.test(axHtml),
  'AX hero picture must keep mobile AVIF and WebP sources',
);
assert(
  /<img\b[^>]*fetchpriority="high"[^>]*loading="eager"/.test(axHtml),
  'AX hero LCP image must remain eager and high priority',
);

const mobileVideoGuard = axClient.indexOf('if (mobileViewport.matches)');
const connectVideoSource = axClient.indexOf('source.src = source.dataset.src');
assert(
  mobileVideoGuard >= 0 && connectVideoSource > mobileVideoGuard,
  'AX client must reject mobile video before connecting its source',
);
assert(
  axClient.includes("source.removeAttribute('src')") && axClient.includes('video.load()'),
  'desktop-to-mobile transitions must unload the video source',
);
assert(
  axClient.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"),
  'AX client must respect reduced motion',
);
assert(
  axClient.indexOf("page.dataset.scrollMotionInitialized = 'mobile-static'") <
    axClient.indexOf("page.querySelectorAll<HTMLElement>('[data-parallax-scene]')"),
  'AX mobile must exit before initializing parallax scenes',
);
assert(
  axClient.includes('if (!isInViewport) return;') &&
    axClient.includes("slides[activeIndex + 1]?.querySelector<HTMLImageElement>('img')"),
  'carousel look-ahead must wait until its carousel is visible',
);

assert(
  /@media \(max-width: 720px\)[\s\S]*?\.ax-page \.hero-video \{\s*display: none;/.test(axCss),
  'AX mobile CSS must hide the hero video',
);
assert(
  /@media \(min-width: 721px\) and \(max-height: 720px\)[\s\S]*?min-height: 654px;[\s\S]*?top: 10px;[\s\S]*?bottom: auto;/.test(
    axCss,
  ),
  'low-height desktop hero must keep the approved top-anchored layout',
);
assert(
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ax-page \.hero-video \{[\s\S]*?opacity: 0 !important;/.test(
    axCss,
  ),
  'reduced-motion CSS must keep video hidden',
);

assert(
  baseLayout.includes("window.matchMedia('(max-width: 720px)').matches") &&
    baseLayout.includes('window.setTimeout(loadGoogleTag, 5000)'),
  'AX mobile analytics must remain outside the initial critical path',
);

const localePages = [
  ['ko', 'ax/index.html', 'pretendard-ko.woff2'],
  ['en', 'en/ax/index.html', 'pretendard-en.woff2'],
  ['ja', 'ja/ax/index.html', 'pretendard-ja.woff2'],
];
for (const [locale, path, font] of localePages) {
  const html = readDist(path);
  assert(html.includes(`/fonts/ax-mobile/v1/${font}`), `${locale} AX mobile font is missing`);
  assert(
    new RegExp(
      `<link[^>]+href="/fonts/ax-mobile/v1/${font}"[^>]+media="\\(max-width: 720px\\)"`,
    ).test(html),
    `${locale} AX mobile font preload must be restricted to mobile`,
  );
  assert(
    /<link[^>]+href="\/fonts\/PretendardVariable\.woff2"[^>]+media="\(min-width: 721px\)"/.test(
      html,
    ),
    `${locale} AX full Pretendard preload must be desktop-only`,
  );
}
const zhHtml = readDist('zh/ax/index.html');
assert(!zhHtml.includes('/fonts/ax-mobile/'), 'Chinese AX must keep its system-font mobile path');
assert(
  /<link[^>]+href="\/fonts\/PretendardVariable\.woff2"[^>]+media="\(min-width: 721px\)"/.test(
    zhHtml,
  ),
  'Chinese AX full Pretendard preload must be desktop-only',
);

for (const [path, maximumBytes] of [
  ['public/images/pages/ax/visuals/01-hero-mobile.avif', 20_000],
  ['public/images/pages/ax/visuals/01-hero-mobile.webp', 25_000],
  ['public/fonts/ax-mobile/v1/pretendard-ko.woff2', 150_000],
  ['public/fonts/ax-mobile/v1/pretendard-en.woff2', 60_000],
  ['public/fonts/ax-mobile/v1/pretendard-ja.woff2', 250_000],
]) {
  const file = join(root, path);
  assert(existsSync(file), `${path} is missing`);
  assert(statSync(file).size <= maximumBytes, `${path} exceeds ${maximumBytes} bytes`);
}

const cached = (path, contentType = '') =>
  withStaticAssetCacheHeaders(
    new Request(`https://www.borca.ai${path}`),
    new Response('fixture', { headers: { 'Content-Type': contentType } }),
  ).headers.get('Cache-Control');

assert(
  cached('/_astro/page.hash.js', 'text/javascript') === 'public, max-age=31536000, immutable',
  'hashed Astro assets must remain immutable',
);
assert(
  cached('/fonts/ax-mobile/v1/pretendard-ko.woff2', 'font/woff2') ===
    'public, max-age=31536000, immutable',
  'versioned AX fonts must remain immutable',
);
assert(
  cached('/images/pages/ax/scene.webp', 'image/webp') ===
    'public, max-age=86400, stale-while-revalidate=604800',
  'mutable static assets must retain the measured cache policy',
);
assert(cached('/ax', 'text/html') === 'public, max-age=0, must-revalidate', 'HTML must revalidate');

console.log(
  'Performance contract passed: mobile poster/video/font critical path, motion, analytics, asset sizes and cache policy.',
);
