import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets/brand/favicon-symbol.png');
const faviconDir = join(root, 'public/favicons');

const assets = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

const roundedSquareMask = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#fff"/></svg>`,
  );

await mkdir(faviconDir, { recursive: true });

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
  cp(join(faviconDir, 'icon-192.png'), join(root, 'public/favicon.png')),
  cp(join(faviconDir, 'icon-192.png'), join(root, 'public/blog/assets/favicon.png')),
]);

console.log(`Generated ${assets.length} optimized favicon assets from ${source}.`);
