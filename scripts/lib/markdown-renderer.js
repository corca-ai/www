import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: false,
});

markdown.core.ruler.after('inline', 'corca_task_lists', (state) => {
  for (let index = 0; index < state.tokens.length; index += 1) {
    const token = state.tokens[index];
    if (token.type !== 'list_item_open') continue;

    const paragraph = state.tokens[index + 1];
    const inline = state.tokens[index + 2];
    if (paragraph?.type !== 'paragraph_open' || inline?.type !== 'inline') continue;

    const marker = inline.content.match(/^\[( |x|X)]\s+/);
    if (!marker) continue;

    const checked = marker[1].toLowerCase() === 'x';
    token.attrJoin('class', 'task-list-item');
    token.attrSet('data-task-checked', checked ? 'true' : 'false');
    inline.content = inline.content.slice(marker[0].length);

    const firstText = inline.children?.find(
      (child) => child.type === 'text' && child.content.startsWith(marker[0]),
    );
    if (firstText) {
      firstText.content = firstText.content.slice(marker[0].length);
    }
  }
});

const renderListItemOpen =
  markdown.renderer.rules.list_item_open ||
  ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));

markdown.renderer.rules.list_item_open = (tokens, index, options, env, self) => {
  const checked = tokens[index].attrGet('data-task-checked');
  const html = renderListItemOpen(tokens, index, options, env, self);
  if (checked == null) return html;
  return `${html}<input type="checkbox" disabled${checked === 'true' ? ' checked' : ''}> `;
};

const renderLinkOpen =
  markdown.renderer.rules.link_open ||
  ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));

markdown.renderer.rules.s_open = () => '<del>';
markdown.renderer.rules.s_close = () => '</del>';

markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const hrefIndex = tokens[index].attrIndex('href');
  if (hrefIndex >= 0) {
    tokens[index].attrs[hrefIndex][1] = safeMarkdownUrl(tokens[index].attrs[hrefIndex][1]);
  }
  return renderLinkOpen(tokens, index, options, env, self);
};

markdown.renderer.rules.image = (tokens, index) => {
  const token = tokens[index];
  const src = safeMarkdownUrl(token.attrGet('src'));
  const title = token.attrGet('title');
  const alt = token.content || '';
  const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : '';
  return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${titleAttribute} loading="lazy" decoding="async">`;
};

export function markdownToHtml(source) {
  const { markdown: preparedMarkdown, blocks } = extractContentBlocks(source);
  const html = markdown.render(preparedMarkdown).trim();
  return normalizeArticleMediaHtml(applyColorSyntax(restoreContentBlocks(html, blocks)));
}

function extractContentBlocks(source) {
  const blocks = [];
  const lines = String(source || '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const prepared = lines.map((line) => {
    const value = line.trim();
    const card = parseLinkCardMarker(value);
    const figure = parseFigureMarker(value);
    if (!card && !figure) return line;
    const placeholder = `CORCA_CONTENT_BLOCK_${blocks.length}`;
    blocks.push({ placeholder, html: card ? renderLinkCard(card) : renderFigure(figure) });
    return placeholder;
  });
  return { markdown: prepared.join('\n'), blocks };
}

function restoreContentBlocks(html, blocks) {
  let output = html;
  for (const block of blocks) {
    const placeholder = escapeRegExp(block.placeholder);
    output = output
      .replace(new RegExp(`<p>\\s*${placeholder}\\s*</p>`, 'g'), block.html)
      .replace(new RegExp(placeholder, 'g'), block.html);
  }
  return output;
}

function applyColorSyntax(html) {
  return String(html || '').replace(
    /\{color=(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/color\}/g,
    '<span style="color: $1">$2</span>',
  );
}

function parseLinkCardMarker(value) {
  const match = String(value || '').match(/^\{\{corca-link-card:([^}]+)\}\}$/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function parseFigureMarker(value) {
  const match = String(value || '').match(/^\{\{corca-figure:([^}]+)\}\}$/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function renderLinkCard(card) {
  const url = String(card.url || '');
  if (!/^https?:\/\//i.test(url)) return '';
  const host = card.host || linkHost(url);
  const label = String(card.label || url).trim();
  return `<aside class="article-link-card"><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer"><span class="article-link-card-domain">${escapeHtml(host)}</span><strong>${escapeHtml(label)}</strong><span class="article-link-card-url">${escapeHtml(url)}</span></a></aside>`;
}

function renderFigure(figure) {
  const src = safeMarkdownUrl(figure?.src);
  if (src === '#') return '';
  const alt = String(figure?.alt || '').trim();
  const caption = String(figure?.caption || '').trim();
  return `<figure><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
}

export function normalizeArticleMediaHtml(html) {
  const withItalicCaptions = String(html || '').replace(
    /<p>\s*(<img\b[^>]*>)\s*<\/p>\s*<p>\s*<em>([^<]+)<\/em>\s*<\/p>/g,
    (_match, image, caption) => renderFigureFromImage(image, caption),
  );
  return withItalicCaptions.replace(
    /<p>\s*(<img\b[^>]*>)\s*<\/p>/g,
    (_match, image) => renderFigureFromImage(image),
  );
}

function renderFigureFromImage(image, explicitCaption = '') {
  const alt = imageAttribute(image, 'alt');
  const caption = String(explicitCaption || '').trim() || (isGenericImageAlt(alt) ? '' : alt);
  const safeCaption = escapeHtml(decodeHtmlEntities(caption));
  return `<figure>${image}${safeCaption ? `<figcaption>${safeCaption}</figcaption>` : ''}</figure>`;
}

function isGenericImageAlt(value) {
  return ['notion image', '노션 이미지', '概念图像'].includes(String(value || '').trim().toLowerCase());
}

function imageAttribute(image, name) {
  const match = String(image || '').match(
    new RegExp(`\\s${escapeRegExp(name)}=("([^"]*)"|'([^']*)')`, 'i'),
  );
  return decodeHtmlEntities(match?.[2] ?? match?.[3] ?? '').trim();
}

function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function safeMarkdownUrl(value) {
  const text = decodeHtmlEntities(value).trim();
  if (
    /^(https?:)?\/\//i.test(text) ||
    text.startsWith('assets/') ||
    text.startsWith('/assets/') ||
    text.startsWith('/blog/assets/') ||
    text.startsWith('#')
  ) {
    return text;
  }
  return '#';
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
