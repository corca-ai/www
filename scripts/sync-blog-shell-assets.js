import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(repoRoot, 'dist');
const astroCssPattern = /\/_astro\/BaseLayout\.[^"')\s]+\.css/g;
const analyticsConfigPattern = /<script id="corca-analytics-config">.*?<\/script>/g;
const blogAppScriptPattern = /<script type="module" src="\/blog\/app\.js[^"']*"><\/script>/;
const blogRoots = ['blog', 'en/blog', 'ja/blog', 'zh/blog'].map((path) => join(distRoot, path));

const rootHtml = await readFile(join(distRoot, 'index.html'), 'utf8');
const currentBaseLayoutCss = rootHtml.match(astroCssPattern)?.[0] || '';
const measurementId =
  rootHtml.match(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9-]{4,32})/i)?.[1] || '';
if (!currentBaseLayoutCss) {
  fail('Could not find the current BaseLayout CSS link in dist/index.html.');
}

await assertFileExists(join(distRoot, currentBaseLayoutCss));

let updated = 0;
let analyticsConfigured = 0;
let analyticsTargets = 0;
for (const root of blogRoots) {
  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('corca-main-header') && !html.includes('corca-main-footer')) continue;

    let next = html.replace(astroCssPattern, currentBaseLayoutCss);
    if (next.includes('/blog/app.js')) {
      analyticsTargets += 1;
      if (!blogAppScriptPattern.test(next)) {
        fail(`Could not locate the blog app script tag in ${relative(repoRoot, file)}.`);
      }
      next = next.replace(analyticsConfigPattern, '');
      if (measurementId) {
        const analyticsConfig = `<script id="corca-analytics-config">window.CORCA_GA_MEASUREMENT_ID=${JSON.stringify(measurementId)};</script>`;
        next = next.replace(blogAppScriptPattern, `${analyticsConfig}$&`);
        if ((next.match(analyticsConfigPattern) || []).length !== 1) {
          fail(`Expected one analytics configuration in ${relative(repoRoot, file)}.`);
        }
        analyticsConfigured += 1;
      }
    }

    if (next !== html) {
      await writeFile(file, next);
      updated += 1;
    }

    if (!next.includes(currentBaseLayoutCss)) {
      fail(`${relative(repoRoot, file)} does not reference ${currentBaseLayoutCss}.`);
    }
  }
}

if (measurementId && analyticsConfigured !== analyticsTargets) {
  fail(`Configured analytics for ${analyticsConfigured} of ${analyticsTargets} blog page(s).`);
}

console.log(`Synced blog shell CSS ${currentBaseLayoutCss} in ${updated} file(s).`);
console.log(
  measurementId
    ? `Configured ${analyticsConfigured} blog page(s) with GA4 measurement ID ${measurementId}.`
    : 'Google Analytics is disabled; no blog analytics configuration was emitted.',
);

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
