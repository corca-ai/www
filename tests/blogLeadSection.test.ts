import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractLeadRequestSection,
  injectBlogLeadRequestSection,
  validateBlogLeadManifest,
} from '../scripts/blog-lead-section.js';

const fragment = `<!-- corca-lead-request:start --><section id="request" data-lead-request-section><form data-lead-form data-locale="ko" data-lead-page="ax" data-page-base-path="/ax" data-content-type="ax-solution"></form></section><script type="module">window.testLeadSection=true</script><!-- corca-lead-request:end -->`;

test('extracts exactly one rendered Lead Request Section', () => {
  assert.equal(extractLeadRequestSection(`<main>${fragment}</main>`), fragment);
  assert.throws(() => extractLeadRequestSection('<main></main>'), /marker pair/);
});

test('injects stable blog context while keeping the actual pathname runtime-owned', () => {
  const html = injectBlogLeadRequestSection('<main><article>Post</article></main>', {
    fragment,
    slug: 'agentic-workflow',
    locale: 'en',
    declaration: { page_id: 'blog-agentic-workflow', content_type: 'blog-post' },
  });
  assert.match(html, /data-lead-page="blog-agentic-workflow"/);
  assert.match(html, /data-page-base-path="\/blog\/agentic-workflow"/);
  assert.match(html, /data-content-type="blog-post"/);
  assert.match(html, /data-locale="en"/);
  assert.equal((html.match(/id="request"/g) || []).length, 1);
  assert.ok(html.indexOf(fragment.split('<section')[0]) > html.indexOf('</article>'));
  assert.ok(html.indexOf('corca-lead-request:end') < html.indexOf('</main>'));
});

test('skips undeclared posts and rejects duplicate request targets', () => {
  const html = '<main><article>Post</article></main>';
  assert.equal(
    injectBlogLeadRequestSection(html, {
      fragment,
      slug: 'unregistered',
      locale: 'ko',
      declaration: undefined,
    }),
    html,
  );
  assert.throws(
    () =>
      injectBlogLeadRequestSection('<main><div id="request"></div></main>', {
        fragment,
        slug: 'registered',
        locale: 'ko',
        declaration: { page_id: 'registered', content_type: 'blog-post' },
      }),
    /already exists/,
  );
});

test('validates locale-neutral slug, page ID and content type', () => {
  assert.deepEqual(
    validateBlogLeadManifest({
      'agentic-workflow': { page_id: 'blog-agentic-workflow', content_type: 'blog-post' },
    }),
    {
      'agentic-workflow': { page_id: 'blog-agentic-workflow', content_type: 'blog-post' },
    },
  );
  assert.throws(
    () => validateBlogLeadManifest({ 'Bad Slug': { page_id: 'bad', content_type: 'blog-post' } }),
    /Invalid blog slug/,
  );
});
