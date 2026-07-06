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
  contentLabel.textContent = fields.format.value === "markdown" ? "Markdown 수정" : "HTML 파일 재업로드";
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
