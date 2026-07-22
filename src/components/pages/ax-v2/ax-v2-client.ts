export {};

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'auto' | 'dark' | 'light';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = 'ax-v2-turnstile-api';
let turnstilePromise: Promise<TurnstileApi> | undefined;

function emitAnalytics(event: string, parameters: Record<string, unknown> = {}) {
  if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
  window.dataLayer.push({ event, ...parameters });
}

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstilePromise) return turnstilePromise;

  turnstilePromise = new Promise<TurnstileApi>((resolve, reject) => {
    const settle = () => {
      const api = window.turnstile;
      if (api) resolve(api);
      else reject(new Error('Turnstile API did not initialize'));
    };
    const fail = () => reject(new Error('Turnstile API failed to load'));
    const installed = document.querySelector<HTMLScriptElement>(`#${TURNSTILE_SCRIPT_ID}`);
    if (installed) {
      installed.onload = settle;
      installed.onerror = fail;
      return;
    }

    const script = Object.assign(document.createElement('script'), {
      id: TURNSTILE_SCRIPT_ID,
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
      async: true,
      defer: true,
      onload: settle,
      onerror: fail,
    });
    document.head.appendChild(script);
  });

  return turnstilePromise;
}

class AxV2HeroMediaController {
  private visible = false;
  private sourceConnected = false;
  private readonly mobile = window.matchMedia('(max-width: 720px)');
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor(
    private readonly media: HTMLElement,
    private readonly video: HTMLVideoElement,
    private readonly source: HTMLSourceElement,
  ) {}

  mount() {
    this.media.dataset.heroInitialized = this.posterMode();
    this.showPoster();

    new IntersectionObserver(([entry]) => {
      this.visible = Boolean(
        entry?.isIntersecting && entry.intersectionRect.width && entry.intersectionRect.height,
      );
      this.reconcile();
    }).observe(this.media);

    document.addEventListener('visibilitychange', this.reconcile);
    this.mobile.addEventListener('change', this.handlePreferenceChange);
    this.reduced.addEventListener('change', this.handlePreferenceChange);
    this.video.addEventListener('playing', this.handlePlaying);
    this.video.addEventListener('error', this.showPoster);
  }

  private posterMode() {
    if (this.mobile.matches) return 'mobile-poster';
    if (this.reduced.matches) return 'reduced-poster';
    return 'true';
  }

  private canPlay() {
    return this.visible && !document.hidden && !this.mobile.matches && !this.reduced.matches;
  }

  private showPoster = () => {
    this.media.classList.remove('is-video-playing');
    this.media.classList.add('is-video-reset');
    this.video.pause();
  };

  private disconnectSource() {
    this.showPoster();
    if (!this.sourceConnected) return;
    this.source.removeAttribute('src');
    this.video.load();
    this.sourceConnected = false;
  }

  private connectSource() {
    if (this.sourceConnected) return;
    this.source.src = this.source.dataset.src ?? '';
    this.video.load();
    this.sourceConnected = true;
  }

  private reconcile = () => {
    if (!this.canPlay()) {
      if (this.mobile.matches || this.reduced.matches) this.disconnectSource();
      else this.showPoster();
      return;
    }
    this.connectSource();
    this.media.classList.remove('is-video-reset');
    void this.video.play().catch(this.showPoster);
  };

  private handlePreferenceChange = () => {
    this.media.dataset.heroInitialized = this.posterMode();
    this.reconcile();
  };

  private handlePlaying = () => {
    if (!this.canPlay()) {
      this.showPoster();
      return;
    }
    this.media.classList.remove('is-video-reset');
    this.media.classList.add('is-video-playing');
  };
}

function initializeHeroVideo(page: HTMLElement) {
  const media = page.querySelector<HTMLElement>('[data-hero-media]');
  const video = media?.querySelector<HTMLVideoElement>('[data-hero-video]');
  const source = video?.querySelector<HTMLSourceElement>('source[data-src]');
  if (!media || !video || !source || media.dataset.heroInitialized) return;
  new AxV2HeroMediaController(media, video, source).mount();
}

function initializeCarousel(root: HTMLElement) {
  const trackElement = root.querySelector<HTMLElement>('[data-testimonial-track]');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-testimonial-slide]'));
  const previous = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  if (!trackElement || slides.length === 0 || !previous || !next || !status) return;

  let activeIndex = 0;
  const update = (index: number, announce = true) => {
    activeIndex = Math.max(0, Math.min(slides.length - 1, index));
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === slides.length - 1;
    if (announce) status.textContent = slides[activeIndex]?.dataset.slideLabel ?? '';
  };

  const scrollTo = (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    trackElement.scrollTo({
      left: slide.offsetLeft - trackElement.offsetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
    update(index);
  };

  previous.addEventListener('click', () => scrollTo(activeIndex - 1));
  next.addEventListener('click', () => scrollTo(activeIndex + 1));
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollTo(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollTo(activeIndex + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      scrollTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      scrollTo(slides.length - 1);
    }
  });

  let scrollTimer = 0;
  trackElement.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const viewportCenter = trackElement.scrollLeft + trackElement.clientWidth / 2;
        const nearestIndex = slides.reduce((nearest, slide, index) => {
          const targetCenter = slide.offsetLeft - trackElement.offsetLeft + slide.offsetWidth / 2;
          const nearestSlide = slides[nearest];
          const nearestCenter = nearestSlide
            ? nearestSlide.offsetLeft - trackElement.offsetLeft + nearestSlide.offsetWidth / 2
            : 0;
          return Math.abs(targetCenter - viewportCenter) < Math.abs(nearestCenter - viewportCenter)
            ? index
            : nearest;
        }, 0);
        update(nearestIndex, nearestIndex !== activeIndex);
      }, 140);
    },
    { passive: true },
  );
}

function initializeTabs(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab-button]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-tab-panel]'));
  if (buttons.length === 0 || panels.length !== buttons.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopTabs = window.matchMedia('(min-width: 901px)');
  let activeIndex = 0;
  let autoAdvanceTimer = 0;
  let isVisible = false;
  let isPaused = false;

  const stopAutoAdvance = () => {
    window.clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = 0;
  };

  const startAutoAdvance = () => {
    stopAutoAdvance();
    if (!isVisible || isPaused || reducedMotion.matches || !desktopTabs.matches || document.hidden)
      return;
    autoAdvanceTimer = window.setInterval(() => {
      select((activeIndex + 1) % buttons.length, false, false);
    }, 2200);
  };

  const select = (index: number, focus = false, restart = true) => {
    const nextIndex = Math.max(0, Math.min(buttons.length - 1, index));
    activeIndex = nextIndex;
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === nextIndex;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panels[buttonIndex]?.setAttribute('aria-hidden', String(!selected));
    });
    if (focus) buttons[nextIndex]?.focus();
    if (restart) startAutoAdvance();
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        select((index + 1) % buttons.length, true);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        select((index - 1 + buttons.length) % buttons.length, true);
      } else if (event.key === 'Home') {
        event.preventDefault();
        select(0, true);
      } else if (event.key === 'End') {
        event.preventDefault();
        select(buttons.length - 1, true);
      }
    });
  });

  root.addEventListener('pointerenter', () => {
    isPaused = true;
    stopAutoAdvance();
  });
  root.addEventListener('pointerleave', () => {
    isPaused = false;
    startAutoAdvance();
  });
  root.addEventListener('focusin', () => {
    isPaused = true;
    stopAutoAdvance();
  });
  root.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
    isPaused = false;
    startAutoAdvance();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
      startAutoAdvance();
    },
    { threshold: 0.45 },
  );
  observer.observe(root);

  reducedMotion.addEventListener('change', startAutoAdvance);
  desktopTabs.addEventListener('change', startAutoAdvance);
  document.addEventListener('visibilitychange', startAutoAdvance);
}

function initializeAccordion(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-accordion-button]'));
  buttons.forEach((button) => {
    const panelId = button.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });
}

function initializeDialog(page: HTMLElement) {
  const dialog = page.querySelector<HTMLDialogElement>('[data-ax-v2-dialog]');
  const openers = Array.from(page.querySelectorAll<HTMLButtonElement>('[data-dialog-open]'));
  const closer = dialog?.querySelector<HTMLButtonElement>('[data-dialog-close]');
  if (!dialog || !closer) return;

  let returnFocus: HTMLElement | null = null;
  const close = () => {
    if (!dialog.open) return;
    dialog.close();
    returnFocus?.focus();
  };

  openers.forEach((button) => {
    button.addEventListener('click', () => {
      returnFocus = button;
      dialog.showModal();
      requestAnimationFrame(() => {
        dialog.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
      });
    });
  });
  closer.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => returnFocus?.focus());
}

function collectUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
    const value = params.get(`utm_${key}`);
    if (value) utm[key] = value.slice(0, 200);
  }
  return utm;
}

function initializeLeadForm(form: HTMLFormElement) {
  const enabled = form.dataset.deliveryEnabled === 'true';
  const startedAt = form.querySelector<HTMLInputElement>('[data-started-at]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const turnstileContainer = form.querySelector<HTMLElement>('[data-turnstile-container]');
  if (!startedAt || !submit || !submitLabel || !status) return;
  startedAt.value = String(Date.now());
  if (!enabled) return;

  let turnstileToken = '';
  let turnstileWidgetId = '';
  let started = false;
  const markStarted = () => {
    if (started) return;
    started = true;
    emitAnalytics('form_start', { form_id: form.id, form_name: form.name, locale: 'ko' });
  };
  form.addEventListener('input', markStarted, { once: true });

  if (turnstileContainer) {
    const initializeTurnstile = async () => {
      if (turnstileWidgetId) return;
      try {
        const api = await loadTurnstile();
        turnstileWidgetId = api.render(turnstileContainer, {
          sitekey: form.dataset.turnstileSitekey ?? '',
          theme: 'light',
          callback: (token) => {
            turnstileToken = token;
          },
          'expired-callback': () => {
            turnstileToken = '';
          },
          'error-callback': () => {
            turnstileToken = '';
          },
        });
      } catch {
        status.textContent = '보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
        status.className = 'ax-v2-form-status is-error';
      }
    };
    form.addEventListener('focusin', () => void initializeTurnstile(), { once: true });
  }

  const clearErrors = () => {
    form
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[aria-invalid="true"]')
      .forEach((field) => {
        field.removeAttribute('aria-invalid');
      });
    form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((element) => {
      element.textContent = '';
    });
  };

  const showFieldErrors = (fields: Record<string, string>) => {
    const messages: Record<string, string> = {
      INVALID_NAME: '성함을 확인해 주세요.',
      INVALID_EMAIL: '이메일 주소를 확인해 주세요.',
      INVALID_PHONE: '전화번호를 확인해 주세요.',
      MESSAGE_TOO_LONG: '문의내용은 2,000자 이내로 입력해 주세요.',
      PRIVACY_CONSENT_REQUIRED: '개인정보처리방침 동의가 필요합니다.',
    };
    for (const [name, code] of Object.entries(fields)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.setAttribute('aria-invalid', 'true');
      }
      const error = form.querySelector<HTMLElement>(`[data-field-error="${name}"]`);
      if (error) error.textContent = messages[code] ?? '입력 내용을 확인해 주세요.';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    if (!form.checkValidity()) {
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(':invalid').forEach((field) => {
        field.setAttribute('aria-invalid', 'true');
      });
      form.reportValidity();
      status.textContent = '입력 내용을 확인해 주세요.';
      status.className = 'ax-v2-form-status is-error';
      return;
    }
    if (!turnstileToken) {
      status.textContent = '보안 확인을 완료해 주세요.';
      status.className = 'ax-v2-form-status is-error';
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      message: String(data.get('message') ?? ''),
      privacy_consent: data.get('privacy_consent') === 'true',
      locale: 'ko',
      started_at: Number(startedAt.value),
      utm: collectUtm(),
      website: String(data.get('website') ?? ''),
      turnstile_token: turnstileToken,
    };

    submit.disabled = true;
    submitLabel.textContent = '전송 중입니다';
    status.textContent = '';
    status.className = 'ax-v2-form-status';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: { code?: string; fields?: Record<string, string> };
      };
      if (!response.ok || !result.ok) {
        if (result.error?.fields) showFieldErrors(result.error.fields);
        status.textContent =
          result.error?.code === 'DELIVERY_NOT_CONFIGURED'
            ? '상담 메일 접수가 아직 활성화되지 않았습니다.'
            : '상담 요청을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.';
        status.className = 'ax-v2-form-status is-error';
        return;
      }

      emitAnalytics('form_submit', { form_id: form.id, form_name: form.name, locale: 'ko' });
      emitAnalytics('ax_lead_submit_success', { form_id: form.id, locale: 'ko' });
      form.reset();
      startedAt.value = String(Date.now());
      status.textContent = '상담 요청이 접수되었습니다.';
      status.className = 'ax-v2-form-status is-success';
      status.focus({ preventScroll: true });
    } catch {
      status.textContent = '상담 요청을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.';
      status.className = 'ax-v2-form-status is-error';
    } finally {
      submit.disabled = false;
      submitLabel.textContent = '2주 진단 상담 신청하기';
      if (window.turnstile && turnstileWidgetId) window.turnstile.reset(turnstileWidgetId);
      turnstileToken = '';
    }
  });
}

function initializeAnimatedDiagram(root: HTMLElement) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      root.dataset.motionActive = String(Boolean(entry?.isIntersecting && !document.hidden));
    },
    { threshold: 0.15 },
  );
  observer.observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) root.dataset.motionActive = 'false';
  });
}

function initialize() {
  const page = document.querySelector<HTMLElement>('[data-ax-v2-page]');
  if (!page || page.dataset.initialized === 'true') return;
  page.dataset.initialized = 'true';
  initializeHeroVideo(page);
  page.querySelectorAll<HTMLElement>('[data-testimonial-carousel]').forEach(initializeCarousel);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-tabs]').forEach(initializeTabs);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-accordion]').forEach(initializeAccordion);
  page.querySelectorAll<HTMLFormElement>('[data-ax-v2-lead-form]').forEach(initializeLeadForm);
  page.querySelectorAll<HTMLElement>('[data-ceal-diagrams]').forEach(initializeAnimatedDiagram);
  initializeDialog(page);
}

initialize();
document.addEventListener('astro:page-load', initialize);
