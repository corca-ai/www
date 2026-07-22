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

function track(event: string, parameters: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...parameters });
}

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstilePromise) return turnstilePromise;

  turnstilePromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    const handleLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile API did not initialize'));
    };
    const handleError = () => reject(new Error('Turnstile API failed to load'));
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existing) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });

  return turnstilePromise;
}

function initializeHeroVideo(page: HTMLElement) {
  const media = page.querySelector<HTMLElement>('[data-hero-media]');
  const video = media?.querySelector<HTMLVideoElement>('[data-hero-video]');
  const source = video?.querySelector<HTMLSourceElement>('source[data-src]');
  if (!media || !video || !source || media.dataset.heroInitialized) return;

  const mobileViewport = window.matchMedia('(max-width: 720px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (mobileViewport.matches || reducedMotion.matches) {
    media.dataset.heroInitialized = mobileViewport.matches ? 'mobile-poster' : 'reduced-poster';
    media.classList.remove('is-video-playing');
    media.classList.add('is-video-reset');
    const initializeWhenEligible = () => {
      if (mobileViewport.matches || reducedMotion.matches) return;
      mobileViewport.removeEventListener('change', initializeWhenEligible);
      reducedMotion.removeEventListener('change', initializeWhenEligible);
      delete media.dataset.heroInitialized;
      initializeHeroVideo(page);
    };
    mobileViewport.addEventListener('change', initializeWhenEligible);
    reducedMotion.addEventListener('change', initializeWhenEligible);
    return;
  }

  media.dataset.heroInitialized = 'true';
  let visible = false;
  let loaded = false;

  const stop = () => {
    media.classList.remove('is-video-playing');
    media.classList.add('is-video-reset');
    video.pause();
  };

  const unload = () => {
    stop();
    source.removeAttribute('src');
    video.load();
    loaded = false;
  };

  const play = () => {
    if (!visible || document.hidden || mobileViewport.matches || reducedMotion.matches) {
      stop();
      return;
    }
    if (!loaded) {
      source.src = source.dataset.src ?? '';
      video.load();
      loaded = true;
    }
    media.classList.remove('is-video-reset');
    void video.play().catch(stop);
  };

  video.addEventListener('playing', () => {
    if (!visible || document.hidden || mobileViewport.matches || reducedMotion.matches) {
      stop();
      return;
    }
    media.classList.remove('is-video-reset');
    media.classList.add('is-video-playing');
  });
  video.addEventListener('error', stop);

  const observer = new IntersectionObserver(([entry]) => {
    visible = Boolean(
      entry?.isIntersecting && entry.intersectionRect.width && entry.intersectionRect.height,
    );
    if (visible) play();
    else stop();
  });
  observer.observe(media);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else play();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) unload();
    else play();
  });
  mobileViewport.addEventListener('change', () => {
    if (mobileViewport.matches) unload();
    else play();
  });
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

  const select = (index: number, focus = false) => {
    const nextIndex = Math.max(0, Math.min(buttons.length - 1, index));
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === nextIndex;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panels[buttonIndex]?.setAttribute('aria-hidden', String(!selected));
    });
    if (focus) buttons[nextIndex]?.focus();
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
    track('form_start', { form_id: form.id, form_name: form.name, locale: 'ko' });
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

      track('form_submit', { form_id: form.id, form_name: form.name, locale: 'ko' });
      track('ax_lead_submit_success', { form_id: form.id, locale: 'ko' });
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
