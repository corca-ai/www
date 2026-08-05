import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets/brand/favicon-symbol.png');
const faviconDir = join(root, 'public/favicons');
const officialSourceSha256 = '0ae77ebc24831733f02e4a86ff0eae0f51d61d22e804a1dec116a5959c858be8';

const assets = [
  ['corca-ai-16.png', 16],
  ['corca-ai-32.png', 32],
  ['corca-ai-48.png', 48],
  ['corca-ai-apple-touch-180.png', 180],
  ['corca-ai-192.png', 192],
  ['corca-ai-512.png', 512],
];

const legacyAssets = [
  'favicon-16.png',
  'favicon-32.png',
  'favicon-48.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
];

const roundedSquareMask = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#fff"/></svg>`,
  );

const sourceSha256 = createHash('sha256')
  .update(await readFile(source))
  .digest('hex');
if (sourceSha256 !== officialSourceSha256) {
  throw new Error(
    `Refusing to generate favicons from an unapproved source: ${sourceSha256}. ` +
      'Use the official Corca dolphin+i symbol or update this contract in an explicit brand change.',
  );
}

await mkdir(faviconDir, { recursive: true });
await Promise.all(legacyAssets.map((name) => rm(join(faviconDir, name), { force: true })));

await Promise.all(
  assets.map(([name, size]) =>
    sharp(source)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .ensureAlpha()
      .composite([{ input: roundedSquareMask(size), blend: 'dest-in' }])
      .png({ compressionLevel: 9, palette: false })
      .toFile(join(faviconDir, name)),
  ),
);

// Keep these legacy URLs current for existing JSON-LD and static blog fallbacks.
await Promise.all([
  cp(join(faviconDir, 'corca-ai-192.png'), join(root, 'public/favicon.png')),
  cp(join(faviconDir, 'corca-ai-192.png'), join(root, 'public/blog/assets/favicon.png')),
]);

console.log(`Generated ${assets.length} optimized favicon assets from ${source}.`);
