import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const canonicalFavicon = 'https://www.corca.ai/favicon.ico';
const canonicalAppleIcon = 'https://www.corca.ai/favicons/corca-ai-apple-touch-180.png';

if (!existsSync(dist)) fail('missing dist/; run the production build first');
if (!existsSync(join(dist, 'favicon.ico'))) fail('missing dist/favicon.ico');

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

function assert(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  throw new Error(`[favicon-contract] ${message}`);
}
