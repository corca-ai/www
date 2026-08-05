import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leadRequestCopyKeys, leadRequestVariants } from '../src/lead/leadRequestContract.js';
import { extractLeadRequestSection, injectBlogLeadRequestSection } from './blog-lead-section.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const distRoot = join(repoRoot, 'dist');
const locales = ['ko', 'en', 'ja', 'zh'];
const slug = 'synthetic-lead-form-fixture';
const declaration = {
  page_id: 'blog-synthetic-lead-form-fixture',
  content_type: 'blog-post',
  variant: 'article',
  copy_key: 'ax-consultation',
};
const launchTalkUrl =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3pvmsLNxvJ5Jt9cX7kmgn8dhhFA27R8tnRNbe_THLtJHU4efWcKcNpyutCEU3n9Zf8R-9tMtRm';
const launchTalkCtas = {
  ko: '런치 토크 예약하기',
  en: 'Book a Launch Talk',
  ja: 'ランチトークを予約する',
  zh: '预约午餐交流',
};

for (const locale of locales) {
  for (const variant of leadRequestVariants) {
    for (const copyKey of leadRequestCopyKeys) {
      const source = `lead-request-fragment/${locale}/${variant}/${copyKey}/index.html`;
      const html = await readFile(join(distRoot, source), 'utf8');
      const fragment = extractLeadRequestSection(html, source);
      assertIncludes(fragment, `data-lead-request-variant="${variant}"`, source);
      assertIncludes(fragment, `data-lead-request-copy="${copyKey}"`, source);
      if (variant === 'article') {
        assertExcludes(fragment, 'lead-request-direct-contact', source);
      } else {
        assertIncludes(fragment, 'lead-request-direct-contact', source);
      }
      if (copyKey === 'ax-launch-talk' && variant !== 'article') {
        assertIncludes(fragment, 'AX Launch Talk', source);
        assertIncludes(fragment, launchTalkUrl, source);
        assertIncludes(fragment, launchTalkCtas[locale], source);
        assertExcludes(fragment, 'mailto:bae.hwidong@corca.ai', source);
        assertIncludes(fragment, 'tel:+82269256978', source);
      }
    }
  }

  const articleSource = `lead-request-fragment/${locale}/article/ax-consultation/index.html`;
  const articleHtml = await readFile(join(distRoot, articleSource), 'utf8');
  const fragment = extractLeadRequestSection(articleHtml, articleSource);
  const syntheticBlog = injectBlogLeadRequestSection(
    '<main id="main"><article>Synthetic post</article></main>',
    { fragment, slug, locale, declaration, source: `${locale} synthetic blog fixture` },
  );
  assertIncludes(syntheticBlog, `data-locale="${locale}"`, articleSource);
  assertIncludes(syntheticBlog, `data-lead-page="${declaration.page_id}"`, articleSource);
  assertIncludes(syntheticBlog, `data-page-base-path="/blog/${slug}"`, articleSource);
  assertIncludes(syntheticBlog, `data-content-type="${declaration.content_type}"`, articleSource);
}

for (const sitemap of ['sitemap.xml', 'sitemap-pages.xml']) {
  const html = await readFile(join(distRoot, sitemap), 'utf8');
  assertExcludes(html, 'lead-request-fragment', sitemap);
  assertExcludes(html, '#request', sitemap);
}

console.log(
  `Lead Request build contract passed for ${locales.length} locales, ${leadRequestVariants.length} variants and synthetic blog context.`,
);

function assertIncludes(value, expected, source) {
  if (!value.includes(expected)) throw new Error(`Expected ${expected} in ${source}.`);
}

function assertExcludes(value, expected, source) {
  if (value.includes(expected)) throw new Error(`Unexpected ${expected} in ${source}.`);
}
