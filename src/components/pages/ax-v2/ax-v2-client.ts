import { initializeLeadForms } from '../../forms/leadFormClient';

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
  initializeLeadForms(page);
  page.querySelectorAll<HTMLElement>('[data-ceal-diagrams]').forEach(initializeAnimatedDiagram);
  page
    .querySelectorAll<HTMLElement>('[data-internal-proof-sequence]')
    .forEach(initializeInternalProofSequence);
  page
    .querySelectorAll<HTMLElement>('[data-diagnosis-sequence]')
    .forEach(initializeDiagnosisSequence);
  initializeDialog(page);
}

initialize();
document.addEventListener('astro:page-load', initialize);
