type PlaybackState = 'playing' | 'paused' | 'ended';

export {};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const SLIDE_DURATION = 2_200;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function track(event: string, parameters: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...parameters });
}

function initializeCarousel(root: HTMLElement) {
  if (root.dataset.axCarouselInitialized === 'true') return;
  root.dataset.axCarouselInitialized = 'true';

  const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]');
  const trackElement = root.querySelector<HTMLElement>('[data-carousel-track]');
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-slide]'));
  const selectors = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-select]'));
  const playbackButton = root.querySelector<HTMLButtonElement>('[data-carousel-playback]');
  const previousButton = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
  const nextButton = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  if (!viewport || !trackElement || !playbackButton || slides.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let playback: PlaybackState = reducedMotion.matches ? 'paused' : 'playing';
  let progress = 0;
  let animationFrame = 0;
  let lastTimestamp = 0;
  let isInViewport = false;
  let isDragging = false;
  const drag = { pointerId: -1, startX: 0, currentX: 0, width: 0 };

  const writeProgress = (value: number) => {
    progress = clamp(value, 0, 1);
    root.style.setProperty('--carousel-progress', progress.toFixed(4));
  };

  const updateTrackPosition = () => {
    const card = slides[0];
    if (!card) return;
    const rootWidth = root.getBoundingClientRect().width;
    const cardWidth = card.offsetWidth;
    const gap = Number.parseFloat(window.getComputedStyle(trackElement).columnGap) || 0;
    const offset = rootWidth / 2 - cardWidth / 2 - activeIndex * (cardWidth + gap);
    root.style.setProperty('--carousel-track-x', `${offset.toFixed(2)}px`);
  };

  const preloadNextImage = () => {
    if (!isInViewport) return;
    const nextImage = slides[activeIndex + 1]?.querySelector<HTMLImageElement>('img');
    if (!nextImage?.currentSrc) return;
    const image = new Image();
    image.src = nextImage.currentSrc;
  };

  const renderSelection = () => {
    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.dataset.active = String(active);
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    selectors.forEach((button, index) => {
      const active = index === activeIndex;
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
      button.querySelector('.pain-carousel__indicator')?.classList.toggle('is-active', active);
    });
    if (previousButton) previousButton.disabled = activeIndex === 0;
    if (nextButton) nextButton.disabled = activeIndex === slides.length - 1;
    updateTrackPosition();
    preloadNextImage();
  };

  const renderPlayback = () => {
    const reduced = reducedMotion.matches;
    root.dataset.playback = playback;
    const label = reduced
      ? root.dataset.labelReduced
      : playback === 'playing'
        ? root.dataset.labelPause
        : playback === 'ended'
          ? root.dataset.labelRestart
          : root.dataset.labelPlay;
    playbackButton.disabled = reduced;
    playbackButton.setAttribute('aria-label', label ?? '');
    playbackButton.title = label ?? '';

    const visibleIcon = reduced || playback !== 'playing' ? 'play' : 'pause';
    root.querySelectorAll<SVGElement>('[data-carousel-icon]').forEach((icon) => {
      icon.style.display = icon.dataset.carouselIcon === visibleIcon ? '' : 'none';
    });
  };

  const shouldPlay = () =>
    playback === 'playing' &&
    isInViewport &&
    !document.hidden &&
    !reducedMotion.matches &&
    !isDragging &&
    slides.length > 1;

  const tick = (timestamp: number) => {
    animationFrame = 0;
    if (!shouldPlay()) {
      lastTimestamp = 0;
      return;
    }

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const nextProgress = progress + elapsed / SLIDE_DURATION;

    if (nextProgress >= 1) {
      activeIndex += 1;
      const reachedEnd = activeIndex >= slides.length - 1;
      activeIndex = clamp(activeIndex, 0, slides.length - 1);
      writeProgress(reachedEnd ? 1 : 0);
      if (reachedEnd) playback = 'ended';
      renderSelection();
      renderPlayback();
      if (reachedEnd) {
        lastTimestamp = 0;
        return;
      }
    } else {
      writeProgress(nextProgress);
    }

    animationFrame = window.requestAnimationFrame(tick);
  };

  const startAnimation = () => {
    if (animationFrame || !shouldPlay()) return;
    lastTimestamp = 0;
    animationFrame = window.requestAnimationFrame(tick);
  };

  const selectSlide = (requestedIndex: number) => {
    activeIndex = clamp(requestedIndex, 0, slides.length - 1);
    const reachedEnd = activeIndex === slides.length - 1 && playback === 'playing';
    writeProgress(reachedEnd ? 1 : 0);
    if (reachedEnd) playback = 'ended';
    else if (playback === 'ended') playback = 'paused';
    renderSelection();
    if (status) status.textContent = slides[activeIndex]?.dataset.carouselAnnouncement ?? '';
    renderPlayback();
    startAnimation();
  };

  selectors.forEach((button) => {
    button.addEventListener('click', () => selectSlide(Number(button.dataset.carouselSelect ?? 0)));
  });
  previousButton?.addEventListener('click', () => selectSlide(activeIndex - 1));
  nextButton?.addEventListener('click', () => selectSlide(activeIndex + 1));

  playbackButton.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    if (playback === 'ended') {
      activeIndex = 0;
      writeProgress(0);
      renderSelection();
      playback = 'playing';
    } else {
      playback = playback === 'playing' ? 'paused' : 'playing';
    }
    renderPlayback();
    startAnimation();
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectSlide(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectSlide(activeIndex + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectSlide(slides.length - 1);
    }
  });

  viewport.addEventListener('pointerdown', (event) => {
    if ((event.pointerType === 'mouse' && event.button !== 0) || slides.length < 2) return;
    viewport.setPointerCapture(event.pointerId);
    drag.pointerId = event.pointerId;
    drag.startX = event.clientX;
    drag.currentX = event.clientX;
    drag.width = viewport.getBoundingClientRect().width;
    isDragging = true;
    root.dataset.dragging = 'true';
    root.style.setProperty('--carousel-drag-x', '0px');
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!isDragging || drag.pointerId !== event.pointerId) return;
    drag.currentX = event.clientX;
    root.style.setProperty('--carousel-drag-x', `${(event.clientX - drag.startX).toFixed(2)}px`);
  });

  const finishDrag = (event: PointerEvent, cancelled = false) => {
    if (!isDragging || drag.pointerId !== event.pointerId) return;
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
    const distance = drag.currentX - drag.startX;
    const threshold = Math.max(52, Math.min(drag.width * 0.12, 96));
    isDragging = false;
    root.dataset.dragging = 'false';
    root.style.setProperty('--carousel-drag-x', '0px');
    if (!cancelled && Math.abs(distance) >= threshold) {
      selectSlide(activeIndex + (distance < 0 ? 1 : -1));
    } else {
      startAnimation();
    }
  };

  viewport.addEventListener('pointerup', (event) => finishDrag(event));
  viewport.addEventListener('pointercancel', (event) => finishDrag(event, true));

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isInViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.3);
      if (isInViewport) preloadNextImage();
      startAnimation();
    },
    { threshold: [0, 0.3, 0.6] },
  );
  intersectionObserver.observe(root);

  const resizeObserver = new ResizeObserver(updateTrackPosition);
  resizeObserver.observe(root);
  resizeObserver.observe(trackElement);

  document.addEventListener('visibilitychange', startAnimation);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      playback = 'paused';
      writeProgress(0);
    }
    renderPlayback();
    startAnimation();
  });

  renderSelection();
  renderPlayback();
}

function initializeForm(form: HTMLFormElement) {
  if (form.dataset.axFormInitialized === 'true') return;
  form.dataset.axFormInitialized = 'true';

  const submit = form.querySelector<HTMLButtonElement>("button[type='submit']");
  const submitLabel = form.querySelector<HTMLElement>('[data-form-submit-label]');
  const errorBox = form.querySelector<HTMLElement>('[data-form-error]');
  const errorMessage = form.querySelector<HTMLElement>('[data-form-error-message]');
  const successBox = form.querySelector<HTMLElement>('[data-form-success]');
  if (!submit || !submitLabel || !errorBox || !errorMessage || !successBox) return;

  const errors = JSON.parse(form.dataset.errorMap ?? '{}') as Record<string, string>;
  const locale = form.dataset.locale ?? 'ko';
  let startedAt = Date.now();
  let started = false;

  const showError = (code: string) => {
    errorMessage.textContent = errors[code] ?? errors.unknown ?? 'Unable to send your request.';
    errorBox.hidden = false;
    successBox.hidden = true;
    track('form_error', { form_id: 'ax_consultation', error_code: code });
  };

  const clearStatus = () => {
    errorBox.hidden = true;
    successBox.hidden = true;
  };

  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    track('form_start', { form_id: 'ax_consultation', locale });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    if (!form.checkValidity()) {
      form.reportValidity();
      showError('validation');
      return;
    }
    submit.disabled = true;
    submitLabel.textContent = form.dataset.sendingLabel ?? 'Sending…';
    const data = new FormData(form);
    const search = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      ['source', 'medium', 'campaign', 'content', 'term']
        .map((key) => [key, search.get(`utm_${key}`)] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    );
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      topic: String(data.get('topic') ?? ''),
      message: String(data.get('message') ?? ''),
      privacy_consent: data.get('privacy_consent') === 'on',
      website: String(data.get('website') ?? ''),
      started_at: startedAt,
      utm,
      locale,
    };

    track('form_submit', { form_id: 'ax_consultation', topic: payload.topic, locale });

    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 15_000);

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
        const fieldCode = result?.error?.fields
          ? Object.values(result.error.fields).find((code) => Boolean(errors[code]))
          : undefined;
        showError(fieldCode ?? result?.error?.code ?? 'unknown');
        return;
      }

      form.reset();
      errorBox.hidden = true;
      successBox.hidden = false;
      startedAt = Date.now();
      started = false;
      track('generate_lead', { form_id: 'ax_consultation', topic: payload.topic, locale });
      successBox.focus({ preventScroll: true });
    } catch {
      showError('network');
    } finally {
      window.clearTimeout(requestTimeout);
      submit.disabled = false;
      submitLabel.textContent = form.dataset.submitLabel ?? 'Submit';
    }
  });
}

function initializeHeroVideo(page: HTMLElement) {
  const media = page.querySelector<HTMLElement>('[data-hero-media]');
  const video = media?.querySelector<HTMLVideoElement>('[data-hero-video]');
  const source = video?.querySelector<HTMLSourceElement>('source[data-src]');
  if (!media || !video || !source || media.dataset.heroInitialized) return;
  const mobileViewport = window.matchMedia('(max-width: 720px)');

  if (mobileViewport.matches) {
    media.dataset.heroInitialized = 'mobile-poster';
    media.classList.remove('is-video-playing');
    media.classList.add('is-video-reset');
    const initializeOnDesktop = () => {
      if (mobileViewport.matches) return;
      mobileViewport.removeEventListener('change', initializeOnDesktop);
      delete media.dataset.heroInitialized;
      initializeHeroVideo(page);
    };
    mobileViewport.addEventListener('change', initializeOnDesktop);
    return;
  }

  media.dataset.heroInitialized = 'true';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let loaded = false;

  const stopAndReset = () => {
    media.classList.remove('is-video-playing');
    media.classList.add('is-video-reset');
    video.pause();
    if (video.readyState >= 1) {
      try {
        video.currentTime = 0;
      } catch {
        // Safari can reject a seek until metadata is ready; the poster stays visible.
      }
    }
  };

  const unload = () => {
    stopAndReset();
    if (!loaded) return;
    source.removeAttribute('src');
    video.load();
    loaded = false;
  };

  const play = () => {
    if (!visible || document.hidden || reducedMotion.matches || mobileViewport.matches) {
      stopAndReset();
      return;
    }
    if (!loaded) {
      source.src = source.dataset.src ?? '';
      video.load();
      loaded = true;
    }
    media.classList.remove('is-video-reset');
    void video.play().catch(stopAndReset);
  };

  video.addEventListener('playing', () => {
    if (!visible || document.hidden || reducedMotion.matches || mobileViewport.matches) {
      stopAndReset();
      return;
    }
    media.classList.remove('is-video-reset');
    media.classList.add('is-video-playing');
  });
  video.addEventListener('error', stopAndReset);

  const observer = new IntersectionObserver(([entry]) => {
    visible = Boolean(
      entry?.isIntersecting && entry.intersectionRect.width && entry.intersectionRect.height,
    );
    if (visible) play();
    else stopAndReset();
  });
  observer.observe(media);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAndReset();
    else play();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) stopAndReset();
    else play();
  });
  mobileViewport.addEventListener('change', () => {
    if (mobileViewport.matches) unload();
    else play();
  });
}

function initializeScrollMotion(page: HTMLElement) {
  if (page.dataset.scrollMotionInitialized) return;

  const mobileViewport = window.matchMedia('(max-width: 720px)');
  if (mobileViewport.matches) {
    page.dataset.scrollMotionInitialized = 'mobile-static';
    page.dataset.scrollMotion = 'off';
    const initializeOnDesktop = () => {
      if (mobileViewport.matches) return;
      mobileViewport.removeEventListener('change', initializeOnDesktop);
      delete page.dataset.scrollMotionInitialized;
      initializeScrollMotion(page);
    };
    mobileViewport.addEventListener('change', initializeOnDesktop);
    return;
  }

  page.dataset.scrollMotionInitialized = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = Array.from(page.querySelectorAll<HTMLElement>('[data-parallax-scene]'));
  const steps = Array.from(page.querySelectorAll<HTMLElement>('[data-scroll-step]'));
  const partnerLogo = page.querySelector<HTMLElement>('.partner-network-logo');
  let sceneMetrics: Array<{ element: HTMLElement; top: number; height: number; active: boolean }> =
    [];
  let stepMetrics: Array<{ element: HTMLElement; top: number; height: number }> = [];
  let targetScroll = window.scrollY;
  let easedScroll = targetScroll;
  let frame = 0;
  let measureFrame = 0;
  let partnerLogoTop = 0;
  let partnerLogoHeight = 0;
  let partnerLogoExiting = false;

  const resetMotion = () => {
    for (const scene of scenes) {
      scene.classList.remove('is-motion-active');
      scene.style.setProperty('--scene-progress', '0');
      scene.style.setProperty('--media-y', '0px');
      scene.style.setProperty('--copy-y', '0px');
      scene.style.setProperty('--float-y', '0px');
      scene.style.setProperty('--media-scale', '1.04');
    }
    for (const step of steps) {
      step.style.setProperty('--step-y', '0px');
      step.style.setProperty('--step-scale', '1');
    }
  };

  const updatePartnerLogo = (scrollPosition: number) => {
    const hero = sceneMetrics.find((item) => item.element.dataset.scene === '01-hero');
    if (!hero || !partnerLogo) return;
    const heroBottom = hero.top + hero.height - scrollPosition;
    const exitLine = partnerLogoTop + partnerLogoHeight + 80;
    const shouldExit = partnerLogoExiting ? heroBottom <= exitLine + 12 : heroBottom <= exitLine;
    if (shouldExit === partnerLogoExiting) return;
    partnerLogoExiting = shouldExit;
    partnerLogo.classList.toggle('is-exiting', shouldExit);
    partnerLogo.setAttribute('aria-hidden', String(shouldExit));
  };

  const render = (immediate = false) => {
    frame = 0;
    if (mobileViewport.matches) {
      page.dataset.scrollMotion = 'off';
      easedScroll = window.scrollY;
      resetMotion();
      return;
    }
    const viewportHeight = Math.max(window.innerHeight, 1);
    const pageRange = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const actualScroll = window.scrollY;
    page.style.setProperty('--page-progress', `${clamp(actualScroll / pageRange, 0, 1) * 100}%`);
    page.dataset.scrollMotion = reducedMotion.matches ? 'off' : 'running';

    if (reducedMotion.matches) {
      easedScroll = actualScroll;
      updatePartnerLogo(actualScroll);
      resetMotion();
      return;
    }

    easedScroll = immediate ? targetScroll : easedScroll + (targetScroll - easedScroll) * 0.12;
    updatePartnerLogo(actualScroll);
    const viewportFactor = window.innerWidth <= 720 ? 0.42 : window.innerWidth <= 1000 ? 0.7 : 1;

    for (const item of sceneMetrics) {
      const sceneTop = item.top - easedScroll;
      const sceneBottom = sceneTop + item.height;
      const nearby = sceneTop < viewportHeight * 1.4 && sceneBottom > -viewportHeight * 0.4;
      if (!nearby) {
        if (item.active) {
          item.active = false;
          item.element.classList.remove('is-motion-active');
        }
        continue;
      }
      if (!item.active) {
        item.active = true;
        item.element.classList.add('is-motion-active');
      }

      const centerOffset = sceneTop + item.height / 2 - viewportHeight / 2;
      const range = Math.max((viewportHeight + item.height) / 2, 1);
      const sceneProgress = clamp(-centerOffset / range, -1, 1);
      if (item.element.dataset.scene === '01-hero') {
        const heroProgress = clamp((easedScroll - item.top) / viewportHeight, 0, 1);
        const mediaProgress = clamp((heroProgress - 0.08) / 0.92, 0, 1);
        const copyTravel =
          window.innerWidth <= 720
            ? Math.min(viewportHeight * 0.22, 180)
            : window.innerWidth <= 1000
              ? Math.min(viewportHeight * 0.26, 230)
              : Math.min(viewportHeight * 0.3, 300);
        const mediaTravel =
          window.innerWidth <= 720
            ? Math.min(viewportHeight * 0.08, 64)
            : window.innerWidth <= 1000
              ? Math.min(viewportHeight * 0.1, 84)
              : Math.min(viewportHeight * 0.12, 110);
        item.element.style.setProperty('--scene-progress', heroProgress.toFixed(4));
        item.element.style.setProperty(
          '--media-y',
          `${(mediaProgress * mediaTravel).toFixed(2)}px`,
        );
        item.element.style.setProperty('--copy-y', `${(-heroProgress * copyTravel).toFixed(2)}px`);
        item.element.style.setProperty('--float-y', '0px');
        item.element.style.setProperty('--media-scale', (1.04 + mediaProgress * 0.018).toFixed(4));
        continue;
      }

      item.element.style.setProperty(
        '--media-y',
        `${clamp(-centerOffset * 0.04 * viewportFactor, -42 * viewportFactor, 42 * viewportFactor).toFixed(2)}px`,
      );
      item.element.style.setProperty(
        '--copy-y',
        `${clamp(centerOffset * 0.018 * viewportFactor, -20 * viewportFactor, 20 * viewportFactor).toFixed(2)}px`,
      );
      item.element.style.setProperty(
        '--float-y',
        `${clamp(centerOffset * 0.01 * viewportFactor, -12 * viewportFactor, 12 * viewportFactor).toFixed(2)}px`,
      );
      item.element.style.setProperty(
        '--media-scale',
        (1.04 + Math.min(Math.abs(sceneProgress) * 0.008, 0.008)).toFixed(4),
      );
    }

    for (const item of stepMetrics) {
      const top = item.top - easedScroll;
      if (top > viewportHeight * 1.25 || top + item.height < -viewportHeight * 0.25) continue;
      const centerOffset = top + item.height / 2 - viewportHeight / 2;
      const influence = clamp(centerOffset / (viewportHeight * 0.72), -1, 1);
      item.element.style.setProperty(
        '--step-y',
        `${(influence * 14 * viewportFactor).toFixed(2)}px`,
      );
      item.element.style.setProperty('--step-scale', (1 - Math.abs(influence) * 0.014).toFixed(4));
    }

    if (Math.abs(targetScroll - easedScroll) > 0.2)
      frame = window.requestAnimationFrame(() => render());
  };

  const measure = () => {
    measureFrame = 0;
    const scroll = window.scrollY;
    sceneMetrics = scenes.map((element) => ({
      element,
      top: element.getBoundingClientRect().top + scroll,
      height: element.offsetHeight,
      active: element.classList.contains('is-motion-active'),
    }));
    stepMetrics = steps.map((element) => ({
      element,
      top: element.getBoundingClientRect().top + scroll,
      height: element.offsetHeight,
    }));
    if (partnerLogo) {
      partnerLogoTop = Number.parseFloat(window.getComputedStyle(partnerLogo).top) || 0;
      partnerLogoHeight = partnerLogo.getBoundingClientRect().height;
    }
    targetScroll = scroll;
    easedScroll = scroll;
    render(true);
  };

  const scheduleRender = () => {
    targetScroll = window.scrollY;
    if (!frame) frame = window.requestAnimationFrame(() => render());
  };
  const scheduleMeasure = () => {
    if (measureFrame) window.cancelAnimationFrame(measureFrame);
    measureFrame = window.requestAnimationFrame(measure);
  };

  const resizeObserver = new ResizeObserver(scheduleMeasure);
  scenes.forEach((scene) => {
    resizeObserver.observe(scene);
  });
  window.addEventListener('scroll', scheduleRender, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('load', scheduleMeasure, { once: true });
  reducedMotion.addEventListener('change', scheduleMeasure);
  mobileViewport.addEventListener('change', scheduleMeasure);
  void document.fonts?.ready.then(scheduleMeasure);
  measure();
}

function initializeRevealAndAnalytics(page: HTMLElement) {
  if (page.dataset.observersInitialized === 'true') return;
  page.dataset.observersInitialized = 'true';

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -12% 0px' },
  );
  page.querySelectorAll('.reveal').forEach((element) => {
    revealObserver.observe(element);
  });

  const seenSections = new Set<string>();
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.scene;
        if (!entry.isIntersecting || !id || seenSections.has(id)) continue;
        seenSections.add(id);
        track('view_section', { section_id: id });
      }
    },
    { threshold: 0.5 },
  );
  page.querySelectorAll<HTMLElement>('[data-scene]').forEach((element) => {
    sectionObserver.observe(element);
  });

  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (!entry.isIntersecting || element.dataset.counted === 'true') continue;
        element.dataset.counted = 'true';
        const target = Number(element.dataset.count ?? 0);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          element.textContent = String(target);
          continue;
        }
        const started = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - started) / 900);
          element.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
          if (progress < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      }
    },
    { threshold: 0.7 },
  );
  page.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
    counterObserver.observe(element);
  });

  page.querySelectorAll<HTMLAnchorElement>('[data-ax-track-link]').forEach((link) => {
    link.addEventListener('click', () => {
      track('cta_click', {
        placement: link.dataset.axTrackLink,
        destination: link.getAttribute('href') ?? '',
      });
    });
  });
}

function initializeAxPage() {
  document.querySelectorAll<HTMLElement>('.ax-page').forEach((page) => {
    initializeHeroVideo(page);
    initializeScrollMotion(page);
    initializeRevealAndAnalytics(page);
    page.querySelectorAll<HTMLElement>('[data-ax-carousel]').forEach(initializeCarousel);
    page.querySelectorAll<HTMLFormElement>('[data-ax-consultation-form]').forEach(initializeForm);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAxPage, { once: true });
} else {
  initializeAxPage();
}
document.addEventListener('astro:page-load', initializeAxPage);
