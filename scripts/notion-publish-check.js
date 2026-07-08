import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'corca-www-notion-publish-'));
const workDir = join(fixtureRoot, 'www');
const bodyPageId = '11111111-2222-3333-4444-555555555555';
const htmlPageId = '66666666-7777-8888-9999-000000000000';
const pagesPath = join(fixtureRoot, 'pages.json');
const blocksPath = join(fixtureRoot, 'blocks.json');
const updatesPath = join(fixtureRoot, 'updates.jsonl');
const htmlPath = join(fixtureRoot, 'notion-html-fixture.html');
const imagePath = join(fixtureRoot, 'notion-image.png');
const tinyPng =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

try {
  await mkdir(join(workDir, 'scripts'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/posts'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/admin/post-sources'), { recursive: true });
  await mkdir(join(workDir, 'public/blog/assets'), { recursive: true });
  await mkdir(join(workDir, 'public/en/blog'), { recursive: true });
  await mkdir(join(workDir, 'public/ja/blog'), { recursive: true });
  await mkdir(join(workDir, 'public/zh/blog'), { recursive: true });

  for (const file of [
    'scripts/apply-admin-post-change.js',
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
    <h2>Expected behavior</h2>
    <p>The workflow should generate static pages and update the blog post index.</p>
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
          }),
          page({
            id: htmlPageId,
            title: 'Notion HTML fixture',
            slug: 'notion-html-fixture',
            description: 'Checks that a Notion HTML upload becomes a Corca blog post.',
            language: 'en',
            fileUrl: pathToFileURL(htmlPath).href,
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
      NOTION_POST_READY_STATUS: '배포 완료',
      NOTION_SKIP_UPDATES: '0',
      CORCA_SITE_URL: 'https://www.borca.ai',
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
    enPosts.some((post) => post.slug === 'notion-html-fixture'),
    true,
  );
  assert.match(
    await readFile(
      join(workDir, 'public/blog/admin/post-sources/notion-body-fixture.html'),
      'utf8',
    ),
    /"sourceFormat": "markdown"/,
  );
  assert.match(
    await readFile(join(workDir, 'public/blog/notion-body-fixture/index.html'), 'utf8'),
    /노션 본문 발행 확인/,
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
    /href="\/en\/blog\/notion-html-fixture" hreflang="en-US"/,
  );
  assert.match(
    await readFile(updatesPath, 'utf8'),
    /https:\/\/www\.borca\.ai\/blog\/notion-body-fixture/,
  );
  assert.match(
    await readFile(updatesPath, 'utf8'),
    /https:\/\/www\.borca\.ai\/en\/blog\/notion-html-fixture/,
  );
  assert.match(
    await readFile(join(workDir, 'public/sitemap-posts.xml'), 'utf8'),
    /https:\/\/www\.borca\.ai\/en\/blog\/notion-html-fixture/,
  );
  assert.match(
    await readFile(join(workDir, 'public/blog/rss.xml'), 'utf8'),
    /https:\/\/www\.borca\.ai\/blog\/notion-body-fixture/,
  );
  assert.match(
    await readFile(join(workDir, 'public/blog/rss.xml'), 'utf8'),
    /<atom:link href="https:\/\/www\.borca\.ai\/rss"/,
  );
  assert.equal(
    JSON.parse(await readFile(join(workDir, 'public/blog/feed.json'), 'utf8')).feed_url,
    'https://www.borca.ai/blog/feed.json',
  );

  console.log('Notion publish check passed.');
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

function page({ id, title, slug, description, language, fileUrl = '' }) {
  return {
    object: 'page',
    id,
    last_edited_time: new Date().toISOString(),
    properties: {
      제목: { id: 'title', type: 'title', title: text(title) },
      상태: { id: 'status', type: 'status', status: { name: '배포 완료', color: 'green' } },
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
      '공개 URL': { id: 'public-url', type: 'url', url: null },
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

function text(value) {
  return [{ type: 'text', plain_text: value, text: { content: value } }];
}
