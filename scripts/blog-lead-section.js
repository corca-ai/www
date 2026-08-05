import { leadRequestCopyKeys, leadRequestVariants } from '../src/lead/leadRequestContract.js';

const START_MARKER = '<!-- corca-lead-request:start -->';
const END_MARKER = '<!-- corca-lead-request:end -->';
const PAGE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT_TYPE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VARIANTS = new Set(leadRequestVariants);
const COPY_KEYS = new Set(leadRequestCopyKeys);
const ALL_PUBLIC_POSTS_KEY = 'all_public_posts';
const MAX_PAGE_ID_LENGTH = 120;

export function validateBlogLeadManifest(manifest) {
  if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object') {
    throw new Error('Blog Lead Form manifest must define the all_public_posts policy.');
  }
  if (Object.keys(manifest).length !== 1 || !(ALL_PUBLIC_POSTS_KEY in manifest)) {
    throw new Error('Blog Lead Form manifest must contain only the all_public_posts policy.');
  }

  const declaration = manifest[ALL_PUBLIC_POSTS_KEY];
  if (!declaration || typeof declaration !== 'object') {
    throw new Error('Missing all_public_posts Lead Form declaration.');
  }
  if (!PAGE_ID_PATTERN.test(declaration.page_id_prefix ?? '')) {
    throw new Error('Invalid page_id_prefix for all_public_posts.');
  }
  if (!CONTENT_TYPE_PATTERN.test(declaration.content_type ?? '')) {
    throw new Error('Invalid content_type for all_public_posts.');
  }
  if (!VARIANTS.has(declaration.variant)) {
    throw new Error('Invalid Lead Request variant for all_public_posts.');
  }
  if (!COPY_KEYS.has(declaration.copy_key)) {
    throw new Error('Invalid Lead Request copy_key for all_public_posts.');
  }
  return manifest;
}

export function resolveBlogLeadDeclaration(manifest, slug) {
  if (!PAGE_ID_PATTERN.test(slug)) {
    throw new Error(`Invalid public blog slug for Lead Form: ${slug}`);
  }
  const policy = manifest[ALL_PUBLIC_POSTS_KEY];
  const pageId = `${policy.page_id_prefix}-${slug}`;
  if (pageId.length > MAX_PAGE_ID_LENGTH) {
    throw new Error(`Lead Form page_id is too long for public blog slug: ${slug}`);
  }
  return {
    page_id: pageId,
    content_type: policy.content_type,
    variant: policy.variant,
    copy_key: policy.copy_key,
  };
}

export function extractLeadRequestSection(html, source = 'rendered Lead Request fragment') {
  const startCount = html.split(START_MARKER).length - 1;
  const endCount = html.split(END_MARKER).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`Expected one Lead Request Section marker pair in ${source}.`);
  }
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER, start) + END_MARKER.length;
  const fragment = html.slice(start, end);
  if (!fragment.includes('data-lead-form')) {
    throw new Error(`Lead Form markup is missing from ${source}.`);
  }
  if (!fragment.includes('/api/ax/consultations')) {
    throw new Error(`Lead Form endpoint is missing from ${source}.`);
  }
  if (!fragment.includes('data-lead-request-section')) {
    throw new Error(`Lead Request Section contract is missing from ${source}.`);
  }
  if ((fragment.match(/<script\b/g) || []).length < 2) {
    throw new Error(`Lead Form and request-focus clients are missing from ${source}.`);
  }
  return fragment;
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
  assertAttribute(localized, 'data-lead-request-variant', declaration.variant, source);
  assertAttribute(localized, 'data-lead-request-copy', declaration.copy_key, source);

  const mainClose = html.lastIndexOf('</main>');
  if (mainClose < 0) throw new Error(`Could not locate </main> in ${source}.`);

  // Static blog pages keep their adjacent-post navigation after the article.
  // Place the request section immediately before that navigation so the
  // conversion step has a clear finish before readers choose another post.
  const paginationStart = html.search(
    /<nav\b[^>]*\bclass=["'][^"']*\bpost-pagination\b[^"']*["'][^>]*>/i,
  );
  const insertAt = paginationStart >= 0 && paginationStart < mainClose ? paginationStart : mainClose;
  const next = `${html.slice(0, insertAt)}${localized}${html.slice(insertAt)}`;
  if (
    next.split(START_MARKER).length - 1 !== 1 ||
    (next.match(/\bid=["']request["']/g) || []).length !== 1
  ) {
    throw new Error(`Expected exactly one managed Lead Request Section in ${source}.`);
  }
  return next;
}

function assertAttribute(html, name, value, source) {
  const pattern = new RegExp(`\\b${name}="${escapeRegExp(value)}"`, 'g');
  if ((html.match(pattern) || []).length !== 1) {
    throw new Error(`Expected ${name}="${value}" in the Lead Form fragment for ${source}.`);
  }
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
