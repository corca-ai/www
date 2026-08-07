import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const canonicalFavicon = 'https://www.corca.ai/favicons/corca-ai-48.png';
const canonicalAppleIcon = 'https://www.corca.ai/favicons/corca-ai-apple-touch-180.png';
const expectedAssets = [
  'favicon.ico',
  'favicons/corca-ai-16.png',
  'favicons/corca-ai-32.png',
  'favicons/corca-ai-48.png',
  'favicons/corca-ai-96.png',
  'favicons/corca-ai-apple-touch-180.png',
  'favicons/corca-ai-192.png',
  'favicons/corca-ai-512.png',
  'favicons/corca-ai-maskable-192.png',
  'favicons/corca-ai-maskable-512.png',
  'favicons/favicon-16.png',
  'favicons/favicon-32.png',
  'favicons/favicon-48.png',
  'favicons/apple-touch-icon.png',
  'favicons/icon-192.png',
  'favicons/icon-512.png',
];
const compatibilityPairs = [
  ['favicons/corca-ai-16.png', 'favicons/favicon-16.png'],
  ['favicons/corca-ai-32.png', 'favicons/favicon-32.png'],
  ['favicons/corca-ai-48.png', 'favicons/favicon-48.png'],
  ['favicons/corca-ai-apple-touch-180.png', 'favicons/apple-touch-icon.png'],
  ['favicons/corca-ai-192.png', 'favicons/icon-192.png'],
  ['favicons/corca-ai-512.png', 'favicons/icon-512.png'],
];

if (!existsSync(dist)) fail('missing dist/; run the production build first');
for (const asset of expectedAssets) {
  assert(existsSync(join(dist, asset)), `missing dist/${asset}`);
}
for (const [currentAsset, compatibilityAsset] of compatibilityPairs) {
  assert(
    readFileSync(join(dist, currentAsset)).equals(readFileSync(join(dist, compatibilityAsset))),
    `${compatibilityAsset} must be byte-identical to ${currentAsset}`,
  );
}

validateIco(readFileSync(join(dist, 'favicon.ico')));
validateManifest(JSON.parse(readFileSync(join(dist, 'site.webmanifest'), 'utf8')));

const files = htmlFiles(dist).filter((file) => !isInternalPage(file));
for (const file of files) {
  const source = relative(dist, file).replaceAll('\\', '/');
  const html = readFileSync(file, 'utf8');
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const searchIcons = links.filter((tag) => {
    const rel = attributeValue(tag, 'rel').toLowerCase();
    return rel === 'icon' || rel === 'shortcut icon';
  });
  const appleIcons = links.filter(
    (tag) => attributeValue(tag, 'rel').toLowerCase() === 'apple-touch-icon',
  );

  assert(
    searchIcons.length === 1,
    `${source} must declare exactly one search favicon; found ${searchIcons.length}`,
  );
  assert(
    attributeValue(searchIcons[0], 'rel').toLowerCase() === 'icon',
    `${source} must use the standard rel="icon"`,
  );
  assert(
    attributeValue(searchIcons[0], 'href') === canonicalFavicon,
    `${source} must use ${canonicalFavicon}`,
  );
  assert(
    attributeValue(searchIcons[0], 'type') === 'image/png',
    `${source} favicon must declare image/png`,
  );
  assert(
    attributeValue(searchIcons[0], 'sizes') === '48x48',
    `${source} favicon must declare sizes="48x48"`,
  );
  assert(
    appleIcons.length === 1,
    `${source} must declare exactly one apple-touch-icon; found ${appleIcons.length}`,
  );
  assert(
    attributeValue(appleIcons[0], 'href') === canonicalAppleIcon,
    `${source} must use ${canonicalAppleIcon}`,
  );
  assert(!html.includes('/blog/assets/favicon.png'), `${source} contains the legacy blog favicon`);
}

console.log(
  `Favicon contract passed for ${files.length} public HTML files using ${canonicalFavicon}.`,
);

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}

function isInternalPage(file) {
  const source = relative(dist, file).replaceAll('\\', '/');
  return (
    source.startsWith('blog/admin/') ||
    source.startsWith('lead-request-fragment/') ||
    /^naver[\da-f]+\.html$/i.test(source)
  );
}

function attributeValue(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] ?? '';
}

function validateIco(ico) {
  assert(ico.readUInt16LE(0) === 0, 'favicon.ico reserved header must be zero');
  assert(ico.readUInt16LE(2) === 1, 'favicon.ico must declare icon type');
  assert(ico.readUInt16LE(4) === 3, 'favicon.ico must contain 16px, 32px and 48px entries');
  const sizes = [0, 1, 2].map((index) => ico.readUInt8(6 + index * 16));
  assert(sizes.join(',') === '16,32,48', `favicon.ico has unexpected sizes: ${sizes.join(',')}`);
}

function validateManifest(manifest) {
  const icons = manifest.icons ?? [];
  const expected = [
    ['/favicons/corca-ai-192.png', '192x192', 'any'],
    ['/favicons/corca-ai-512.png', '512x512', 'any'],
    ['/favicons/corca-ai-maskable-192.png', '192x192', 'maskable'],
    ['/favicons/corca-ai-maskable-512.png', '512x512', 'maskable'],
  ];
  assert(icons.length === expected.length, `manifest must contain ${expected.length} icons`);
  for (const [src, sizes, purpose] of expected) {
    const icon = icons.find((candidate) => candidate.src === src);
    assert(icon, `manifest missing ${src}`);
    assert(icon.sizes === sizes, `${src} must declare ${sizes}`);
    assert(icon.type === 'image/png', `${src} must declare image/png`);
    assert(icon.purpose === purpose, `${src} must declare purpose=${purpose}`);
  }
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  throw new Error(`[favicon-contract] ${message}`);
}
