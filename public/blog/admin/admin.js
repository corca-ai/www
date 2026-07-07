const loginPanel = document.querySelector("#loginPanel");
const adminPanel = document.querySelector("#adminPanel");
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#passwordInput");
const loginMessage = document.querySelector("#loginMessage");
const postList = document.querySelector("#postList");
const postForm = document.querySelector("#postForm");
const adminMessage = document.querySelector("#adminMessage");
const fileInput = document.querySelector("#fileInput");
const coverFileInput = document.querySelector("#coverFileInput");
const contentInput = document.querySelector("#contentInput");
const contentLabel = document.querySelector("#contentLabel");
const markdownToolbar = document.querySelector("#markdownToolbar");
const markdownPreviewPanel = document.querySelector("#markdownPreviewPanel");
const markdownPreview = document.querySelector("#markdownPreview");
const previewStatus = document.querySelector("#previewStatus");
const saveButton = document.querySelector("#saveButton");
const deleteButton = document.querySelector("#deleteButton");
const fields = {
  title: document.querySelector("#titleInput"),
  slug: document.querySelector("#slugInput"),
  description: document.querySelector("#descriptionInput"),
  date: document.querySelector("#dateInput"),
  tags: document.querySelector("#tagsInput"),
  author: document.querySelector("#authorInput"),
  format: document.querySelector("#formatInput"),
  cover: document.querySelector("#coverInput"),
  language: document.querySelector("#languageInput"),
  section: document.querySelector("#sectionInput"),
  coverAlt: document.querySelector("#coverAltInput")
};

let posts = [];
let activeSlug = "";
let pendingCoverImage = null;
let previewTimer = 0;

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "확인 중입니다.";
  let response;
  try {
    response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput.value })
    });
  } catch {
    loginMessage.textContent = workerRuntimeMessage();
    return;
  } finally {
    passwordInput.value = "";
  }
  if (!response.ok) {
    loginMessage.textContent = await apiErrorMessage(response, "비밀번호가 맞지 않습니다.");
    return;
  }
  await enterAdmin();
});

fields.format.addEventListener("change", () => {
  updateEditorMode();
});

contentInput.addEventListener("input", () => {
  scheduleMarkdownPreview();
});

markdownToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-markdown-action]");
  if (!button || fields.format.value !== "markdown" || contentInput.disabled) return;
  applyMarkdownAction(button.dataset.markdownAction || "");
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const content = await file.text();
  contentInput.value = content;
  if (/\.md|\.markdown$/i.test(file.name)) {
    fields.format.value = "markdown";
    const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
    if (title && !fields.title.value) fields.title.value = title;
  } else {
    fields.format.value = "html";
    const title = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
    if (title && !fields.title.value) fields.title.value = title;
  }
  if (!fields.slug.value) {
    fields.slug.value = slugify(fields.title.value || file.name.replace(/\.[^.]+$/, ""));
  }
  fields.format.dispatchEvent(new Event("change"));
  updateMarkdownPreview();
});

coverFileInput.addEventListener("change", async () => {
  const file = coverFileInput.files?.[0];
  pendingCoverImage = null;
  if (!file) return;
  if (!/^image\/(?:jpeg|png|webp)$/.test(file.type)) {
    adminMessage.textContent = "썸네일은 jpg, png, webp 이미지만 업로드할 수 있습니다.";
    coverFileInput.value = "";
    return;
  }
  adminMessage.textContent = "썸네일 이미지를 준비하는 중입니다.";
  try {
    pendingCoverImage = await prepareCoverImage(file);
    fields.cover.value = pendingCoverImage.pathPreview;
    adminMessage.textContent = "썸네일 이미지가 선택되었습니다. 저장 요청하면 함께 반영됩니다.";
  } catch (error) {
    pendingCoverImage = null;
    coverFileInput.value = "";
    adminMessage.textContent = error.message || "썸네일 이미지를 처리하지 못했습니다.";
  }
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeSlug || fields.slug.value !== activeSlug) {
    adminMessage.textContent = "수정할 글을 먼저 선택하세요.";
    return;
  }
  adminMessage.textContent = "저장 요청을 보내는 중입니다.";
  const payload = {
    action: "upsert",
    slug: fields.slug.value,
    format: fields.format.value,
    fileName: fileInput.files?.[0]?.name || "",
    metadata: readMetadata(),
    contentBase64: await toBase64(contentInput.value)
  };
  if (pendingCoverImage) {
    payload.coverImageBase64 = pendingCoverImage.contentBase64;
    payload.coverImageFileName = pendingCoverImage.fileName;
    payload.coverImageMime = pendingCoverImage.mime;
  }
  const response = await fetch("/api/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    adminMessage.textContent = await apiErrorMessage(response, "저장 요청에 실패했습니다.");
    return;
  }
  pendingCoverImage = null;
  coverFileInput.value = "";
  adminMessage.textContent = "저장 요청을 보냈습니다. GitHub Actions 반영 후 목록이 갱신됩니다.";
});

deleteButton.addEventListener("click", async () => {
  const slug = activeSlug;
  if (!slug) {
    adminMessage.textContent = "삭제할 글을 선택하세요.";
    return;
  }
  if (!window.confirm(`'${slug}' 글을 삭제 요청할까요?`)) {
    return;
  }
  adminMessage.textContent = "삭제 요청을 보내는 중입니다.";
  const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!response.ok) {
    adminMessage.textContent = await apiErrorMessage(response, "삭제 요청에 실패했습니다.");
    return;
  }
  adminMessage.textContent = "삭제 요청을 보냈습니다. GitHub Actions 반영 후 목록이 갱신됩니다.";
});

async function enterAdmin() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  loginMessage.textContent = "";
  await loadPosts();
  clearEditor();
}

async function loadPosts() {
  let response;
  try {
    response = await fetch("/api/admin/posts");
  } catch {
    posts = [];
    renderPostList();
    adminMessage.textContent = workerRuntimeMessage();
    return;
  }
  if (response.status === 401) {
    adminPanel.hidden = true;
    loginPanel.hidden = false;
    return;
  }
  if (!response.ok) {
    posts = [];
    renderPostList();
    adminMessage.textContent = await apiErrorMessage(response, "글 목록을 불러오지 못했습니다.");
    return;
  }
  let data;
  try {
    data = await response.json();
  } catch {
    posts = [];
    renderPostList();
    adminMessage.textContent = "글 목록 응답을 해석하지 못했습니다. Worker API 응답을 확인하세요.";
    return;
  }
  posts = Array.isArray(data.posts) ? data.posts : [];
  renderPostList();
  adminMessage.textContent = posts.length ? "수정하거나 삭제할 글을 선택하세요." : "불러올 글이 없습니다.";
}

function renderPostList() {
  if (!posts.length) {
    postList.innerHTML = `<p class="empty-list">글 목록이 없습니다.</p>`;
    return;
  }
  postList.innerHTML = posts.map((post) => `
    <button class="post-row ${post.slug === activeSlug ? "is-active" : ""}" type="button" data-slug="${escapeAttribute(post.slug)}">
      <strong>${escapeHtml(post.title)}</strong>
      <span>${escapeHtml(post.date)} · ${escapeHtml(post.author || "Corca Team")}</span>
    </button>
  `).join("");
  postList.querySelectorAll("[data-slug]").forEach((button) => {
    button.addEventListener("click", () => loadPostSource(button.dataset.slug));
  });
}

async function loadPostSource(slug) {
  activeSlug = slug;
  renderPostList();
  adminMessage.textContent = "글 원본을 불러오는 중입니다.";
  const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/source`);
  if (!response.ok) {
    adminMessage.textContent = await apiErrorMessage(response, "원본을 불러오지 못했습니다.");
    return;
  }
  const data = await response.json();
  const metadata = data.metadata || {};
  fields.title.value = metadata.title || "";
  fields.slug.value = slug;
  fields.description.value = metadata.description || "";
  fields.date.value = metadata.date || "";
  fields.tags.value = Array.isArray(metadata.tags) ? metadata.tags.join(",") : metadata.tags || "";
  fields.author.value = metadata.author || "Corca Team";
  fields.format.value = data.format || "html";
  fields.cover.value = metadata.cover || "assets/editorial-cover.jpg";
  pendingCoverImage = null;
  coverFileInput.value = "";
  fields.language.value = metadata.language || "ko";
  fields.section.value = metadata.section || "";
  fields.coverAlt.value = metadata.coverAlt || "";
  contentInput.value = data.content || "";
  fields.format.dispatchEvent(new Event("change"));
  updateMarkdownPreview();
  setEditorDisabled(false);
  adminMessage.textContent = "";
}

function clearEditor() {
  activeSlug = "";
  fields.title.value = "";
  fields.slug.value = "";
  fields.description.value = "";
  fields.date.value = "";
  fields.tags.value = "";
  fields.author.value = "";
  fields.format.value = "markdown";
  fields.cover.value = "";
  fields.language.value = "ko";
  fields.section.value = "";
  fields.coverAlt.value = "";
  contentInput.value = "";
  fileInput.value = "";
  coverFileInput.value = "";
  pendingCoverImage = null;
  fields.format.dispatchEvent(new Event("change"));
  updateMarkdownPreview();
  setEditorDisabled(true);
}

function readMetadata() {
  return {
    title: fields.title.value,
    description: fields.description.value,
    date: fields.date.value,
    tags: fields.tags.value,
    author: fields.author.value,
    cover: fields.cover.value,
    language: fields.language.value,
    section: fields.section.value,
    coverAlt: fields.coverAlt.value
  };
}

async function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function setEditorDisabled(disabled) {
  Object.values(fields).forEach((field) => {
    field.disabled = disabled;
  });
  fileInput.disabled = disabled;
  coverFileInput.disabled = disabled;
  contentInput.disabled = disabled;
  saveButton.disabled = disabled;
  deleteButton.disabled = disabled || !activeSlug;
  updateMarkdownToolsState();
}

function updateEditorMode() {
  const isMarkdown = fields.format.value === "markdown";
  contentLabel.textContent = isMarkdown ? "Markdown 수정" : "HTML 파일 재업로드";
  markdownToolbar.hidden = !isMarkdown;
  markdownPreviewPanel.hidden = !isMarkdown;
  updateMarkdownToolsState();
  updateMarkdownPreview();
}

function updateMarkdownToolsState() {
  const disabled = fields.format.value !== "markdown" || contentInput.disabled;
  markdownToolbar.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
}

function scheduleMarkdownPreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updateMarkdownPreview, 120);
}

function updateMarkdownPreview() {
  if (fields.format.value !== "markdown") {
    markdownPreview.innerHTML = "";
    previewStatus.textContent = "HTML";
    return;
  }
  const markdown = contentInput.value.trim();
  previewStatus.textContent = markdown ? "실시간" : "비어 있음";
  markdownPreview.innerHTML = markdown
    ? markdownToHtml(contentInput.value)
    : `<p class="preview-empty">Markdown을 입력하면 여기에 미리보기가 표시됩니다.</p>`;
}

function applyMarkdownAction(action) {
  const start = contentInput.selectionStart;
  const end = contentInput.selectionEnd;
  const selected = contentInput.value.slice(start, end);
  const lineRange = selectedLineRange(contentInput.value, start, end);
  let nextValue = contentInput.value;
  let nextStart = start;
  let nextEnd = end;

  if (action === "heading") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceLineRange(
      contentInput.value,
      lineRange,
      prefixLines(lineRange.text, "## ", "제목"),
    ));
  } else if (action === "quote") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceLineRange(
      contentInput.value,
      lineRange,
      prefixLines(lineRange.text, "> ", "인용문"),
    ));
  } else if (action === "unordered-list") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceLineRange(
      contentInput.value,
      lineRange,
      prefixLines(lineRange.text, "- ", "목록 항목"),
    ));
  } else if (action === "ordered-list") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceLineRange(
      contentInput.value,
      lineRange,
      numberLines(lineRange.text),
    ));
  } else if (action === "rule") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceSelection(
      contentInput.value,
      start,
      end,
      `${needsLeadingBlank(contentInput.value, start) ? "\n\n" : ""}---\n\n`,
    ));
  } else if (action === "link") {
    const label = selected || "링크 텍스트";
    const replacement = `[${label}](https://example.com)`;
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceSelection(
      contentInput.value,
      start,
      end,
      replacement,
    ));
    nextStart = start + label.length + 3;
    nextEnd = nextStart + "https://example.com".length;
  } else if (action === "image") {
    const alt = selected || "이미지 설명";
    const replacement = `![${alt}](assets/example.png)`;
    ({ value: nextValue, start: nextStart, end: nextEnd } = replaceSelection(
      contentInput.value,
      start,
      end,
      replacement,
    ));
    nextStart = start + alt.length + 4;
    nextEnd = nextStart + "assets/example.png".length;
  } else if (action === "code") {
    const multiline = selected.includes("\n");
    if (multiline) {
      ({ value: nextValue, start: nextStart, end: nextEnd } = replaceSelection(
        contentInput.value,
        start,
        end,
        `\`\`\`\n${selected || "code"}\n\`\`\``,
      ));
    } else {
      ({ value: nextValue, start: nextStart, end: nextEnd } = wrapSelection(
        contentInput.value,
        start,
        end,
        "`",
        "`",
      ));
    }
  } else if (action === "bold") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = wrapSelection(
      contentInput.value,
      start,
      end,
      "**",
      "**",
    ));
  } else if (action === "italic") {
    ({ value: nextValue, start: nextStart, end: nextEnd } = wrapSelection(
      contentInput.value,
      start,
      end,
      "_",
      "_",
    ));
  }

  contentInput.value = nextValue;
  contentInput.focus();
  contentInput.setSelectionRange(nextStart, nextEnd);
  updateMarkdownPreview();
}

function selectedLineRange(value, start, end) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  return {
    start: lineStart,
    end: lineEnd,
    text: value.slice(lineStart, lineEnd)
  };
}

function replaceLineRange(value, range, replacement) {
  const next = `${value.slice(0, range.start)}${replacement}${value.slice(range.end)}`;
  return { value: next, start: range.start, end: range.start + replacement.length };
}

function replaceSelection(value, start, end, replacement) {
  const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
  return { value: next, start, end: start + replacement.length };
}

function wrapSelection(value, start, end, before, after, selectionStart, selectionEnd) {
  const selected = value.slice(start, end) || placeholderForWrap(before);
  const replacement = `${before}${selected}${after}`;
  const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
  const nextStart = selectionStart ?? start + before.length;
  const nextEnd = selectionEnd ?? start + before.length + selected.length;
  return { value: next, start: nextStart, end: nextEnd };
}

function placeholderForWrap(before) {
  if (before === "**") return "굵은 텍스트";
  if (before === "_") return "기울임 텍스트";
  if (before === "`") return "code";
  return "";
}

function prefixLines(text, prefix, fallback) {
  const source = text.trim() ? text : fallback;
  return source
    .split("\n")
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line || fallback}`))
    .join("\n");
}

function numberLines(text) {
  const lines = (text.trim() ? text : "목록 항목").split("\n");
  return lines.map((line, index) => `${index + 1}. ${line.replace(/^\d+[.)]\s+/, "")}`).join("\n");
}

function needsLeadingBlank(value, start) {
  return start > 0 && !value.slice(0, start).endsWith("\n\n");
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let listTag = "ul";
  let quote = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      html.push(
        `<${listTag}>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listTag}>`,
      );
      list = [];
      listTag = "ul";
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      const content = quote.join("\n").trim();
      if (content) {
        html.push(`<blockquote>${markdownToHtml(content)}</blockquote>`);
      }
      quote = [];
    }
  };
  const flushCode = () => {
    if (code.length) {
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      code = [];
    }
  };
  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushTextBlocks();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!trimmed) {
      flushTextBlocks();
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushTextBlocks();
      html.push("<hr>");
      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushTextBlocks();
      html.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const nextTag = ordered ? "ol" : "ul";
      if (list.length && listTag !== nextTag) flushList();
      listTag = nextTag;
      list.push(unordered?.[1] || ordered?.[1] || "");
      continue;
    }
    const quoteItem = trimmed.match(/^>\s?(.*)$/);
    if (quoteItem) {
      flushParagraph();
      flushList();
      quote.push(quoteItem[1]);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushTextBlocks();
  if (inCode) flushCode();
  return html.join("\n");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_match, alt, src) =>
        `<img src="${safeMarkdownUrl(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">`,
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, text, href) =>
        `<a href="${safeMarkdownUrl(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`,
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s([{])_([^_\s][^_]*?)_(?=$|[\s.,!?;:)\]}])/g, "$1<em>$2</em>")
    .replace(/(^|[\s([{])\*([^*\s][^*]*?)\*(?=$|[\s.,!?;:)\]}])/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function safeMarkdownUrl(value) {
  const text = decodeHtml(value).trim();
  if (
    /^(https?:)?\/\//i.test(text) ||
    text.startsWith("#") ||
    text.startsWith("/blog/assets/")
  ) {
    return escapeAttribute(text);
  }
  if (text.startsWith("assets/")) {
    return escapeAttribute(`/blog/${text}`);
  }
  if (text.startsWith("/assets/")) {
    return escapeAttribute(`/blog${text}`);
  }
  return "#";
}

async function apiErrorMessage(response, fallback) {
  if (response.status === 404) {
    const detail = await responseErrorCode(response);
    return detail ? `${fallback} (${detail})` : workerRuntimeMessage();
  }
  if (response.status === 503) {
    const detail = await responseErrorCode(response);
    if (detail === "asset_binding_unavailable") {
      return "글 목록은 빌드된 /posts/index.json에서 읽습니다. 현재 Worker ASSETS binding이 없어 목록을 불러올 수 없습니다.";
    }
    if (detail === "missing_github_dispatch_token") {
      return `${fallback} (GitHub dispatch token이 설정되어 있지 않습니다.)`;
    }
    return `${fallback} (Worker 런타임 설정을 확인하세요.)`;
  }
  try {
    const data = await response.json();
    return data.error ? `${fallback} (${data.error})` : fallback;
  } catch {
    return fallback;
  }
}

async function responseErrorCode(response) {
  try {
    const data = await response.clone().json();
    return data.error || "";
  } catch {
    return "";
  }
}

function workerRuntimeMessage() {
  return "정적 서버에는 admin API가 없습니다. Cloudflare Worker 환경에서 접속해야 로그인, 글 목록, 수정, 삭제가 동작합니다.";
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "");
}

async function prepareCoverImage(file) {
  const image = await loadImage(file);
  const maxWidth = 1200;
  const maxHeight = 675;
  const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("브라우저에서 이미지 처리를 지원하지 않습니다.");
  }
  context.drawImage(image, 0, 0, width, height);

  let blob = null;
  for (const quality of [0.82, 0.74, 0.66, 0.58]) {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (blob.size <= 48000) break;
  }
  if (!blob || blob.size > 64000) {
    throw new Error("썸네일 이미지 용량이 큽니다. 더 작은 이미지를 선택해 주세요.");
  }

  const contentBase64 = await blobToBase64(blob);
  const slug = fields.slug.value || slugify(fields.title.value || file.name.replace(/\.[^.]+$/, ""));
  return {
    contentBase64,
    fileName: `${slug || "post"}-cover.jpg`,
    mime: "image/jpeg",
    pathPreview: `assets/admin-posts/${slug || "post"}-cover.jpg`
  };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("썸네일 이미지를 읽지 못했습니다."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("썸네일 이미지를 압축하지 못했습니다."));
      }
    }, type, quality);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(new Error("썸네일 이미지를 인코딩하지 못했습니다."));
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function decodeHtml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value || "");
  return textarea.value;
}
