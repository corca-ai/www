const state = {
  posts: [],
  search: "",
  sort: "newest",
  savedOnly: false,
  currentPage: 1,
  currentPostSlug: null,
  articleScale: 1,
  articleLeading: "normal",
  articleFont: "sans",
  articleWidth: "normal",
  paragraphSpacing: "normal",
  recentSlugs: [],
  savedSlugs: [],
  readingProgressBySlug: {},
  reactedSlugs: [],
  lastProgressSaveAt: 0,
  articleRequestId: 0,
  analyticsReady: false,
  lastAnalyticsPath: ""
};

document.documentElement.classList.remove("no-js");

const STORAGE_KEYS = {
  prefs: "corca:blog-prefs"
};

const BASE_PATH = resolveBasePath(import.meta.url);
const REACTION_OPTIONS = [
  { key: "useful", icon: "👍", label: "좋아요" }
];
const POSTS_PER_PAGE = 9;
const PUBLIC_POST_TOPICS = ["AX", "문라이트", "트레이스", "크라켄", "씰", "마진", "코르카"];
const DEFAULT_POST_TOPIC = "코르카";
const listShareIcon = `<svg class="action-icon share-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M8.7 10.7 15.3 7.3"></path><path d="M8.7 13.3 15.3 16.7"></path></svg>`;
const listDownloadIcon = `<svg class="action-icon download-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 3v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>`;
const buttonFeedbackTimers = new WeakMap();

const skipLink = document.querySelector(".skip-link");
const postList = document.querySelector("#postList");
const siteHeader = document.querySelector(".site-header");
const siteFooter = document.querySelector(".site-footer");
const heroSection = document.querySelector(".hero");
const featuredPost = document.querySelector("#featuredPost");
const recentReads = document.querySelector("#recentReads");
const savedReads = document.querySelector("#savedReads");
const postView = document.querySelector("#postView");
const postArticle = document.querySelector("#postArticle");
const tableOfContents = document.querySelector("#tableOfContents");
const relatedPosts = document.querySelector("#relatedPosts");
const postsSection = document.querySelector("#posts");
const resultCount = document.querySelector("#resultCount");
const archiveSection = document.querySelector("#archive");
const searchInput = document.querySelector("#searchInput");
const clearSearchButton = document.querySelector("#clearSearchButton");
const savedOnlyButton = document.querySelector("#savedOnlyButton");
const sortSelect = document.querySelector("#sortSelect");
const filterSummary = document.querySelector("#filterSummary");
const listMessage = document.querySelector("#listMessage");
const postPagination = document.querySelector("#postPagination");
const backButton = document.querySelector("#backButton");
const postViewMessage = document.querySelector("#postViewMessage");
const copyLinkButton = document.querySelector("#copyLinkButton");
const sharePostButton = document.querySelector("#sharePostButton");
const downloadPostButton = document.querySelector("#downloadPostButton");
const currentPostSaveButton = document.querySelector("#currentPostSaveButton");
const articleShareMenu = document.querySelector(".article-share-menu");
const decreaseFontButton = document.querySelector("#decreaseFontButton");
const increaseFontButton = document.querySelector("#increaseFontButton");
const lineHeightButton = document.querySelector("#lineHeightButton");
const fontFamilyButton = document.querySelector("#fontFamilyButton");
const articleWidthButton = document.querySelector("#articleWidthButton");
const paragraphSpacingButton = document.querySelector("#paragraphSpacingButton");
const resetReadingButton = document.querySelector("#resetReadingButton");
const readingSettings = document.querySelector(".reading-settings");
const emptyState = document.querySelector("#emptyState");
const toolbarSection = document.querySelector(".toolbar");
const aboutSection = document.querySelector(".about-section");
const readingProgress = document.querySelector("#readingProgress");
const postDependentLinks = document.querySelectorAll("[data-requires-posts]");
const sectionNavLinks = document.querySelectorAll(".nav a");
const heroPrimaryAction = document.querySelector(".hero-actions .primary-button");

const defaultDocumentMeta = {
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
  image: absoluteUrl(document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "assets/editorial-cover.jpg"),
  url: document.querySelector('link[rel="canonical"]')?.href || new URL(appPath("/"), window.location.origin).href
};

init();

async function init() {
  try {
    restorePrefs();
    state.posts = normalizePosts(await fetchJson(appPath("/posts/index.json")));
    applyDiscoveryParamsFromLocation();
    reconcileDiscoveryPrefs();
    renderPosts();
    bindEvents();
    initAnalytics();

    const slug = getPostSlugFromLocation();

    if (slug) {
      await openPost(slug, { push: false, replace: isLegacyPostQuery() });
    } else {
      scrollToInitialHash();
      trackPageView(defaultDocumentMeta.title, new URL(appPath("/"), window.location.origin).pathname);
    }
  } catch (error) {
    showList();
    postList.classList.remove("is-loading");
    postList.removeAttribute("aria-busy");
    postList.setAttribute("aria-label", "글 목록");
    postList.hidden = true;
    postList.innerHTML = "";
    resultCount.textContent = "잠시 후 다시 시도해 주세요.";
    emptyState.hidden = false;
    emptyState.innerHTML = `글 목록을 불러오지 못했습니다. <span class="empty-state-detail">네트워크 상태를 확인한 뒤 다시 시도해 주세요.</span> <button class="text-button compact empty-state-action" type="button" data-retry-post-load>다시 불러오기</button>`;
    emptyState.querySelector("[data-retry-post-load]")?.addEventListener("click", () => {
      window.location.reload();
    });
    console.error(error);
  }
}

function bindEvents() {
  document.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("popstate", handlePopState);
  window.addEventListener("hashchange", scrollToInitialHash);
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", () => {
    updateReadingProgress();
    updateActiveTocLink();
  });

  document.querySelector("#listNav")?.addEventListener("click", (event) => {
    event.preventDefault();
    showList();
    hideListMessage();
    history.pushState({}, "", homePath("#posts"));
    updateSectionNavigation("#posts");
    scrollToPosts();
  });

  document.querySelectorAll("[data-list-anchor]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(`#${link.dataset.listAnchor}`);
      showList();
      hideListMessage();
      history.pushState({}, "", homePath(`#${link.dataset.listAnchor}`));
      updateSectionNavigation(`#${link.dataset.listAnchor}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value.trim();
    state.currentPage = 1;
    clearSearchButton.hidden = !state.search;
    hideListMessage();
    savePrefs();
    updateDiscoveryUrl();
    renderPosts();
  });

  clearSearchButton.addEventListener("click", () => {
    state.search = "";
    state.currentPage = 1;
    searchInput.value = "";
    clearSearchButton.hidden = true;
    searchInput.focus();
    hideListMessage();
    savePrefs();
    updateDiscoveryUrl();
    renderPosts();
  });
  savedOnlyButton?.addEventListener("click", () => {
    state.savedOnly = !state.savedOnly;
    state.currentPage = 1;
    hideListMessage();
    savePrefs();
    updateDiscoveryUrl();
    renderPosts();
    postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    state.currentPage = 1;
    hideListMessage();
    savePrefs();
    updateDiscoveryUrl();
    renderPosts();
  });

  document.addEventListener("click", async (event) => {
    const saveButton = event.target.closest("[data-save-post]");
    if (saveButton) {
      toggleSavedPost(saveButton.dataset.savePost, { focusScope: getSaveButtonScope(saveButton) });
      return;
    }

    const reactionButton = event.target.closest("[data-list-reaction-post]");
    if (reactionButton) {
      event.preventDefault();
      await toggleListReaction(reactionButton.dataset.listReactionPost);
      return;
    }

    const shareButton = event.target.closest("[data-list-share-post]");
    if (shareButton) {
      event.preventDefault();
      await shareListPost(shareButton.dataset.listSharePost);
      return;
    }

    const downloadButton = event.target.closest("[data-list-download-post]");
    if (downloadButton) {
      event.preventDefault();
      await downloadListPost(downloadButton.dataset.listDownloadPost);
      return;
    }

    const pageButton = event.target.closest("[data-page-number], [data-page-direction]");
    if (pageButton) {
      event.preventDefault();
      handlePaginationClick(pageButton);
    }
  });

  backButton.addEventListener("click", () => {
    showList();
    hideListMessage();
    history.pushState({}, "", homePath("#posts"));
    postsSection.scrollIntoView({ behavior: "auto", block: "start" });
  });
  copyLinkButton.addEventListener("click", async () => {
    try {
      await copyPostLink();
    } finally {
      closeArticleActionMenus();
    }
  });
  sharePostButton.addEventListener("click", async () => {
    try {
      await shareCurrentPost();
    } finally {
      closeArticleActionMenus();
    }
  });
  downloadPostButton.addEventListener("click", async () => {
    try {
      await downloadCurrentPost();
    } finally {
      closeArticleActionMenus();
    }
  });
  decreaseFontButton.addEventListener("click", () => changeArticleScale(-0.05));
  increaseFontButton.addEventListener("click", () => changeArticleScale(0.05));
  lineHeightButton.addEventListener("click", cycleArticleLeading);
  fontFamilyButton.addEventListener("click", toggleArticleFont);
  articleWidthButton.addEventListener("click", cycleArticleWidth);
  paragraphSpacingButton.addEventListener("click", cycleParagraphSpacing);
  resetReadingButton.addEventListener("click", resetReadingPrefs);
}

function initAnalytics() {
  const measurementId = String(window.CORCA_GA_MEASUREMENT_ID || "").trim();
  if (!measurementId || !/^G-[A-Z0-9-]{4,32}$/i.test(measurementId)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.addEventListener("load", () => {
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
    state.analyticsReady = true;
    state.lastAnalyticsPath = "";
    trackPageView(document.title, window.location.pathname);
  }, { once: true });
  document.head.append(script);
}

function trackPageView(title, path) {
  if (!state.analyticsReady || typeof window.gtag !== "function") {
    return;
  }
  const pagePath = path || window.location.pathname;
  if (state.lastAnalyticsPath === pagePath) {
    return;
  }
  state.lastAnalyticsPath = pagePath;
  window.gtag("event", "page_view", {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: pagePath
  });
}

function trackAnalyticsEvent(name, params = {}) {
  if (!state.analyticsReady || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", name, params);
}

function getPostAnalyticsParams(post, extra = {}) {
  return {
    item_id: post.slug,
    item_name: post.title,
    post_slug: post.slug,
    post_title: post.title,
    content_type: "blog_post",
    ...extra
  };
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} fetch failed`);
  }
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} fetch failed`);
  }
  return response.text();
}

function renderPosts() {
  const visiblePosts = getVisiblePosts();
  const listPosts = getListPosts(visiblePosts);
  clampCurrentPage(listPosts.length);
  const pagePosts = getPaginatedPosts(listPosts);
  updatePostDependentNavigation();
  updateEmptyProductionActions();
  updateDiscoveryToolbarVisibility();
  renderDiscoverySurfaces();
  setHidden(featuredPost, true);
  setHidden(recentReads, true);
  setHidden(savedReads, true);
  setHidden(archiveSection, true);
  renderPostList(pagePosts);
  renderPostPagination(listPosts.length);
  updateToolbarState(listPosts.length, visiblePosts.length);
  renderListReactions(pagePosts);
}

function updateDiscoveryToolbarVisibility() {
  setHidden(toolbarSection, true);
}

function updatePostDependentNavigation() {
  const hasPosts = state.posts.length > 0;
  postDependentLinks.forEach((link) => {
    link.hidden = !hasPosts;
  });
}

function updateEmptyProductionActions() {
  postsSection?.classList.toggle("is-empty-production", state.posts.length === 0);
  if (state.posts.length === 0) {
    return;
  }
}

function renderFeaturedPost() {
  const post = getFeaturedPost();
  if (!post) {
    featuredPost.hidden = true;
    featuredPost.innerHTML = "";
    return;
  }

  featuredPost.hidden = false;
  const saved = state.savedSlugs.includes(post.slug);
  featuredPost.innerHTML = `
    <article class="featured-card">
      <a class="featured-media-link" href="${escapeAttribute(getStaticPostPath(post))}" aria-label="${escapeAttribute(`${post.title} 읽기`)}">
        <img src="${escapeAttribute(appPath(toRootPath(post.cover)))}" alt="" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">
      </a>
      <div class="featured-copy">
        <a class="featured-card-link" href="${escapeAttribute(getStaticPostPath(post))}">
          <p class="eyebrow">최신 글 · <span class="featured-topic">${escapeHtml(getPrimaryPostTopic(post))}</span></p>
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.description)}</p>
        </a>
        <div class="featured-actions">
          <span class="featured-meta">${renderPostMeta(post)}</span>
          <button class="icon-button featured-save-button save-button ${saved ? "active" : ""}" type="button" data-save-post="${escapeAttribute(post.slug)}" aria-pressed="${saved}" aria-label="${escapeAttribute(`${post.title} ${saved ? "저장됨" : "저장"}`)}"><span class="save-icon save-icon-off" aria-hidden="true">☆</span><span class="save-icon save-icon-on" aria-hidden="true">★</span></button>
        </div>
      </div>
    </article>
  `;
}

function getFeaturedPost() {
  return getSortedPosts("newest")[0];
}

function normalizePosts(posts) {
  return (Array.isArray(posts) ? posts : [])
    .map((post) => ({
      slug: String(post.slug || "").trim(),
      title: String(post.title || "제목 없는 글").trim(),
      description: String(post.description || "설명이 없는 글입니다.").trim(),
      date: String(post.date || new Date().toISOString().slice(0, 10)).trim(),
      tags: Array.isArray(post.tags) ? post.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [],
      author: String(post.author || "Corca Team").trim(),
      cover: String(post.cover || "assets/editorial-cover.jpg").trim(),
      file: String(post.file || "").trim(),
      contentPath: String(post.contentPath || post.file || "").trim(),
      wordCount: Number(post.wordCount || 800),
      searchText: normalizeSearchText(post.searchText || "")
    }))
    .filter((post) => post.slug);
}

function renderRecentReads() {
  const recent = state.recentSlugs
    .map((slug) => state.posts.find((post) => post.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  recentReads.hidden = recent.length === 0;
  recentReads.innerHTML = recent.length ? `
    <div class="section-heading compact-heading">
      <div>
        <p class="eyebrow">다시 읽기</p>
        <h2>최근 읽은 글</h2>
      </div>
      <p>방금 읽던 흐름으로 다시 돌아갈 수 있습니다.</p>
    </div>
    <div class="recent-grid">
      ${recent.map((post) => `
        <a class="recent-link" href="${escapeAttribute(getStaticPostPath(post))}">
          <span class="recent-meta"><strong>${escapeHtml(getPrimaryPostTopic(post))}</strong> · ${renderPostDate(post)} · ${formatReadingProgress(post)}</span>
          <strong>${escapeHtml(post.title)}</strong>
          <span class="recent-cue" aria-hidden="true">→</span>
          ${renderReadingProgressBar(post)}
        </a>
      `).join("")}
    </div>
  ` : "";
}

function renderSavedReads() {
  const saved = state.savedSlugs
    .map((slug) => state.posts.find((post) => post.slug === slug))
    .filter(Boolean);

  savedReads.hidden = saved.length === 0;
  savedReads.innerHTML = saved.length ? `
    <div class="section-heading compact-heading">
      <div>
        <p class="eyebrow">보관함</p>
        <h2>저장한 글</h2>
      </div>
      <p>다시 읽고 싶은 글을 모아둡니다.</p>
    </div>
    <div class="saved-grid">
      ${saved.map((post) => `
        <article class="saved-card">
          <a href="${escapeAttribute(getStaticPostPath(post))}">
            <span class="saved-meta"><strong>${escapeHtml(getPrimaryPostTopic(post))}</strong> · ${renderPostDate(post)} · ${estimateReadingTime(post)}</span>
            <strong>${escapeHtml(post.title)}</strong>
            <span class="saved-cue" aria-hidden="true">→</span>
          </a>
          <button class="text-button compact save-button active" type="button" data-save-post="${escapeAttribute(post.slug)}" aria-pressed="true" aria-label="${escapeAttribute(`${post.title} 저장됨`)}">저장됨</button>
        </article>
      `).join("")}
    </div>
  ` : "";
}

function renderDiscoverySurfaces() {
  setHidden(archiveSection, true);
}

function renderArchive() {
  if (!archiveSection) {
    return;
  }
  const posts = getSortedPosts("newest");
  archiveSection.hidden = posts.length === 0;
  archiveSection.innerHTML = posts.length ? `
    <div class="section-heading">
      <div>
        <p class="eyebrow">아카이브</p>
        <h2>전체 글 아카이브</h2>
      </div>
      <p>발행된 Corca 글을 날짜순으로 빠르게 훑어볼 수 있습니다.</p>
    </div>
    <div class="archive-list">
      ${groupPostsByMonth(posts).map((group) => `
        <section class="archive-month" aria-labelledby="archive-${escapeAttribute(group.key)}">
          <h3 id="archive-${escapeAttribute(group.key)}">${escapeHtml(group.label)}</h3>
          <div class="archive-items">
            ${group.posts.map((post) => `
              <a class="archive-item" href="${escapeAttribute(getStaticPostPath(post))}">
                <span>${renderPostDate(post)}</span>
                <strong>${escapeHtml(post.title)}</strong>
                <em class="archive-meta">${renderArchiveMeta(post)}</em>
                <span class="archive-cue" aria-hidden="true">→</span>
              </a>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  ` : "";
}

function groupPostsByMonth(posts) {
  const groups = new Map();
  for (const post of posts) {
    const key = String(post.date || "").slice(0, 7) || "unknown";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatArchiveMonth(post.date),
        posts: []
      });
    }
    groups.get(key).posts.push(post);
  }
  return [...groups.values()];
}

function formatArchiveMonth(date) {
  const value = String(date || "");
  const year = value.slice(0, 4);
  const month = value.slice(5, 7);
  if (!year || !month) {
    return "날짜 미정";
  }
  return `${year}년 ${Number(month)}월`;
}

function renderPostList(posts) {
  postList.classList.remove("is-loading");
  postList.removeAttribute("aria-busy");
  postList.setAttribute("aria-label", "글 목록");
  postList.hidden = posts.length === 0;
  postList.innerHTML = posts.map((post) => {
    const saved = state.savedSlugs.includes(post.slug);
    const interaction = getInteractionState(post);
    const reacted = interaction.selectedReaction === "useful";
    return `
      <article class="post-card">
        <a class="post-card-link" href="${escapeAttribute(getStaticPostPath(post))}">
          <img src="${escapeAttribute(appPath(toRootPath(post.cover)))}" alt="" width="1672" height="941" loading="lazy" decoding="async">
          <div class="post-card-body">
            <h3>${highlightText(post.title, state.search)}</h3>
            <div class="meta post-card-meta">${renderPostMeta(post)}<span class="meta-item post-card-topic">${escapeHtml(getPrimaryPostTopic(post))}</span><span class="read-cue" aria-hidden="true">→</span></div>
            <p>${highlightText(post.description, state.search)}</p>
            ${renderSearchContext(post)}
          </div>
        </a>
        <div class="post-card-actions" aria-label="${escapeAttribute(`${post.title} 빠른 동작`)}">
          <button class="icon-button list-share-button" type="button" data-list-share-post="${escapeAttribute(post.slug)}" aria-label="${escapeAttribute(`${post.title} 공유`)}">${listShareIcon}</button>
          <button class="icon-button list-download-button" type="button" data-list-download-post="${escapeAttribute(post.slug)}" aria-label="${escapeAttribute(`${post.title} 다운로드`)}">${listDownloadIcon}</button>
          <button class="icon-button list-reaction-button ${reacted ? "active" : ""}" type="button" data-list-reaction-post="${escapeAttribute(post.slug)}" aria-pressed="${reacted}" aria-label="${escapeAttribute(`${post.title} 좋아요`)}" ${interaction.unavailable ? "disabled" : ""}><span aria-hidden="true">👍</span></button>
          <button class="icon-button save-button ${saved ? "active" : ""}" type="button" data-save-post="${escapeAttribute(post.slug)}" aria-pressed="${saved}" aria-label="${escapeAttribute(`${post.title} ${saved ? "저장됨" : "저장"}`)}"><span class="save-icon save-icon-off" aria-hidden="true">☆</span><span class="save-icon save-icon-on" aria-hidden="true">★</span></button>
        </div>
      </article>
    `;
  }).join("");
}

function getPaginatedPosts(posts) {
  const start = (state.currentPage - 1) * POSTS_PER_PAGE;
  return posts.slice(start, start + POSTS_PER_PAGE);
}

function clampCurrentPage(totalPosts) {
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  state.currentPage = clampNumber(Number(state.currentPage || 1), 1, totalPages, 1);
}

function renderPostPagination(totalPosts) {
  if (!postPagination) {
    return;
  }
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  if (totalPages <= 1) {
    postPagination.hidden = true;
    postPagination.innerHTML = "";
    return;
  }
  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const active = pageNumber === state.currentPage;
    return `<button class="text-button compact ${active ? "active" : ""}" type="button" data-page-number="${pageNumber}" aria-current="${active ? "page" : "false"}">${pageNumber}</button>`;
  }).join("");
  postPagination.hidden = false;
  postPagination.innerHTML = `
    <button class="text-button compact pagination-step" type="button" data-page-direction="prev" aria-label="이전 글 목록 페이지" ${state.currentPage <= 1 ? "disabled" : ""}><span aria-hidden="true">‹</span></button>
    <span class="pagination-pages">${pageButtons}</span>
    <button class="text-button compact pagination-step" type="button" data-page-direction="next" aria-label="다음 글 목록 페이지" ${state.currentPage >= totalPages ? "disabled" : ""}><span aria-hidden="true">›</span></button>
    <span class="pagination-summary" aria-live="polite">페이지 ${state.currentPage} / ${totalPages}</span>
  `;
}

function handlePaginationClick(button) {
  const listPosts = getListPosts(getVisiblePosts());
  const totalPages = Math.max(1, Math.ceil(listPosts.length / POSTS_PER_PAGE));
  let nextPage = state.currentPage;
  if (button.dataset.pageNumber) {
    nextPage = Number(button.dataset.pageNumber);
  } else if (button.dataset.pageDirection === "prev") {
    nextPage -= 1;
  } else if (button.dataset.pageDirection === "next") {
    nextPage += 1;
  }
  state.currentPage = clampNumber(nextPage, 1, totalPages, state.currentPage);
  renderPosts();
  postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleSavedPost(slug, options = {}) {
  if (!slug) {
    return;
  }
  if (state.savedSlugs.includes(slug)) {
    state.savedSlugs = state.savedSlugs.filter((item) => item !== slug);
  } else {
    state.savedSlugs = [slug, ...state.savedSlugs].slice(0, 12);
  }
  if (state.savedOnly && state.savedSlugs.length === 0) {
    state.savedOnly = false;
  }
  savePrefs();
  updateDiscoveryUrl();
  renderPosts();
  updateCurrentPostSaveButton();
  focusSaveButton(slug, options.focusScope);
}

function focusSaveButton(slug, scope = "") {
  const applyFocus = (element) => {
    if (!element) {
      return;
    }
    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  };
  const focusTarget = () => {
    const selector = `[data-save-post="${cssEscape(slug)}"]`;
    const scopedButton = scope ? document.querySelector(`${scope} ${selector}`) : null;
    const fallbackButton = document.querySelector(`#postList ${selector}`) ||
      document.querySelector(`#featuredPost ${selector}`) ||
      document.querySelector(`#savedReads ${selector}`) ||
      document.querySelector(`#postView ${selector}`) ||
      document.querySelector(selector);
    applyFocus(scopedButton || fallbackButton);
  };
  focusTarget();
  requestAnimationFrame(focusTarget);
  setTimeout(focusTarget, 50);
}

function getSaveButtonScope(button) {
  if (button.closest("#postList")) {
    return "#postList";
  }
  if (button.closest("#featuredPost")) {
    return "#featuredPost";
  }
  if (button.closest("#savedReads")) {
    return "#savedReads";
  }
  if (button.closest("#postView")) {
    return "#postView";
  }
  return "";
}

function updateCurrentPostSaveButton() {
  if (!currentPostSaveButton) {
    return;
  }
  const post = state.posts.find((item) => item.slug === state.currentPostSlug);
  if (!post) {
    currentPostSaveButton.hidden = true;
    currentPostSaveButton.removeAttribute("data-save-post");
    currentPostSaveButton.setAttribute("aria-pressed", "false");
    currentPostSaveButton.textContent = "저장";
    currentPostSaveButton.classList.remove("active");
    currentPostSaveButton.setAttribute("aria-label", "현재 글 저장");
    return;
  }
  const saved = state.savedSlugs.includes(post.slug);
  currentPostSaveButton.hidden = false;
  currentPostSaveButton.dataset.savePost = post.slug;
  currentPostSaveButton.setAttribute("aria-pressed", String(saved));
  currentPostSaveButton.setAttribute("aria-label", `${post.title} ${saved ? "저장됨" : "저장"}`);
  currentPostSaveButton.textContent = saved ? "저장됨" : "저장";
  currentPostSaveButton.classList.toggle("active", saved);
}

function updateToolbarState(listCount, matchCount = listCount) {
  searchInput.value = state.search;
  clearSearchButton.hidden = !state.search;
  sortSelect.value = state.sort;
  updateSavedOnlyButton();
  resultCount.textContent = getResultCountText(listCount, matchCount);
  filterSummary.textContent = getFilterSummary(matchCount);
  emptyState.hidden = matchCount > 0;
  emptyState.innerHTML = getEmptyStateHtml();
}

function getVisiblePosts() {
  const query = normalizeSearchText(state.search);
  const posts = state.posts.filter((post) => {
    if (state.savedOnly && !state.savedSlugs.includes(post.slug)) {
      return false;
    }
    const haystack = normalizeSearchText([post.title, post.description, post.author, ...(post.tags || []), post.searchText].join(" "));
    return !query || haystack.includes(query);
  });

  return getSortedPosts(state.sort, posts);
}

function getListPosts(posts) {
  return posts;
}

function renderSearchContext(post) {
  const context = getSearchContext(post, state.search);
  if (!context) {
    return "";
  }
  return `<p class="search-context"><span class="search-context-label">본문 일치</span><span class="search-context-snippet">${highlightText(context, state.search)}</span></p>`;
}

function getSearchContext(post, query) {
  const needle = normalizeSearchText(query);
  const body = normalizeSearchText(post.searchText || "");
  if (!needle || !body.includes(needle)) {
    return "";
  }

  const metadata = normalizeSearchText([post.title, post.description, post.author, ...(post.tags || [])].join(" "));
  if (metadata.includes(needle)) {
    return "";
  }

  const index = body.indexOf(needle);
  const start = Math.max(0, index - 42);
  const end = Math.min(body.length, index + needle.length + 64);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < body.length ? "..." : "";
  return `${prefix}${body.slice(start, end)}${suffix}`;
}

function getSortedPosts(sort = "newest", posts = state.posts) {
  return [...posts].sort((a, b) => {
    if (sort === "oldest") {
      return new Date(a.date) - new Date(b.date);
    }
    if (sort === "title") {
      return a.title.localeCompare(b.title, "ko");
    }
    return new Date(b.date) - new Date(a.date);
  });
}

async function openPost(slug, options = {}) {
  const requestId = state.articleRequestId + 1;
  state.articleRequestId = requestId;
  const post = state.posts.find((item) => item.slug === slug);
  if (!post) {
    showList();
    showListMessage("글을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.");
    if (options.replace) {
      history.replaceState({}, "", homePath("#posts"));
    }
    if (options.push !== false) {
      history.pushState({}, "", homePath("#posts"));
    }
    postsSection.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  try {
    state.currentPostSlug = slug;
    hideListMessage();
    showPostView();
    renderArticleLoading(post);
    if (options.replace) {
      history.replaceState({ post: slug }, "", getStaticPostPath(post));
    } else if (options.push !== false) {
      history.pushState({ post: slug }, "", getStaticPostPath(post));
    }
    const html = await fetchText(appPath(toRootPath(post.contentPath || post.file)));
    if (requestId !== state.articleRequestId) {
      return;
    }
    renderArticle(post, stripPostMetadata(html, post.contentPath || post.file, post.title));
    renderRelatedPosts(post);
    updateDocumentMeta(post);
    trackPageView(document.title, new URL(getStaticPostPath(post), window.location.origin).pathname);
    saveRecentPrefs(post);
    if (options.restoreProgress) {
      restoreReadingPosition(post);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (error) {
    if (requestId !== state.articleRequestId) {
      return;
    }
    showList();
    showListMessage("글 본문을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    if (getPostSlugFromLocation() === slug) {
      history.replaceState({}, "", homePath("#posts"));
    }
    postsSection.scrollIntoView({ behavior: "auto", block: "start" });
    console.error(error);
  }
}

function renderArticleLoading(post) {
  updateArticleClass();
  updateCurrentPostSaveButton();
  tableOfContents.hidden = true;
  tableOfContents.innerHTML = "";
  relatedPosts.hidden = true;
  relatedPosts.innerHTML = "";
  postArticle.innerHTML = `
    <header class="article-header article-loading-header" aria-busy="true">
      <div class="tag-row">${renderTagRow(post)}</div>
      <h1>${renderArticleTitle(post.title)}</h1>
      <p>${escapeHtml(post.description)}</p>
      <div class="article-meta">
        <span class="meta-item">${renderPostDate(post)}</span>
        <span class="meta-item">${escapeHtml(post.author)}</span>
      </div>
    </header>
    <div class="article-loading" aria-label="글 본문을 불러오는 중">
      <div class="skeleton-media"></div>
      <div class="skeleton-line title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line medium"></div>
    </div>
  `;
  updateReadingControls();
  updateReadingProgress();
}

function renderArticle(post, html) {
  updateArticleClass();
  updateCurrentPostSaveButton();
  postArticle.innerHTML = `
    <header class="article-header">
      <div class="tag-row">${renderTagRow(post)}</div>
      <h1>${renderArticleTitle(post.title)}</h1>
      <p>${escapeHtml(post.description)}</p>
      <div class="article-meta">
        <span class="meta-item">${renderPostDate(post)}</span>
        <span class="meta-item">${escapeHtml(post.author)}</span>
      </div>
    </header>
    ${renderArticleCover(post, html)}
    <div class="article-content">${html}</div>
  `;
  renderTableOfContents();
  decorateArticleHeadings();
  updateReadingControls();
  updateReadingProgress();
}

function renderArticleCover(post, html) {
  if (!shouldRenderArticleCover(post, html)) {
    return "";
  }
  return `<img class="article-cover" src="${escapeAttribute(appPath(toRootPath(post.cover)))}" alt="" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">`;
}

function shouldRenderArticleCover(post, html) {
  const coverPath = normalizeComparableAssetPath(post.cover);
  const firstImagePath = normalizeComparableAssetPath(getFirstArticleImageSrc(html));
  return Boolean(coverPath) && coverPath !== firstImagePath;
}

function getFirstArticleImageSrc(html) {
  return String(html || "").match(/<img\b[^>]*\ssrc=(["'])(.*?)\1/i)?.[2] || "";
}

function normalizeComparableAssetPath(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  let pathname = text;
  try {
    pathname = new URL(text, window.location.origin).pathname;
  } catch {
    pathname = toRootPath(text);
  }
  const cleanPath = stripBasePath(pathname);
  const assetIndex = cleanPath.indexOf("/assets/");
  return assetIndex >= 0 ? cleanPath.slice(assetIndex) : cleanPath;
}

function stripPostMetadata(html, sourcePath = "", title = "") {
  const articleHtml = normalizeArticleHeadingLevels(
    String(html || "").replace(/^\s*<!--\s*corca-post\s*[\s\S]*?-->\s*/i, ""),
    title
  );
  if (!/<\/?(html|head|body|article|main)\b/i.test(articleHtml) || typeof DOMParser === "undefined") {
    return articleHtml;
  }

  const documentHtml = new DOMParser().parseFromString(articleHtml, "text/html");
  const container = documentHtml.querySelector("article, main") || documentHtml.body;
  const articleTitle = title || documentHtml.title;
  container.querySelectorAll(".quiz, .checkpoint, [data-quiz]").forEach((element) => element.remove());
  container.querySelectorAll("script, style, noscript, iframe, object, embed, form, input, button, select, textarea, nav, footer, aside").forEach((element) => element.remove());
  container.querySelectorAll("h1").forEach((heading) => {
    if (normalizeSearchText(heading.textContent) === normalizeSearchText(articleTitle)) {
      heading.remove();
      return;
    }
    const replacement = documentHtml.createElement("h2");
    [...heading.attributes].forEach((attribute) => replacement.setAttribute(attribute.name, attribute.value));
    replacement.innerHTML = heading.innerHTML;
    heading.replaceWith(replacement);
  });
  container.querySelectorAll("header").forEach((element) => element.replaceWith(...[...element.childNodes]));
  container.querySelectorAll("[src]").forEach((element) => element.setAttribute("src", normalizeArticleAssetUrl(element.getAttribute("src"), sourcePath)));
  container.querySelectorAll("[href]").forEach((element) => element.setAttribute("href", normalizeArticleAssetUrl(element.getAttribute("href"), sourcePath)));
  container.querySelectorAll("[srcset]").forEach((element) => element.setAttribute("srcset", normalizeArticleSrcset(element.getAttribute("srcset"), sourcePath)));
  return container.innerHTML.trim();
}

function normalizeArticleHeadingLevels(html, title = "") {
  return String(html || "").replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (match, attrs, content) => {
    const headingText = normalizeSearchText(stripInlineHtml(content));
    return title && headingText === normalizeSearchText(title) ? "" : `<h2${attrs}>${content}</h2>`;
  });
}

function stripInlineHtml(value) {
  if (typeof document !== "undefined") {
    const template = document.createElement("template");
    template.innerHTML = String(value || "");
    return template.content.textContent || "";
  }
  return String(value || "").replace(/<[^>]+>/g, " ");
}

function normalizeArticleSrcset(value, sourcePath) {
  return String(value || "").split(",")
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      const url = parts.shift();
      if (!url) {
        return "";
      }
      return [normalizeArticleAssetUrl(url, sourcePath), ...parts].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

function normalizeArticleAssetUrl(value, sourcePath) {
  const text = String(value || "").trim();
  if (!text || text.startsWith("#") || /^(?:https?:|mailto:|tel:|data:)/i.test(text)) {
    return text;
  }
  if (text.startsWith("/")) {
    return appPath(text);
  }
  const source = toRootPath(sourcePath || "/posts/post.html").replace(/^\//, "");
  const resolved = new URL(text, `${window.location.origin}/${source}`);
  const assetIndex = resolved.pathname.indexOf("/assets/");
  if (assetIndex >= 0) {
    return appPath(resolved.pathname.slice(assetIndex));
  }
  const postIndex = resolved.pathname.indexOf("/posts/");
  if (postIndex >= 0) {
    return appPath(resolved.pathname.slice(postIndex));
  }
  return text;
}

function renderTableOfContents() {
  const headings = [...postArticle.querySelectorAll(".article-content h2")];
  tableOfContents.hidden = headings.length < 2;

  if (tableOfContents.hidden) {
    tableOfContents.innerHTML = "";
    return;
  }

  tableOfContents.innerHTML = `
    <section class="toc-section" aria-label="글 목차">
      <strong>목차</strong>
      <ol>
        ${headings.map((heading, index) => {
          const id = heading.id || `section-${index + 1}`;
          heading.id = id;
          return `<li><a href="#${escapeAttribute(id)}" data-toc-link="${escapeAttribute(id)}">${escapeHtml(heading.textContent)}</a></li>`;
        }).join("")}
      </ol>
    </section>
  `;
  updateActiveTocLink();
}

function decorateArticleHeadings() {
  postArticle.querySelectorAll(".article-content h2[id], .article-content h3[id]").forEach((heading) => {
    if (heading.querySelector(".heading-anchor")) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = `#${heading.id}`;
    anchor.tabIndex = -1;
    anchor.setAttribute("aria-label", `${heading.textContent.trim()} 섹션 링크`);
    heading.append(anchor);
  });
}

function renderRelatedPosts(post) {
  const related = getRecommendedPosts(post, state.posts);
  relatedPosts.hidden = true;
  relatedPosts.innerHTML = "";
  renderSidebarRecommendations(related);
}

function getRecommendedPosts(post, posts = state.posts) {
  let related = posts
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({
      post: item,
      score: item.tags.filter((tag) => post.tags.includes(tag)).length
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, 3)
    .map((item) => item.post);

  if (!related.length) {
    related = getSortedPosts("newest")
      .filter((item) => item.slug !== post.slug)
      .slice(0, 3);
  }

  if (related.length < 3) {
    const selectedSlugs = new Set(related.map((item) => item.slug));
    related = [
      ...related,
      ...getSortedPosts("newest")
        .filter((item) => item.slug !== post.slug && !selectedSlugs.has(item.slug))
        .slice(0, 3 - related.length)
    ];
  }

  return related;
}

function renderSidebarRecommendations(posts) {
  tableOfContents.querySelector(".toc-recommendations")?.remove();

  if (!posts.length) {
    tableOfContents.hidden = !tableOfContents.textContent.trim();
    return;
  }

  tableOfContents.hidden = false;
  tableOfContents.insertAdjacentHTML("beforeend", `
    <section class="toc-recommendations" aria-label="추천 글">
      <strong>추천 글</strong>
      <div class="toc-recommendation-list">
        ${posts.slice(0, 3).map((item) => `
          <a class="toc-recommendation" href="${escapeAttribute(getStaticPostPath(item))}">
            <span>${escapeHtml(item.title)}</span>
            <small>${renderPostDate(item)} · ${escapeHtml(item.author)}</small>
          </a>
        `).join("")}
      </div>
    </section>
  `);
}

function renderTagRow(post) {
  return getPublicPostTags(post).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function getPrimaryPostTopic(post) {
  return getPublicPostTags(post)[0] || DEFAULT_POST_TOPIC;
}

function getPublicPostTags(post) {
  const publicTags = (post.tags || []).filter((tag) => PUBLIC_POST_TOPICS.includes(tag));
  return publicTags.length ? [publicTags[0]] : [DEFAULT_POST_TOPIC];
}

function getPostSection(post) {
  return String(post.section || getPrimaryPostTopic(post) || DEFAULT_POST_TOPIC).trim();
}

function getPostImageAlt(post) {
  return String(post.coverAlt || `${post.title} 대표 이미지`).replace(/\s+/g, " ").trim();
}

function getPostLanguage(post) {
  const language = String(post.language || "").trim().toLowerCase().replace("_", "-");
  return language.startsWith("en") ? "en" : "ko";
}

function getPostLocale(post) {
  return getPostLanguage(post) === "en" ? "en_US" : "ko_KR";
}

function renderPostDate(post) {
  return `<time datetime="${escapeAttribute(post.date)}">${formatDate(post.date)}</time>`;
}

function renderPostMeta(post) {
  return `
    <span class="meta-item">${renderPostDate(post)}</span>
    <span class="meta-item">${escapeHtml(post.author)}</span>
  `;
}

function renderArticleTitle(title) {
  const normalizedTitle = String(title || "").replace(/\s+/g, " ").trim();
  return escapeHtml(normalizedTitle).replace(/([/·:：,，;；!?！？])\s*/g, "$1<wbr>");
}

function renderArchiveMeta(post) {
  const primaryTopic = getPrimaryPostTopic(post);
  const secondaryTopic = getPublicPostTags(post).find((tag) => tag !== primaryTopic);
  return `<strong>${escapeHtml(primaryTopic)}</strong> · ${escapeHtml([estimateReadingTime(post), secondaryTopic].filter(Boolean).join(" · "))}`;
}

function showList() {
  state.articleRequestId += 1;
  closeReadingSettings();
  skipLink.href = "#posts";
  setHidden(postView, true);
  setHidden(siteHeader, false);
  setHidden(siteFooter, false);
  setHidden(heroSection, false);
  setHidden(featuredPost, true);
  setHidden(savedReads, true);
  setHidden(toolbarSection, true);
  setHidden(postsSection, false);
  setHidden(archiveSection, true);
  setHidden(aboutSection, true);
  setHidden(recentReads, true);
  state.currentPostSlug = null;
  updateCurrentPostSaveButton();
  updateSectionNavigation(window.location.hash || "#posts");
  resetDocumentMeta();
  updateReadingProgress();
  trackPageView(defaultDocumentMeta.title, new URL(appPath("/"), window.location.origin).pathname);
}

function showPostView() {
  closeReadingSettings();
  skipLink.href = "#postArticle";
  setHidden(siteHeader, false);
  setHidden(siteFooter, false);
  setHidden(heroSection, true);
  setHidden(featuredPost, true);
  setHidden(recentReads, true);
  setHidden(savedReads, true);
  setHidden(toolbarSection, true);
  setHidden(postsSection, true);
  setHidden(archiveSection, true);
  setHidden(aboutSection, true);
  setHidden(postView, false);
  updateSectionNavigation("");
  updateCurrentPostSaveButton();
  hidePostViewMessage();
}

function setHidden(element, hidden) {
  if (!element) {
    return;
  }
  element.hidden = hidden;
  if (hidden) {
    element.setAttribute("inert", "");
  } else {
    element.removeAttribute("inert");
  }
}

function closeReadingSettings() {
  if (readingSettings) {
    readingSettings.open = false;
  }
}

function showListMessage(message) {
  listMessage.hidden = false;
  listMessage.textContent = message;
}

function hideListMessage() {
  listMessage.hidden = true;
  listMessage.textContent = "";
}

function hidePostViewMessage() {
  postViewMessage.hidden = true;
  postViewMessage.textContent = "";
}

function showPostViewMessage(message) {
  if (!postViewMessage) {
    return;
  }
  postViewMessage.hidden = false;
  postViewMessage.textContent = message;
}

function closeArticleActionMenus() {
  if (articleShareMenu) {
    articleShareMenu.open = false;
  }
}

function handlePopState() {
  const slug = getPostSlugFromLocation();
  if (slug) {
    openPost(slug, { push: false });
  } else {
    showList();
    scrollToInitialHash();
  }
}

function handleGlobalKeydown(event) {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    focusSearchFromShortcut();
    return;
  }

  if (event.key === "/" && !typing) {
    event.preventDefault();
    focusSearchFromShortcut();
  }
}

function focusSearchFromShortcut() {
  showList();
  hideListMessage();
  if (state.posts.length === 0) {
    if (!isHomePath() || window.location.hash !== "#posts") {
      history.pushState({}, "", homePath("#posts"));
    }
    postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    focusEmptyStateAction();
    requestAnimationFrame(() => {
      focusEmptyStateAction();
    });
    window.setTimeout(focusEmptyStateAction, 80);
    return;
  }
  if (!isHomePath() || window.location.hash !== "#posts") {
    history.pushState({}, "", homePath("#posts"));
  }
  postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  searchInput.focus();
}

function focusEmptyStateAction() {
  const action = emptyState.querySelector(".empty-state-action");
  if (action instanceof HTMLElement) {
    action.focus({ preventScroll: true });
  }
}

function applyDiscoveryParamsFromLocation() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("q")) {
    state.search = String(params.get("q") || "").trim();
  }
  state.savedOnly = params.get("saved") === "1";
  if (["newest", "oldest", "title"].includes(params.get("sort"))) {
    state.sort = params.get("sort");
  }
}

function updateDiscoveryUrl(options = {}) {
  if (state.currentPostSlug) {
    return;
  }

  const params = new URLSearchParams();
  if (state.search) {
    params.set("q", state.search);
  }
  if (state.savedOnly) {
    params.set("saved", "1");
  }
  if (state.sort !== "newest") {
    params.set("sort", state.sort);
  }
  const query = params.toString();
  const nextUrl = query ? `${appPath("/")}?${query}#posts` : homePath("#posts");
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === nextUrl) {
    return;
  }
  const method = options.replace === false ? "pushState" : "replaceState";
  history[method]({}, "", nextUrl);
}

function hasDiscoveryState() {
  return Boolean(state.search || state.savedOnly || state.sort !== "newest");
}

async function copyPostLink() {
  if (!state.currentPostSlug) {
    return;
  }
  const post = state.posts.find((item) => item.slug === state.currentPostSlug);
  const url = post ? getStaticPostUrl(post) : `${window.location.origin}${window.location.pathname}`;
  try {
    await writeClipboardText(url);
    flashButtonLabel(copyLinkButton, "복사됨");
  } catch {
    postViewMessage.hidden = false;
    postViewMessage.textContent = "링크 복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.";
  }
}

async function shareCurrentPost() {
  const post = getCurrentPost();
  if (!post) {
    return;
  }
  await sharePost(post, {
    onSuccess: (message) => flashButtonLabel(sharePostButton, message.includes("복사") ? "링크 복사됨" : "공유 완료"),
    onError: (message) => showPostViewMessage(message)
  });
}

async function shareListPost(slug) {
  const post = state.posts.find((item) => item.slug === slug);
  if (!post) {
    return;
  }
  const selector = `[data-list-share-post="${cssEscape(slug)}"]`;
  const button = document.querySelector(selector);
  await withListActionButtonDisabled(selector, () => sharePost(post, {
    onSuccess: () => flashIconButtonState(button, "공유 링크 복사됨"),
    onError: (message) => showListMessage(message)
  }));
}

async function sharePost(post, feedback = {}) {
  const url = getStaticPostUrl(post);
  const payload = {
    title: post.title,
    text: post.description,
    url
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      trackAnalyticsEvent("post_share", getPostAnalyticsParams(post));
      feedback.onSuccess?.("공유 창을 열었습니다.");
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  try {
    await writeClipboardText(url);
    trackAnalyticsEvent("post_share", getPostAnalyticsParams(post));
    feedback.onSuccess?.("공유 링크를 복사했습니다.");
  } catch {
    feedback.onError?.("공유 링크 복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.");
  }
}

async function downloadCurrentPost() {
  const post = getCurrentPost();
  if (!post) {
    return;
  }
  await downloadPostHtml(post, {
    onError: (message) => showPostViewMessage(message)
  });
}

async function downloadListPost(slug) {
  const post = state.posts.find((item) => item.slug === slug);
  if (!post) {
    return;
  }
  await withListActionButtonDisabled(`[data-list-download-post="${cssEscape(slug)}"]`, () => downloadPostHtml(post, {
    onError: (message) => showListMessage(message)
  }));
}

async function downloadPostHtml(post, feedback = {}) {
  try {
    const html = await fetchText(appPath(toRootPath(post.contentPath || post.file || getStaticPostPath(post))));
    triggerHtmlDownload(post, html);
    trackAnalyticsEvent("post_download", getPostAnalyticsParams(post));
  } catch (error) {
    console.warn(error);
    feedback.onError?.("글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

function flashButtonLabel(button, label) {
  if (!button) {
    return;
  }
  const defaultLabel = button.dataset.defaultLabel || button.textContent;
  button.dataset.defaultLabel = defaultLabel;
  button.textContent = label;
  clearTimeout(buttonFeedbackTimers.get(button));
  buttonFeedbackTimers.set(button, setTimeout(() => {
    button.textContent = defaultLabel;
  }, 1400));
}

function flashIconButtonState(button, label) {
  if (!button) {
    return;
  }
  const defaultLabel = button.dataset.defaultAriaLabel || button.getAttribute("aria-label") || "";
  button.dataset.defaultAriaLabel = defaultLabel;
  button.setAttribute("aria-label", label);
  button.classList.add("is-success");
  clearTimeout(buttonFeedbackTimers.get(button));
  buttonFeedbackTimers.set(button, setTimeout(() => {
    button.setAttribute("aria-label", defaultLabel);
    button.classList.remove("is-success");
  }, 1200));
}

function triggerHtmlDownload(post, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${post.slug}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function withListActionButtonDisabled(selector, action) {
  const button = document.querySelector(selector);
  if (button) {
    button.disabled = true;
  }
  try {
    await action();
  } finally {
    if (button) {
      button.disabled = false;
    }
  }
}

function renderListReactions(posts) {
  posts.forEach(renderListReactionButton);
}

async function toggleListReaction(slug) {
  const post = state.posts.find((item) => item.slug === slug);
  if (!post) {
    return;
  }
  const button = document.querySelector(`[data-list-reaction-post="${cssEscape(slug)}"]`);
  if (button) {
    button.disabled = true;
  }
  try {
    const reacted = state.reactedSlugs.includes(post.slug);
    state.reactedSlugs = reacted
      ? state.reactedSlugs.filter((item) => item !== post.slug)
      : [post.slug, ...state.reactedSlugs.filter((item) => item !== post.slug)].slice(0, 100);
    savePrefs();
    trackAnalyticsEvent("post_reaction", getPostAnalyticsParams(post, { reaction: "useful" }));
  } catch (error) {
    console.warn(error);
  }
  renderListReactionButton(post);
}

function renderListReactionButton(post) {
  const button = document.querySelector(`[data-list-reaction-post="${cssEscape(post.slug)}"]`);
  if (!button) {
    return;
  }
  const interaction = getInteractionState(post);
  const active = interaction.selectedReaction === "useful";
  button.disabled = false;
  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
  button.setAttribute("aria-label", active ? `${post.title} 좋아요 취소` : `${post.title} 좋아요`);
  button.title = "좋아요";
}

function normalizeReactionCounts(counts) {
  return Object.fromEntries(REACTION_OPTIONS.map((option) => [
    option.key,
    Math.max(0, Number(counts?.[option.key] || 0) || 0)
  ]));
}

function normalizeReactionKey(value) {
  const key = String(value || "").trim();
  return REACTION_OPTIONS.some((option) => option.key === key) ? key : "";
}

function getInteractionState(post) {
  return {
    ...getDefaultInteractionState(),
    selectedReaction: state.reactedSlugs.includes(post.slug) ? "useful" : ""
  };
}

function getDefaultInteractionState() {
  return {
    likes: 0,
    liked: false,
    metrics: getDefaultMetrics(),
    reactions: normalizeReactionCounts({}),
    selectedReaction: "",
    unavailable: false
  };
}

function getDefaultMetrics() {
  return {
    views: 0,
    shares: 0,
    downloads: 0,
    reactions: 0
  };
}

function getCurrentPost() {
  return state.posts.find((item) => item.slug === state.currentPostSlug) || null;
}


async function fetchJsonWithOptions(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    ...options
  });
  if (!response.ok) {
    throw new Error(`${path} request failed with ${response.status}`);
  }
  return response.json();
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) {
    throw new Error("Clipboard fallback failed");
  }
}

function changeArticleScale(delta) {
  state.articleScale = Math.min(1.2, Math.max(0.9, Number((state.articleScale + delta).toFixed(2))));
  savePrefs();
  applyReadingSettings();
}

function cycleArticleLeading() {
  const values = ["normal", "wide", "compact"];
  state.articleLeading = values[(values.indexOf(state.articleLeading) + 1) % values.length];
  savePrefs();
  applyReadingSettings();
}

function toggleArticleFont() {
  state.articleFont = state.articleFont === "sans" ? "serif" : "sans";
  savePrefs();
  applyReadingSettings();
}

function cycleArticleWidth() {
  const values = ["normal", "wide", "narrow"];
  state.articleWidth = values[(values.indexOf(state.articleWidth) + 1) % values.length];
  savePrefs();
  applyReadingSettings();
}

function cycleParagraphSpacing() {
  const values = ["normal", "wide", "compact"];
  state.paragraphSpacing = values[(values.indexOf(state.paragraphSpacing) + 1) % values.length];
  savePrefs();
  applyReadingSettings();
}

function resetReadingPrefs() {
  state.articleScale = 1;
  state.articleLeading = "normal";
  state.articleFont = "sans";
  state.articleWidth = "normal";
  state.paragraphSpacing = "normal";
  savePrefs();
  applyReadingSettings();
}

function applyReadingSettings() {
  updateArticleClass();
  updateReadingControls();
  updateReadingProgress();
}

function updateArticleClass() {
  postArticle.className = `article scale-${Math.round(state.articleScale * 100)} leading-${state.articleLeading} font-${state.articleFont} width-${state.articleWidth} paragraph-${state.paragraphSpacing}`;
}

function updateReadingControls() {
  lineHeightButton.textContent = `행간 ${labelFor(state.articleLeading)}`;
  fontFamilyButton.textContent = `글꼴 ${state.articleFont === "sans" ? "산세" : "세리프"}`;
  articleWidthButton.textContent = `폭 ${labelFor(state.articleWidth)}`;
  paragraphSpacingButton.textContent = `문단 ${labelFor(state.paragraphSpacing)}`;
  resetReadingButton.textContent = "기본값";
  resetReadingButton.hidden = !hasCustomReadingSettings();
}

function hasCustomReadingSettings() {
  return state.articleScale !== 1 ||
    state.articleLeading !== "normal" ||
    state.articleFont !== "sans" ||
    state.articleWidth !== "normal" ||
    state.paragraphSpacing !== "normal";
}

function updateReadingProgress() {
  if (!state.currentPostSlug || postView.hidden) {
    readingProgress.style.transform = "scaleX(0)";
    return;
  }

  const rect = postArticle.getBoundingClientRect();
  const total = Math.max(1, rect.height - window.innerHeight);
  const read = Math.min(total, Math.max(0, -rect.top));
  const ratio = read / total;
  readingProgress.style.transform = `scaleX(${ratio})`;
  rememberReadingProgress(ratio);
  updateActiveTocLink();
}

function rememberReadingProgress(ratio) {
  if (!state.currentPostSlug || !postArticle.querySelector(".article-content")) {
    return;
  }
  const nextRatio = clampNumber(ratio, 0, 1, 0);
  state.readingProgressBySlug[state.currentPostSlug] = Number(nextRatio.toFixed(3));
  const now = Date.now();
  if (now - state.lastProgressSaveAt > 700 || nextRatio >= 0.98) {
    state.lastProgressSaveAt = now;
    savePrefs();
  }
}

function restoreReadingPosition(post) {
  const ratio = getReadingProgress(post);
  if (ratio <= 0.04) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  requestAnimationFrame(() => {
    const rect = postArticle.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const top = window.scrollY + rect.top + (total * ratio);
    window.scrollTo({ top, behavior: "smooth" });
  });
}

function updateActiveTocLink() {
  if (!state.currentPostSlug || postView.hidden || tableOfContents.hidden) {
    return;
  }

  const headings = [...postArticle.querySelectorAll(".article-content h2[id]")];
  const links = [...tableOfContents.querySelectorAll("[data-toc-link]")];
  if (!headings.length || !links.length) {
    return;
  }

  const threshold = Math.min(180, window.innerHeight * 0.28);
  const activeHeading = headings.reduce((current, heading) => {
    const top = heading.getBoundingClientRect().top;
    if (top <= threshold) {
      return heading;
    }
    return current;
  }, headings[0]);

  for (const link of links) {
    const active = link.dataset.tocLink === activeHeading.id;
    if (active) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function updateDocumentMeta(post) {
  const image = absoluteUrl(post.cover);
  const imageAlt = getPostImageAlt(post);
  document.title = `${post.title} | Corca Blog`;
  setCanonical(getStaticPostUrl(post));
  setMeta("name", "description", post.description);
  setMeta("property", "og:title", post.title);
  setMeta("property", "og:description", post.description);
  setMeta("property", "og:site_name", "Corca Blog");
  setMeta("property", "og:locale", getPostLocale(post));
  setMeta("property", "og:type", "article");
  setMeta("property", "og:image", image);
  setMeta("property", "og:image:secure_url", image);
  setMeta("property", "og:image:type", imageMimeType(image));
  setMeta("property", "og:image:width", "1672");
  setMeta("property", "og:image:height", "941");
  setMeta("property", "og:image:alt", imageAlt);
  setMeta("property", "og:url", getStaticPostUrl(post));
  setMeta("property", "article:published_time", new Date(post.date).toISOString());
  setMeta("property", "article:modified_time", new Date(post.date).toISOString());
  setMeta("property", "article:author", post.author);
  setMeta("property", "article:section", getPostSection(post));
  setRepeatedMeta("property", "article:tag", post.tags || []);
  setMeta("name", "twitter:title", post.title);
  setMeta("name", "twitter:description", post.description);
  setMeta("name", "twitter:image", image);
  setMeta("name", "twitter:image:alt", imageAlt);
  setStructuredData(makePostStructuredData(post));
}

function makePostStructuredData(post) {
  const image = absoluteUrl(post.cover);
  const url = getStaticPostUrl(post);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        image,
        thumbnailUrl: image,
        url,
        keywords: [...new Set((post.tags || []).filter(Boolean))],
        articleSection: getPostSection(post),
        wordCount: Number(post.wordCount || 0) || undefined,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Organization",
          name: post.author
        },
        publisher: {
          "@type": "Organization",
          name: "Corca"
        },
        inLanguage: getPostLanguage(post) === "en" ? "en-US" : "ko-KR",
        isPartOf: {
          "@type": "Blog",
          name: "Corca Blog",
          url: new URL(appPath("/"), window.location.origin).href
        },
        mainEntityOfPage: url
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Corca Blog",
            item: new URL(appPath("/"), window.location.origin).href
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "글",
            item: new URL(appPath("/#posts"), window.location.origin).href
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title
          }
        ]
      }
    ]
  };
}

function getStaticPostUrl(post) {
  return new URL(getStaticPostPath(post), window.location.origin).href;
}

function getStaticPostPath(post) {
  return appPath(`/posts/${encodeURIComponent(post.slug)}/`);
}

function getPostSlugFromLocation() {
  return "";
}

function isLegacyPostQuery() {
  return isHomePath() && new URLSearchParams(window.location.search).has("post");
}

function scrollToInitialHash() {
  if (window.location.hash !== "#posts") {
    updateSectionNavigation("");
    return;
  }
  const target = document.querySelector(window.location.hash);
  if (!target || target.hidden) {
    history.replaceState({}, "", homePath("#posts"));
    updateSectionNavigation("#posts");
    requestAnimationFrame(() => {
      postsSection.scrollIntoView({ block: "start" });
    });
    return;
  }
  updateSectionNavigation(window.location.hash);
  requestAnimationFrame(() => {
    target.scrollIntoView({ block: "start" });
  });
}

function updateSectionNavigation(hash) {
  const currentHash = hash === "#posts" ? hash : "";
  sectionNavLinks.forEach((link) => {
    const linkHash = new URL(link.getAttribute("href") || "", window.location.origin).hash;
    const active = currentHash && linkHash === currentHash;
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function scrollToPosts() {
  postsSection.scrollIntoView({ behavior: "auto", block: "start" });
  requestAnimationFrame(() => {
    postsSection.scrollIntoView({ behavior: "auto", block: "start" });
  });
}

function toRootPath(path) {
  return `/${String(path || "").replace(/^\/+/, "")}`;
}

function resolveBasePath(scriptUrl = "") {
  const script = scriptUrl || document.currentScript?.getAttribute("src") || document.currentScript?.src || "";
  const scriptPath = script ? new URL(script, window.location.href).pathname : "";
  const basePath = scriptPath.replace(/\/app\.js$/, "").replace(/\/+$/, "");
  return basePath === "/" ? "" : basePath;
}

function appPath(path = "/") {
  const cleanPath = toRootPath(path);
  return `${BASE_PATH}${cleanPath}` || "/";
}

function homePath(hash = "") {
  return `${appPath("/")}${hash}`;
}

function stripBasePath(pathname) {
  const cleanPath = pathname || "/";
  if (!BASE_PATH) {
    return cleanPath;
  }
  if (cleanPath === BASE_PATH || cleanPath === `${BASE_PATH}/`) {
    return "/";
  }
  if (cleanPath.startsWith(`${BASE_PATH}/`)) {
    return cleanPath.slice(BASE_PATH.length) || "/";
  }
  return cleanPath;
}

function isHomePath() {
  const path = stripBasePath(window.location.pathname);
  return path === "/" || path === "/index.html";
}

function resetDocumentMeta() {
  document.title = defaultDocumentMeta.title;
  setCanonical(defaultDocumentMeta.url);
  setMeta("name", "description", defaultDocumentMeta.description);
  setMeta("property", "og:title", "Corca Blog");
  setMeta("property", "og:description", defaultDocumentMeta.description);
  setMeta("property", "og:site_name", "Corca Blog");
  setMeta("property", "og:locale", "ko_KR");
  setMeta("property", "og:type", "website");
  setMeta("property", "og:image", defaultDocumentMeta.image);
  setMeta("property", "og:image:secure_url", defaultDocumentMeta.image);
  setMeta("property", "og:image:type", imageMimeType(defaultDocumentMeta.image));
  setMeta("property", "og:image:width", "1672");
  setMeta("property", "og:image:height", "941");
  setMeta("property", "og:image:alt", "Corca 블로그 글쓰기와 제품 리서치를 위한 작업 공간");
  setMeta("property", "og:url", defaultDocumentMeta.url);
  setMeta("name", "twitter:title", "Corca Blog");
  setMeta("name", "twitter:description", defaultDocumentMeta.description);
  setMeta("name", "twitter:image", defaultDocumentMeta.image);
  setMeta("name", "twitter:image:alt", "Corca 블로그 글쓰기와 제품 리서치를 위한 작업 공간");
  removeMeta("property", "article:published_time");
  removeMeta("property", "article:modified_time");
  removeMeta("property", "article:author");
  removeMeta("property", "article:section");
  removeMeta("property", "article:tag");
  setStructuredData({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Corca Blog",
    description: defaultDocumentMeta.description,
    url: defaultDocumentMeta.url,
    inLanguage: "ko-KR",
    publisher: {
      "@type": "Organization",
      name: "Corca"
    }
  });
}

function setMeta(attribute, key, value) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute("content", value);
}

function removeMeta(attribute, key) {
  document.querySelectorAll(`meta[${attribute}="${key}"]`).forEach((element) => element.remove());
}

function setRepeatedMeta(attribute, key, values) {
  removeMeta(attribute, key);
  for (const value of values) {
    const element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.setAttribute("content", value);
    document.head.append(element);
  }
}

function setCanonical(value) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }
  element.href = value;
}

function setStructuredData(payload) {
  let element = document.querySelector("#structuredData");
  if (!element) {
    element = document.createElement("script");
    element.id = "structuredData";
    element.type = "application/ld+json";
    document.head.append(element);
  }
  element.textContent = JSON.stringify(payload);
}

function absoluteUrl(path) {
  const value = String(path || "");
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return new URL(appPath(toRootPath(value)), window.location.origin).href;
}

function imageMimeType(image) {
  const pathname = (() => {
    try {
      return new URL(image).pathname;
    } catch {
      return String(image || "").split("?")[0];
    }
  })().toLowerCase();
  if (pathname.endsWith(".avif")) return "image/avif";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".gif")) return "image/gif";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

function restorePrefs() {
  try {
    const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.prefs) || "{}");
    state.articleScale = clampNumber(Number(prefs.articleScale || 1), 0.9, 1.2, 1);
    state.articleLeading = ["normal", "wide", "compact"].includes(prefs.articleLeading) ? prefs.articleLeading : "normal";
    state.articleFont = ["sans", "serif"].includes(prefs.articleFont) ? prefs.articleFont : "sans";
    state.articleWidth = ["normal", "wide", "narrow"].includes(prefs.articleWidth) ? prefs.articleWidth : "normal";
    state.paragraphSpacing = ["normal", "wide", "compact"].includes(prefs.paragraphSpacing) ? prefs.paragraphSpacing : "normal";
    state.recentSlugs = Array.isArray(prefs.recentSlugs) ? prefs.recentSlugs.map(String).slice(0, 3) : [];
    state.savedSlugs = Array.isArray(prefs.savedSlugs) ? prefs.savedSlugs.map(String).slice(0, 12) : [];
    state.reactedSlugs = Array.isArray(prefs.reactedSlugs) ? prefs.reactedSlugs.map(String).slice(0, 100) : [];
    state.readingProgressBySlug = sanitizeProgressMap(prefs.readingProgressBySlug);
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEYS.prefs);
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }
}

function reconcileDiscoveryPrefs() {
  let discoveryChanged = false;
  if (state.posts.length === 0) {
    discoveryChanged = hasDiscoveryState();
    state.search = "";
    state.savedOnly = false;
    state.sort = "newest";
    state.currentPage = 1;
  }
  const availableSlugs = new Set(state.posts.map((post) => post.slug));
  state.recentSlugs = state.recentSlugs.filter((slug) => availableSlugs.has(slug));
  state.savedSlugs = state.savedSlugs.filter((slug) => availableSlugs.has(slug));
  state.reactedSlugs = state.reactedSlugs.filter((slug) => availableSlugs.has(slug));
  if (state.savedOnly && state.savedSlugs.length === 0) {
    state.savedOnly = false;
  }
  state.readingProgressBySlug = Object.fromEntries(
    Object.entries(state.readingProgressBySlug).filter(([slug]) => availableSlugs.has(slug))
  );
  savePrefs();
  if (discoveryChanged) {
    updateDiscoveryUrl();
  }
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

function savePrefs() {
  try {
    localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify({
      articleScale: state.articleScale,
      articleLeading: state.articleLeading,
      articleFont: state.articleFont,
      articleWidth: state.articleWidth,
      paragraphSpacing: state.paragraphSpacing,
      recentSlugs: state.recentSlugs,
      savedSlugs: state.savedSlugs,
      reactedSlugs: state.reactedSlugs,
      readingProgressBySlug: state.readingProgressBySlug
    }));
  } catch {
    // Preferences are progressive enhancement; core reading/search must still work.
  }
}

function saveRecentPrefs(post) {
  if (post?.slug) {
    state.recentSlugs = [post.slug, ...state.recentSlugs.filter((slug) => slug !== post.slug)].slice(0, 3);
  }
  savePrefs();
}

function getReadingProgress(post) {
  return clampNumber(Number(state.readingProgressBySlug[post.slug] || 0), 0, 1, 0);
}

function formatReadingProgress(post) {
  const progress = getReadingProgress(post);
  if (progress < 0.05) {
    return "처음부터";
  }
  if (progress > 0.96) {
    return "완독";
  }
  return `${Math.round(progress * 100)}% 읽음`;
}

function renderReadingProgressBar(post) {
  const progress = getReadingProgress(post);
  if (progress < 0.05) {
    return "";
  }
  const bucket = Math.min(100, Math.max(5, Math.round(progress * 20) * 5));
  const percent = Math.round(progress * 100);
  return `<span class="recent-progress progress-${bucket}" role="progressbar" aria-label="${escapeAttribute(`${post.title} 읽기 진행률`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${escapeAttribute(formatReadingProgress(post))}"><span></span></span>`;
}

function sanitizeProgressMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(Object.entries(value)
    .map(([slug, progress]) => [String(slug), clampNumber(Number(progress), 0, 1, 0)])
    .filter(([slug]) => slug));
}

function getFilterSummary(count) {
  const parts = [];
  if (state.search) {
    parts.push(`"${state.search}" 검색`);
  }
  if (state.savedOnly) {
    parts.push("저장한 글");
  }
  return parts.length ? `${parts.join(", ")} 결과 ${count}개` : "";
}

function getResultCountText(listCount) {
  if (state.posts.length === 0) {
    return "첫 공개 글을 준비하고 있습니다.";
  }
  if (state.savedOnly) {
    return `저장한 글 ${listCount}개`;
  }
  return `${listCount}개의 글`;
}

function getEmptyStateHtml() {
  if (state.posts.length === 0) {
    return `아직 공개된 글이 없습니다. <span class="empty-state-detail">Corca가 어떤 관점으로 제품과 워크플로를 기록하는지 먼저 확인해 보세요.</span> <a class="text-button compact empty-state-action" href="${escapeAttribute(homePath("#about"))}" data-list-anchor="about">블로그 소개 보기</a>`;
  }
  if (state.search) {
    return "조건에 맞는 글이 없습니다. 검색어를 바꿔보세요.";
  }
  if (state.savedOnly) {
    return "저장한 글이 없습니다. 글 카드에 마우스를 올린 뒤 별 버튼을 눌러 저장해 보세요.";
  }
  return "아직 공개된 글이 없습니다.";
}

function updateSavedOnlyButton() {
  if (!savedOnlyButton) {
    return;
  }
  const savedCount = state.savedSlugs.length;
  const hasSavedFilter = savedCount > 0 || state.savedOnly;
  savedOnlyButton.textContent = `저장한 글 ${savedCount}`;
  savedOnlyButton.hidden = !hasSavedFilter;
  savedOnlyButton.disabled = savedCount === 0;
  savedOnlyButton.setAttribute("aria-pressed", String(state.savedOnly));
  savedOnlyButton.classList.toggle("active", state.savedOnly);
  toolbarSection?.classList.toggle("has-saved-filter", hasSavedFilter);
}

function estimateReadingTime(post) {
  const words = [post.title, post.description, ...(post.tags || [])].join(" ").length + Number(post.wordCount || 800);
  return `${Math.max(1, Math.ceil(words / 600))}분 읽기`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(date));
}

function labelFor(value) {
  return {
    normal: "보통",
    wide: "넓게",
    compact: "좁게",
    narrow: "좁게"
  }[value] || "보통";
}

function highlightText(value, query) {
  const text = String(value || "");
  if (!query) {
    return escapeHtml(text);
  }
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .split(new RegExp(`(${escaped})`, "gi"))
    .map((part) => part.toLowerCase() === query.toLowerCase() ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part))
    .join("");
}

function normalizeSearchText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
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

function cssEscape(value) {
  if (window.CSS?.escape) {
    return CSS.escape(String(value || ""));
  }
  return String(value || "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
