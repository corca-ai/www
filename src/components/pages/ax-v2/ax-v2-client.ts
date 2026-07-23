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

function initializePartnerBadge(page: HTMLElement) {
  const badge = page.querySelector<HTMLElement>('.ax-v2-partner-badge');
  const hero = page.querySelector<HTMLElement>('#ax-top');
  if (!badge || !hero) return;

  const compact = window.matchMedia('(max-width: 900px)');
  let frame = 0;
  let badgeTop = 0;
  let badgeHeight = 0;
  let exiting = false;

  const measure = () => {
    badgeTop = Number.parseFloat(window.getComputedStyle(badge).top) || 0;
    badgeHeight = badge.getBoundingClientRect().height;
  };

  const render = () => {
    frame = 0;
    if (compact.matches) {
      exiting = false;
      badge.classList.remove('is-exiting');
      badge.style.removeProperty('--ax-v2-badge-exit-progress');
      badge.setAttribute('aria-hidden', 'false');
      return;
    }

    badge.style.removeProperty('--ax-v2-badge-exit-progress');

    const heroBottom = hero.getBoundingClientRect().bottom;
    const exitLine = badgeTop + badgeHeight + 80;
    const shouldExit = exiting ? heroBottom <= exitLine + 12 : heroBottom <= exitLine;
    if (shouldExit === exiting) return;
    exiting = shouldExit;
    badge.classList.toggle('is-exiting', shouldExit);
    badge.setAttribute('aria-hidden', String(shouldExit));
  };

  const update = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(render);
  };

  const refresh = () => {
    measure();
    update();
  };

  measure();
  render();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  compact.addEventListener('change', refresh);
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

  const getScrollTarget = (index: number) => {
    const slide = slides[index];
    if (!slide) return 0;
    return slide.offsetLeft + slide.offsetWidth / 2 - trackElement.clientWidth / 2;
  };

  const revealCenteredSlide = () => {
    const trackRect = trackElement.getBoundingClientRect();
    const viewportCenter = trackRect.left + trackRect.width / 2;
    const centeredSlide = slides.reduce((nearest, slide) => {
      const nearestRect = nearest.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const nearestDistance = Math.abs(nearestRect.left + nearestRect.width / 2 - viewportCenter);
      const slideDistance = Math.abs(slideRect.left + slideRect.width / 2 - viewportCenter);
      return slideDistance < nearestDistance ? slide : nearest;
    });
    const slideRect = centeredSlide.getBoundingClientRect();
    const centeredDistance = Math.abs(slideRect.left + slideRect.width / 2 - viewportCenter);
    const visibleHeight =
      Math.min(window.innerHeight, slideRect.bottom) - Math.max(0, slideRect.top);
    if (centeredDistance > 4 || visibleHeight < slideRect.height * 0.98) return;
    centeredSlide.classList.add('is-highlight-drawn');
  };

  const scrollTo = (index: number) => {
    if (!slides[index]) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    trackElement.scrollTo({
      left: getScrollTarget(index),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
    update(index);
  };

  let resizeFrame = 0;
  const alignActiveSlide = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      trackElement.scrollTo({ left: getScrollTarget(activeIndex), behavior: 'auto' });
      revealCenteredSlide();
    });
  };

  const resizeObserver = new ResizeObserver(alignActiveSlide);
  resizeObserver.observe(trackElement);
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.98)) {
        revealCenteredSlide();
      }
    },
    { threshold: [0.45, 0.75, 0.98, 1] },
  );
  slides.forEach((slide) => {
    visibilityObserver.observe(slide);
  });

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
          const targetCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const nearestSlide = slides[nearest];
          const nearestCenter = nearestSlide
            ? nearestSlide.offsetLeft + nearestSlide.offsetWidth / 2
            : 0;
          return Math.abs(targetCenter - viewportCenter) < Math.abs(nearestCenter - viewportCenter)
            ? index
            : nearest;
        }, 0);
        update(nearestIndex, nearestIndex !== activeIndex);
        revealCenteredSlide();
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
  let autoAdvanceTimer = 0;
  let isVisible = false;
  let rotationIndex = 0;
  let hasStarted = false;
  let hasCompleted = false;

  const stopAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = 0;
  };

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

  const canAutoAdvance = () =>
    isVisible && !hasCompleted && !reducedMotion.matches && desktopTabs.matches && !document.hidden;

  const scheduleAutoAdvance = () => {
    stopAutoAdvance();
    if (!canAutoAdvance()) return;
    autoAdvanceTimer = window.setTimeout(() => {
      if (rotationIndex < buttons.length - 1) {
        rotationIndex += 1;
        select(rotationIndex);
        scheduleAutoAdvance();
        return;
      }
      rotationIndex = 0;
      select(0);
      hasCompleted = true;
      stopAutoAdvance();
    }, 2600);
  };

  const startOrResumeAutoAdvance = () => {
    if (!canAutoAdvance()) {
      stopAutoAdvance();
      return;
    }
    if (!hasStarted) {
      hasStarted = true;
      rotationIndex = 0;
      select(0);
    }
    scheduleAutoAdvance();
  };

  const cancelAutoAdvance = () => {
    hasCompleted = true;
    stopAutoAdvance();
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      cancelAutoAdvance();
      select(index);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        cancelAutoAdvance();
        select((index + 1) % buttons.length, true);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        cancelAutoAdvance();
        select((index - 1 + buttons.length) % buttons.length, true);
      } else if (event.key === 'Home') {
        event.preventDefault();
        cancelAutoAdvance();
        select(0, true);
      } else if (event.key === 'End') {
        event.preventDefault();
        cancelAutoAdvance();
        select(buttons.length - 1, true);
      }
    });
  });

  root.addEventListener('focusin', () => {
    cancelAutoAdvance();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
      startOrResumeAutoAdvance();
    },
    { threshold: 0.55 },
  );
  observer.observe(root);

  reducedMotion.addEventListener('change', startOrResumeAutoAdvance);
  desktopTabs.addEventListener('change', startOrResumeAutoAdvance);
  document.addEventListener('visibilitychange', startOrResumeAutoAdvance);
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

function initializeSuccessDialog(page: HTMLElement) {
  const dialog = page.querySelector<HTMLDialogElement>('[data-ax-v2-success-dialog]');
  const closer = dialog?.querySelector<HTMLButtonElement>('[data-ax-v2-success-close]');
  if (!dialog || !closer) return;

  let returnFocus: HTMLElement | null = null;
  let closeTimer = 0;
  let finishTimer = 0;

  const clearTimers = () => {
    window.clearTimeout(closeTimer);
    window.clearTimeout(finishTimer);
  };

  const close = () => {
    clearTimers();
    if (!dialog.open) return;
    dialog.classList.add('is-closing');
    finishTimer = window.setTimeout(() => dialog.close(), 280);
  };

  page.addEventListener('ax:lead-sent', (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    returnFocus = form?.querySelector<HTMLButtonElement>('button[type="submit"]') ?? null;
    const leadDialog = page.querySelector<HTMLDialogElement>('[data-ax-v2-dialog]');
    if (leadDialog?.open) leadDialog.close();
    requestAnimationFrame(() => {
      clearTimers();
      dialog.classList.remove('is-counting', 'is-closing');
      if (dialog.open) dialog.close();
      dialog.showModal();
      closer.focus();
      requestAnimationFrame(() => dialog.classList.add('is-counting'));
      closeTimer = window.setTimeout(close, 2_000);
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
  dialog.addEventListener('close', () => {
    clearTimers();
    dialog.classList.remove('is-counting', 'is-closing');
    returnFocus?.focus();
  });
}

function initializeLeadForm(form: HTMLFormElement) {
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const formAlert = form.querySelector<HTMLElement>('[data-form-alert]');
  if (!submit || !submitLabel || !status || !formAlert) return;
  const defaultSubmitLabel = submitLabel.textContent ?? '2주 진단 상담 신청하기';
  const siteKey = form.dataset.turnstileSiteKey ?? '';
  const locale = form.dataset.locale ?? 'ko';
  let startedAt = Date.now();
  let turnstileToken = '';
  let turnstileWidgetId: string | undefined;
  let submitting = false;

  const syncSubmitState = () => {
    const controls = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
    );
    const isReady = controls.every((field) => !field.willValidate || field.validity.valid);
    submit.disabled = submitting || !isReady;
    submit.classList.toggle('is-ready', isReady && !submitting);
  };

  const clearErrors = () => {
    form
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[aria-invalid="true"]')
      .forEach((field) => {
        field.removeAttribute('aria-invalid');
      });
    form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((element) => {
      element.textContent = '';
    });
    formAlert.hidden = true;
    formAlert.textContent = '';
  };

  const resetTurnstile = () => {
    turnstileToken = '';
    if (window.turnstile && turnstileWidgetId !== undefined) {
      window.turnstile.reset(turnstileWidgetId);
    }
  };

  const showRequestError = (code: string) => {
    const messages: Record<string, string> = {
      BOT_CHECK_FAILED: '보안 확인을 다시 완료해 주세요.',
      BOT_CHECK_NOT_CONFIGURED: '보안 확인 설정을 불러오지 못했습니다.',
      BOT_CHECK_UNAVAILABLE: '보안 확인 서비스에 일시적인 문제가 있습니다.',
      DELIVERY_FAILED: '상담 신청 전송에 실패했습니다.',
      DELIVERY_NOT_CONFIGURED: '상담 접수 설정을 불러오지 못했습니다.',
      FORM_EXPIRED: '입력 시간이 만료되었습니다. 다시 제출해 주세요.',
      FORM_SUBMITTED_TOO_QUICKLY: '잠시 후 다시 제출해 주세요.',
      RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
      VALIDATION_ERROR: '입력 내용을 다시 확인해 주세요.',
      network: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
      unknown: '상담 신청을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    };
    formAlert.textContent =
      messages[code] ?? messages.unknown ?? '상담 신청을 전송하지 못했습니다.';
    formAlert.hidden = false;
    formAlert.focus({ preventScroll: true });
    status.textContent = formAlert.textContent;
    status.className = 'ax-v2-form-status is-error';
    emitAnalytics('form_error', { error_code: code, form_id: 'ax_consultation' });
  };

  const showFieldErrors = (fields: Record<string, string>) => {
    const messages: Record<string, string> = {
      INVALID_NAME: '성함을 확인해 주세요.',
      INVALID_EMAIL: '이메일 주소를 확인해 주세요.',
      INVALID_PHONE: '전화번호는 하이픈 없이 숫자 8~15자리로 입력해 주세요.',
      MESSAGE_REQUIRED: '문의내용을 입력해 주세요.',
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

  const fieldCode = (field: HTMLInputElement | HTMLTextAreaElement) => {
    if (field.name === 'name') return 'INVALID_NAME';
    if (field.name === 'email') return 'INVALID_EMAIL';
    if (field.name === 'phone') return 'INVALID_PHONE';
    if (field.name === 'message') return 'MESSAGE_REQUIRED';
    if (field.name === 'privacy_consent') return 'PRIVACY_CONSENT_REQUIRED';
    return 'INVALID_NAME';
  };

  const revealValidationAlert = (invalidFields: Array<HTMLInputElement | HTMLTextAreaElement>) => {
    const fields: Record<string, string> = {};
    for (const field of invalidFields) fields[field.name] = fieldCode(field);
    showFieldErrors(fields);
    formAlert.textContent = '필수 항목을 모두 올바르게 입력해 주세요.';
    formAlert.hidden = false;
    formAlert.focus({ preventScroll: true });
    const firstInvalid = invalidFields[0];
    if (!firstInvalid) return;
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 320);
  };

  const phoneInput = form.elements.namedItem('phone');
  if (phoneInput instanceof HTMLInputElement) {
    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '').slice(0, 15);
      if (phoneInput.value !== digits) phoneInput.value = digits;
    });
  }

  form.addEventListener(
    'invalid',
    (event) => {
      event.preventDefault();
    },
    true,
  );

  const turnstileContainer = form.querySelector<HTMLElement>('[data-form-turnstile]');
  if (siteKey && turnstileContainer) {
    void loadTurnstile()
      .then((turnstile) => {
        turnstileWidgetId = turnstile.render(turnstileContainer, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => {
            turnstileToken = token;
            if (status.classList.contains('is-error')) {
              status.textContent = '보안 확인이 완료되었습니다.';
              status.className = 'ax-v2-form-status';
            }
          },
          'expired-callback': () => {
            turnstileToken = '';
          },
          'error-callback': () => {
            turnstileToken = '';
          },
        });
      })
      .catch(() => showRequestError('BOT_CHECK_UNAVAILABLE'));
  }

  form.addEventListener('input', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    if (!field.checkValidity()) {
      syncSubmitState();
      return;
    }
    field.removeAttribute('aria-invalid');
    const error = form.querySelector<HTMLElement>(`[data-field-error="${field.name}"]`);
    if (error) error.textContent = '';
    if (!form.querySelector('[aria-invalid="true"]')) {
      formAlert.hidden = true;
      formAlert.textContent = '';
    }
    syncSubmitState();
  });
  form.addEventListener('change', syncSubmitState);
  syncSubmitState();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    if (!form.checkValidity()) {
      const invalidFields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(':invalid'),
      );
      revealValidationAlert(invalidFields);
      status.textContent = '입력 내용을 확인해 주세요.';
      status.className = 'ax-v2-form-status is-error';
      return;
    }
    if (siteKey && !turnstileToken) {
      showRequestError('BOT_CHECK_FAILED');
      return;
    }

    submitting = true;
    syncSubmitState();
    submitLabel.textContent = form.dataset.sendingLabel ?? '상담 신청을 전송하고 있습니다.';
    status.textContent = '상담 신청을 안전하게 전송하고 있습니다.';
    status.className = 'ax-v2-form-status';
    const data = new FormData(form);
    const search = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      ['source', 'medium', 'campaign', 'content', 'term']
        .map((key) => [key, search.get(`utm_${key}`)] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    );
    const privacyConsent = form.elements.namedItem('privacy_consent');
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      message: String(data.get('message') ?? ''),
      privacy_consent: privacyConsent instanceof HTMLInputElement && privacyConsent.checked,
      website: String(data.get('website') ?? ''),
      started_at: startedAt,
      turnstile_token: turnstileToken,
      utm,
      locale,
    };
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 15_000);

    emitAnalytics('form_submit', { form_id: 'ax_consultation', locale });

    try {
      const response = await fetch('/api/ax/consultations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: requestController.signal,
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: { code?: string; fields?: Record<string, string> };
      } | null;

      if (!response.ok || !result?.ok) {
        const fields = result?.error?.fields;
        if (fields) showFieldErrors(fields);
        resetTurnstile();
        showRequestError(result?.error?.code ?? 'unknown');
        return;
      }

      form.reset();
      resetTurnstile();
      startedAt = Date.now();
      status.textContent = '상담 신청이 잘 전송되었습니다.';
      status.className = 'ax-v2-form-status is-success';
      status.focus({ preventScroll: true });
      emitAnalytics('generate_lead', { form_id: 'ax_consultation', locale });
      form.dispatchEvent(new CustomEvent('ax:lead-sent', { bubbles: true }));
    } catch {
      resetTurnstile();
      showRequestError('network');
    } finally {
      window.clearTimeout(requestTimeout);
      submitting = false;
      syncSubmitState();
      submitLabel.textContent = defaultSubmitLabel;
    }
  });
}

function initializeAnimatedDiagram(root: HTMLElement) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const isIntersecting = Boolean(entry?.isIntersecting);
      root.dataset.motionActive = String(isIntersecting && !document.hidden);
      if (isIntersecting) root.classList.add('is-sequence-visible');
    },
    { threshold: 0.15 },
  );
  observer.observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) root.dataset.motionActive = 'false';
  });
}

function initializeBrochureLinks(page: HTMLElement) {
  page.querySelectorAll<HTMLAnchorElement>('[data-ax-brochure-link]').forEach((link) => {
    link.addEventListener('click', () => {
      emitAnalytics('ax_deck_click', {
        deck_id: 'corca-ax-consulting',
        link_url: link.href,
        link_location: 'ax_contact',
      });
    });
  });
}

function initializeCompoundParallax(page: HTMLElement) {
  const section = page.querySelector<HTMLElement>('[data-compound-parallax]');
  if (!section) return;

  const compact = window.matchMedia('(max-width: 720px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let listening = false;

  const render = () => {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const rate = compact.matches ? 0.12 : 0.18;
    const limit = compact.matches ? 44 : 96;
    const offset = Math.max(-limit, Math.min(limit, (viewportCenter - sectionCenter) * rate));
    section.style.setProperty('--ax-v2-compound-media-y', `${offset}px`);
  };

  const update = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(render);
  };

  const stop = () => {
    if (!listening) return;
    listening = false;
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    section.style.removeProperty('--ax-v2-compound-media-y');
  };

  const start = () => {
    if (listening) return;
    listening = true;
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  };

  const reconcile = () => {
    if (!reducedMotion.matches) start();
    else stop();
  };

  compact.addEventListener('change', update);
  reducedMotion.addEventListener('change', reconcile);
  reconcile();
}

function initialize() {
  const page = document.querySelector<HTMLElement>('[data-ax-v2-page]');
  if (!page || page.dataset.initialized === 'true') return;
  page.dataset.initialized = 'true';
  initializeHeroVideo(page);
  initializePartnerBadge(page);
  initializeCompoundParallax(page);
  page.querySelectorAll<HTMLElement>('[data-testimonial-carousel]').forEach(initializeCarousel);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-tabs]').forEach(initializeTabs);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-accordion]').forEach(initializeAccordion);
  page.querySelectorAll<HTMLFormElement>('[data-ax-v2-lead-form]').forEach(initializeLeadForm);
  page.querySelectorAll<HTMLElement>('[data-ceal-diagrams]').forEach(initializeAnimatedDiagram);
  initializeBrochureLinks(page);
  initializeDialog(page);
  initializeSuccessDialog(page);
}

initialize();
document.addEventListener('astro:page-load', initialize);
