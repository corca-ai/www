import { execFileSync } from 'node:child_process';
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownToHtml } from './lib/markdown-renderer.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const config = loadConfig();
const workDir = await mkdtemp(join(tmpdir(), 'corca-notion-posts-'));
const processed = [];

try {
  const pages = await queryNotionPages(config);
  const readyPages = pages
    .map((page) => ({ page, action: actionForPage(page, config) }))
    .filter((item) => item.action)
    .filter((item) => isPublishCandidateForTrigger(item.page, config))
    .slice(0, args.limit || config.limit);

  if (readyPages.length === 0) {
    console.log('No Notion posts are ready to sync.');
    process.exit(0);
  }

  await mkdir(workDir, { recursive: true });

  for (const { page, action } of readyPages) {
    const context = pageContext(page, config);
    try {
      await updateNotionResult(page, config, {
        status: statusFor(
          context.statusName,
          action === 'delete' ? 'deleting' : 'publishing',
          config,
        ),
        message:
          action === 'delete' ? 'Deleting from Notion started.' : 'Publishing from Notion started.',
      });

      if (action === 'delete') {
        const slug = deleteSlugForPage(page, config);
        if (args.dryRun) {
          validateDeletePayload({ slug });
        } else {
          runAdminPostDelete({ slug });
        }
        processed.push({
          action,
          page,
          context,
          slug,
          language: '',
          title: context.title || slug,
        });
      } else {
        const source = await downloadPageSource(page, config);
        const metadata = extractPostMetadata(page, config, source);
        const slug = normalizeSlug(metadata.slug || metadata.title || source.baseName);
        if (!slug) {
          throw new Error('Slug could not be generated. Add Slug/슬러그 or a title.');
        }
        metadata.cover = await resolveCoverAsset(metadata.cover, slug);
        metadata.language = normalizeLanguage(metadata.language || '');

        if (args.dryRun) {
          validatePublishPayload({ source, metadata, slug });
        } else {
          runAdminPostUpsert({ source, metadata, slug });
        }

        processed.push({
          action,
          page,
          context,
          slug,
          language: metadata.language,
          title: metadata.title || slug,
        });
      }
    } catch (error) {
      await updateNotionResult(page, config, {
        status: statusFor(context.statusName, 'error', config),
        message: error.message,
      });
      console.error(`Failed to publish Notion page ${context.title || page.id}: ${error.message}`);
      process.exitCode = 1;
    }
  }

  if (processed.length > 0 && !args.dryRun) {
    for (const item of processed) {
      if (item.action === 'delete') {
        await updateNotionResult(item.page, config, {
          status: statusFor(item.context.statusName, 'deleted', config),
          clearPublicUrl: true,
          message: `Deleted ${item.slug}.`,
        });
      } else {
        await updateNotionResult(item.page, config, {
          status: statusFor(item.context.statusName, 'published', config),
          publicUrl: `${config.publicBaseUrl}${blogPathForLanguage(item.language)}/${encodeURIComponent(item.slug)}`,
          message: `Published ${item.slug}.`,
        });
      }
    }
  }

  const syncAction = args.dryRun ? 'checked' : 'synced';
  console.log(`Notion post sync ${syncAction} ${processed.length} post(s).`);
} finally {
  await rm(workDir, { recursive: true, force: true });
}

async function queryNotionPages(config) {
  if (config.fixturePagesFile) {
    const fixture = JSON.parse(await readFile(config.fixturePagesFile, 'utf8'));
    return Array.isArray(fixture) ? fixture : fixture.results || [];
  }

  const pages = [];
  let cursor = '';
  do {
    const body = {
      page_size: Math.min(config.limit || 100, 100),
    };
    if (cursor) {
      body.start_cursor = cursor;
    }

    const endpoint = config.dataSourceId
      ? `/data_sources/${config.dataSourceId}/query`
      : `/databases/${config.databaseId}/query`;
    const response = await notionRequest(config, endpoint, {
      method: 'POST',
      body,
    });
    pages.push(...(response.results || []).filter((item) => item.object === 'page'));
    cursor = response.has_more ? response.next_cursor : '';
  } while (cursor && pages.length < config.limit);
  return pages;
}

async function downloadPageSource(page, config) {
  const properties = page.properties || {};
  const fileProperty =
    findProperty(properties, config.propertyNames.file) ||
    Object.entries(properties).find(([, property]) => property?.type === 'files')?.[1];
  const sourceUrlProperty = findProperty(properties, config.propertyNames.sourceUrl);
  const files = fileProperty?.type === 'files' ? fileProperty.files || [] : [];
  const htmlFile = files.find((item) => /\.html?$/i.test(item.name || ''));
  const sourceUrl = textProperty(sourceUrlProperty);
  const url = fileUrl(htmlFile) || (isHtmlUrl(sourceUrl) ? sourceUrl : '');

  if (url) {
    const name = htmlFile?.name || baseNameFromUrl(url) || 'notion-post.html';
    const content = await downloadText(url);
    const format = inferSourceFormat(name, content);
    return {
      name,
      baseName: name.replace(/\.[^.]+$/, ''),
      content,
      format,
    };
  }

  const baseName =
    textProperty(findProperty(properties, config.propertyNames.slug)) ||
    pageTitle(properties) ||
    page.id ||
    'notion-post';
  const content = await readPageMarkdown(page, config, baseName);
  if (content.trim()) {
    return {
      name: `${page.id || 'notion-post'}.md`,
      baseName,
      content,
      format: 'markdown',
    };
  }

  throw new Error(
    'No Notion body content or HTML file found. Write the post in the Notion page body or attach an .html/.htm file to File/파일.',
  );
}

function extractPostMetadata(page, config, source) {
  const properties = page.properties || {};
  const parsed = source.format === 'html' ? parsePostHtml(source.content, source.name) : null;
  const markdown = source.format === 'markdown' ? inferMarkdownMetadata(source.content) : {};
  const title = firstPresent([
    textProperty(findProperty(properties, config.propertyNames.title)),
    pageTitle(properties),
    markdown.title,
    parsed?.metadata.title,
    source.baseName,
  ]);
  const description = normalizePostDescription(
    [
      textProperty(findProperty(properties, config.propertyNames.description)),
      markdown.description,
      parsed?.metadata.description,
    ],
    title,
    source.content,
  );
  const rawTags = tagList(
    firstPresent([
      textProperty(findProperty(properties, config.propertyNames.tags)),
      parsed?.metadata.tags,
    ]) || config.defaultTags,
  );
  const tags = normalizePostTags(rawTags, {
    title,
    description,
    slug: textProperty(findProperty(properties, config.propertyNames.slug)),
  });

  return {
    title,
    slug: textProperty(findProperty(properties, config.propertyNames.slug)),
    description,
    date:
      textProperty(findProperty(properties, config.propertyNames.date)) ||
      todayInTimeZone('Asia/Seoul'),
    tags,
    author: textProperty(findProperty(properties, config.propertyNames.author)) || 'Corca Team',
    cover:
      textProperty(findProperty(properties, config.propertyNames.cover)) ||
      'assets/editorial-cover.jpg',
    language: textProperty(findProperty(properties, config.propertyNames.language)) || '',
    coverAlt: textProperty(findProperty(properties, config.propertyNames.coverAlt)) || '',
    section: textProperty(findProperty(properties, config.propertyNames.section)) || '',
  };
}

function validatePublishPayload({ source, metadata, slug }) {
  if (!slug) {
    throw new Error('Slug could not be generated.');
  }
  if (!metadata.title) {
    throw new Error('Notion post title is required.');
  }
  if (!metadata.description) {
    throw new Error('Notion post description is required.');
  }
  if (!source.content.trim()) {
    throw new Error('Notion post content is empty.');
  }
}

function validateDeletePayload({ slug }) {
  if (!slug) {
    throw new Error('Notion post delete requires Slug/슬러그.');
  }
}

function runAdminPostUpsert({ source, metadata, slug }) {
  validatePublishPayload({ source, metadata, slug });
  runAdminPostChange({
    action: 'upsert',
    slug,
    format: source.format,
    fileName: source.name,
    metadata: {
      ...metadata,
      slug,
    },
    contentBase64: Buffer.from(source.content, 'utf8').toString('base64'),
  });
}

function runAdminPostDelete({ slug }) {
  validateDeletePayload({ slug });
  runAdminPostChange({ action: 'delete', slug });
}

function runAdminPostChange(payload) {
  execFileSync(process.execPath, [join(scriptDir, 'apply-admin-post-change.js')], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BLOG_ADMIN_ROOT: process.env.BLOG_ADMIN_ROOT || process.cwd(),
      ADMIN_POST_CHANGE: JSON.stringify(payload),
    },
    stdio: 'inherit',
  });
}

function normalizePostDescription(candidates, title, sourceContent) {
  const explicit = candidates.map(normalizeWhitespace).find(Boolean);
  if (explicit) {
    return trimDescription(explicit);
  }

  const inferred = inferDescriptionFromContent(sourceContent);
  const values = [inferred, title].map(normalizeWhitespace).filter(Boolean);
  const valid = values.find((value) => value.length >= 40 && value.length <= 180);
  if (valid) {
    return valid;
  }

  const seed = firstPresent([...values, 'Corca Blog post']);
  const enriched =
    seed.length < 40
      ? normalizeWhitespace(`${seed} Corca 블로그 독자를 위해 본문 내용을 정리한 공개 글입니다.`)
      : seed;
  return trimDescription(enriched);
}

function inferDescriptionFromContent(content) {
  return stripTags(
    String(content || '')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^#{1,6}\s+.+$/gm, ' ')
      .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
      .replace(/[#>*_`[\]()!-]/g, ' '),
  );
}

function trimDescription(value) {
  const text = normalizeWhitespace(value);
  if (text.length <= 180) {
    return text;
  }
  const sliced = text
    .slice(0, 180)
    .replace(/\s+\S*$/, '')
    .trim();
  return sliced.length >= 40 ? sliced : text.slice(0, 180).trim();
}

async function updateNotionResult(page, config, result) {
  if (args.dryRun || config.skipUpdates) {
    return;
  }
  const properties = {};
  const currentProperties = page.properties || {};
  const statusProperty = findPropertyEntry(currentProperties, config.propertyNames.status);
  const publicUrlProperty = findPropertyEntry(currentProperties, config.propertyNames.publicUrl);
  const messageProperty = findPropertyEntry(currentProperties, config.propertyNames.message);

  if (result.status && statusProperty) {
    const [name, property] = statusProperty;
    if (property.type === 'status') {
      properties[name] = { status: { name: result.status } };
    } else if (property.type === 'select') {
      properties[name] = { select: { name: result.status } };
    }
  }
  if ((result.publicUrl || result.clearPublicUrl) && publicUrlProperty) {
    const [name, property] = publicUrlProperty;
    if (property.type === 'url') {
      properties[name] = { url: result.clearPublicUrl ? null : result.publicUrl };
    } else if (property.type === 'rich_text') {
      properties[name] = result.clearPublicUrl
        ? { rich_text: [] }
        : { rich_text: [{ text: { content: result.publicUrl } }] };
    }
  }
  if (result.message && messageProperty) {
    const [name, property] = messageProperty;
    const message = String(result.message).slice(0, 1800);
    if (property.type === 'rich_text') {
      properties[name] = { rich_text: [{ text: { content: message } }] };
    } else if (property.type === 'url' && /^https?:\/\//i.test(message)) {
      properties[name] = { url: message };
    }
  }

  if (Object.keys(properties).length === 0) {
    return;
  }

  if (config.fixtureUpdatesFile) {
    await appendFile(
      config.fixtureUpdatesFile,
      `${JSON.stringify({ page_id: page.id, properties })}\n`,
    );
    return;
  }

  try {
    await notionRequest(config, `/pages/${page.id}`, {
      method: 'PATCH',
      body: { properties },
    });
  } catch (error) {
    console.warn(`Could not update Notion page ${page.id}: ${error.message}`);
  }
}

function actionForPage(page, config) {
  const status = pageContext(page, config).statusName;
  const normalized = normalizeLabel(status);
  if (config.deleteStatuses.map(normalizeLabel).includes(normalized)) {
    return 'delete';
  }
  if (config.updateStatuses.map(normalizeLabel).includes(normalized)) {
    return 'upsert';
  }
  if (
    config.readyStatuses.map(normalizeLabel).includes(normalized) &&
    !publicUrlForPage(page, config)
  ) {
    return 'upsert';
  }
  return '';
}

function deleteSlugForPage(page, config) {
  const properties = page.properties || {};
  return normalizeSlug(textProperty(findProperty(properties, config.propertyNames.slug)) || '');
}

function publicUrlForPage(page, config) {
  return textProperty(findProperty(page.properties || {}, config.propertyNames.publicUrl)).trim();
}

function isPublishCandidateForTrigger(page, config) {
  if (config.pageId && normalizeNotionId(page.id) !== config.pageId) {
    return false;
  }

  if (!config.requireRecentReady) {
    return true;
  }

  const editedAt = new Date(page.last_edited_time || '');
  if (Number.isNaN(editedAt.getTime())) {
    return true;
  }
  const recentMs = Math.max(1, config.recentReadyMinutes) * 60 * 1000;
  return Date.now() - editedAt.getTime() <= recentMs;
}

function pageContext(page, config) {
  const statusProperty = findProperty(page.properties || {}, config.propertyNames.status);
  return {
    title: pageTitle(page.properties || {}),
    statusName: textProperty(statusProperty),
    replace: checkboxProperty(findProperty(page.properties || {}, config.propertyNames.replace)),
  };
}

function statusFor(currentStatus, target, config) {
  const hasKorean = /[가-힣]/.test(currentStatus || '');
  if (/삭제|delete/i.test(currentStatus || '')) {
    const deleteDefaults = {
      deleting: hasKorean ? '삭제 중' : 'Deleting',
      deleted: hasKorean ? '삭제 완료' : 'Deleted',
      publishing: hasKorean ? '삭제 중' : 'Deleting',
      published: hasKorean ? '삭제 완료' : 'Deleted',
      error: hasKorean ? '삭제 실패' : 'Delete failed',
    };
    return config.statusTargets[target] || deleteDefaults[target];
  }
  if (/배포/.test(currentStatus || '')) {
    const deployDefaults = {
      publishing: currentStatus || '배포 완료',
      published: '배포 완료',
      deleting: '삭제 중',
      deleted: '삭제 완료',
      error: '배포 전',
    };
    return config.statusTargets[target] || deployDefaults[target];
  }
  const defaults = {
    publishing: hasKorean ? '발행 중' : 'Publishing',
    published: hasKorean ? '발행 완료' : 'Published',
    deleting: hasKorean ? '삭제 중' : 'Deleting',
    deleted: hasKorean ? '삭제 완료' : 'Deleted',
    error: hasKorean ? '발행 실패' : 'Failed',
  };
  return config.statusTargets[target] || defaults[target];
}

async function readPageMarkdown(page, config, assetSlug) {
  const blocks = await getBlockChildren(page.id, config);
  const context = {
    config,
    assetSlug: normalizeSlug(assetSlug || page.id || 'notion-post') || 'notion-post',
    mediaIndex: 0,
  };
  return blocksToMarkdown(blocks, context, 0);
}

async function getBlockChildren(blockId, config) {
  if (!blockId) {
    return [];
  }

  if (config.fixtureBlocksFile) {
    const fixture = JSON.parse(await readFile(config.fixtureBlocksFile, 'utf8'));
    const value = fixture[blockId] || fixture.results || [];
    return Array.isArray(value) ? value : value.results || [];
  }

  const blocks = [];
  let cursor = '';
  do {
    const params = new URLSearchParams({ page_size: '100' });
    if (cursor) {
      params.set('start_cursor', cursor);
    }
    const response = await notionRequest(
      config,
      `/blocks/${encodeURIComponent(blockId)}/children?${params.toString()}`,
    );
    blocks.push(...(response.results || []));
    cursor = response.has_more ? response.next_cursor : '';
  } while (cursor);
  return blocks;
}

async function blockToMarkdown(block, context, depth) {
  const type = block?.type;
  const value = block?.[type] || {};
  const text = richTextMarkdown(value.rich_text || value.title || []);
  const plainText = richTextPlain(value.rich_text || value.title || []);
  const children = block?.has_children
    ? await childBlocksToMarkdown(block.id, context, depth + 1)
    : '';

  switch (type) {
    case 'paragraph':
      return joinMarkdownParts([text, children]);
    case 'heading_1':
      return joinMarkdownParts([`# ${text}`, children]);
    case 'heading_2':
      return joinMarkdownParts([`## ${text}`, children]);
    case 'heading_3':
    case 'heading_4':
      return joinMarkdownParts([`### ${text}`, children]);
    case 'bulleted_list_item':
      return joinMarkdownParts([`${indent(depth)}- ${text}`, indentMarkdown(children, depth + 1)]);
    case 'numbered_list_item':
      return joinMarkdownParts([`${indent(depth)}1. ${text}`, indentMarkdown(children, depth + 1)]);
    case 'to_do':
      return joinMarkdownParts([
        `${indent(depth)}- [${value.checked ? 'x' : ' '}] ${text}`,
        indentMarkdown(children, depth + 1),
      ]);
    case 'quote':
    case 'callout':
      return quoteMarkdown(joinMarkdownParts([text, children]));
    case 'code':
      return `\`\`\`${String(value.language || '').trim()}\n${plainText}\n\`\`\``;
    case 'divider':
      return '---';
    case 'image':
      return mediaMarkdown(value, 'image', context);
    case 'file':
    case 'pdf':
    case 'video':
      return mediaMarkdown(value, 'file', context);
    case 'bookmark':
    case 'embed':
    case 'link_preview':
      return linkCardMarkdown(
        value.url || value.link_preview?.url || '',
        richTextPlain(value.caption || []) || value.url || '링크',
      );
    case 'toggle':
      return joinMarkdownParts([`### ${text}`, children]);
    case 'column_list':
    case 'column':
    case 'synced_block':
    case 'template':
    case 'tab':
      return children;
    default:
      return '';
  }
}

async function childBlocksToMarkdown(blockId, context, depth) {
  const children = await getBlockChildren(blockId, context.config);
  return blocksToMarkdown(children, context, depth);
}

async function blocksToMarkdown(blocks, context, depth) {
  let result = '';
  let previousListKind = '';
  for (const block of blocks) {
    const markdown = await blockToMarkdown(block, context, depth);
    if (!markdown.trim()) {
      continue;
    }
    const currentListKind = listMarkdownKind(block?.type);
    const separator = result
      ? previousListKind && currentListKind && previousListKind === currentListKind
        ? '\n'
        : '\n\n'
      : '';
    result += `${separator}${markdown.trimEnd()}`;
    previousListKind = currentListKind;
  }
  return result.trim();
}

function listMarkdownKind(type) {
  if (type === 'bulleted_list_item' || type === 'to_do') {
    return 'ul';
  }
  if (type === 'numbered_list_item') {
    return 'ol';
  }
  return '';
}

async function notionRequest(config, path, options = {}) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Notion-Version': config.notionVersion,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(json.message || `Notion API ${response.status}`);
  }
  return json;
}

async function downloadText(url) {
  if (url.startsWith('file://') && process.env.NOTION_ALLOW_FILE_URLS === '1') {
    return readFile(new URL(url), 'utf8');
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Could not download source file: HTTP ${response.status}`);
  }
  return response.text();
}

async function downloadBinary(url) {
  if (url.startsWith('file://') && process.env.NOTION_ALLOW_FILE_URLS === '1') {
    const data = await readFile(new URL(url));
    return { data, contentType: contentTypeFromPath(new URL(url).pathname) };
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Could not download media file: HTTP ${response.status}`);
  }
  return {
    data: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || '',
  };
}

async function downloadMediaAsset(url, context) {
  const { data, contentType } = await downloadBinary(url);
  const index = String(++context.mediaIndex).padStart(2, '0');
  const extension = mediaExtension(url, contentType);
  const relativePath = `assets/notion-posts/${context.assetSlug}-${index}${extension}`;
  await mkdir(join(process.cwd(), 'public/blog/assets/notion-posts'), { recursive: true });
  await writeFile(join(process.cwd(), 'public/blog', relativePath), data);
  return relativePath;
}

async function resolveCoverAsset(value, slug) {
  const rawCover = String(value || '').trim();
  const assetCover = normalizeAssetCover(rawCover);
  if (assetCover) {
    return assetCover;
  }
  if (!rawCover || !isDownloadableMediaUrl(rawCover)) {
    return rawCover || 'assets/editorial-cover.jpg';
  }

  const { data, contentType } = await downloadBinary(rawCover);
  const extension = mediaExtension(rawCover, contentType);
  if (!['.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(extension)) {
    throw new Error('Notion thumbnail must be an image file.');
  }

  const relativePath = `assets/notion-posts/${slug}-cover${extension}`;
  await mkdir(join(process.cwd(), 'public/blog/assets/notion-posts'), { recursive: true });
  await writeFile(join(process.cwd(), 'public/blog', relativePath), data);
  return relativePath;
}

function normalizeAssetCover(value) {
  const text = String(value || '')
    .trim()
    .replace(/^\.\/+/, '');
  if (text.startsWith('assets/')) {
    return text;
  }
  if (text.startsWith('/assets/')) {
    return text.slice(1);
  }
  return '';
}

function isDownloadableMediaUrl(value) {
  return (
    /^https?:\/\//i.test(value) ||
    (value.startsWith('file://') && process.env.NOTION_ALLOW_FILE_URLS === '1')
  );
}

function mediaExtension(url, contentType = '') {
  const pathname = safeUrlPathname(url);
  const extension = extname(pathname).toLowerCase();
  if (['.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf'].includes(extension)) {
    return extension;
  }
  const normalizedType = String(contentType || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  return (
    {
      'image/avif': '.avif',
      'image/webp': '.webp',
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
    }[normalizedType] || '.jpg'
  );
}

function contentTypeFromPath(pathname) {
  const extension = extname(pathname).toLowerCase();
  return (
    {
      '.avif': 'image/avif',
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    }[extension] || ''
  );
}

function safeUrlPathname(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return String(url || '').split('?')[0];
  }
}

function _renderMarkdownDocument(markdown, metadata) {
  const language = normalizeLanguage(metadata.language || '');
  const locale = ogLocaleForLanguage(language);
  const coverAlt = metadata.coverAlt || `${metadata.title} 대표 이미지`;
  const section = metadata.section || metadata.tags[0] || '';
  const postMetadata = {
    title: metadata.title,
    description: metadata.description,
    date: metadata.date,
    tags: metadata.tags,
    author: metadata.author,
    cover: metadata.cover,
    language,
    coverAlt,
    section,
    sourceFormat: 'markdown',
    sourceMarkdown: String(markdown || '').trim(),
  };
  return `<!--
corca-post
${JSON.stringify(postMetadata, null, 2)}
-->
<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(metadata.title)}</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <meta name="keywords" content="${escapeHtml(metadata.tags.join(','))}">
  <meta name="date" content="${escapeHtml(metadata.date)}">
  <meta name="author" content="${escapeHtml(metadata.author)}">
  <meta name="language" content="${escapeHtml(language)}">
  <meta name="cover-alt" content="${escapeHtml(coverAlt)}">
  <meta name="section" content="${escapeHtml(section)}">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:locale" content="${escapeHtml(locale)}">
  <meta property="og:image" content="${escapeHtml(metadata.cover)}">
  <meta property="og:image:alt" content="${escapeHtml(coverAlt)}">
  <meta property="article:section" content="${escapeHtml(section)}">
</head>
<body>
  <article>
${markdownToHtml(markdown)}
  </article>
</body>
</html>`;
}

function normalizeLanguage(value) {
  const text = String(value || '')
    .trim()
    .toLowerCase()
    .replace('_', '-');
  if (!text) return 'ko';
  if (text.startsWith('en')) return 'en';
  if (text.startsWith('ko') || text.startsWith('kr') || text === '한국어' || text === 'korean')
    return 'ko';
  if (text.startsWith('ja') || text.startsWith('jp') || text === '일본어' || text === 'japanese')
    return 'ja';
  if (text.startsWith('zh') || text.startsWith('cn') || text === '중국어' || text === 'chinese')
    return 'zh';
  return 'ko';
}

function blogPathForLanguage(language) {
  return {
    ko: '/blog',
    en: '/en/blog',
    ja: '/ja/blog',
    zh: '/zh/blog',
  }[normalizeLanguage(language)];
}

function ogLocaleForLanguage(language) {
  return {
    ko: 'ko_KR',
    en: 'en_US',
    ja: 'ja_JP',
    zh: 'zh_CN',
  }[normalizeLanguage(language)];
}

function richTextMarkdown(value) {
  return (value || [])
    .map((item) => {
      const href = item.href || item.text?.link?.url || '';
      const annotations = item.annotations || {};
      const text = String(item.plain_text || item.text?.content || '').replace(/\r\n?/g, '\n');
      if (!text) {
        return '';
      }
      return text
        .split(/(\n(?:[ \t]*\n)+)/)
        .map((part) => {
          if (!part || /^\n(?:[ \t]*\n)+$/.test(part)) {
            return part;
          }
          let formatted = part;
          if (annotations.code) {
            formatted = `\`${formatted.replaceAll('`', "'")}\``;
          }
          if (annotations.bold) {
            formatted = `**${formatted}**`;
          }
          if (annotations.italic) {
            formatted = `_${formatted}_`;
          }
          if (href && /^https?:\/\//i.test(href)) {
            formatted = `[${formatted}](${href})`;
          }
          return formatted;
        })
        .join('');
    })
    .join('')
    .trim();
}

function richTextPlain(value) {
  return (value || [])
    .map((item) => item.plain_text || item.text?.content || '')
    .join('')
    .trim();
}

function joinMarkdownParts(parts) {
  return parts
    .map((part) => String(part || '').trimEnd())
    .filter(Boolean)
    .join('\n\n');
}

function indentMarkdown(markdown, depth) {
  if (!markdown.trim()) {
    return '';
  }
  const prefix = indent(depth);
  return markdown
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

function indent(depth) {
  return '  '.repeat(Math.max(0, depth));
}

function quoteMarkdown(markdown) {
  return markdown
    .split('\n')
    .map((line) => `> ${line}`.trimEnd())
    .join('\n');
}

async function mediaMarkdown(value, kind, context) {
  const url = notionFileUrl(value);
  if (!url) {
    return '';
  }
  const mediaUrl = value.type === 'file' ? await downloadMediaAsset(url, context) : url;
  const caption =
    richTextPlain(value.caption || []) ||
    (kind === 'image' ? 'Notion image' : basename(safeUrlPathname(mediaUrl)) || '파일');
  if (kind === 'image') {
    return `![${caption}](${mediaUrl})`;
  }
  return linkMarkdown(mediaUrl, caption);
}

function linkMarkdown(url, label) {
  if (!/^https?:\/\//i.test(url || '')) {
    return '';
  }
  return `[${label || url}](${url})`;
}

function linkCardMarkdown(url, label) {
  if (!/^https?:\/\//i.test(url || '')) {
    return '';
  }
  const payload = encodeURIComponent(
    JSON.stringify({
      url,
      label: label || url,
      host: linkHost(url),
    }),
  );
  return `{{corca-link-card:${payload}}}`;
}

function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function notionFileUrl(value) {
  if (!value) {
    return '';
  }
  if (value.type === 'file') {
    return value.file?.url || '';
  }
  if (value.type === 'external') {
    return value.external?.url || '';
  }
  return '';
}

function inferMarkdownMetadata(markdown) {
  const title =
    String(markdown || '')
      .match(/^#\s+(.+)$/m)?.[1]
      ?.trim() || '';
  const paragraph =
    String(markdown || '')
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .find((part) => part && !part.startsWith('#') && !part.startsWith('```')) || '';
  return {
    title,
    description: stripTags(paragraph.replace(/[#>*_`[\]()!-]/g, ' ')).slice(0, 180),
  };
}

function inferSourceFormat(name, content) {
  if (/\.html?$/i.test(name) || /<article|<html|<!doctype/i.test(content)) {
    return 'html';
  }
  throw new Error(
    'Only .html or .htm file uploads can be published. For Markdown, write the post in the Notion page body.',
  );
}

function isHtmlUrl(url) {
  return /\.html?(?:[?#].*)?$/i.test(String(url || ''));
}

function baseNameFromUrl(url) {
  try {
    return basename(new URL(url).pathname);
  } catch {
    return '';
  }
}

function findProperty(properties, names) {
  return findPropertyEntry(properties, names)?.[1] || null;
}

function findPropertyEntry(properties, names) {
  const requested = names.map(normalizeLabel);
  return (
    Object.entries(properties || {}).find(([name]) => requested.includes(normalizeLabel(name))) ||
    null
  );
}

function textProperty(property) {
  if (!property) {
    return '';
  }
  if (property.type === 'title') {
    return richText(property.title);
  }
  if (property.type === 'rich_text') {
    return richText(property.rich_text);
  }
  if (property.type === 'text') {
    if (typeof property.text === 'string') {
      return property.text.trim();
    }
    return richText(property.text || property.rich_text);
  }
  if (property.type === 'select') {
    return property.select?.name || '';
  }
  if (property.type === 'status') {
    return property.status?.name || '';
  }
  if (property.type === 'multi_select') {
    return (property.multi_select || [])
      .map((item) => item.name)
      .filter(Boolean)
      .join(',');
  }
  if (property.type === 'date') {
    return property.date?.start?.slice(0, 10) || '';
  }
  if (property.type === 'url') {
    return property.url || '';
  }
  if (property.type === 'email') {
    return property.email || '';
  }
  if (property.type === 'phone_number') {
    return property.phone_number || '';
  }
  if (property.type === 'files') {
    return fileUrl(property.files?.[0]) || '';
  }
  return '';
}

function checkboxProperty(property) {
  return property?.type === 'checkbox' ? Boolean(property.checkbox) : false;
}

function richText(value) {
  return (value || [])
    .map((item) => item.plain_text || item.text?.content || '')
    .join('')
    .trim();
}

function pageTitle(properties) {
  return textProperty(
    Object.values(properties || {}).find((property) => property?.type === 'title'),
  );
}

function fileUrl(file) {
  if (!file) {
    return '';
  }
  if (file.type === 'file') {
    return file.file?.url || '';
  }
  if (file.type === 'external') {
    return file.external?.url || '';
  }
  return '';
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'");
}

function tagList(value) {
  return normalizeRawTags(value);
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 90);
}

function parsePostHtml(html, name = 'notion-post.html') {
  const source = String(html || '');
  const articleHtml =
    extractElementInnerHtml(source, 'article') ||
    extractElementInnerHtml(source, 'main') ||
    extractElementInnerHtml(source, 'body') ||
    source;
  return {
    articleHtml,
    metadata: {
      title: firstPresent([
        metaContent(source, ({ property }) => property === 'og:title'),
        elementText(source, 'title'),
        elementText(articleHtml, 'h1'),
        basename(name).replace(/\.[^.]+$/, ''),
      ]),
      description: firstPresent([
        metaContent(source, ({ name: metaName }) => metaName === 'description'),
        metaContent(source, ({ property }) => property === 'og:description'),
        inferDescriptionFromContent(articleHtml),
      ]),
      date: normalizeDate(
        firstPresent([
          metaContent(source, ({ name: metaName }) =>
            ['date', 'publish_date', 'published_time'].includes(metaName),
          ),
          metaContent(source, ({ property }) => property === 'article:published_time'),
          todayInTimeZone('Asia/Seoul'),
        ]),
      ),
      tags: normalizeRawTags(
        [
          ...metaContents(source, ({ property }) => property === 'article:tag'),
          metaContent(source, ({ name: metaName }) => ['keywords', 'tags'].includes(metaName)),
        ]
          .filter(Boolean)
          .join(','),
      ),
      author: firstPresent([
        metaContent(source, ({ name: metaName }) => metaName === 'author'),
        metaContent(source, ({ property }) => property === 'article:author'),
        'Corca Team',
      ]),
      cover: firstPresent([
        metaContent(source, ({ property }) => property === 'og:image'),
        metaContent(source, ({ name: metaName }) => metaName === 'twitter:image'),
      ]),
    },
  };
}

function normalizePostTags(value) {
  const tags = normalizeRawTags(value)
    .map((item) => item.replace(/^#/, '').trim())
    .filter(Boolean);
  return [...new Set(tags.length ? tags : ['코르카'])].slice(0, 8);
}

function normalizeRawTags(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeRawTags(item));
  }
  return String(value || '')
    .split(/[,#]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : todayInTimeZone('Asia/Seoul');
}

function todayInTimeZone(timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function stripTags(value) {
  return normalizeWhitespace(String(value || '').replace(/<[^>]*>/g, ' '));
}

function elementText(html, tagName) {
  return stripTags(extractElementInnerHtml(html, tagName));
}

function extractElementInnerHtml(html, tagName) {
  const match = String(html || '').match(
    new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'),
  );
  return match?.[1]?.trim() || '';
}

function metaContent(html, predicate) {
  return metaContents(html, predicate)[0] || '';
}

function metaContents(html, predicate) {
  const values = [];
  for (const match of String(html || '').matchAll(/<meta\b([^>]*)>/gi)) {
    const attrs = parseAttributes(match[1] || '');
    const normalized = {
      name: String(attrs.name || '').toLowerCase(),
      property: String(attrs.property || '').toLowerCase(),
    };
    if (predicate(normalized) && attrs.content) {
      values.push(String(attrs.content).trim());
    }
  }
  return values;
}

function parseAttributes(value) {
  const attrs = {};
  for (const match of String(value || '').matchAll(
    /([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g,
  )) {
    attrs[match[1].toLowerCase()] = decodeHtmlEntities(match[3] ?? match[4] ?? match[5] ?? '');
  }
  return attrs;
}

function firstPresent(values) {
  return (
    values
      .map((value) => (Array.isArray(value) ? value.join(',') : String(value || '').trim()))
      .find(Boolean) || ''
  );
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function _runNode(commandArgs) {
  execFileSync(process.execPath, commandArgs, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

function loadConfig() {
  const token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
  if (!token) {
    fail('NOTION_TOKEN is required.');
  }
  const dataSourceId = normalizeNotionId(process.env.NOTION_BLOG_DATA_SOURCE_ID || '');
  const databaseId = normalizeNotionId(
    process.env.NOTION_BLOG_DATABASE_ID ||
      process.env.NOTION_BLOG_DATABASE_URL ||
      process.env.NOTION_DATABASE_ID ||
      '',
  );
  if (!dataSourceId && !databaseId) {
    fail('Set NOTION_BLOG_DATA_SOURCE_ID or NOTION_BLOG_DATABASE_ID/NOTION_BLOG_DATABASE_URL.');
  }

  return {
    token,
    dataSourceId,
    databaseId,
    apiBaseUrl: (process.env.NOTION_API_BASE_URL || 'https://api.notion.com/v1').replace(
      /\/+$/,
      '',
    ),
    notionVersion: process.env.NOTION_VERSION || (dataSourceId ? '2026-03-11' : '2022-06-28'),
    publicBaseUrl: (process.env.CORCA_SITE_URL || 'https://corca.local').replace(/\/+$/, ''),
    readyStatuses: envList('NOTION_POST_READY_STATUS', [
      'Ready',
      'Ready to publish',
      'Publish',
      'Publish requested',
      '발행 요청',
      '발행 준비',
      '배포 완료',
      '업로드 요청',
      '게시 요청',
    ]),
    updateStatuses: envList('NOTION_POST_UPDATE_STATUS', [
      'Update',
      'Update requested',
      'Republish',
      'Republish requested',
      '수정 요청',
      '수정',
      '재발행 요청',
    ]),
    deleteStatuses: envList('NOTION_POST_DELETE_STATUS', [
      'Delete',
      'Delete requested',
      'Unpublish',
      'Unpublish requested',
      '삭제 요청',
      '삭제',
      '비공개 요청',
    ]),
    statusTargets: {
      publishing: process.env.NOTION_POST_PUBLISHING_STATUS || '',
      published: process.env.NOTION_POST_PUBLISHED_STATUS || '',
      deleting: process.env.NOTION_POST_DELETING_STATUS || '',
      deleted: process.env.NOTION_POST_DELETED_STATUS || '',
      error: process.env.NOTION_POST_ERROR_STATUS || '',
    },
    propertyNames: {
      title: envList('NOTION_POST_TITLE_PROPERTY', ['Title', 'Name', '제목', '이름']),
      status: envList('NOTION_POST_STATUS_PROPERTY', ['Status', '상태']),
      file: envList('NOTION_POST_FILE_PROPERTY', [
        'File',
        'Files',
        '파일',
        '원고',
        '업로드',
        'Source',
        'Content',
      ]),
      sourceUrl: envList('NOTION_POST_SOURCE_URL_PROPERTY', [
        'Source URL',
        'File URL',
        '원문 URL',
        '파일 URL',
      ]),
      slug: envList('NOTION_POST_SLUG_PROPERTY', ['Slug', '슬러그']),
      description: envList('NOTION_POST_DESCRIPTION_PROPERTY', [
        'Description',
        'Summary',
        '설명',
        '요약',
      ]),
      tags: envList('NOTION_POST_TAGS_PROPERTY', ['Tags', '태그', 'Category', '카테고리']),
      date: envList('NOTION_POST_DATE_PROPERTY', [
        'Date',
        'Publish Date',
        'Published',
        '날짜',
        '게시일',
        '발행일',
      ]),
      author: envList('NOTION_POST_AUTHOR_PROPERTY', ['Author', '작성자']),
      cover: envList('NOTION_POST_COVER_PROPERTY', [
        'Cover',
        'Cover Image',
        'Thumbnail',
        '대표 이미지',
        '썸네일',
        '커버',
      ]),
      language: envList('NOTION_POST_LANGUAGE_PROPERTY', ['Language', '언어']),
      coverAlt: envList('NOTION_POST_COVER_ALT_PROPERTY', [
        'Cover Alt',
        'Thumbnail Alt',
        'Image Alt',
        '대표 이미지 설명',
        '썸네일 설명',
        '이미지 설명',
      ]),
      section: envList('NOTION_POST_SECTION_PROPERTY', [
        'Section',
        'Article Section',
        '대표 섹션',
        '섹션',
        'Category',
        '카테고리',
      ]),
      replace: envList('NOTION_POST_REPLACE_PROPERTY', ['Replace', '교체']),
      publicUrl: envList('NOTION_POST_PUBLIC_URL_PROPERTY', [
        'Public URL',
        'Published URL',
        '공개 URL',
        '발행 URL',
      ]),
      message: envList('NOTION_POST_MESSAGE_PROPERTY', [
        'Publish Log',
        'Result',
        'Message',
        '발행 로그',
        '결과',
        '오류',
      ]),
    },
    defaultTags: process.env.NOTION_POST_DEFAULT_TAGS || '코르카',
    skipUpdates: process.env.NOTION_SKIP_UPDATES === '1',
    fixturePagesFile: process.env.NOTION_FIXTURE_PAGES_FILE || '',
    fixtureBlocksFile: process.env.NOTION_FIXTURE_BLOCKS_FILE || '',
    fixtureUpdatesFile: process.env.NOTION_FIXTURE_UPDATES_FILE || '',
    pageId: normalizeNotionId(process.env.NOTION_PAGE_ID || process.env.NOTION_POST_PAGE_ID || ''),
    requireRecentReady: process.env.NOTION_REQUIRE_RECENT_READY === '1',
    recentReadyMinutes: Number(process.env.NOTION_RECENT_READY_MINUTES || 30),
    limit: args.limit || Number(process.env.NOTION_POST_LIMIT || 50),
  };
}

function envList(name, fallback) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeNotionId(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  const matches = text.match(/[0-9a-f]{32}/gi);
  if (matches?.length) {
    return matches[0];
  }
  return text.replace(/-/g, '');
}

function normalizeLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseArgs(values) {
  const parsed = {
    dryRun: false,
    limit: 0,
  };
  for (let index = 0; index < values.length; index += 1) {
    const token = values[index];
    if (token === '--dry-run' || token === '--check') {
      parsed.dryRun = true;
      continue;
    }
    if (token === '--limit') {
      parsed.limit = Number(values[index + 1] || 0);
      index += 1;
      continue;
    }
    fail(`Unknown argument: ${token}`);
  }
  return parsed;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
