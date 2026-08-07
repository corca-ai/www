import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = JSON.parse(
  await readFile(join(root, 'tests/fixtures/lead-form-rendered.json'), 'utf8'),
);

for (const locale of ['ko', 'en', 'ja', 'zh']) {
  const page = locale === 'ko' ? 'ax/index.html' : `${locale}/ax/index.html`;
  const html = await readFile(join(root, 'dist', page), 'utf8');
  for (const placement of ['inline', 'modal']) {
    const id = `ax-lead-${placement}`;
    const marker = `id="${id}"`;
    const markerIndex = html.indexOf(marker);
    const start = html.lastIndexOf('<form', markerIndex);
    const end = html.indexOf('</form>', start) + '</form>'.length;
    if (markerIndex < 0 || start < 0 || end < '</form>'.length) {
      throw new Error(`[lead-form-rendered] Could not find ${id} in ${page}.`);
    }
    const actual = createHash('sha256').update(html.slice(start, end)).digest('hex');
    const expected = fixture[locale]?.[placement];
    if (actual !== expected) {
      throw new Error(
        `[lead-form-rendered] ${locale}/${placement} changed (${actual}). Restore the immutable Form output; update the fixture only in an explicitly approved Form policy PR.`,
      );
    }
  }
}

console.log('Rendered Lead Form contract passed for inline and modal forms in four locales.');
