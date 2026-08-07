import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets/brand/favicon-symbol.svg');
const faviconDir = join(root, 'public/favicons');
const officialSourceSha256 = '4e9be581cd5bf84e7ad16b1fea495ecb56352f7d965dbeaf1d9dfc40f64de002';

const assets = [
  ['corca-ai-16.png', 16],
  ['corca-ai-32.png', 32],
  ['corca-ai-48.png', 48],
  ['corca-ai-96.png', 96],
  ['corca-ai-apple-touch-180.png', 180],
  ['corca-ai-192.png', 192],
  ['corca-ai-512.png', 512],
];

const maskableAssets = [
  ['corca-ai-maskable-192.png', 192],
  ['corca-ai-maskable-512.png', 512],
];

const compatibilityAssets = [
  ['corca-ai-16.png', 'favicon-16.png'],
  ['corca-ai-32.png', 'favicon-32.png'],
  ['corca-ai-48.png', 'favicon-48.png'],
  ['corca-ai-apple-touch-180.png', 'apple-touch-icon.png'],
  ['corca-ai-192.png', 'icon-192.png'],
  ['corca-ai-512.png', 'icon-512.png'],
];

const icoAssetNames = ['corca-ai-16.png', 'corca-ai-32.png', 'corca-ai-48.png'];

const createPngIco = (images) => {
  const directorySize = 6 + images.length * 16;
  const header = Buffer.alloc(directorySize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let imageOffset = directorySize;
  images.forEach(({ size, data }, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(data.length, entryOffset + 8);
    header.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += data.length;
  });

  return Buffer.concat([header, ...images.map(({ data }) => data)]);
};

const sourceBuffer = await readFile(source);
const sourceSha256 = createHash('sha256').update(sourceBuffer).digest('hex');
if (sourceSha256 !== officialSourceSha256) {
  throw new Error(
    `Refusing to generate favicons from an unapproved source: ${sourceSha256}. ` +
      'Use the official Corca dolphin+i symbol or update this contract in an explicit brand change.',
  );
}

await mkdir(faviconDir, { recursive: true });

await Promise.all(
  assets.map(([name, size]) =>
    sharp(sourceBuffer)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .ensureAlpha()
      .png({ compressionLevel: 9, palette: false })
      .toFile(join(faviconDir, name)),
  ),
);

await Promise.all(
  maskableAssets.map(async ([name, size]) => {
    const safeSize = Math.round(size * 0.8);
    const safeIcon = await sharp(sourceBuffer)
      .resize(safeSize, safeSize, { kernel: sharp.kernel.lanczos3 })
      .ensureAlpha()
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: '#0061BC',
      },
    })
      .composite([{ input: safeIcon, gravity: 'centre' }])
      .png({ compressionLevel: 9, palette: false })
      .toFile(join(faviconDir, name));
  }),
);

await Promise.all(
  compatibilityAssets.map(([currentName, compatibilityName]) =>
    cp(join(faviconDir, currentName), join(faviconDir, compatibilityName)),
  ),
);

const icoImages = await Promise.all(
  icoAssetNames.map(async (name) => {
    const size = Number(name.match(/-(\d+)\.png$/)?.[1]);
    if (!size) throw new Error(`Could not infer ICO size from ${name}.`);
    return { size, data: await readFile(join(faviconDir, name)) };
  }),
);
const ico = createPngIco(icoImages);
if (ico.readUInt16LE(2) !== 1 || ico.readUInt16LE(4) !== icoImages.length) {
  throw new Error('Generated favicon.ico has an invalid ICO directory.');
}
await writeFile(join(root, 'public/favicon.ico'), ico);

// Keep these legacy URLs current for existing JSON-LD and static blog fallbacks.
await Promise.all([
  cp(join(faviconDir, 'corca-ai-192.png'), join(root, 'public/favicon.png')),
  cp(join(faviconDir, 'corca-ai-192.png'), join(root, 'public/blog/assets/favicon.png')),
]);

console.log(
  `Generated ${assets.length} favicon assets, ${maskableAssets.length} maskable assets, ` +
    `${compatibilityAssets.length} compatibility aliases and favicon.ico from ${source}.`,
);
