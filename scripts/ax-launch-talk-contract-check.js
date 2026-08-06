import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const fail = (message) => {
  throw new Error(`[ax-launch-talk-contract] ${message}`);
};
const readDist = (path) => {
  const file = join(dist, path);
  if (!existsSync(file)) fail(`missing dist/${path}; run the production build first`);
  return readFileSync(file, 'utf8');
};
const count = (html, token) => html.split(token).length - 1;

for (const [locale, path, pagePath] of [
  ['ko', 'ax/index.html', '/ax'],
  ['en', 'en/ax/index.html', '/en/ax'],
  ['ja', 'ja/ax/index.html', '/ja/ax'],
  ['zh', 'zh/ax/index.html', '/zh/ax'],
]) {
  const html = readDist(path);
  if (count(html, 'data-ax-launch-talk-widget') !== 1) {
    fail(`${locale} AX must render exactly one floating widget`);
  }
  if (count(html, 'data-ax-floating-hero') !== 1) {
    fail(`${locale} AX must render exactly one floating-widget hero marker`);
  }
  for (const value of [
    `data-locale="${locale}"`,
    'data-lead-page="ax"',
    'data-page-base-path="/ax"',
    'data-content-type="ax-solution"',
    'data-ax-launch-talk-cta',
  ]) {
    if (!html.includes(value)) fail(`${locale} AX is missing ${value}`);
  }
  if (!html.includes('target="_blank"') || !html.includes('rel="noopener noreferrer"')) {
    fail(`${locale} AX Launch Talk CTA must remain a native safe new-tab link`);
  }
  if (!html.includes(pagePath)) fail(`${locale} AX lost its localized page path`);
}

for (const path of ['ax-backup/index.html', 'index.html', 'about/index.html']) {
  const html = readDist(path);
  if (html.includes('data-ax-launch-talk-widget')) {
    fail(`dist/${path} must not render the AX Launch Talk widget`);
  }
}

for (const path of [
  'images/pages/ax/launch-talk/launch-talk-background.webp',
  'images/pages/ax/launch-talk/hwidong-bae.webp',
]) {
  if (!existsSync(join(dist, path))) fail(`missing optimized widget asset ${path}`);
}

const client = readFileSync(
  join(root, 'src/components/ax-launch-talk/axLaunchTalkWidgetClient.ts'),
  'utf8',
);
for (const token of [
  "'ax_launch_talk_click'",
  "fetch('/api/ax/launch-talk-leads'",
  'keepalive: true',
  "const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'",
]) {
  if (!client.includes(token)) fail(`widget client is missing ${token}`);
}
if (client.includes('preventDefault')) fail('Calendar CTA must never prevent native navigation');

console.log(
  'AX Launch Talk contract passed: four locales, native Calendar CTA, AX-only scope, assets, GA and keepalive lead request.',
);
