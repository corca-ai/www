const START_MARKER = '<!-- corca-lead-request:start -->';
const END_MARKER = '<!-- corca-lead-request:end -->';
const PAGE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT_TYPE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateBlogLeadManifest(manifest) {
  if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object') {
    throw new Error('Blog Lead Form manifest must be an object keyed by locale-neutral slug.');
  }
  for (const [slug, declaration] of Object.entries(manifest)) {
    if (!PAGE_ID_PATTERN.test(slug))
      throw new Error(`Invalid blog slug in Lead Form manifest: ${slug}`);
    if (!declaration || typeof declaration !== 'object') {
      throw new Error(`Missing Lead Form declaration for blog slug: ${slug}`);
    }
    if (!PAGE_ID_PATTERN.test(declaration.page_id ?? '')) {
      throw new Error(`Invalid page_id for blog slug ${slug}.`);
    }
    if (!CONTENT_TYPE_PATTERN.test(declaration.content_type ?? '')) {
      throw new Error(`Invalid content_type for blog slug ${slug}.`);
    }
  }
  return manifest;
}

export function extractLeadRequestSection(html, source = 'rendered AX page') {
  const startCount = html.split(START_MARKER).length - 1;
  const endCount = html.split(END_MARKER).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`Expected one Lead Request Section marker pair in ${source}.`);
  }
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER, start) + END_MARKER.length;
  return html.slice(start, end);
}

export function injectBlogLeadRequestSection(
  html,
  { fragment, slug, locale, declaration, source = 'blog page' },
) {
  if (!slug || !declaration) return html;
  if (html.includes(START_MARKER) || /\bid=["']request["']/.test(html)) {
    throw new Error(`Lead Request Section or #request already exists in ${source}.`);
  }

  let localized = fragment;
  localized = replaceAttribute(localized, 'data-locale', locale, source);
  localized = replaceAttribute(localized, 'data-lead-page', declaration.page_id, source);
  localized = replaceAttribute(localized, 'data-page-base-path', `/blog/${slug}`, source);
  localized = replaceAttribute(localized, 'data-content-type', declaration.content_type, source);

  const mainClose = html.lastIndexOf('</main>');
  if (mainClose < 0) throw new Error(`Could not locate </main> in ${source}.`);
  const next = `${html.slice(0, mainClose)}${localized}${html.slice(mainClose)}`;
  if (
    next.split(START_MARKER).length - 1 !== 1 ||
    (next.match(/\bid=["']request["']/g) || []).length !== 1
  ) {
    throw new Error(`Expected exactly one managed Lead Request Section in ${source}.`);
  }
  return next;
}

function replaceAttribute(html, name, value, source) {
  const pattern = new RegExp(`\\b${name}="[^"]*"`, 'g');
  const matches = html.match(pattern) || [];
  if (matches.length !== 1) {
    throw new Error(`Expected one ${name} attribute in the Lead Form fragment for ${source}.`);
  }
  return html.replace(pattern, `${name}="${escapeAttribute(value)}"`);
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
