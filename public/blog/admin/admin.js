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
const bodyImageInput = document.querySelector("#bodyImageInput");
const toastEditorContainer = document.querySelector("#toastEditor");
const contentInput = document.querySelector("#contentInput");
const contentLabel = document.querySelector("#contentLabel");
const markdownToolbar = document.querySelector("#markdownToolbar");
const markdownPreviewPanel = document.querySelector("#markdownPreviewPanel");
const markdownPreview = document.querySelector("#markdownPreview");
const htmlPreview = document.querySelector("#htmlPreview");
const previewInspector = document.querySelector("#previewInspector");
const previewStatus = document.querySelector("#previewStatus");
const colorInput = document.querySelector("#colorInput");
const slashCommandMenu = document.querySelector("#slashCommandMenu");
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
let pendingBodyImages = [];
let originalContent = "";
let previewTimer = 0;
let toastEditor = null;
let syncingToastEditor = false;
let slashState = null;
let activeSlashCommandIndex = 0;
const slashCommands = [
  { id: "text", title: "텍스트", hint: "일반 문단", keywords: ["text", "paragraph", "p", "텍스트", "문단"] },
  { id: "h1", title: "제목 1", hint: "# 큰 제목", keywords: ["h1", "title", "제목"] },
  { id: "h2", title: "제목 2", hint: "## 섹션 제목", keywords: ["h2", "heading", "제목"] },
  { id: "h3", title: "제목 3", hint: "### 작은 제목", keywords: ["h3", "subheading", "제목"] },
  { id: "bullets", title: "글머리 목록", hint: "- 목록 항목", keywords: ["bullet", "list", "ul", "목록"] },
  { id: "numbers", title: "번호 목록", hint: "1. 목록 항목", keywords: ["number", "ordered", "ol", "번호"] },
  { id: "todo", title: "체크리스트", hint: "- [ ] 할 일", keywords: ["todo", "task", "check", "체크"] },
  { id: "quote", title: "인용문", hint: "> 인용문", keywords: ["quote", "blockquote", "인용"] },
  { id: "callout", title: "콜아웃", hint: "강조 메모", keywords: ["callout", "note", "메모", "콜아웃"] },
  { id: "divider", title: "구분선", hint: "---", keywords: ["divider", "rule", "hr", "구분선"] },
  { id: "code", title: "코드 블록", hint: "```", keywords: ["code", "pre", "코드"] },
  { id: "table", title: "표", hint: "2열 표", keywords: ["table", "grid", "표"] },
  { id: "image-upload", title: "이미지 파일", hint: "파일 업로드 후 삽입", keywords: ["image", "img", "photo", "이미지", "사진"] },
  { id: "image-url", title: "이미지 URL", hint: "이미지 링크 삽입", keywords: ["image", "url", "이미지"] },
  { id: "link", title: "링크", hint: "[텍스트](URL)", keywords: ["link", "url", "링크"] },
  { id: "color", title: "글자 색상", hint: "선택한 색상 적용", keywords: ["color", "색", "색상"] },
  { id: "bold", title: "굵게", hint: "**텍스트**", keywords: ["bold", "strong", "굵게"] },
  { id: "italic", title: "기울임", hint: "_텍스트_", keywords: ["italic", "em", "기울임"] },
  { id: "strike", title: "취소선", hint: "~~텍스트~~", keywords: ["strike", "delete", "취소선"] }
];

initToastEditor();

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
  updateSlashCommandMenu();
});

contentInput.addEventListener("click", () => {
  updateSlashCommandMenu();
});

contentInput.addEventListener("keyup", (event) => {
  if (["ArrowUp", "ArrowDown", "Enter", "Tab", "Escape"].includes(event.key)) return;
  updateSlashCommandMenu();
});

contentInput.addEventListener("keydown", (event) => {
  handleEditorKeydown(event);
});

markdownToolbar.addEventListener("mousedown", (event) => {
  if (event.target.closest("[data-markdown-action]")) {
    event.preventDefault();
  }
});

markdownToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-markdown-action]");
  if (!button || fields.format.value !== "markdown" || contentInput.disabled) return;
  hideSlashCommandMenu();
  applyMarkdownAction(button.dataset.markdownAction || "");
});

slashCommandMenu.addEventListener("mousedown", (event) => {
  event.preventDefault();
});

slashCommandMenu.addEventListener("click", (event) => {
  const item = event.target.closest("[data-slash-command]");
  if (!item) return;
  const command = slashCommands.find((entry) => entry.id === item.dataset.slashCommand);
  if (command) applySlashCommand(command);
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const content = await file.text();
  setEditorContent(content);
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

bodyImageInput.addEventListener("change", async () => {
  const file = bodyImageInput.files?.[0];
  bodyImageInput.value = "";
  if (!file) return;
  if (!activeSlug) {
    adminMessage.textContent = "이미지를 넣을 글을 먼저 선택하세요.";
    return;
  }
  if (fields.format.value !== "markdown") {
    adminMessage.textContent = "본문 이미지 파일 삽입은 Markdown 모드에서만 사용할 수 있습니다.";
    return;
  }
  if (!/^image\/(?:jpeg|png|webp)$/.test(file.type)) {
    adminMessage.textContent = "본문 이미지는 jpg, png, webp 이미지만 업로드할 수 있습니다.";
    return;
  }
  adminMessage.textContent = "본문 이미지를 준비하는 중입니다.";
  try {
    const preparedImage = await prepareBodyImage(file);
    pendingBodyImages = [
      ...pendingBodyImages.filter((item) => item.path !== preparedImage.path),
      preparedImage
    ].slice(-6);
    insertOrReplaceImageMarkdown(preparedImage.path, file.name.replace(/\.[^.]+$/, ""));
    adminMessage.textContent = "본문 이미지를 Markdown에 삽입했습니다. 저장 요청하면 함께 반영됩니다.";
  } catch (error) {
    adminMessage.textContent = error.message || "본문 이미지를 처리하지 못했습니다.";
  }
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeSlug || fields.slug.value !== activeSlug) {
    adminMessage.textContent = "수정할 글을 먼저 선택하세요.";
    return;
  }
  adminMessage.textContent = "저장 요청을 보내는 중입니다.";
  const currentContent = getEditorContent();
  if (!currentContent.trim()) {
    adminMessage.textContent = "본문을 입력하세요.";
    return;
  }
  const payload = {
    action: "upsert",
    slug: fields.slug.value,
    format: fields.format.value,
    fileName: fileInput.files?.[0]?.name || "",
    metadata: readMetadata(),
    contentBase64: await toBase64(currentContent)
  };
  if (pendingCoverImage) {
    payload.coverImageBase64 = pendingCoverImage.contentBase64;
    payload.coverImageFileName = pendingCoverImage.fileName;
    payload.coverImageMime = pendingCoverImage.mime;
  }
  const currentBodyImagePaths = new Set(extractMarkdownImagePaths(currentContent));
  const referencedBodyImages = pendingBodyImages.filter((image) => currentBodyImagePaths.has(image.path));
  if (referencedBodyImages.length) {
    payload.bodyImages = referencedBodyImages.map(
      ({ path, pathPreview: _pathPreview, previewSrc: _previewSrc, ...image }) => image,
    );
  }
  const deleteBodyImagePaths = removedBodyImagePaths(originalContent, currentContent, fields.slug.value);
  if (deleteBodyImagePaths.length) {
    payload.deleteBodyImagePaths = deleteBodyImagePaths;
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
  pendingBodyImages = [];
  originalContent = currentContent;
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
  pendingBodyImages = [];
  coverFileInput.value = "";
  fields.language.value = metadata.language || "ko";
  fields.section.value = metadata.section || "";
  fields.coverAlt.value = metadata.coverAlt || "";
  setEditorContent(data.content || "");
  originalContent = getEditorContent();
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
  pendingBodyImages = [];
  setEditorContent("");
  fileInput.value = "";
  coverFileInput.value = "";
  bodyImageInput.value = "";
  pendingCoverImage = null;
  originalContent = "";
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
  bodyImageInput.disabled = disabled;
  contentInput.disabled = disabled;
  saveButton.disabled = disabled;
  deleteButton.disabled = disabled || !activeSlug;
  updateToastEditorState();
  updateMarkdownToolsState();
}

function updateEditorMode() {
  const isMarkdown = fields.format.value === "markdown";
  contentLabel.textContent = isMarkdown ? "Markdown 수정" : "HTML 수정";
  const toastActive = isToastEditorActive();
  markdownToolbar.hidden = !isMarkdown || toastActive;
  markdownPreviewPanel.hidden = toastActive;
  contentInput.hidden = toastActive;
  contentInput.required = !toastActive;
  if (toastEditorContainer) {
    toastEditorContainer.hidden = !toastActive;
  }
  document.body.classList.toggle("toast-editor-active", toastActive);
  if (!isMarkdown) hideSlashCommandMenu();
  updateToastEditorState();
  updateMarkdownToolsState();
  updateMarkdownPreview();
}

function updateMarkdownToolsState() {
  const disabled = fields.format.value !== "markdown" || contentInput.disabled;
  markdownToolbar.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
  colorInput.disabled = disabled;
  bodyImageInput.disabled = disabled;
}

function scheduleMarkdownPreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updateMarkdownPreview, 120);
}

function updateMarkdownPreview() {
  if (isToastEditorActive()) {
    previewStatus.textContent = "TOAST UI";
    resetManualPreview();
    hideSlashCommandMenu();
    return;
  }
  if (fields.format.value !== "markdown") {
    renderHtmlPreview(contentInput.value);
    hideSlashCommandMenu();
    return;
  }
  const markdown = contentInput.value.trim();
  htmlPreview.hidden = true;
  previewInspector.hidden = true;
  markdownPreview.hidden = false;
  previewStatus.textContent = markdown ? "실시간" : "비어 있음";
  preserveEditorScroll(() => {
    markdownPreview.innerHTML = markdown
      ? markdownToHtml(contentInput.value)
      : `<p class="preview-empty">Markdown을 입력하면 여기에 미리보기가 표시됩니다.</p>`;
  });
}

function resetManualPreview() {
  markdownPreview.innerHTML = "";
  markdownPreview.hidden = false;
  htmlPreview.hidden = true;
  htmlPreview.removeAttribute("srcdoc");
  previewInspector.hidden = true;
  previewInspector.innerHTML = "";
}

function renderHtmlPreview(source) {
  const html = String(source || "").trim();
  markdownPreview.hidden = true;
  htmlPreview.hidden = false;
  previewInspector.hidden = false;
  previewStatus.textContent = html ? "HTML 실시간" : "비어 있음";
  htmlPreview.srcdoc = html ? buildHtmlPreviewDocument(html) : emptyHtmlPreviewDocument();
  renderPreviewInspector(html ? summarizeHtml(html) : emptyHtmlSummary());
}

function buildHtmlPreviewDocument(source) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(source, "text/html");
  sanitizePreviewDocument(parsed);

  const hasDocumentShell = /<html[\s>]/i.test(source) || /<!doctype/i.test(source);
  if (hasDocumentShell) {
    ensurePreviewBase(parsed);
    ensurePreviewViewport(parsed);
    return `<!doctype html>\n${parsed.documentElement.outerHTML}`;
  }

  const fragment = parsed.body.innerHTML;
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="/blog/admin/post-sources/${encodeURIComponent(activeSlug || "preview")}.html">
    <style>${htmlPreviewCss()}</style>
  </head>
  <body>
    <article class="article-content">${fragment || '<p class="preview-empty">HTML을 입력하면 여기에 미리보기가 표시됩니다.</p>'}</article>
  </body>
</html>`;
}

function emptyHtmlPreviewDocument() {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${htmlPreviewCss()}</style>
  </head>
  <body><p class="preview-empty">HTML을 입력하면 여기에 미리보기가 표시됩니다.</p></body>
</html>`;
}

function sanitizePreviewDocument(documentNode) {
  documentNode.querySelectorAll("script, object, embed").forEach((element) => element.remove());
  documentNode.querySelectorAll("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = String(attribute.value || "").trim();
      if (name.startsWith("on") || /^javascript:/i.test(value)) {
        element.removeAttribute(attribute.name);
      }
    }
  });
}

function ensurePreviewBase(documentNode) {
  if (documentNode.head.querySelector("base")) return;
  const base = documentNode.createElement("base");
  base.href = `/blog/admin/post-sources/${encodeURIComponent(activeSlug || "preview")}.html`;
  documentNode.head.prepend(base);
}

function ensurePreviewViewport(documentNode) {
  if (documentNode.head.querySelector('meta[name="viewport"]')) return;
  const viewport = documentNode.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  documentNode.head.prepend(viewport);
}

function htmlPreviewCss() {
  return `
    :root { color-scheme: light; }
    body {
      margin: 0;
      padding: 20px;
      color: #1d1d1f;
      font-family: Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", Inter, system-ui, sans-serif;
      line-height: 1.65;
    }
    img, video, iframe { max-width: 100%; }
    img { height: auto; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e4e4ea; padding: 8px; text-align: left; }
    pre { overflow: auto; border-radius: 8px; background: #17181c; color: #f6f7fb; padding: 14px; }
    code { border-radius: 5px; background: #f0f1f4; padding: 2px 5px; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { margin: 18px 0; padding: 12px 14px; border-left: 3px solid #0066cc; background: #f7f9fc; }
    .preview-empty { color: #6e6e73; font-weight: 700; }
  `;
}

function summarizeHtml(source) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(source, "text/html");
  const headings = parsed.querySelectorAll("h1,h2,h3,h4,h5,h6").length;
  const links = parsed.querySelectorAll("a[href]").length;
  const images = parsed.querySelectorAll("img[src]").length;
  const tables = parsed.querySelectorAll("table").length;
  const forms = parsed.querySelectorAll("form,input,button,select,textarea").length;
  const scripts = parsed.querySelectorAll("script,[onclick],[onload],[onerror],[onchange],[onsubmit]").length;
  return [
    ["제목", `${headings}개`],
    ["링크", `${links}개`],
    ["이미지", `${images}개`],
    ["표", `${tables}개`],
    ["폼 요소", `${forms}개`],
    ["스크립트 차단", scripts ? `${scripts}개` : "없음"]
  ];
}

function emptyHtmlSummary() {
  return [
    ["제목", "0개"],
    ["링크", "0개"],
    ["이미지", "0개"],
    ["표", "0개"],
    ["폼 요소", "0개"],
    ["스크립트 차단", "없음"]
  ];
}

function renderPreviewInspector(items) {
  previewInspector.innerHTML = items
    .map(
      ([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
    )
    .join("");
}

function initToastEditor() {
  const Editor = window.toastui?.Editor;
  if (!Editor || !toastEditorContainer) {
    return;
  }
  toastEditor = new Editor({
    el: toastEditorContainer,
    height: "560px",
    initialEditType: "markdown",
    previewStyle: "vertical",
    initialValue: "",
    language: "ko-KR",
    usageStatistics: false,
    autofocus: false,
    placeholder: "본문을 Markdown 또는 WYSIWYG로 작성하세요.",
    toolbarItems: [
      ["heading", "bold", "italic", "strike"],
      ["hr", "quote"],
      ["ul", "ol", "task"],
      ["table", "link", "image"],
      ["code", "codeblock"]
    ],
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        if (!activeSlug) {
          adminMessage.textContent = "이미지를 넣을 글을 먼저 선택하세요.";
          return false;
        }
        if (!/^image\/(?:jpeg|png|webp)$/.test(blob.type)) {
          adminMessage.textContent = "본문 이미지는 jpg, png, webp 이미지만 업로드할 수 있습니다.";
          return false;
        }
        adminMessage.textContent = "본문 이미지를 준비하는 중입니다.";
        try {
          const preparedImage = await prepareBodyImage(blob);
          pendingBodyImages = [
            ...pendingBodyImages.filter((item) => item.path !== preparedImage.path),
            preparedImage
          ].slice(-6);
          const altText = blob.name ? blob.name.replace(/\.[^.]+$/, "") : "이미지";
          callback(`/blog/${preparedImage.path}`, altText);
          scheduleToastPreviewImageRefresh();
          window.setTimeout(syncToastEditorToSource, 0);
          adminMessage.textContent = "본문 이미지를 삽입했습니다. 저장 요청하면 함께 반영됩니다.";
        } catch (error) {
          adminMessage.textContent = error.message || "본문 이미지를 처리하지 못했습니다.";
        }
        return false;
      }
    },
    events: {
      change: () => {
        syncToastEditorToSource();
        scheduleToastPreviewImageRefresh();
      }
    }
  });
  document.body.classList.add("has-toast-editor");
  updateEditorMode();
}

function isToastEditorActive() {
  return Boolean(toastEditor && fields.format.value === "markdown");
}

function updateToastEditorState() {
  if (!toastEditorContainer) {
    return;
  }
  const disabled = contentInput.disabled || fields.format.value !== "markdown";
  toastEditorContainer.classList.toggle("is-disabled", disabled);
  if (toastEditor && isToastEditorActive()) {
    toastEditorContainer.removeAttribute("aria-hidden");
  } else {
    toastEditorContainer.setAttribute("aria-hidden", "true");
  }
}

function setEditorContent(value) {
  const source = String(value || "");
  contentInput.value = source;
  if (!toastEditor) {
    return;
  }
  syncingToastEditor = true;
  toastEditor.setMarkdown(sourceMarkdownToToastMarkdown(source), false);
  syncingToastEditor = false;
  scheduleToastPreviewImageRefresh();
}

function getEditorContent() {
  if (isToastEditorActive()) {
    syncToastEditorToSource();
  }
  return contentInput.value;
}

function syncToastEditorToSource() {
  if (!toastEditor || syncingToastEditor) {
    return;
  }
  contentInput.value = toastMarkdownToSourceMarkdown(toastEditor.getMarkdown());
}

function sourceMarkdownToToastMarkdown(markdown) {
  return String(markdown || "")
    .replace(/\((assets\/[^)\s]+)\)/g, "(/blog/$1)")
    .replace(/\(\/assets\/([^)\s]+)\)/g, "(/blog/assets/$1)");
}

function toastMarkdownToSourceMarkdown(markdown) {
  let next = String(markdown || "");
  for (const image of pendingBodyImages) {
    if (image.previewSrc) {
      next = next.replaceAll(`(${image.previewSrc})`, `(${image.path})`);
      next = next.replaceAll(`(${encodeURI(image.previewSrc)})`, `(${image.path})`);
    }
  }
  return next
    .replace(/\(blob:[^)]+\)/g, (match) => {
      const blobUrl = match.slice(1, -1);
      const image = pendingBodyImages.find((item) => item.previewSrc === blobUrl);
      return image ? `(${image.path})` : match;
    })
    .replace(/\(\/blog\/assets\/([^)\s]+)\)/g, "(assets/$1)")
    .replace(/\(\/assets\/([^)\s]+)\)/g, "(assets/$1)");
}

function scheduleToastPreviewImageRefresh() {
  if (!toastEditorContainer || !pendingBodyImages.length) return;
  window.requestAnimationFrame(() => {
    window.setTimeout(refreshToastPreviewImages, 0);
  });
}

function refreshToastPreviewImages() {
  if (!toastEditorContainer || !pendingBodyImages.length) return;
  toastEditorContainer.querySelectorAll("img").forEach((imageElement) => {
    const normalized = normalizeMarkdownImagePath(
      imageElement.getAttribute("src") || imageElement.currentSrc || "",
    );
    if (!normalized) return;
    const pendingImage = pendingBodyImages.find((image) => image.path === normalized);
    if (!pendingImage?.previewSrc || imageElement.getAttribute("src") === pendingImage.previewSrc) {
      return;
    }
    imageElement.setAttribute("src", pendingImage.previewSrc);
  });
}

function handleEditorKeydown(event) {
  if (!slashState) return;
  const commands = slashState.commands;
  if (!commands.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeSlashCommandIndex = (activeSlashCommandIndex + 1) % commands.length;
    renderSlashCommandMenu(commands);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeSlashCommandIndex = (activeSlashCommandIndex - 1 + commands.length) % commands.length;
    renderSlashCommandMenu(commands);
  } else if (event.key === "Enter" || event.key === "Tab") {
    event.preventDefault();
    applySlashCommand(commands[activeSlashCommandIndex]);
  } else if (event.key === "Escape") {
    event.preventDefault();
    hideSlashCommandMenu();
  }
}

function updateSlashCommandMenu() {
  if (fields.format.value !== "markdown" || contentInput.disabled) {
    hideSlashCommandMenu();
    return;
  }
  const nextState = currentSlashState();
  if (!nextState) {
    hideSlashCommandMenu();
    return;
  }
  const commands = filterSlashCommands(nextState.query);
  if (!commands.length) {
    hideSlashCommandMenu();
    return;
  }
  slashState = { ...nextState, commands };
  activeSlashCommandIndex = Math.min(activeSlashCommandIndex, commands.length - 1);
  renderSlashCommandMenu(commands);
}

function currentSlashState() {
  if (contentInput.selectionStart !== contentInput.selectionEnd) return null;
  const caret = contentInput.selectionStart;
  const value = contentInput.value;
  const lineRange = selectedLineRange(value, caret, caret);
  const beforeCaret = value.slice(lineRange.start, caret);
  const slashIndex = beforeCaret.lastIndexOf("/");
  if (slashIndex === -1) return null;
  const beforeSlash = beforeCaret.slice(0, slashIndex);
  if (beforeSlash.trim() && !/\s$/.test(beforeSlash)) return null;
  const query = beforeCaret.slice(slashIndex + 1);
  if (/\s/.test(query)) return null;
  return {
    start: lineRange.start + slashIndex,
    end: caret,
    query,
    line: lineRange
  };
}

function filterSlashCommands(query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return slashCommands;
  return slashCommands.filter((command) =>
    [command.id, command.title, command.hint, ...command.keywords]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

function renderSlashCommandMenu(commands) {
  slashCommandMenu.hidden = false;
  slashCommandMenu.innerHTML = commands
    .map(
      (command, index) => `
        <button class="slash-command-item ${index === activeSlashCommandIndex ? "is-active" : ""}" type="button" role="option" aria-selected="${index === activeSlashCommandIndex}" data-slash-command="${escapeAttribute(command.id)}">
          <strong>${escapeHtml(command.title)}</strong>
          <span>${escapeHtml(command.hint)}</span>
        </button>
      `,
    )
    .join("");
}

function hideSlashCommandMenu() {
  slashState = null;
  activeSlashCommandIndex = 0;
  slashCommandMenu.hidden = true;
  slashCommandMenu.innerHTML = "";
}

function applySlashCommand(command) {
  const state = slashState || currentSlashState();
  if (!state) return;
  hideSlashCommandMenu();
  if (command.id === "image-upload") {
    const next = replaceSelection(contentInput.value, state.start, state.end, "");
    commitEditorChange(next.value, state.start, state.start);
    bodyImageInput.click();
    return;
  }
  const lineText = contentInput.value
    .slice(state.line.start, state.line.end)
    .replace(contentInput.value.slice(state.start, state.end), "")
    .trim();
  const block = slashCommandBlock(command.id, lineText);
  if (!block) return;
  const next = replaceLineRange(contentInput.value, state.line, block.text);
  commitEditorChange(next.value, state.line.start + block.start, state.line.start + block.end);
}

function slashCommandBlock(id, lineText) {
  const text = lineText || slashPlaceholder(id);
  if (id === "text") return blockResult(text, 0, text.length);
  if (id === "h1") return blockResult(`# ${text}`, 2, 2 + text.length);
  if (id === "h2") return blockResult(`## ${text}`, 3, 3 + text.length);
  if (id === "h3") return blockResult(`### ${text}`, 4, 4 + text.length);
  if (id === "bullets") return blockResult(`- ${text}`, 2, 2 + text.length);
  if (id === "numbers") return blockResult(`1. ${text}`, 3, 3 + text.length);
  if (id === "todo") return blockResult(`- [ ] ${text}`, 6, 6 + text.length);
  if (id === "quote") return blockResult(`> ${text}`, 2, 2 + text.length);
  if (id === "callout") {
    const prefix = "> **메모:** ";
    return blockResult(`${prefix}${text}`, prefix.length, prefix.length + text.length);
  }
  if (id === "divider") return blockResult("---", 3, 3);
  if (id === "code") return blockResult("```\ncode\n```", 4, 8);
  if (id === "table") {
    const table = "| 제목 | 내용 |\n| --- | --- |\n| 항목 | 설명 |";
    return blockResult(table, 2, 4);
  }
  if (id === "image-url") {
    const alt = escapeMarkdownText(lineText || "이미지 설명");
    const prefix = `![${alt}](`;
    const url = "assets/example.png";
    return blockResult(`${prefix}${url})`, prefix.length, prefix.length + url.length);
  }
  if (id === "link") {
    const label = lineText || "링크 텍스트";
    const prefix = `[${label}](`;
    const url = "https://example.com";
    return blockResult(`${prefix}${url})`, prefix.length, prefix.length + url.length);
  }
  if (id === "color") {
    const prefix = `{color=${normalizeColor(colorInput.value)}}`;
    return blockResult(`${prefix}${text}{/color}`, prefix.length, prefix.length + text.length);
  }
  if (id === "bold") return blockResult(`**${text}**`, 2, 2 + text.length);
  if (id === "italic") return blockResult(`_${text}_`, 1, 1 + text.length);
  if (id === "strike") return blockResult(`~~${text}~~`, 2, 2 + text.length);
  return null;
}

function slashPlaceholder(id) {
  if (id === "h1" || id === "h2" || id === "h3") return "제목";
  if (["bullets", "numbers"].includes(id)) return "목록 항목";
  if (id === "todo") return "할 일";
  if (id === "quote") return "인용문";
  if (id === "callout") return "메모";
  if (id === "color") return "색상 텍스트";
  if (["bold", "italic", "strike"].includes(id)) return "텍스트";
  return "";
}

function blockResult(text, start, end) {
  return { text, start, end };
}

function applyMarkdownAction(action) {
  if (action === "image-upload") {
    hideSlashCommandMenu();
    bodyImageInput.click();
    return;
  }
  if (action === "image-delete") {
    hideSlashCommandMenu();
    deleteCurrentImageMarkdown();
    return;
  }

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
  } else if (action === "color") {
    const color = normalizeColor(colorInput.value);
    ({ value: nextValue, start: nextStart, end: nextEnd } = wrapSelection(
      contentInput.value,
      start,
      end,
      `{color=${color}}`,
      "{/color}",
    ));
  }

  commitEditorChange(nextValue, nextStart, nextEnd);
}

function commitEditorChange(nextValue, nextStart, nextEnd) {
  preserveEditorScroll(() => {
    contentInput.value = nextValue;
    contentInput.focus({ preventScroll: true });
    contentInput.setSelectionRange(nextStart, nextEnd);
    updateMarkdownPreview();
  });
}

function preserveEditorScroll(callback) {
  const windowX = window.scrollX;
  const windowY = window.scrollY;
  const editorScrollTop = contentInput.scrollTop;
  const previewScrollTop = markdownPreview.scrollTop;
  callback();
  contentInput.scrollTop = editorScrollTop;
  markdownPreview.scrollTop = previewScrollTop;
  window.scrollTo(windowX, windowY);
}

function insertOrReplaceImageMarkdown(path, altText) {
  const imageMarkdown = `![${escapeMarkdownText(altText || "이미지")}](${path})`;
  const replacement = replaceCurrentImageSyntax(contentInput.value, imageMarkdown);
  if (replacement) {
    commitEditorChange(replacement.value, replacement.start, replacement.end);
    return;
  }
  const start = contentInput.selectionStart;
  const end = contentInput.selectionEnd;
  const prefix = needsLeadingBlank(contentInput.value, start) ? "\n\n" : "";
  const suffix = contentInput.value.slice(end).startsWith("\n\n") ? "" : "\n\n";
  const inserted = `${prefix}${imageMarkdown}${suffix}`;
  const next = replaceSelection(contentInput.value, start, end, inserted);
  commitEditorChange(next.value, start + prefix.length, start + prefix.length + imageMarkdown.length);
}

function deleteCurrentImageMarkdown() {
  const replacement = replaceCurrentImageSyntax(contentInput.value, "");
  if (!replacement) {
    adminMessage.textContent = "삭제할 이미지 Markdown에 커서를 두거나 이미지 구문을 선택하세요.";
    return;
  }
  commitEditorChange(replacement.value, replacement.start, replacement.end);
  adminMessage.textContent = "본문에서 이미지 구문을 삭제했습니다. 저장 요청하면 반영됩니다.";
}

function replaceCurrentImageSyntax(value, replacement) {
  const start = contentInput.selectionStart;
  const end = contentInput.selectionEnd;
  const selected = value.slice(start, end);
  const selectedMatch = selected.match(/!\[[^\]]*]\([^)]+\)/);
  if (selectedMatch) {
    const matchStart = start + selectedMatch.index;
    const matchEnd = matchStart + selectedMatch[0].length;
    const next = replaceSelection(value, matchStart, matchEnd, replacement);
    return { value: next.value, start: matchStart, end: matchStart + replacement.length };
  }

  const lineRange = selectedLineRange(value, start, end);
  const lineMatches = [...lineRange.text.matchAll(/!\[[^\]]*]\([^)]+\)/g)];
  const relativeCaret = start - lineRange.start;
  const match =
    lineMatches.find((item) => {
      const matchStart = item.index || 0;
      return relativeCaret >= matchStart && relativeCaret <= matchStart + item[0].length;
    }) || lineMatches[0];
  if (!match) return null;
  const matchStart = lineRange.start + (match.index || 0);
  const matchEnd = matchStart + match[0].length;
  const next = replaceSelection(value, matchStart, matchEnd, replacement);
  return { value: next.value, start: matchStart, end: matchStart + replacement.length };
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
  let table = [];
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
        `<${listTag}>${list.map((item) => renderListItem(item)).join("")}</${listTag}>`,
      );
      list = [];
      listTag = "ul";
    }
  };
  const flushTable = () => {
    if (table.length) {
      html.push(renderMarkdownTable(table));
      table = [];
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
    flushTable();
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
    const linkCard = parseLinkCardMarker(trimmed);
    if (linkCard) {
      flushTextBlocks();
      html.push(renderLinkCard(linkCard));
      continue;
    }
    if (isMarkdownTableRow(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      table.push(trimmed);
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
    flushTable();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushTextBlocks();
  if (inCode) flushCode();
  return html.join("\n");
}

function renderListItem(item) {
  const task = String(item || "").match(/^\[( |x|X)]\s+(.+)$/);
  if (task) {
    const checked = task[1].toLowerCase() === "x";
    return `<li class="task-list-item"><input type="checkbox" disabled${checked ? " checked" : ""}> <span>${inlineMarkdown(task[2])}</span></li>`;
  }
  return `<li>${inlineMarkdown(item)}</li>`;
}

function isMarkdownTableRow(value) {
  return /^\|.+\|$/.test(value) && value.split("|").length > 2;
}

function renderMarkdownTable(rows) {
  const parsedRows = rows.map(parseMarkdownTableRow).filter((row) => row.length);
  if (!parsedRows.length) return "";
  const hasDivider = parsedRows[1]?.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
  const head = hasDivider ? parsedRows[0] : null;
  const bodyRows = hasDivider ? parsedRows.slice(2) : parsedRows;
  const headHtml = head
    ? `<thead><tr>${head.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>`
    : "";
  const bodyHtml = `<tbody>${bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `<table>${headHtml}${bodyHtml}</table>`;
}

function parseMarkdownTableRow(value) {
  return String(value || "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
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
    .replace(
      /\{color=(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/color\}/g,
      '<span style="color: $1">$2</span>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/(^|[\s([{])_([^_\s][^_]*?)_(?=$|[\s.,!?;:)\]}])/g, "$1<em>$2</em>")
    .replace(/(^|[\s([{])\*([^*\s][^*]*?)\*(?=$|[\s.,!?;:)\]}])/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseLinkCardMarker(value) {
  const match = String(value || "").match(/^\{\{corca-link-card:([^}]+)\}\}$/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function renderLinkCard(card) {
  const url = String(card.url || "");
  if (!/^https?:\/\//i.test(url)) return "";
  const host = card.host || linkHost(url);
  const label = String(card.label || url).trim();
  return `<aside class="article-link-card"><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer"><span class="article-link-card-domain">${escapeHtml(host)}</span><strong>${escapeHtml(label)}</strong><span class="article-link-card-url">${escapeHtml(url)}</span></a></aside>`;
}

function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function safeMarkdownUrl(value) {
  const text = decodeHtml(value).trim();
  const previewUrl = previewMarkdownAssetUrl(text);
  if (previewUrl) return escapeAttribute(previewUrl);
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

function previewMarkdownAssetUrl(path) {
  const normalized = normalizeMarkdownImagePath(path);
  if (!normalized) return "";
  const pendingPreview = pendingBodyImages.find((image) => image.path === normalized)?.previewSrc;
  if (pendingPreview) return pendingPreview;
  return `/blog/${normalized}`;
}

async function apiErrorMessage(response, fallback) {
  if (response.status === 404) {
    const detail = await responseErrorCode(response);
    return detail ? `${fallback} (${detail})` : workerRuntimeMessage();
  }
  if (response.status === 503) {
    const detail = await responseErrorCode(response);
    if (detail === "asset_binding_unavailable") {
      return "글 목록은 빌드된 /index.json에서 읽습니다. 현재 Worker ASSETS binding이 없어 목록을 불러올 수 없습니다.";
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

function normalizeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : "#0066cc";
}

function escapeMarkdownText(value) {
  return String(value || "")
    .replace(/[[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMarkdownImagePaths(markdown) {
  return [...String(markdown || "").matchAll(/!\[[^\]]*]\(([^)\s]+)\)/g)]
    .map((match) => normalizeMarkdownImagePath(match[1]))
    .filter(Boolean);
}

function normalizeMarkdownImagePath(path) {
  const text = String(path || "").trim();
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      if (url.pathname.startsWith("/blog/assets/")) return url.pathname.slice("/blog/".length);
      if (url.pathname.startsWith("/assets/")) return url.pathname.slice(1);
    } catch {
      return "";
    }
  }
  if (text.startsWith("/blog/assets/")) return text.slice("/blog/".length);
  if (text.startsWith("/assets/")) return text.slice(1);
  if (text.startsWith("assets/")) return text;
  return "";
}

function removedBodyImagePaths(before, after, slug) {
  const current = new Set(extractMarkdownImagePaths(after));
  return [...new Set(extractMarkdownImagePaths(before))]
    .filter((path) => !current.has(path))
    .filter((path) => path.startsWith(`assets/admin-posts/${slug}-`))
    .slice(0, 20);
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

async function prepareBodyImage(file) {
  const image = await loadImage(file);
  const maxWidth = 1600;
  const maxHeight = 1200;
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
  for (const quality of [0.86, 0.78, 0.7, 0.62, 0.54]) {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (blob.size <= 62000) break;
  }
  if (!blob || blob.size > 80000) {
    throw new Error("본문 이미지 용량이 큽니다. 더 작은 이미지를 선택해 주세요.");
  }

  const contentBase64 = await blobToBase64(blob);
  const hash = await sha256Hex(await blob.arrayBuffer());
  const slug = fields.slug.value || slugify(fields.title.value || file.name.replace(/\.[^.]+$/, ""));
  const fileName = `${slug || "post"}-${hash.slice(0, 12)}.jpg`;
  return {
    contentBase64,
    fileName,
    mime: "image/jpeg",
    path: `assets/admin-posts/${fileName}`,
    previewSrc: URL.createObjectURL(blob)
  };
}

async function sha256Hex(buffer) {
  if (!window.crypto?.subtle) {
    throw new Error("브라우저에서 이미지 해시 생성을 지원하지 않습니다.");
  }
  const digest = await window.crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
