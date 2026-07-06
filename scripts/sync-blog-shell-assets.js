import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(repoRoot, 'dist');
const astroCssPattern = /\/_astro\/BaseLayout\.[^"')\s]+\.css/g;
const blogRoots = ['blog', 'en/blog', 'ja/blog', 'zh/blog'].map((path) => join(distRoot, path));

const rootHtml = await readFile(join(distRoot, 'index.html'), 'utf8');
const currentBaseLayoutCss = rootHtml.match(astroCssPattern)?.[0] || '';
if (!currentBaseLayoutCss) {
  fail('Could not find the current BaseLayout CSS link in dist/index.html.');
}

await assertFileExists(join(distRoot, currentBaseLayoutCss));

let updated = 0;
for (const root of blogRoots) {
  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('corca-main-header') && !html.includes('corca-main-footer')) continue;

    const next = html.replace(astroCssPattern, currentBaseLayoutCss);
    if (next !== html) {
      await writeFile(file, next);
      updated += 1;
    }

    if (!next.includes(currentBaseLayoutCss)) {
      fail(`${relative(repoRoot, file)} does not reference ${currentBaseLayoutCss}.`);
    }
  }
}

console.log(`Synced blog shell CSS ${currentBaseLayoutCss} in ${updated} file(s).`);

async function htmlFiles(root) {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path);
    }
  }
  return files;
}

async function assertFileExists(path) {
  try {
    const info = await stat(path);
    if (info.isFile()) return;
  } catch {
    // handled below
  }
  fail(`Expected Astro CSS asset does not exist: ${relative(repoRoot, path)}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
