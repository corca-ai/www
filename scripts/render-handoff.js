import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import MarkdownIt from 'markdown-it';

const sourceArg = process.argv[2] ?? 'docs/handoffs/2026-07-28-corca-site-handoff.md';
const sourcePath = path.resolve(process.cwd(), sourceArg);
const outputPath = sourcePath.replace(/\.md$/u, '.html');

if (sourcePath === outputPath) {
  throw new Error('The handoff source must be a Markdown file.');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function parseSource(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/u);
  if (!match) {
    return { metadata: {}, body: source };
  }

  const metadata = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/gu, '');
    metadata[key] = value;
  }

  return { metadata, body: match[2] };
}

function slugify(value, seen) {
  const base =
    value
      .toLowerCase()
      .replace(/<[^>]+>/gu, '')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/gu, '') || 'section';
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

const source = await readFile(sourcePath, 'utf8');
const { metadata, body } = parseSource(source);
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
});
const tokens = markdown.parse(body, {});
const headings = [];
const seenSlugs = new Map();

for (let index = 0; index < tokens.length; index += 1) {
  const token = tokens[index];
  if (token.type !== 'heading_open') continue;
  const inline = tokens[index + 1];
  if (inline?.type !== 'inline') continue;
  const slug = slugify(inline.content, seenSlugs);
  token.attrSet('id', slug);
  if (token.tag === 'h2') {
    headings.push({ slug, label: inline.content });
  }
}

const rendered = markdown.renderer.render(tokens, markdown.options, {});
const sections = rendered.split(/(?=<h2 id=")/u);
const intro = sections.shift() ?? '';
const collapsible = sections
  .map((section) => {
    const match = section.match(/^<h2 id="([^"]+)">([\s\S]*?)<\/h2>\n?([\s\S]*)$/u);
    if (!match) return section;
    return `<details class="handoff-section" open data-section>
  <summary id="${match[1]}">${match[2]}</summary>
  <div class="handoff-section__body">${match[3]}</div>
</details>`;
  })
  .join('\n');

const title = metadata.title ?? 'Corca site handoff';
const generatedAt = metadata.generated_at ?? 'not recorded';
const baseline = metadata.baseline_commit ?? 'not recorded';
const snapshot = metadata.snapshot_commit ?? 'not recorded';
const sourceRelative = path.relative(process.cwd(), sourcePath);
const toc = headings
  .map(({ slug, label }) => `<li><a href="#${slug}">${escapeHtml(label)}</a></li>`)
  .join('');

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" type="image/svg+xml" href="../../assets/brand/favicon-symbol.svg">
  <style>
    :root {
      color-scheme: light;
      font-family: Pretendard, "Noto Sans KR", system-ui, sans-serif;
      color: #101828;
      background: #eef3fb;
    }
    * { box-sizing: border-box; }
    body { margin: 0; }
    a { color: #075cd8; }
    code, pre { font-family: "SFMono-Regular", Consolas, monospace; }
    code { overflow-wrap: anywhere; }
    pre {
      overflow-x: auto;
      padding: 1rem;
      border-radius: 0.75rem;
      color: #eef5ff;
      background: #0a1d3b;
    }
    table {
      display: block;
      width: 100%;
      overflow-x: auto;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.65rem 0.8rem;
      border: 1px solid #d6deeb;
      vertical-align: top;
      text-align: left;
    }
    th { background: #edf4ff; }
    .page {
      width: min(1120px, calc(100% - 2rem));
      margin: 2rem auto 5rem;
    }
    .meta, .toolbar, .toc, .handoff-section {
      border: 1px solid #d6deeb;
      border-radius: 1rem;
      background: #fff;
      box-shadow: 0 12px 36px rgb(31 56 94 / 7%);
    }
    .meta { padding: 1.25rem 1.5rem; }
    .meta p { margin: 0.35rem 0; }
    .notice {
      padding: 0.8rem 1rem;
      border-left: 4px solid #0a66e8;
      background: #edf5ff;
    }
    .toolbar {
      position: sticky;
      top: 0.75rem;
      z-index: 2;
      display: flex;
      gap: 0.75rem;
      margin: 1rem 0;
      padding: 0.75rem;
    }
    .toolbar input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid #aebbd0;
      border-radius: 0.65rem;
      font: inherit;
    }
    .toolbar button {
      padding: 0.75rem 1rem;
      border: 0;
      border-radius: 0.65rem;
      color: #fff;
      background: #0a66e8;
      cursor: pointer;
    }
    .toc { padding: 1rem 1.5rem; }
    .toc h2 { margin-top: 0; }
    .toc ol { columns: 2; }
    .handoff-section { margin-top: 1rem; overflow: clip; }
    .handoff-section > summary {
      padding: 1rem 1.25rem;
      font-size: 1.2rem;
      font-weight: 750;
      cursor: pointer;
      background: #f8faff;
    }
    .handoff-section__body { padding: 0.25rem 1.25rem 1.5rem; }
    .is-hidden { display: none; }
    @media (max-width: 720px) {
      .page { width: min(100% - 1rem, 1120px); margin-top: 0.5rem; }
      .toolbar { top: 0.25rem; }
      .toc ol { columns: 1; }
      .handoff-section__body { padding-inline: 0.8rem; }
    }
    @media print {
      :root { background: #fff; }
      .toolbar { display: none; }
      .page { width: 100%; margin: 0; }
      .meta, .toc, .handoff-section { box-shadow: none; }
    }
  </style>
</head>
<body>
  <!-- Generated from ${escapeHtml(sourceRelative)}. Edit the Markdown source only. -->
  <main class="page">
    <section class="meta" aria-label="Snapshot metadata">
      <p class="notice"><strong>수정은 Markdown에서만:</strong> 이 HTML은 로컬 검토용 파생물이며 공개 라우트가 아닙니다.</p>
      <p><strong>원본:</strong> <code>${escapeHtml(sourceRelative)}</code></p>
      <p><strong>기준 커밋:</strong> <code>${escapeHtml(baseline)}</code></p>
      <p><strong>현재 완성본:</strong> <code>${escapeHtml(snapshot)}</code></p>
      <p><strong>생성 시각:</strong> <time>${escapeHtml(generatedAt)}</time></p>
    </section>
    <div class="toolbar">
      <input id="handoff-search" type="search" placeholder="인수인계 내용 검색" aria-label="인수인계 내용 검색">
      <button id="toggle-sections" type="button">모두 접기</button>
    </div>
    <nav class="toc" aria-label="문서 목차">
      <h2>목차</h2>
      <ol>${toc}</ol>
    </nav>
    <article>
      ${intro}
      ${collapsible}
    </article>
  </main>
  <script>
    const search = document.querySelector('#handoff-search');
    const sections = [...document.querySelectorAll('[data-section]')];
    const toggle = document.querySelector('#toggle-sections');
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase('ko');
      for (const section of sections) {
        const matches = !query || section.textContent.toLocaleLowerCase('ko').includes(query);
        section.classList.toggle('is-hidden', !matches);
        if (query && matches) section.open = true;
      }
    });
    toggle.addEventListener('click', () => {
      const shouldOpen = sections.some((section) => !section.open);
      for (const section of sections) section.open = shouldOpen;
      toggle.textContent = shouldOpen ? '모두 접기' : '모두 펼치기';
    });
  </script>
</body>
</html>
`;

await writeFile(outputPath, html, 'utf8');
console.log(`Rendered ${path.relative(process.cwd(), outputPath)}`);
