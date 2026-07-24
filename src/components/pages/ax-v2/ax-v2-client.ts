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

const FORM_MESSAGES = {
  ko: {
    request: {
      DELIVERY_FAILED: '상담 신청 전송에 실패했습니다.',
      DELIVERY_NOT_CONFIGURED: '상담 접수 설정을 불러오지 못했습니다.',
      FORM_EXPIRED: '입력 시간이 만료되었습니다. 다시 제출해 주세요.',
      FORM_SUBMITTED_TOO_QUICKLY: '잠시 후 다시 제출해 주세요.',
      RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
      VALIDATION_ERROR: '입력 내용을 다시 확인해 주세요.',
      network: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
      unknown: '상담 신청을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    },
    fields: {
      INVALID_NAME: '성함을 확인해 주세요.',
      INVALID_EMAIL: '이메일 주소를 확인해 주세요.',
      INTEREST_REQUIRED: '관심 있는 컨설팅 형태를 하나 이상 선택해 주세요.',
      INVALID_INTEREST: '관심 있는 컨설팅 형태를 다시 확인해 주세요.',
      OTHER_INTEREST_REQUIRED: '기타 관심 분야를 입력해 주세요.',
      OTHER_INTEREST_TOO_LONG: '기타 관심 분야는 240자 이내로 입력해 주세요.',
      REASON_REQUIRED: '선택한 이유를 입력해 주세요.',
      REASON_TOO_LONG: '선택한 이유는 2,000자 이내로 입력해 주세요.',
      CROSS_BORDER_CONSENT_REQUIRED: '국외 이전에 대한 별도 동의가 필요합니다.',
    },
    fieldFallback: '입력 내용을 확인해 주세요.',
    required: '필수 항목을 모두 올바르게 입력해 주세요.',
    sending: '상담 신청을 안전하게 전송하고 있습니다.',
    sent: '상담 신청이 잘 전송되었습니다.',
  },
  en: {
    request: {
      DELIVERY_FAILED: 'We could not send your consultation request.',
      DELIVERY_NOT_CONFIGURED: 'The consultation service is not available right now.',
      FORM_EXPIRED: 'Your form session expired. Please submit it again.',
      FORM_SUBMITTED_TOO_QUICKLY: 'Please wait a moment and try again.',
      RATE_LIMITED: 'Too many requests. Please try again shortly.',
      VALIDATION_ERROR: 'Please review the information entered.',
      network: 'Check your network connection and try again.',
      unknown: 'We could not send your request. Please try again shortly.',
    },
    fields: {
      INVALID_NAME: 'Please check your name.',
      INVALID_EMAIL: 'Please check your email address.',
      INTEREST_REQUIRED: 'Select at least one consulting area.',
      INVALID_INTEREST: 'Please check the consulting areas selected.',
      OTHER_INTEREST_REQUIRED: 'Please describe the other area of interest.',
      OTHER_INTEREST_TOO_LONG: 'Please keep the other area under 240 characters.',
      REASON_REQUIRED: 'Please tell us why you selected these areas.',
      REASON_TOO_LONG: 'Please keep your reason under 2,000 characters.',
      CROSS_BORDER_CONSENT_REQUIRED: 'Separate consent is required for the international transfer.',
    },
    fieldFallback: 'Please review this field.',
    required: 'Please complete all required fields correctly.',
    sending: 'Sending your consultation request securely.',
    sent: 'Your consultation request has been sent.',
  },
  ja: {
    request: {
      DELIVERY_FAILED: '相談申請を送信できませんでした。',
      DELIVERY_NOT_CONFIGURED: '現在、相談受付サービスを利用できません。',
      FORM_EXPIRED: '入力時間が終了しました。もう一度送信してください。',
      FORM_SUBMITTED_TOO_QUICKLY: 'しばらくしてからもう一度お試しください。',
      RATE_LIMITED: 'リクエストが多すぎます。しばらくしてからお試しください。',
      VALIDATION_ERROR: '入力内容をご確認ください。',
      network: 'ネットワーク接続を確認して、もう一度お試しください。',
      unknown: '相談申請を送信できませんでした。しばらくしてからお試しください。',
    },
    fields: {
      INVALID_NAME: 'お名前をご確認ください。',
      INVALID_EMAIL: 'メールアドレスをご確認ください。',
      INTEREST_REQUIRED: '関心のあるコンサルティング内容を1つ以上選択してください。',
      INVALID_INTEREST: '選択したコンサルティング内容をご確認ください。',
      OTHER_INTEREST_REQUIRED: 'その他の関心内容を入力してください。',
      OTHER_INTEREST_TOO_LONG: 'その他の関心内容は240文字以内で入力してください。',
      REASON_REQUIRED: '選択した理由を入力してください。',
      REASON_TOO_LONG: '選択した理由は2,000文字以内で入力してください。',
      CROSS_BORDER_CONSENT_REQUIRED: '外国への移転について個別の同意が必要です。',
    },
    fieldFallback: '入力内容をご確認ください。',
    required: '必須項目を正しく入力してください。',
    sending: '相談申請を安全に送信しています。',
    sent: '相談申請を送信しました。',
  },
  zh: {
    request: {
      DELIVERY_FAILED: '咨询申请发送失败。',
      DELIVERY_NOT_CONFIGURED: '当前无法使用咨询服务。',
      FORM_EXPIRED: '填写时间已过期，请重新提交。',
      FORM_SUBMITTED_TOO_QUICKLY: '请稍候再试。',
      RATE_LIMITED: '请求过多，请稍后重试。',
      VALIDATION_ERROR: '请检查填写内容。',
      network: '请检查网络连接后重试。',
      unknown: '咨询申请未能发送，请稍后重试。',
    },
    fields: {
      INVALID_NAME: '请检查姓名。',
      INVALID_EMAIL: '请检查电子邮箱地址。',
      INTEREST_REQUIRED: '请至少选择一项咨询服务类型。',
      INVALID_INTEREST: '请检查选择的咨询服务类型。',
      OTHER_INTEREST_REQUIRED: '请填写其他感兴趣的服务类型。',
      OTHER_INTEREST_TOO_LONG: '其他服务类型请控制在240字以内。',
      REASON_REQUIRED: '请告诉我们您选择以上服务的原因。',
      REASON_TOO_LONG: '选择原因请控制在2,000字以内。',
      CROSS_BORDER_CONSENT_REQUIRED: '需要单独同意个人信息跨境传输。',
    },
    fieldFallback: '请检查填写内容。',
    required: '请正确填写所有必填项。',
    sending: '正在安全发送咨询申请。',
    sent: '咨询申请已发送。',
  },
} as const;

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
  let closeTimer = 0;
  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1_600;
    closeTimer = window.setTimeout(() => dialog.close(), duration);
  };

  openers.forEach((button) => {
    button.addEventListener('click', () => {
      returnFocus = button;
      window.clearTimeout(closeTimer);
      dialog.classList.remove('is-closing');
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
  dialog.addEventListener('close', () => {
    window.clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    returnFocus?.focus();
  });
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
      closeTimer = window.setTimeout(close, 5_000);
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
  const locale = form.dataset.locale ?? 'ko';
  const messages = FORM_MESSAGES[locale as keyof typeof FORM_MESSAGES] ?? FORM_MESSAGES.ko;
  let startedAt = Date.now();
  let submitting = false;

  const interestOptions = Array.from(
    form.querySelectorAll<HTMLInputElement>('[data-interest-option]'),
  );
  const syncInterestValidity = () => {
    const firstInterest = interestOptions[0];
    if (!firstInterest) return;
    firstInterest.setCustomValidity(
      interestOptions.some((option) => option.checked) ? '' : 'INTEREST_REQUIRED',
    );
  };

  const syncSubmitState = () => {
    syncInterestValidity();
    const controls = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
    );
    const isReady = controls.every((field) => !field.willValidate || field.validity.valid);
    submit.disabled = submitting;
    submit.classList.toggle('is-ready', isReady && !submitting);
  };

  const autoGrowTextareas = Array.from(
    form.querySelectorAll<HTMLTextAreaElement>('textarea[data-autogrow]'),
  );
  const syncTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  autoGrowTextareas.forEach((textarea) => {
    textarea.addEventListener('input', () => syncTextareaHeight(textarea));
    syncTextareaHeight(textarea);
  });

  const clearErrors = () => {
    form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute('aria-invalid');
    });
    form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((element) => {
      element.textContent = '';
    });
    formAlert.hidden = true;
    formAlert.textContent = '';
  };

  const showRequestError = (code: string) => {
    formAlert.textContent =
      messages.request[code as keyof typeof messages.request] ?? messages.request.unknown;
    formAlert.hidden = false;
    formAlert.focus({ preventScroll: true });
    status.textContent = formAlert.textContent;
    status.className = 'ax-v2-form-status is-error';
    emitAnalytics('form_error', { error_code: code, form_id: 'ax_consultation' });
  };

  const showFieldErrors = (fields: Record<string, string>) => {
    for (const [name, code] of Object.entries(fields)) {
      if (name === 'consulting_interests') {
        form
          .querySelector<HTMLElement>('.ax-v2-interest-options')
          ?.setAttribute('aria-invalid', 'true');
      } else {
        form
          .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
          .forEach((field) => {
            field.setAttribute('aria-invalid', 'true');
          });
      }
      const error = form.querySelector<HTMLElement>(`[data-field-error="${name}"]`);
      if (error) {
        error.textContent =
          messages.fields[code as keyof typeof messages.fields] ?? messages.fieldFallback;
      }
    }
  };

  const fieldCode = (field: HTMLInputElement | HTMLTextAreaElement) => {
    if (field.name === 'name') return 'INVALID_NAME';
    if (field.name === 'email') return 'INVALID_EMAIL';
    if (field.name === 'consulting_interests') return 'INTEREST_REQUIRED';
    if (field.name === 'other_interest') return 'OTHER_INTEREST_REQUIRED';
    if (field.name === 'reason') return 'REASON_REQUIRED';
    if (field.name === 'cross_border_consent') return 'CROSS_BORDER_CONSENT_REQUIRED';
    return 'INVALID_NAME';
  };

  const revealValidationAlert = (invalidFields: Array<HTMLInputElement | HTMLTextAreaElement>) => {
    const fields: Record<string, string> = {};
    for (const field of invalidFields) fields[field.name] = fieldCode(field);
    showFieldErrors(fields);
    formAlert.textContent = messages.required;
    formAlert.hidden = false;
    formAlert.focus({ preventScroll: true });
    const firstInvalid = invalidFields[0];
    if (!firstInvalid) return;
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 320);
  };

  form.addEventListener(
    'invalid',
    (event) => {
      event.preventDefault();
    },
    true,
  );

  form.addEventListener(
    'blur',
    (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
      if (!field.willValidate || field.validity.valid) return;
      showFieldErrors({ [field.name]: fieldCode(field) });
    },
    true,
  );

  const otherInterestOption = form.querySelector<HTMLInputElement>(
    '[data-interest-option="other"]',
  );
  const otherInterestField = form.querySelector<HTMLElement>('[data-other-interest]');
  const otherInterestInput = form.querySelector<HTMLInputElement>('[data-other-interest-input]');
  const syncOtherInterest = () => {
    const enabled = Boolean(otherInterestOption?.checked);
    if (otherInterestField) otherInterestField.hidden = !enabled;
    if (otherInterestInput) {
      otherInterestInput.disabled = !enabled;
      otherInterestInput.required = enabled;
      if (!enabled) {
        otherInterestInput.value = '';
        otherInterestInput.removeAttribute('aria-invalid');
      }
    }
  };
  otherInterestOption?.addEventListener('change', syncOtherInterest);
  syncOtherInterest();

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
  form.addEventListener('change', () => {
    syncOtherInterest();
    syncInterestValidity();
    if (!interestOptions.some((option) => option.checked)) {
      showFieldErrors({ consulting_interests: 'INTEREST_REQUIRED' });
    }
    syncSubmitState();
  });
  syncSubmitState();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    if (!form.checkValidity()) {
      const invalidFields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(':invalid'),
      );
      revealValidationAlert(invalidFields);
      status.textContent = messages.fieldFallback;
      status.className = 'ax-v2-form-status is-error';
      return;
    }
    submitting = true;
    syncSubmitState();
    submitLabel.textContent = form.dataset.sendingLabel ?? '상담 신청을 전송하고 있습니다.';
    status.textContent = messages.sending;
    status.className = 'ax-v2-form-status';
    const data = new FormData(form);
    const search = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      ['source', 'medium', 'campaign', 'content', 'term']
        .map((key) => [key, search.get(`utm_${key}`)] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    );
    const crossBorderConsent = form.elements.namedItem('cross_border_consent');
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      consulting_interests: data.getAll('consulting_interests').map(String),
      other_interest: String(data.get('other_interest') ?? ''),
      reason: String(data.get('reason') ?? ''),
      cross_border_consent:
        crossBorderConsent instanceof HTMLInputElement && crossBorderConsent.checked,
      website: String(data.get('website') ?? ''),
      started_at: startedAt,
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
        showRequestError(result?.error?.code ?? 'unknown');
        return;
      }

      form.reset();
      autoGrowTextareas.forEach(syncTextareaHeight);
      startedAt = Date.now();
      status.textContent = messages.sent;
      status.className = 'ax-v2-form-status is-success';
      status.focus({ preventScroll: true });
      emitAnalytics('generate_lead', { form_id: 'ax_consultation', locale });
      form.dispatchEvent(new CustomEvent('ax:lead-sent', { bubbles: true }));
    } catch {
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

function initializeInternalProofSequence(root: HTMLElement) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      root.classList.add('is-sequence-visible');
      observer.disconnect();
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  );
  observer.observe(root);
}

function initializeDiagnosisSequence(root: HTMLElement) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      root.classList.add('is-sequence-visible');
      observer.disconnect();
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
  );
  observer.observe(root);
}

type SpringParallaxOptions = {
  property: string;
  desktopRate: number;
  compactRate: number;
  desktopLimit: number;
  compactLimit: number;
};

function initializeSpringParallax(section: HTMLElement | null, options: SpringParallaxOptions) {
  if (!section) return;

  const compact = window.matchMedia('(max-width: 720px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let listening = false;
  let targetOffset = 0;
  let currentOffset = 0;
  let velocity = 0;
  let previousTime = 0;
  let initialized = false;

  const measureTarget = () => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const rate = compact.matches ? options.compactRate : options.desktopRate;
    const limit = compact.matches ? options.compactLimit : options.desktopLimit;
    targetOffset = Math.max(-limit, Math.min(limit, (viewportCenter - sectionCenter) * rate));
  };

  const render = (time: number) => {
    if (!initialized) {
      currentOffset = targetOffset;
      initialized = true;
    }

    const deltaTime = previousTime ? Math.min((time - previousTime) / 1000, 0.032) : 1 / 60;
    previousTime = time;

    // A critically damped spring gives the image weight without bounce: it
    // accelerates toward the scroll target, then eases to a quiet stop.
    const stiffness = compact.matches ? 42 : 48;
    const damping = 2 * Math.sqrt(stiffness);
    const acceleration = (targetOffset - currentOffset) * stiffness - velocity * damping;
    velocity += acceleration * deltaTime;
    currentOffset += velocity * deltaTime;

    const settled = Math.abs(targetOffset - currentOffset) < 0.02 && Math.abs(velocity) < 0.02;
    if (settled) {
      currentOffset = targetOffset;
      velocity = 0;
    }

    section.style.setProperty(options.property, `${currentOffset.toFixed(3)}px`);
    frame = settled ? 0 : window.requestAnimationFrame(render);
  };

  const update = () => {
    if (!listening) return;
    measureTarget();
    if (!frame) {
      previousTime = 0;
      frame = window.requestAnimationFrame(render);
    }
  };

  const stop = () => {
    if (!listening) return;
    listening = false;
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    targetOffset = 0;
    currentOffset = 0;
    velocity = 0;
    previousTime = 0;
    initialized = false;
    section.style.removeProperty(options.property);
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

function initializeParallax(page: HTMLElement) {
  initializeSpringParallax(page.querySelector<HTMLElement>('[data-compound-parallax]'), {
    property: '--ax-v2-compound-media-y',
    desktopRate: 0.18,
    compactRate: 0.12,
    desktopLimit: 96,
    compactLimit: 44,
  });
  initializeSpringParallax(page.querySelector<HTMLElement>('[data-coaching-parallax]'), {
    property: '--ax-v2-coaching-bg-y',
    desktopRate: 0.12,
    compactRate: 0.08,
    desktopLimit: 64,
    compactLimit: 32,
  });
}

function initialize() {
  const page = document.querySelector<HTMLElement>('[data-ax-v2-page]');
  if (!page || page.dataset.initialized === 'true') return;
  page.dataset.initialized = 'true';
  initializeHeroVideo(page);
  initializePartnerBadge(page);
  initializeParallax(page);
  page.querySelectorAll<HTMLElement>('[data-testimonial-carousel]').forEach(initializeCarousel);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-tabs]').forEach(initializeTabs);
  page.querySelectorAll<HTMLElement>('[data-ax-v2-accordion]').forEach(initializeAccordion);
  page.querySelectorAll<HTMLFormElement>('[data-ax-v2-lead-form]').forEach(initializeLeadForm);
  page.querySelectorAll<HTMLElement>('[data-ceal-diagrams]').forEach(initializeAnimatedDiagram);
  page
    .querySelectorAll<HTMLElement>('[data-internal-proof-sequence]')
    .forEach(initializeInternalProofSequence);
  page
    .querySelectorAll<HTMLElement>('[data-diagnosis-sequence]')
    .forEach(initializeDiagnosisSequence);
  initializeDialog(page);
  initializeSuccessDialog(page);
}

initialize();
document.addEventListener('astro:page-load', initialize);
