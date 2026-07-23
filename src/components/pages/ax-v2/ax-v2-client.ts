export {};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function emitAnalytics(event: string, parameters: Record<string, unknown> = {}) {
  if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
  window.dataLayer.push({ event, ...parameters });
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

  const scrollTo = (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    trackElement.scrollTo({
      left:
        slide.offsetLeft -
        trackElement.offsetLeft -
        Math.max(0, (trackElement.clientWidth - slide.offsetWidth) / 2),
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

function initializeHoldDialog(page: HTMLElement) {
  const dialog = page.querySelector<HTMLDialogElement>('[data-ax-v2-hold-dialog]');
  const closer = dialog?.querySelector<HTMLButtonElement>('[data-ax-v2-hold-close]');
  if (!dialog || !closer) return;

  let returnFocus: HTMLElement | null = null;
  const close = () => {
    if (dialog.open) dialog.close();
  };

  page.addEventListener('ax:lead-ready', (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    returnFocus = form?.querySelector<HTMLButtonElement>('button[type="submit"]') ?? null;
    const leadDialog = page.querySelector<HTMLDialogElement>('[data-ax-v2-dialog]');
    if (leadDialog?.open) leadDialog.close();
    requestAnimationFrame(() => {
      dialog.showModal();
      closer.focus();
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

function initializeLeadForm(form: HTMLFormElement) {
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const formAlert = form.querySelector<HTMLElement>('[data-form-alert]');
  if (!submit || !submitLabel || !status || !formAlert) return;
  const defaultSubmitLabel = submitLabel.textContent ?? '2주 진단 상담 신청하기';

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

  form.addEventListener('input', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    if (!field.checkValidity()) return;
    field.removeAttribute('aria-invalid');
    const error = form.querySelector<HTMLElement>(`[data-field-error="${field.name}"]`);
    if (error) error.textContent = '';
    if (!form.querySelector('[aria-invalid="true"]')) {
      formAlert.hidden = true;
      formAlert.textContent = '';
    }
  });

  form.addEventListener('submit', (event) => {
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
    submit.disabled = true;
    submitLabel.textContent = '입력 확인 완료';
    status.textContent = '상담 신청 입력 내용이 확인되었습니다.';
    status.className = 'ax-v2-form-status is-success';
    status.focus({ preventScroll: true });
    form.dispatchEvent(new CustomEvent('ax:lead-ready', { bubbles: true }));
    window.setTimeout(() => {
      submit.disabled = false;
      submitLabel.textContent = defaultSubmitLabel;
    }, 350);
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

function initialize() {
  const page = document.querySelector<HTMLElement>('[data-ax-v2-page]');
  if (!page || page.dataset.initialized === 'true') return;
  page.dataset.initialized = 'true';
  initializeHeroVideo(page);
  initializePartnerBadge(page);
  page.querySelectorAll<HTMLElement>('[data-testimonial-carousel]').forEach(initializeCarousel);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-tabs]').forEach(initializeTabs);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-accordion]').forEach(initializeAccordion);
  page.querySelectorAll<HTMLFormElement>('[data-ax-v2-lead-form]').forEach(initializeLeadForm);
  page.querySelectorAll<HTMLElement>('[data-ceal-diagrams]').forEach(initializeAnimatedDiagram);
  initializeBrochureLinks(page);
  initializeDialog(page);
  initializeHoldDialog(page);
}

initialize();
document.addEventListener('astro:page-load', initialize);
