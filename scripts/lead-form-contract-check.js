import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const formPath = join(root, 'src/components/forms/LeadForm.astro');
const clientPath = join(root, 'src/components/forms/leadFormClient.ts');
const fixturePath = join(root, 'tests/fixtures/lead-form-markup.sha256');
const ownedCssPath = 'src/components/forms/lead-form.css';

const fail = (message) => {
  throw new Error(`[lead-form-contract] ${message}`);
};

const formSource = await readFile(formPath, 'utf8');
const formMarkup = formSource.match(/<form[\s\S]*?<\/form>/)?.[0];
if (!formMarkup) fail('LeadForm.astro must contain exactly one form element.');
if ((formSource.match(/<form\b/g) || []).length !== 1) {
  fail('LeadForm.astro must keep exactly one form element.');
}

const expectedHash = (await readFile(fixturePath, 'utf8')).trim();
const actualHash = createHash('sha256').update(formMarkup).digest('hex');
if (actualHash !== expectedHash) {
  fail(
    `immutable form markup changed (${actualHash}). Restore the existing markup; do not update the fixture without an explicitly approved Lead Form policy PR.`,
  );
}

const clientSource = await readFile(clientPath, 'utf8');
for (const required of [
  "fetch('/api/ax/consultations'",
  "emitAnalytics('form_submit'",
  "emitAnalytics('generate_lead'",
  "form.dispatchEvent(new CustomEvent('ax:lead-sent'",
]) {
  if (!clientSource.includes(required)) fail(`missing client contract: ${required}`);
}

const sourceFiles = await walk(join(root, 'src'));
const duplicatedForms = [];
for (const file of sourceFiles.filter((path) => path.endsWith('.astro') && path !== formPath)) {
  const source = await readFile(file, 'utf8');
  if (/name=["']ax_consultation["']|\bdata-lead-form\b/.test(source)) {
    duplicatedForms.push(relative(root, file));
  }
}
if (duplicatedForms.length > 0) {
  fail(`Lead Form markup must not be copied outside LeadForm.astro: ${duplicatedForms.join(', ')}`);
}

const protectedSelector =
  /\[data-lead-form\]|\.ax-v2-(?:lead-form|form-(?:grid|alert|submit|status)|field|interest|other-interest|consent|privacy-notice|honeypot|hold-dialog|hold-panel|hold-title|hold-copy|success-)/;
const externalCss = [];
for (const file of sourceFiles.filter((path) => path.endsWith('.css'))) {
  const path = relative(root, file);
  if (path === ownedCssPath) continue;
  const source = await readFile(file, 'utf8');
  if (protectedSelector.test(source)) externalCss.push(path);
}
if (externalCss.length > 0) {
  fail(`external CSS targets the immutable Lead Form contract: ${externalCss.join(', ')}`);
}

console.log('Lead Form contract passed: markup, endpoint, analytics and CSS ownership are locked.');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
