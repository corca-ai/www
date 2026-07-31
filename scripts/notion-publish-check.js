import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { browserImageExtension } from './lib/browser-image-format.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'corca-www-notion-publish-'));
const workDir = join(fixtureRoot, 'www');
const bodyPageId = '11111111-2222-3333-4444-555555555555';
const htmlPageId = '66666666-7777-8888-9999-000000000000';
const publishedPageId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const legacyCompletedPageId = 'ffffffff-1111-2222-3333-444444444444';
const pagesPath = join(fixtureRoot, 'pages.json');
const blocksPath = join(fixtureRoot, 'blocks.json');
const updatesPath = join(fixtureRoot, 'updates.jsonl');
const htmlPath = join(fixtureRoot, 'notion-html-fixture.html');
const imagePath = join(fixtureRoot, 'notion-image.png');
const tinyPng =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

try {
  await mkdir(join(workDir, 'scripts'), { recursive: true });
  await mkdir(join(workDir, 'scripts/lib'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/posts'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/admin/post-sources'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/assets'), { recursive: true });
  await mkdir(join(workDir, 'public/en/blog'), { recursive: true });
  await mkdir(join(workDir, 'public/ja/blog'), { recursive: true });
  await mkdir(join(workDir, 'public/zh/blog'), { recursive: true });

  for (const file of [
    'scripts/apply-admin-post-change.js',
    'scripts/lib/browser-image-format.js',
    'scripts/sync-notion-posts.js',
    'public/blog/index.html',
    'public/en/blog/index.html',
    'public/ja/blog/index.html',
    'public/zh/blog/index.html',
    'public/blog/assets/editorial-cover.jpg',
  ]) {
    await cp(join(repoRoot, file), join(workDir, file), { recursive: true });
  }
  await writeFile(join(workDir, 'public/blog/posts/index.json'), '[]\n');
  await writeFile(imagePath, Buffer.from(tinyPng, 'base64'));
  await writeFile(
    htmlPath,
    `<!doctype html>
<html lang="en">
<head>
  <title>Notion HTML fixture</title>
  <meta name="description" content="Checks that a Notion HTML upload becomes a Corca blog post.">
  <meta name="keywords" content="Workflow,Publishing">
  <meta name="date" content="2026-06-18">
</head>
<body>
  <article>
    <h1>Notion HTML fixture</h1>
    <p>This fixture includes enough public article copy to prove the HTML branch can publish through the shared www blog renderer.</p>
    <section class="frame" aria-label="HTML upload compatibility">
      <h2>Authored callout frame</h2>
      <p>Standalone HTML uploads may contain semantic sections with author-provided utility classes.</p>
    </section>
    <h2>Expected behavior</h2>
    <p>The workflow should generate static pages and update the blog post index.</p>
    <div class="intro-question">Can a highlighted question still look intentional inside the blog shell?</div>
    <pre>first preserved code-like line
second preserved code-like line</pre>
    <div class="note"><strong>HTML note</strong><br>Notes should remain visually grouped after the original document stylesheet is removed.</div>
  </article>
</body>
</html>`,
  );

  await writeFile(
    blocksPath,
    JSON.stringify(
      {
        [bodyPageId]: {
          results: [
            block('heading_1', { rich_text: text('노션 본문 발행 확인') }),
            block('paragraph', {
              rich_text: text(
                'Notion page body를 Markdown처럼 읽어서 www 블로그 정적 글로 발행하는지 확인하는 테스트입니다.',
              ),
            }),
            block('heading_2', { rich_text: text('업로드 흐름') }),
            block('paragraph', {
              rich_text: text(
                '본문에는 충분한 설명과 링크, 이미지가 포함되어 발행 스크립트와 정적 렌더러를 함께 검증합니다.',
              ),
            }),
            block('paragraph', {
              rich_text: [
                ...text('문라이트 팀은 앞서 '),
                ...linkedText('숭실대학교', 'https://example.com/soongsil', { bold: true }),
                ...text('와'),
                ...text(' ', { bold: true }),
                ...linkedText('건국대학교', 'https://example.com/konkuk', { bold: true }),
                ...text(' ', { bold: true }),
                ...text('연구자분들을 만났습니다.'),
              ],
            }),
            block('paragraph', {
              rich_text: [
                ...text('한 연구실 안에 '),
                ...text('물성, 소자, 기계공학 등 ', { bold: true }),
                ...text('다양한 전공의 연구자들이 모여 있습니다.'),
              ],
            }),
            block('quote', {
              rich_text: text(
                'First italic paragraph from Notion.\n\nSecond italic paragraph from Notion.',
                { italic: true },
              ),
            }),
            {
              object: 'block',
              id: 'image-block',
              type: 'image',
              has_children: false,
              image: {
                type: 'file',
                file: { url: pathToFileURL(imagePath).href },
                caption: text('Notion file image'),
              },
            },
          ],
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    pagesPath,
    JSON.stringify(
      {
        results: [
          page({
            id: bodyPageId,
            title: '노션 본문 발행 확인',
            slug: 'notion-body-fixture',
            description:
              'Notion 본문 block을 읽어 Corca 블로그 정적 글로 발행하는지 확인하는 테스트입니다.',
            language: 'ko',
            status: '수정 요청',
          }),
          page({
            id: htmlPageId,
            title: 'Notion HTML fixture',
            slug: 'notion-html-fixture',
            description: 'Checks that a Notion HTML upload becomes a Corca blog post.',
            language: 'en',
            status: '배포 신청',
            fileUrl: pathToFileURL(htmlPath).href,
          }),
          page({
            id: publishedPageId,
            title: 'Already published fixture',
            slug: 'already-published-fixture',
            description: 'Already published posts with a public URL should not resync.',
            language: 'ko',
            status: '배포 신청',
            publicUrl: 'https://www.corca.ai/blog/already-published-fixture',
          }),
          page({
            id: legacyCompletedPageId,
            title: 'Legacy completed fixture',
            slug: 'legacy-completed-fixture',
            description: 'The old completed status must not request a new deployment.',
            language: 'ko',
            status: '배포 완료',
          }),
        ],
      },
      null,
      2,
    ),
  );

  execFileSync(process.execPath, [join(repoRoot, 'scripts/sync-notion-posts.js')], {
    cwd: workDir,
    env: {
      ...process.env,
      BLOG_ADMIN_ROOT: workDir,
      NOTION_TOKEN: 'secret_fixture',
      NOTION_BLOG_DATABASE_ID: '391dd8f2aea280ab814bc694394a1720',
      NOTION_FIXTURE_PAGES_FILE: pagesPath,
      NOTION_FIXTURE_BLOCKS_FILE: blocksPath,
      NOTION_FIXTURE_UPDATES_FILE: updatesPath,
      NOTION_ALLOW_FILE_URLS: '1',
      NOTION_POST_READY_STATUS: '',
      NOTION_POST_UPDATE_STATUS: '수정 요청',
      NOTION_POST_PUBLISHING_STATUS: '배포 완료',
      NOTION_POST_PUBLISHED_STATUS: '배포 완료',
      NOTION_SKIP_UPDATES: '0',
      CORCA_SITE_URL: 'https://www.corca.ai',
      BLOG_TRANSLATION_PROVIDER: 'fixture',
    },
    stdio: 'inherit',
  });

  const posts = JSON.parse(await readFile(join(workDir, 'public/blog/posts/index.json'), 'utf8'));
  const postsAlias = JSON.parse(await readFile(join(workDir, 'public/blog/index.json'), 'utf8'));
  const enPosts = JSON.parse(
    await readFile(join(workDir, 'public/en/blog/posts/index.json'), 'utf8'),
  );
  const enPostsAlias = JSON.parse(
    await readFile(join(workDir, 'public/en/blog/index.json'), 'utf8'),
  );
  assert.deepEqual(postsAlias, posts);
  assert.deepEqual(enPostsAlias, enPosts);
  assert.equal(
    posts.some((post) => post.slug === 'notion-body-fixture'),
    true,
  );
  assert.equal(
    posts.some((post) => post.slug === 'notion-html-fixture'),
    true,
  );
  assert.equal(
    posts.some((post) => post.slug === 'already-published-fixture'),
    false,
  );
  assert.equal(
    posts.some((post) => post.slug === 'legacy-completed-fixture'),
    false,
  );
  assert.equal(
    enPosts.some((post) => post.slug === 'notion-html-fixture'),
    true,
  );
  const notionBodySource = await readFile(
    join(workDir, 'public/blog/admin/post-sources/notion-body-fixture.html'),
    'utf8',
  );
  assert.match(notionBodySource, /"sourceFormat": "markdown"/);
  const notionBodyMetadataMatch = notionBodySource.match(/^\s*<!--\s*corca-post\s*([\s\S]*?)-->/i);
  assert.ok(notionBodyMetadataMatch);
  const notionBodyMetadata = JSON.parse(notionBodyMetadataMatch[1]);
  assert.match(
    notionBodyMetadata.sourceMarkdown,
    /> _First italic paragraph from Notion\._\n>\n> _Second italic paragraph from Notion\._/,
  );
  assert.match(notionBodyMetadata.sourceMarkdown, /\{\{corca-figure:/);
  assert.doesNotMatch(notionBodyMetadata.sourceMarkdown, /\*\*\s+\*\*/);
  const notionBodyStaticPage = await readFile(
    join(workDir, 'public/blog/notion-body-fixture/index.html'),
    'utf8',
  );
  assert.match(notionBodyStaticPage, /노션 본문 발행 확인/);
  assert.match(
    notionBodyStaticPage,
    /<blockquote>\s*<p><em>First italic paragraph from Notion\.<\/em><\/p>\s*<p><em>Second italic paragraph from Notion\.<\/em><\/p>\s*<\/blockquote>/,
  );
  assert.match(
    notionBodyStaticPage,
    /<figure><img[^>]*alt="Notion file image"[^>]*><figcaption>Notion file image<\/figcaption><\/figure>/,
  );
  assert.doesNotMatch(notionBodyStaticPage, /<p>_/);
  assert.doesNotMatch(notionBodyStaticPage, /\*\*/);
  assert.match(
    notionBodyStaticPage,
    /<a href="https:\/\/example\.com\/soongsil"><strong>숭실대학교<\/strong><\/a>와 <a href="https:\/\/example\.com\/konkuk"><strong>건국대학교<\/strong><\/a> 연구자분들을 만났습니다\./,
  );
  assert.match(
    notionBodyStaticPage,
    /한 연구실 안에 <strong>물성, 소자, 기계공학 등<\/strong> 다양한 전공의 연구자들이 모여 있습니다\./,
  );
  assert.equal(browserImageExtension(Buffer.from(tinyPng, 'base64'), '.jpg'), '.png');
  assert.throws(
    () =>
      browserImageExtension(
        Buffer.from('0000001c667479706865696300000000746d6170686569636d696631', 'hex'),
        '.jpg',
      ),
    /HEIF\/HEIC/,
  );
  assert.match(
    await readFile(
      join(workDir, 'public/blog/admin/post-translations/en/notion-body-fixture.html'),
      'utf8',
    ),
    /\[en\] 노션 본문 발행 확인/,
  );
  assert.match(
    await readFile(join(workDir, 'public/en/blog/notion-html-fixture/index.html'), 'utf8'),
    /href="\/en\/blog\/notion-html-fixture" hreflang="en"/,
  );
  const htmlStaticPage = await readFile(
    join(workDir, 'public/en/blog/notion-html-fixture/index.html'),
    'utf8',
  );
  assert.match(
    htmlStaticPage,
    /<link rel="canonical" href="https:\/\/www\.corca\.ai\/en\/blog\/notion-html-fixture">/,
  );
  assert.match(
    htmlStaticPage,
    /<link rel="alternate" hreflang="ko" href="https:\/\/www\.corca\.ai\/blog\/notion-html-fixture">/,
  );
  assert.match(
    htmlStaticPage,
    /<link rel="alternate" hreflang="x-default" href="https:\/\/www\.corca\.ai\/blog\/notion-html-fixture">/,
  );
  assert.match(htmlStaticPage, /class="frame"/);
  assert.match(htmlStaticPage, /class="intro-question"/);
  assert.match(
    htmlStaticPage,
    /<pre>first preserved code-like line\nsecond preserved code-like line<\/pre>/,
  );
  assert.match(htmlStaticPage, /class="note"/);
  const blogStyles = await readFile(join(repoRoot, 'public/blog/styles.css'), 'utf8');
  assert.match(blogStyles, /\.article-content \.frame/);
  assert.match(blogStyles, /\.article-content \.intro-question/);
  assert.match(blogStyles, /\.article-content \.note/);
  assert.match(blogStyles, /\.article-content pre code/);
  assert.match(blogStyles, /\.article-content a\s*\{[^}]*font-weight:\s*inherit;/s);
  const articleDescriptionRules = [
    ...blogStyles.matchAll(/[^{}]*\.article-header p[^{}]*\{([^{}]*)\}/g),
  ].map((match) => match[1]);
  assert.ok(articleDescriptionRules.length >= 2);
  for (const declarations of articleDescriptionRules) {
    assert.doesNotMatch(
      declarations,
      /(?:-webkit-)?line-clamp|max-height|overflow:\s*hidden|text-overflow:\s*ellipsis/,
    );
  }
  const narrowArticleStyles = mediaBlockContaining(
    blogStyles,
    'max-width: 1024px',
    '.article-mobile-navigation',
  );
  assert.match(narrowArticleStyles, /\.table-of-contents-panel\s*\{\s*display:\s*none;/);
  assert.match(narrowArticleStyles, /\.recommendations-panel\s*\{\s*margin-top:\s*48px;/);
  assert.match(narrowArticleStyles, /\.article-mobile-navigation\s*\{\s*display:\s*block;/);
  assert.match(
    blogStyles,
    /\.article-content img\s*\{[^}]*box-shadow:\s*none;[^}]*outline:\s*none;/s,
  );
  assert.match(
    blogStyles,
    /\.post-card img\[src\$="corca-openai-partner-cover\.png"\],\s*\.post-pagination-card \.related-thumbnail img\[src\$="corca-openai-partner-cover\.png"\]\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9;[^}]*background:\s*#ffffff;[^}]*border-inline:\s*4px\s+solid\s+#000000;[^}]*box-sizing:\s*border-box;[^}]*object-fit:\s*cover;[^}]*object-position:\s*18%\s+center;[^}]*outline:\s*none;/s,
  );
  assert.match(
    await readFile(updatesPath, 'utf8'),
    /https:\/\/www\.corca\.ai\/blog\/notion-body-fixture/,
  );
  const notionUpdates = (await readFile(updatesPath, 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const deploymentRequestUpdates = JSON.stringify(
    notionUpdates.filter((update) => update.page_id === htmlPageId),
  );
  assert.doesNotMatch(
    deploymentRequestUpdates,
    /https:\/\/www\.corca\.ai\/en\/blog\/notion-html-fixture/,
  );
  assert.match(deploymentRequestUpdates, /배포 신청/);
  assert.doesNotMatch(deploymentRequestUpdates, /배포 완료/);
  assert.match(deploymentRequestUpdates, /Prepared notion-html-fixture for deployment/);
  assert.match(
    await readFile(join(workDir, 'public/sitemap-posts.xml'), 'utf8'),
    /https:\/\/www\.corca\.ai\/en\/blog\/notion-html-fixture/,
  );
  assert.match(
    await readFile(join(workDir, 'public/blog/rss.xml'), 'utf8'),
    /https:\/\/www\.corca\.ai\/blog\/notion-body-fixture/,
  );
  assert.match(
    await readFile(join(workDir, 'public/blog/rss.xml'), 'utf8'),
    /<atom:link href="https:\/\/www\.corca\.ai\/rss"/,
  );
  assert.equal(
    JSON.parse(await readFile(join(workDir, 'public/blog/feed.json'), 'utf8')).feed_url,
    'https://www.corca.ai/blog/feed.json',
  );

  await writeFile(
    pagesPath,
    JSON.stringify(
      {
        results: [
          page({
            id: htmlPageId,
            title: 'Notion HTML fixture',
            slug: 'notion-html-fixture',
            description: 'Checks that a Notion HTML upload becomes a Corca blog post.',
            language: 'en',
            status: '삭제 요청',
          }),
        ],
      },
      null,
      2,
    ),
  );

  execFileSync(process.execPath, [join(repoRoot, 'scripts/sync-notion-posts.js')], {
    cwd: workDir,
    env: {
      ...process.env,
      BLOG_ADMIN_ROOT: workDir,
      NOTION_TOKEN: 'secret_fixture',
      NOTION_BLOG_DATABASE_ID: '391dd8f2aea280ab814bc694394a1720',
      NOTION_FIXTURE_PAGES_FILE: pagesPath,
      NOTION_FIXTURE_BLOCKS_FILE: blocksPath,
      NOTION_FIXTURE_UPDATES_FILE: updatesPath,
      NOTION_ALLOW_FILE_URLS: '1',
      NOTION_POST_READY_STATUS: '',
      NOTION_POST_UPDATE_STATUS: '수정 요청',
      NOTION_POST_DELETE_STATUS: '삭제 요청',
      NOTION_POST_DELETED_STATUS: '삭제 완료',
      NOTION_SKIP_UPDATES: '0',
      CORCA_SITE_URL: 'https://www.corca.ai',
      BLOG_TRANSLATION_PROVIDER: 'fixture',
    },
    stdio: 'inherit',
  });

  const afterDeletePosts = JSON.parse(
    await readFile(join(workDir, 'public/blog/posts/index.json'), 'utf8'),
  );
  assert.equal(
    afterDeletePosts.some((post) => post.slug === 'notion-html-fixture'),
    false,
  );
  await assert.rejects(
    readFile(join(workDir, 'public/blog/notion-html-fixture/index.html'), 'utf8'),
    /ENOENT/,
  );
  await assert.rejects(
    readFile(join(workDir, 'public/en/blog/notion-html-fixture/index.html'), 'utf8'),
    /ENOENT/,
  );
  assert.doesNotMatch(
    await readFile(join(workDir, 'public/sitemap-posts.xml'), 'utf8'),
    /notion-html-fixture/,
  );
  assert.match(await readFile(updatesPath, 'utf8'), /Deleted notion-html-fixture/);
  assert.match(await readFile(updatesPath, 'utf8'), /삭제 완료/);

  console.log('Notion publish check passed.');
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

function page({
  id,
  title,
  slug,
  description,
  language,
  status = '배포 신청',
  fileUrl = '',
  publicUrl = '',
}) {
  return {
    object: 'page',
    id,
    last_edited_time: new Date().toISOString(),
    properties: {
      제목: { id: 'title', type: 'title', title: text(title) },
      상태: { id: 'status', type: 'status', status: { name: status, color: 'green' } },
      파일: {
        id: 'file',
        type: 'files',
        files: fileUrl ? [{ name: `${slug}.html`, type: 'file', file: { url: fileUrl } }] : [],
      },
      slug: { id: 'slug', type: 'rich_text', rich_text: text(slug) },
      설명: { id: 'description', type: 'rich_text', rich_text: text(description) },
      태그: {
        id: 'tags',
        type: 'multi_select',
        multi_select: [{ name: 'AX' }, { name: '제품' }],
      },
      게시일: { id: 'date', type: 'date', date: { start: '2026-06-18' } },
      언어: { id: 'language', type: 'select', select: { name: language } },
      작성자: { id: 'author', type: 'rich_text', rich_text: text('Corca Team') },
      썸네일: { id: 'cover', type: 'rich_text', rich_text: text('assets/editorial-cover.jpg') },
      '공개 URL': { id: 'public-url', type: 'url', url: publicUrl || null },
      '발행 로그': { id: 'message', type: 'rich_text', rich_text: [] },
    },
  };
}

function block(type, value) {
  return {
    object: 'block',
    id: `${type}-${Math.random()}`,
    type,
    has_children: false,
    [type]: value,
  };
}

function text(value, annotations = {}) {
  return [{ type: 'text', plain_text: value, text: { content: value }, annotations }];
}

function linkedText(value, url, annotations = {}) {
  return [
    {
      type: 'text',
      plain_text: value,
      href: url,
      text: { content: value, link: { url } },
      annotations,
    },
  ];
}

function mediaBlockContaining(css, query, selector) {
  const marker = `@media (${query})`;
  let searchStart = 0;
  while (searchStart < css.length) {
    const mediaStart = css.indexOf(marker, searchStart);
    if (mediaStart < 0) break;
    const blockStart = css.indexOf('{', mediaStart);
    let depth = 0;
    for (let index = blockStart; index < css.length; index += 1) {
      if (css[index] === '{') depth += 1;
      if (css[index] !== '}' || --depth !== 0) continue;
      const block = css.slice(mediaStart, index + 1);
      if (block.includes(selector)) return block;
      searchStart = index + 1;
      break;
    }
  }
  throw new Error(`Could not find ${selector} in ${marker}`);
}
