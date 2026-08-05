import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractLeadRequestSection,
  injectBlogLeadRequestSection,
  resolveBlogLeadDeclaration,
  validateBlogLeadManifest,
} from '../scripts/blog-lead-section.js';

const fragment = `<!-- corca-lead-request:start --><section id="request" data-lead-request-section data-lead-request-variant="article" data-lead-request-copy="ax-consultation"><form action="/api/ax/consultations" data-lead-form data-locale="ko" data-lead-page="fragment" data-page-base-path="/_lead-request" data-content-type="fragment"></form></section><script type="module">window.testLeadForm=true</script><script type="module">window.testLeadSection=true</script><!-- corca-lead-request:end -->`;
const declaration = {
  page_id_prefix: 'blog',
  content_type: 'blog-post',
  variant: 'article',
  copy_key: 'ax-consultation',
};
const manifest = { all_public_posts: declaration };

test('extracts exactly one rendered Lead Request Section', () => {
  assert.equal(extractLeadRequestSection(`<main>${fragment}</main>`), fragment);
  assert.throws(() => extractLeadRequestSection('<main></main>'), /marker pair/);
});

test('injects stable blog context while keeping the actual pathname runtime-owned', () => {
  const resolvedDeclaration = resolveBlogLeadDeclaration(manifest, 'agentic-workflow');
  const html = injectBlogLeadRequestSection('<main><article>Post</article></main>', {
    fragment,
    slug: 'agentic-workflow',
    locale: 'en',
    declaration: resolvedDeclaration,
  });
  assert.match(html, /data-lead-page="blog-agentic-workflow"/);
  assert.match(html, /data-page-base-path="\/blog\/agentic-workflow"/);
  assert.match(html, /data-content-type="blog-post"/);
  assert.match(html, /data-locale="en"/);
  assert.equal((html.match(/id="request"/g) || []).length, 1);
  assert.ok(html.indexOf(fragment.split('<section')[0]) > html.indexOf('</article>'));
  assert.ok(html.indexOf('corca-lead-request:end') < html.indexOf('</main>'));
});

test('places the request section before adjacent-post navigation when present', () => {
  const html = injectBlogLeadRequestSection(
    '<main><article>Post</article><nav class="post-pagination" aria-label="글 이동"></nav></main>',
    {
      fragment,
      slug: 'agentic-workflow',
      locale: 'ko',
      declaration: resolveBlogLeadDeclaration(manifest, 'agentic-workflow'),
    },
  );
  assert.ok(html.indexOf('corca-lead-request:end') < html.indexOf('<nav class="post-pagination"'));
});

test('applies the all-public-posts policy and rejects duplicate request targets', () => {
  assert.deepEqual(resolveBlogLeadDeclaration(manifest, 'new-notion-post'), {
    page_id: 'blog-new-notion-post',
    content_type: 'blog-post',
    variant: 'article',
    copy_key: 'ax-consultation',
  });
  assert.throws(
    () =>
      injectBlogLeadRequestSection('<main><div id="request"></div></main>', {
        fragment,
        slug: 'registered',
        locale: 'ko',
        declaration: resolveBlogLeadDeclaration(manifest, 'registered'),
      }),
    /already exists/,
  );
});

test('validates the all-public-posts policy', () => {
  assert.deepEqual(validateBlogLeadManifest(manifest), manifest);
  assert.throws(() => validateBlogLeadManifest({ 'Bad Slug': declaration }), /all_public_posts/);
  assert.throws(
    () =>
      validateBlogLeadManifest({
        all_public_posts: { ...declaration, variant: 'wide' },
      }),
    /Invalid Lead Request variant/,
  );
  assert.throws(
    () =>
      validateBlogLeadManifest({
        all_public_posts: { ...declaration, copy_key: 'unknown-copy' },
      }),
    /Invalid Lead Request copy_key/,
  );
  assert.throws(() => resolveBlogLeadDeclaration(manifest, 'Bad Slug'), /Invalid public blog slug/);
  assert.throws(() => resolveBlogLeadDeclaration(manifest, 'a'.repeat(116)), /page_id is too long/);
});
