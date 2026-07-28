const WEB_IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp']);

export function browserImageExtension(data, fallbackExtension = '') {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data || []);
  if (isJpeg(bytes)) return '.jpg';
  if (isPng(bytes)) return '.png';
  if (isGif(bytes)) return '.gif';
  if (isWebp(bytes)) return '.webp';
  if (isSvg(bytes)) return '.svg';

  const isoBrands = isoBaseMediaBrands(bytes);
  if (isoBrands.some((brand) => brand === 'avif' || brand === 'avis')) {
    return '.avif';
  }
  if (isoBrands.some((brand) => HEIF_BRANDS.has(brand))) {
    throw new Error(
      'Notion image contains HEIF/HEIC data, which is not safe for cross-browser publishing. Re-upload it as JPEG, PNG, WebP, or AVIF.',
    );
  }

  const fallback = String(fallbackExtension || '').toLowerCase();
  if (WEB_IMAGE_EXTENSIONS.has(fallback)) {
    throw new Error(
      `Notion image bytes do not match a supported browser image format (${fallback}).`,
    );
  }
  throw new Error('Notion image must be JPEG, PNG, GIF, WebP, AVIF, or SVG.');
}

const HEIF_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
]);

function isJpeg(bytes) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes) {
  return (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  );
}

function isGif(bytes) {
  const signature = bytes.subarray(0, 6).toString('ascii');
  return signature === 'GIF87a' || signature === 'GIF89a';
}

function isWebp(bytes) {
  return (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}

function isSvg(bytes) {
  const prefix = bytes.subarray(0, 512).toString('utf8').trimStart();
  return /^(?:<\?xml[\s\S]*?\?>\s*)?<svg(?:\s|>)/i.test(prefix);
}

function isoBaseMediaBrands(bytes) {
  if (bytes.length < 16 || bytes.subarray(4, 8).toString('ascii') !== 'ftyp') {
    return [];
  }
  const boxSize = Math.min(bytes.readUInt32BE(0), bytes.length, 64);
  const brands = [];
  for (let offset = 8; offset + 4 <= boxSize; offset += 4) {
    if (offset === 12) continue;
    brands.push(bytes.subarray(offset, offset + 4).toString('ascii'));
  }
  return brands;
}
