import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = await mkdtemp(join(tmpdir(), 'corca-www-admin-post-change-'));
const workDir = join(fixtureRoot, 'www');
const slug = 'admin-edit-fixture';
const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

try {
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

Admin markdown body with **bold** text and [Corca](https://www.corca.ai/).

This line has {color=#0066cc}blue text{/color} and a body image.

![Body fixture](assets/admin-posts/admin-edit-fixture-111111111111.png)

> Admin markdown quote should become a blockquote.

---

This line has _italic emphasis_ and an ![inline image](assets/editorial-cover.jpg).

This fixture intentionally includes enough article copy to pass the public post generator while still focusing on the admin edit path. The admin editor should preserve the Markdown source for later editing, render the body into HTML for readers, and regenerate the index from the same metadata that was sent by the Worker dispatch.

- First admin list item
- Second admin list item`),
  });

  const source = await readFile(
    join(workDir, `public/blog/admin/post-sources/${slug}.html`),
    'utf8',
  );
  const metadata = embeddedMetadata(source);
  assert.equal(metadata.title, 'Admin Markdown Updated');
  assert.equal(metadata.sourceFormat, 'markdown');
  assert.match(metadata.sourceMarkdown, /^# Admin Markdown Updated/);
  assert.match(metadata.cover, /^assets\/admin-posts\/admin-edit-fixture-[a-f0-9]{12}\.png$/);

  const index = JSON.parse(await readFile(join(workDir, 'public/blog/posts/index.json'), 'utf8'));
  assert.equal(index.length, 1);
  assert.equal(index[0].slug, slug);
  assert.equal(index[0].title, 'Admin Markdown Updated');
  assert.equal(index[0].cover, metadata.cover);

  const staticPage = await readFile(join(workDir, `public/blog/posts/${slug}/index.html`), 'utf8');
  assert.match(staticPage, /Admin Markdown Updated/);
  assert.match(staticPage, /<strong>bold<\/strong>/);
  assert.match(staticPage, /<blockquote>/);
  assert.match(staticPage, /<hr>/);
  assert.match(staticPage, /<em>italic emphasis<\/em>/);
  assert.match(staticPage, /<span style="color: #0066cc">blue text<\/span>/);
  assert.match(staticPage, /<img src="\/blog\/assets\/editorial-cover\.jpg"/);
  assert.match(
    staticPage,
    /<img src="\/blog\/assets\/admin-posts\/admin-edit-fixture-111111111111\.png"/,
  );
  assert.match(staticPage, /\/blog\/assets\/admin-posts\/admin-edit-fixture-[a-f0-9]{12}\.png/);
  assert.equal(
    (
      await readFile(
        join(workDir, 'public/blog/assets/admin-posts/admin-edit-fixture-111111111111.png'),
      )
    ).length > 0,
    true,
  );

  const enIndex = JSON.parse(
    await readFile(join(workDir, 'public/en/blog/posts/index.json'), 'utf8'),
  );
  assert.equal(enIndex.length, 0);
  await assert.rejects(
    readFile(join(workDir, `public/en/blog/posts/${slug}/index.html`), 'utf8'),
    /ENOENT/,
  );

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
  await assert.rejects(
    readFile(join(workDir, `public/blog/posts/${slug}/index.html`), 'utf8'),
    /ENOENT/,
  );

  console.log('Admin post change check passed.');
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

function runAdminChange(payload) {
  execFileSync(process.execPath, [join(repoRoot, 'scripts/apply-admin-post-change.js')], {
    cwd: repoRoot,
    env: {
      ...process.env,
      BLOG_ADMIN_ROOT: workDir,
      ADMIN_POST_CHANGE: JSON.stringify(payload),
    },
    stdio: 'inherit',
  });
}

function embeddedMetadata(source) {
  const match = String(source || '').match(/^\s*<!--\s*corca-post\s*([\s\S]*?)-->/i);
  assert.ok(match, 'post source should include embedded metadata');
  return JSON.parse(match[1]);
}

function toBase64(value) {
  return Buffer.from(String(value || ''), 'utf8').toString('base64');
}
