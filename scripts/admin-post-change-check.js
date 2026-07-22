import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'corca-www-admin-post-change-'));
const workDir = join(fixtureRoot, 'www');
const slug = 'admin-edit-fixture';
const fallbackThumbnail = 'assets/admin-posts/adjacent-thumbnail-fixture-222222222222.png';
const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const productDisplayTopics = [
  '문라이트',
  'Moonlight',
  '트레이스',
  'Trace',
  '씰',
  'Ceal',
  '마진',
  'Margin',
  '크라켄',
  'Kraken',
];

try {
  for (const sourceRoot of [
    'public/blog/admin/post-sources',
    'public/blog/admin/post-translations/en',
    'public/blog/admin/post-translations/ja',
    'public/blog/admin/post-translations/zh',
  ]) {
    for (const file of (await readdir(join(repoRoot, sourceRoot))).filter((name) =>
      name.endsWith('.html'),
    )) {
      const sourceMetadata = embeddedMetadata(
        await readFile(join(repoRoot, sourceRoot, file), 'utf8'),
      );
      assert.equal(sourceMetadata.tags.length, 1, `${sourceRoot}/${file} must have one category`);
      assert.equal(
        [...productDisplayTopics, 'AX', '코르카', 'Corca'].includes(sourceMetadata.tags[0]),
        true,
        `${sourceRoot}/${file} must use a supported display topic`,
      );
      if (sourceMetadata.section) {
        assert.equal(
          categoryForDisplayTopic(sourceMetadata.tags[0]),
          normalizeCategory(sourceMetadata.section),
          `${sourceRoot}/${file} display topic must belong to its section`,
        );
      }
    }
  }
  for (const sourcePath of [
    'public/blog/admin/post-sources/corca-newbie-trip.html',
    'public/blog/admin/post-translations/en/corca-newbie-trip.html',
    'public/blog/admin/post-translations/ja/corca-newbie-trip.html',
    'public/blog/admin/post-translations/zh/corca-newbie-trip.html',
  ]) {
    const newbieMetadata = embeddedMetadata(await readFile(join(repoRoot, sourcePath), 'utf8'));
    assert.deepEqual(newbieMetadata.tags, ['AX']);
    assert.equal(newbieMetadata.section, 'AX');
  }
  for (const sourcePath of [
    'public/blog/admin/post-sources/ceal-terview-ai-work-trust-cli-guideline-rewrite-with-image.html',
    'public/blog/admin/post-translations/en/ceal-terview-ai-work-trust-cli-guideline-rewrite-with-image.html',
    'public/blog/admin/post-translations/ja/ceal-terview-ai-work-trust-cli-guideline-rewrite-with-image.html',
    'public/blog/admin/post-translations/zh/ceal-terview-ai-work-trust-cli-guideline-rewrite-with-image.html',
  ]) {
    const axPostSource = await readFile(join(repoRoot, sourcePath), 'utf8');
    const axPostMetadata = embeddedMetadata(axPostSource);
    assert.deepEqual(axPostMetadata.tags, ['AX']);
    assert.equal(axPostMetadata.section, 'AX');
    assert.doesNotMatch(axPostSource, /ceal-terview · 2026-06-25/i);
  }
  for (const [sourcePath, expectedTag, expectedSection] of [
    ['public/blog/admin/post-sources/voc-agent.html', '문라이트', '제품'],
    ['public/blog/admin/post-translations/en/voc-agent.html', 'Moonlight', 'Product'],
    ['public/blog/admin/post-translations/ja/voc-agent.html', 'Moonlight', 'Product'],
    ['public/blog/admin/post-translations/zh/voc-agent.html', 'Moonlight', 'Product'],
  ]) {
    const vocMetadata = embeddedMetadata(await readFile(join(repoRoot, sourcePath), 'utf8'));
    assert.deepEqual(vocMetadata.tags, [expectedTag]);
    assert.equal(vocMetadata.section, expectedSection);
  }
  for (const [sourcePath, expectedSection] of [
    ['public/blog/admin/post-sources/corca-team-page.html', '코르카'],
    ['public/blog/admin/post-sources/corca-buddy-program.html', '코르카'],
    ['public/blog/admin/post-translations/en/corca-team-page.html', 'Corca'],
    ['public/blog/admin/post-translations/en/corca-buddy-program.html', 'Corca'],
    ['public/blog/admin/post-translations/ja/corca-team-page.html', 'Corca'],
    ['public/blog/admin/post-translations/ja/corca-buddy-program.html', 'Corca'],
    ['public/blog/admin/post-translations/zh/corca-team-page.html', 'Corca'],
    ['public/blog/admin/post-translations/zh/corca-buddy-program.html', 'Corca'],
  ]) {
    const corcaMetadata = embeddedMetadata(await readFile(join(repoRoot, sourcePath), 'utf8'));
    assert.deepEqual(corcaMetadata.tags, ['코르카']);
    assert.equal(corcaMetadata.section, expectedSection);
  }
  for (const [localeRoot, productCategory, corcaCategory, expectedProductTopics] of [
    [
      'blog',
      '제품',
      '코르카',
      {
        'we-make-ai-colleague': '문라이트',
        'ceal-operations-team': '씰',
        'voc-agent': '문라이트',
        'live-activity-schedule': '트레이스',
        'app-store-optimization': '트레이스',
      },
    ],
    [
      'en/blog',
      'Product',
      'Corca',
      {
        'we-make-ai-colleague': 'Moonlight',
        'ceal-operations-team': 'Ceal',
        'voc-agent': 'Moonlight',
        'live-activity-schedule': 'Trace',
        'app-store-optimization': 'Trace',
      },
    ],
    [
      'ja/blog',
      'Product',
      'Corca',
      {
        'we-make-ai-colleague': 'Moonlight',
        'ceal-operations-team': 'Ceal',
        'voc-agent': 'Moonlight',
        'live-activity-schedule': 'Trace',
        'app-store-optimization': 'Trace',
      },
    ],
    [
      'zh/blog',
      'Product',
      'Corca',
      {
        'we-make-ai-colleague': 'Moonlight',
        'ceal-operations-team': 'Ceal',
        'voc-agent': 'Moonlight',
        'live-activity-schedule': 'Trace',
        'app-store-optimization': 'Trace',
      },
    ],
  ]) {
    const posts = JSON.parse(
      await readFile(join(repoRoot, `public/${localeRoot}/index.json`), 'utf8'),
    );
    assert.equal(
      posts.every(
        (post) =>
          post.tags.length === 1 &&
          [productCategory, 'AX', corcaCategory].includes(post.section) &&
          categoryForDisplayTopic(post.tags[0]) === normalizeCategory(post.section),
      ),
      true,
    );
    for (const [productSlug, displayTopic] of Object.entries(expectedProductTopics)) {
      const post = posts.find((item) => item.slug === productSlug);
      assert.deepEqual(post?.tags, [displayTopic]);
      assert.equal(post?.section, productCategory);
    }
    const axPost = posts.find(
      (post) => post.slug === 'ceal-terview-ai-work-trust-cli-guideline-rewrite-with-image',
    );
    assert.deepEqual(axPost?.tags, ['AX']);
    assert.equal(axPost?.section, 'AX');
    assert.doesNotMatch(
      await readFile(
        join(
          repoRoot,
          `public/${localeRoot}/ceal-terview-ai-work-trust-cli-guideline-rewrite-with-image/index.html`,
        ),
        'utf8',
      ),
      /ceal-terview · 2026-06-25/i,
    );
    assert.deepEqual(posts.find((post) => post.slug === 'corca-team-page')?.tags, [corcaCategory]);
    assert.deepEqual(posts.find((post) => post.slug === 'corca-buddy-program')?.tags, [
      corcaCategory,
    ]);
    for (const post of posts) {
      const staticPost = await readFile(
        join(repoRoot, `public/${localeRoot}/${post.slug}/index.html`),
        'utf8',
      );
      assert.equal(staticPost.includes('https://www.borca.ai'), false);
      assert.equal(staticPost.includes('https://www.corca.ai'), true);
    }
  }
  for (const outputPath of [
    'public/blog/feed.json',
    'public/blog/robots.txt',
    'public/blog/rss.xml',
    'public/blog/sitemap.xml',
    'public/sitemap-categories.xml',
    'public/sitemap-posts.xml',
    'public/sitemap-tags.xml',
  ]) {
    const generatedOutput = await readFile(join(repoRoot, outputPath), 'utf8');
    assert.equal(generatedOutput.includes('https://www.borca.ai'), false);
    assert.equal(generatedOutput.includes('https://www.corca.ai'), true);
  }
  const blogAppSource = await readFile(join(repoRoot, 'public/blog/app.js'), 'utf8');
  assert.match(
    blogAppSource,
    /return Boolean\(value\) && normalizeSearchText\(getPostSection\(post\)\) === normalizeSearchText\(value\);/,
  );
  assert.doesNotMatch(
    blogAppSource,
    /return Boolean\(value\) && normalizeSearchText\(getPrimaryPostTopic\(post\)\) === normalizeSearchText\(value\);/,
  );
  assert.match(blogAppSource, /bindHashlessTocNavigation\(\);/);
  assert.match(blogAppSource, /closest\("\.toc-section a\[href\^='#'\]"\)/);
  assert.match(
    blogAppSource,
    /history\.replaceState\(history\.state, "", `\$\{window\.location\.pathname\}\$\{window\.location\.search\}`\);/,
  );
  assert.match(blogAppSource, /target\.scrollIntoView\(\{ block: "start" \}\);/);

  await mkdir(join(workDir, 'public/blog/admin/post-sources'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/posts'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/assets'), { recursive: true });
  await mkdir(join(workDir, 'public/en/blog'), { recursive: true });
  await mkdir(join(workDir, 'public/ja/blog'), { recursive: true });
  await mkdir(join(workDir, 'public/zh/blog'), { recursive: true });

  for (const file of [
    'public/blog/index.html',
    'public/en/blog/index.html',
    'public/ja/blog/index.html',
    'public/zh/blog/index.html',
    'public/blog/assets/editorial-cover.jpg',
  ]) {
    await cp(join(repoRoot, file), join(workDir, file), { recursive: true });
  }

  await writeFile(join(workDir, 'public/blog/posts/index.json'), '[]\n');

  assert.throws(
    () =>
      runAdminChange(
        {
          action: 'upsert',
          slug,
          format: 'markdown',
          fileName: 'product-without-family.md',
          metadata: {
            title: 'Product Without Family',
            description: 'A Product post must provide the family shown on its card.',
            date: '2026-02-03',
            tags: 'Product',
            author: 'Fixture Author',
            cover: 'assets/editorial-cover.jpg',
            language: 'ko',
            section: 'Product',
          },
          contentBase64: toBase64(`# Product Without Family

This fixture verifies that a generic Product label cannot replace the product family.`),
        },
        { stdio: 'pipe' },
      ),
    (error) => {
      assert.match(
        String(error.stderr || ''),
        /Product posts must use Moonlight, Trace, Ceal, Margin, or Kraken as the display topic/,
      );
      return true;
    },
  );

  for (const [familyTag, expectedDisplayTopic] of [
    ['Moonlight', '문라이트'],
    ['문라이트', '문라이트'],
    ['Trace', '트레이스'],
    ['트레이스', '트레이스'],
    ['Ceal', '씰'],
    ['씰', '씰'],
    ['Margin', '마진'],
    ['마진', '마진'],
    ['Kraken', '크라켄'],
    ['크라켄', '크라켄'],
  ]) {
    runAdminChange({
      action: 'upsert',
      slug,
      format: 'markdown',
      fileName: 'product-family-fixture.md',
      metadata: {
        title: `${familyTag} Product Family Fixture`,
        description: `${familyTag} must normalize to the single Product category.`,
        date: '2026-02-03',
        tags: familyTag,
        author: 'Fixture Author',
        cover: 'assets/editorial-cover.jpg',
        language: 'ko',
        section: familyTag,
      },
      contentBase64: toBase64(`# ${familyTag} Product Family Fixture

This fixture verifies that the product-family category is normalized consistently.`),
    });
    const familyMetadata = embeddedMetadata(
      await readFile(join(workDir, `public/blog/admin/post-sources/${slug}.html`), 'utf8'),
    );
    assert.deepEqual(familyMetadata.tags, [expectedDisplayTopic]);
    assert.equal(familyMetadata.section, '제품');
  }

  runAdminChange({
    action: 'upsert',
    slug,
    format: 'markdown',
    fileName: 'admin-edit-fixture.md',
    metadata: {
      title: 'Admin Markdown Updated',
      description: 'Markdown description updated through the admin editor.',
      date: '2026-02-03',
      tags: '문라이트,제품',
      author: 'Markdown Author',
      cover: 'assets/editorial-cover.jpg',
      language: 'ko',
      coverAlt: 'Markdown cover alt',
      section: '문라이트',
    },
    coverImageBase64: tinyPngBase64,
    coverImageFileName: 'uploaded-cover.png',
    coverImageMime: 'image/png',
    bodyImages: [
      {
        contentBase64: tinyPngBase64,
        fileName: 'admin-edit-fixture-111111111111.png',
        mime: 'image/png',
      },
    ],
    contentBase64: toBase64(`# Admin Markdown Updated

## Markdown Section

#### Deeper Markdown Heading

Admin markdown body with **bold** text and [Corca](https://www.corca.ai/).

This line has {color=#0066cc}blue text{/color} and a body image.

![Body fixture](assets/admin-posts/admin-edit-fixture-111111111111.png)

> Admin markdown quote should become a blockquote.

---

This line has _italic emphasis_ and an ![inline image](assets/editorial-cover.jpg).

- [x] Checked task item
- [ ] Open task item

| Feature | Status |
| --- | --- |
| Table preview | Works |

This line has ~~removed copy~~ for strike-through preview.

\`\`\`js
const markdownRenderer = 'standard';
\`\`\`

This fixture intentionally includes enough article copy to pass the public post generator while still focusing on the admin edit path. The admin editor should preserve the Markdown source for later editing, render the body into HTML for readers, and regenerate the index from the same metadata that was sent by the Worker dispatch.

- First admin list item
- Second admin list item`),
  });

  runAdminChange({
    action: 'upsert',
    slug: 'adjacent-thumbnail-fixture',
    format: 'markdown',
    fileName: 'adjacent-thumbnail-fixture.md',
    metadata: {
      title: 'Adjacent Thumbnail Fixture',
      description: 'Adjacent post used to verify thumbnail pagination cards.',
      date: '2026-02-02',
      tags: '문라이트,제품',
      author: 'Adjacent Author',
      cover: 'assets/editorial-cover.jpg',
      language: 'ko',
      coverAlt: 'Adjacent cover alt',
      section: '문라이트',
    },
    bodyImages: [
      {
        contentBase64: tinyPngBase64,
        fileName: 'adjacent-thumbnail-fixture-222222222222.png',
        mime: 'image/png',
      },
    ],
    contentBase64: toBase64(`# Adjacent Thumbnail Fixture

![Adjacent thumbnail](assets/admin-posts/adjacent-thumbnail-fixture-222222222222.png)

This adjacent fixture gives the generated static page a previous-post card so the thumbnail pagination markup can be verified. The body intentionally includes enough copy to pass the public post generator while keeping the fixture focused on adjacent post navigation.`),
  });

  const source = await readFile(
    join(workDir, `public/blog/admin/post-sources/${slug}.html`),
    'utf8',
  );
  const metadata = embeddedMetadata(source);
  assert.equal(metadata.title, 'Admin Markdown Updated');
  assert.equal(metadata.sourceFormat, 'markdown');
  assert.deepEqual(metadata.tags, ['문라이트']);
  assert.equal(metadata.section, '제품');
  assert.match(metadata.sourceMarkdown, /^# Admin Markdown Updated/);
  assert.match(metadata.cover, /^assets\/admin-posts\/admin-edit-fixture-[a-f0-9]{12}\.png$/);

  const index = JSON.parse(await readFile(join(workDir, 'public/blog/posts/index.json'), 'utf8'));
  const indexAlias = JSON.parse(await readFile(join(workDir, 'public/blog/index.json'), 'utf8'));
  assert.equal(index.length, 2);
  assert.equal(index[0].slug, slug);
  assert.equal(index[0].title, 'Admin Markdown Updated');
  assert.equal(index[0].cover, metadata.cover);
  assert.equal(index[1].slug, 'adjacent-thumbnail-fixture');
  assert.equal(index[1].cover, fallbackThumbnail);
  assert.equal(
    index.every(
      (post) =>
        post.tags.length === 1 &&
        categoryForDisplayTopic(post.tags[0]) === normalizeCategory(post.section),
    ),
    true,
  );
  assert.deepEqual(indexAlias, index);

  const staticPage = await readFile(join(workDir, `public/blog/${slug}/index.html`), 'utf8');
  assert.match(staticPage, /Admin Markdown Updated/);
  assert.match(staticPage, /<link rel="stylesheet" href="\/blog\/styles\.css\?v=[^"]+">/);
  assert.doesNotMatch(
    staticPage,
    /<meta name="robots" content="index,follow,max-image-preview:large">/,
  );
  assert.match(
    staticPage,
    /<link rel="canonical" href="https:\/\/www\.corca\.ai\/blog\/admin-edit-fixture">/,
  );
  for (const [hreflang, path] of [
    ['ko-KR', '/blog/admin-edit-fixture'],
    ['en-US', '/en/blog/admin-edit-fixture'],
    ['ja-JP', '/ja/blog/admin-edit-fixture'],
    ['zh-CN', '/zh/blog/admin-edit-fixture'],
  ]) {
    assert.match(
      staticPage,
      new RegExp(
        `<link rel="alternate" hreflang="${hreflang}" href="https:\\/\\/www\\.corca\\.ai${path}">`,
      ),
    );
  }
  assert.match(
    staticPage,
    /<link rel="alternate" hreflang="x-default" href="https:\/\/www\.corca\.ai\/blog\/admin-edit-fixture">/,
  );
  assert.match(staticPage, /<h4>Deeper Markdown Heading<\/h4>/);
  assert.match(staticPage, /<strong>bold<\/strong>/);
  assert.match(staticPage, /<blockquote>/);
  assert.match(staticPage, /<hr>/);
  assert.match(staticPage, /<em>italic emphasis<\/em>/);
  assert.match(staticPage, /<span style="color: #0066cc">blue text<\/span>/);
  assert.match(
    staticPage,
    /<li class="task-list-item" data-task-checked="true"><input type="checkbox" disabled checked>/,
  );
  assert.match(staticPage, /<table>[\s\S]*<th>Feature<\/th>[\s\S]*<th>Status<\/th>/);
  assert.match(staticPage, /<del>removed copy<\/del>/);
  assert.match(
    staticPage,
    /<pre><code class="language-js">const markdownRenderer = 'standard';\n<\/code><\/pre>/,
  );
  assert.match(staticPage, /<img src="\/blog\/assets\/editorial-cover\.jpg"/);
  assert.match(
    staticPage,
    /<img src="\/blog\/assets\/admin-posts\/admin-edit-fixture-111111111111\.png"/,
  );
  assert.match(staticPage, /class="related-card post-pagination-card post-pagination-previous"/);
  assert.match(staticPage, /<span class="related-thumbnail" aria-hidden="true">/);
  assert.match(staticPage, /<details class="article-mobile-navigation">/);
  assert.match(staticPage, /<summary>목차와 추천 글<\/summary>/);
  assert.match(
    staticPage,
    /<aside class="toc static-toc table-of-contents-panel"[\s\S]*?<section class="toc-section"[\s\S]*?<\/aside>[\s\S]*?<aside class="toc static-toc recommendations-panel"[\s\S]*?<section class="toc-recommendations"/,
  );
  const noTocStaticPage = await readFile(
    join(workDir, 'public/blog/adjacent-thumbnail-fixture/index.html'),
    'utf8',
  );
  assert.doesNotMatch(noTocStaticPage, /<section class="toc-section"/);
  assert.doesNotMatch(noTocStaticPage, /table-of-contents-panel/);
  assert.match(noTocStaticPage, /class="toc static-toc recommendations-panel"/);
  assert.ok(
    staticPage.includes(
      `<img src="/blog/${fallbackThumbnail}" alt="" loading="lazy" decoding="async">`,
    ),
  );
  assert.match(staticPage, /<span class="related-title">Adjacent Thumbnail Fixture<\/span>/);
  assert.match(staticPage, /\/blog\/assets\/admin-posts\/admin-edit-fixture-[a-f0-9]{12}\.png/);
  assert.equal(
    (
      await readFile(
        join(workDir, 'public/blog/assets/admin-posts/admin-edit-fixture-111111111111.png'),
      )
    ).length > 0,
    true,
  );
  const sitemapIndex = await readFile(join(workDir, 'public/blog/sitemap.xml'), 'utf8');
  assert.match(sitemapIndex, /\/sitemap-posts\.xml/);
  const sitemap = await readFile(join(workDir, 'public/sitemap-posts.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/www\.corca\.ai\/blog\/admin-edit-fixture<\/loc>/);
  assert.match(sitemap, /https:\/\/www\.corca\.ai\/en\/blog\/admin-edit-fixture/);
  assert.match(
    sitemap,
    /<\?xml-stylesheet type="text\/xsl" href="\/sitemap\.xsl\?v=20260721-blue"\?>/,
  );
  assert.match(sitemap, /<lastmod>2026-02-03T00:00:00\.000Z<\/lastmod>/);
  assert.doesNotMatch(sitemap, /hreflang=/);
  assert.doesNotMatch(sitemap, /<changefreq>/);
  assert.doesNotMatch(sitemap, /<priority>/);
  const categorySitemap = await readFile(join(workDir, 'public/sitemap-categories.xml'), 'utf8');
  assert.match(categorySitemap, /\/blog\?topic=product/);
  assert.doesNotMatch(categorySitemap, /[?&]topic=moonlight/);
  assert.doesNotMatch(categorySitemap, /[?&]topic=tech/);
  const tagSitemap = await readFile(join(workDir, 'public/sitemap-tags.xml'), 'utf8');
  assert.match(tagSitemap, /\/blog\?q=/);
  assert.match(tagSitemap, /\/en\/blog\?q=/);
  assert.doesNotMatch(tagSitemap, /[?&]search=/);
  for (const localeRoot of ['blog', 'en/blog', 'ja/blog', 'zh/blog']) {
    const blogIndex = await readFile(join(workDir, `public/${localeRoot}/index.html`), 'utf8');
    assert.match(blogIndex, /data-topic-filter="product" data-topic-value="(?:제품|Product)"/);
    assert.doesNotMatch(blogIndex, /data-topic-filter="moonlight"/);
    assert.doesNotMatch(blogIndex, /data-topic-filter="tech"/);
    assert.match(blogIndex, /id="tableOfContents" class="toc table-of-contents-panel"/);
    assert.match(blogIndex, /id="recommendationsPanel" class="toc recommendations-panel"/);
    assert.match(blogIndex, /<noscript>[\s\S]*?<strong>(?:문라이트|Moonlight)<\/strong>/);
  }
  const rss = await readFile(join(workDir, 'public/blog/rss.xml'), 'utf8');
  assert.match(rss, /<\?xml-stylesheet type="text\/xsl" href="\/rss\.xsl"\?>/);
  assert.match(rss, /<atom:link href="https:\/\/www\.corca\.ai\/rss"/);
  assert.match(rss, /<link>https:\/\/www\.corca\.ai\/blog\/admin-edit-fixture<\/link>/);
  assert.match(rss, /<dc:creator><!\[CDATA\[Markdown Author\]\]><\/dc:creator>/);
  assert.match(rss, /<category><!\[CDATA\[제품 · 문라이트\]\]><\/category>/);
  const feed = JSON.parse(await readFile(join(workDir, 'public/blog/feed.json'), 'utf8'));
  assert.equal(feed.home_page_url, 'https://www.corca.ai/blog');
  assert.equal(
    feed.items.some((item) => item.url === 'https://www.corca.ai/blog/admin-edit-fixture'),
    true,
  );
  assert.deepEqual(
    feed.items.find((item) => item.url === 'https://www.corca.ai/blog/admin-edit-fixture')?.tags,
    ['제품', '문라이트'],
  );
  assert.match(
    await readFile(join(workDir, 'public/blog/robots.txt'), 'utf8'),
    /Sitemap: https:\/\/www\.corca\.ai\/sitemap\.xml/,
  );

  const explicitLocaleCoverPath = join(
    workDir,
    `public/blog/admin/post-translations/en/${slug}.html`,
  );
  const explicitLocaleCoverSource = await readFile(explicitLocaleCoverPath, 'utf8');
  const explicitLocaleCoverOverride = explicitLocaleCoverSource.replace(
    /("cover":\s*)"[^"]+"/,
    `$1"${fallbackThumbnail}"`,
  );
  assert.notEqual(explicitLocaleCoverOverride, explicitLocaleCoverSource);
  await writeFile(explicitLocaleCoverPath, explicitLocaleCoverOverride);
  runAdminChange({ action: 'sync' });

  for (const locale of ['en', 'ja', 'zh']) {
    const translationSource = await readFile(
      join(workDir, `public/blog/admin/post-translations/${locale}/${slug}.html`),
      'utf8',
    );
    assert.match(translationSource, new RegExp(`\\[${locale}\\] Admin Markdown Updated`));

    const localeIndex = JSON.parse(
      await readFile(join(workDir, `public/${locale}/blog/posts/index.json`), 'utf8'),
    );
    const localeIndexAlias = JSON.parse(
      await readFile(join(workDir, `public/${locale}/blog/index.json`), 'utf8'),
    );
    assert.equal(localeIndex.length, 2);
    assert.equal(localeIndex[0].slug, slug);
    assert.match(localeIndex[0].title, new RegExp(`\\[${locale}\\] Admin Markdown Updated`));
    const expectedExplicitCover = locale === 'en' ? fallbackThumbnail : metadata.cover;
    assert.equal(localeIndex[0].cover, expectedExplicitCover);
    assert.equal(localeIndex[1].slug, 'adjacent-thumbnail-fixture');
    assert.equal(localeIndex[1].cover, fallbackThumbnail);
    assert.equal(
      localeIndex.every(
        (post) =>
          post.tags.length === 1 &&
          categoryForDisplayTopic(post.tags[0]) === normalizeCategory(post.section),
      ),
      true,
    );
    assert.deepEqual(localeIndex[0].tags, ['Moonlight']);
    assert.equal(localeIndex[0].section, 'Product');
    assert.deepEqual(localeIndexAlias, localeIndex);
    const localeStaticPage = await readFile(
      join(workDir, `public/${locale}/blog/${slug}/index.html`),
      'utf8',
    );
    const expectedExplicitCoverUrl = `https://www.corca.ai/blog/${expectedExplicitCover}`;
    assert.match(localeStaticPage, /Admin Markdown Updated/);
    assert.ok(
      localeStaticPage.includes(`<meta property="og:image" content="${expectedExplicitCoverUrl}">`),
    );
    assert.ok(
      localeStaticPage.includes(
        `<meta name="twitter:image" content="${expectedExplicitCoverUrl}">`,
      ),
    );
    assert.ok(localeStaticPage.includes(`"image":"${expectedExplicitCoverUrl}"`));
    assert.ok(localeStaticPage.includes(`"thumbnailUrl":"${expectedExplicitCoverUrl}"`));
    assert.ok(
      (
        await readFile(
          join(workDir, `public/${locale}/blog/adjacent-thumbnail-fixture/index.html`),
          'utf8',
        )
      ).includes(`/blog/${fallbackThumbnail}`),
    );
  }

  runAdminChange({
    action: 'upsert',
    slug,
    format: 'markdown',
    fileName: 'admin-edit-fixture.md',
    metadata: {
      title: 'Admin Markdown Updated',
      description: 'Markdown description updated through the admin editor.',
      date: '2026-02-03',
      tags: '문라이트,제품',
      author: 'Markdown Author',
      cover: metadata.cover,
      language: 'ko',
      coverAlt: 'Markdown cover alt',
      section: '문라이트',
    },
    deleteBodyImagePaths: ['assets/admin-posts/admin-edit-fixture-111111111111.png'],
    contentBase64: toBase64(`# Admin Markdown Updated

## Markdown Section

Admin markdown body after deleting the inline image. This fixture intentionally includes enough article copy to pass the public post generator while still focusing on the admin edit path. The admin editor should preserve the Markdown source for later editing, render the body into HTML for readers, and regenerate the index from the same metadata that was sent by the Worker dispatch.`),
  });
  await assert.rejects(
    readFile(join(workDir, 'public/blog/assets/admin-posts/admin-edit-fixture-111111111111.png')),
    /ENOENT/,
  );

  runAdminChange({ action: 'delete', slug });
  const deletedIndex = JSON.parse(
    await readFile(join(workDir, 'public/blog/posts/index.json'), 'utf8'),
  );
  assert.equal(
    deletedIndex.some((post) => post.slug === slug),
    false,
  );
  assert.doesNotMatch(
    await readFile(join(workDir, 'public/sitemap-posts.xml'), 'utf8'),
    /admin-edit-fixture/,
  );
  assert.doesNotMatch(
    await readFile(join(workDir, 'public/blog/rss.xml'), 'utf8'),
    /admin-edit-fixture/,
  );
  assert.equal(
    JSON.parse(await readFile(join(workDir, 'public/blog/feed.json'), 'utf8')).items.some((item) =>
      item.url.includes(slug),
    ),
    false,
  );
  await assert.rejects(readFile(join(workDir, `public/blog/${slug}/index.html`), 'utf8'), /ENOENT/);
  await assert.rejects(
    readFile(join(workDir, `public/blog/posts/${slug}/index.html`), 'utf8'),
    /ENOENT/,
  );
  await assert.rejects(
    readFile(join(workDir, `public/blog/admin/post-translations/en/${slug}.html`), 'utf8'),
    /ENOENT/,
  );

  console.log('Admin post change check passed.');
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

function runAdminChange(payload, options = {}) {
  execFileSync(process.execPath, [join(repoRoot, 'scripts/apply-admin-post-change.js')], {
    cwd: repoRoot,
    env: {
      ...process.env,
      BLOG_ADMIN_ROOT: workDir,
      ADMIN_POST_CHANGE: JSON.stringify(payload),
      BLOG_TRANSLATION_PROVIDER: 'fixture',
    },
    stdio: options.stdio || 'inherit',
  });
}

function embeddedMetadata(source) {
  const match = String(source || '').match(/^\s*<!--\s*corca-post\s*([\s\S]*?)-->/i);
  assert.ok(match, 'post source should include embedded metadata');
  return JSON.parse(match[1]);
}

function normalizeCategory(value) {
  const topic = String(value || '')
    .trim()
    .toLowerCase();
  if (topic === '제품' || topic === 'product') return 'product';
  if (topic === 'ax') return 'ax';
  if (topic === '코르카' || topic === 'corca') return 'corca';
  return topic;
}

function categoryForDisplayTopic(value) {
  const topic = String(value || '')
    .trim()
    .toLowerCase();
  if (productDisplayTopics.some((productTopic) => productTopic.toLowerCase() === topic)) {
    return 'product';
  }
  return normalizeCategory(topic);
}

function toBase64(value) {
  return Buffer.from(String(value || ''), 'utf8').toString('base64');
}
