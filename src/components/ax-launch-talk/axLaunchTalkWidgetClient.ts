import { emitGtagEvent, type Gtag } from '../../analytics/gtag';
import { resolveLeadPayloadContext } from '../../lead/pageContext';

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

type WidgetMode = 'compact' | 'hero' | 'open';
type WidgetState = 'compact' | 'expanded' | 'mobile-mini';

const MOBILE_QUERY = '(max-width: 720px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const BUBBLE_DURATION_MS = 3000;
const COLLISION_SELECTOR =
  '#request, footer, [data-ax-floating-exclusion], h1, h2, h3, h4, p, a, button, form, input, textarea, img, video';

function initializeLaunchTalkLeadTracking() {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-ax-launch-talk-cta]');
  for (const link of links) {
    if (link.dataset.launchTalkTrackingReady === 'true') continue;
    link.dataset.launchTalkTrackingReady = 'true';
    link.addEventListener('click', () => {
      const context = link.closest<HTMLElement>('[data-ax-launch-talk-context]');
      if (!context) return;

      const page = resolveLeadPayloadContext(context.dataset, window.location.pathname);
      const widgetState = (link.dataset.widgetState ?? 'expanded') as WidgetState;

      emitGtagEvent(window.gtag, 'ax_launch_talk_click', {
        page_id: page.page_id,
        page_path: page.page_path,
        base_path: page.base_path,
        locale: page.locale,
        content_type: page.content_type,
        widget_state: widgetState,
      });
    });
  }
}

function initializeWidget(widget: HTMLElement) {
  if (widget.dataset.widgetReady === 'true') return;
  widget.dataset.widgetReady = 'true';

  const hero = document.querySelector<HTMLElement>('[data-ax-floating-hero]');
  const compactBoundary = document.querySelector<HTMLElement>(
    '[data-ax-floating-compact-boundary]',
  );
  const avatar = widget.querySelector<HTMLButtonElement>('[data-ax-launch-talk-avatar]');
  const card = widget.querySelector<HTMLElement>('[data-ax-launch-talk-card]');
  const bubble = widget.querySelector<HTMLElement>('[data-ax-launch-talk-bubble]');
  if (!avatar || !card || !bubble) return;

  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  let mode: WidgetMode = hero ? 'hero' : 'compact';
  let heroVisible = Boolean(hero);
  let bubbleTimer = 0;
  let frame = 0;
  let previousScrollY = window.scrollY;

  const updateMode = (nextMode: WidgetMode, returnFocus = false) => {
    mode = nextMode;
    widget.dataset.mode = nextMode;
    const expanded = nextMode === 'open';
    avatar.setAttribute('aria-expanded', String(expanded));
    if (nextMode !== 'compact') bubble.classList.remove('is-visible');
    if (returnFocus) avatar.focus({ preventScroll: true });
  };

  const bubbleCollides = () => {
    if (!bubble.classList.contains('is-visible')) return false;
    const rect = bubble.getBoundingClientRect();
    const points: Array<readonly [number, number]> = [
      [rect.left + 8, rect.top + 8],
      [rect.right - 8, rect.top + 8],
      [rect.left + rect.width / 2, rect.top + rect.height / 2],
    ];
    return points.some(([x, y]) =>
      document.elementsFromPoint(x, y).some((element) => {
        if (widget.contains(element)) return false;
        return Boolean(element.closest(COLLISION_SELECTOR));
      }),
    );
  };

  const scheduleCollisionCheck = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      if (bubbleCollides()) bubble.classList.remove('is-visible');
    });
  };

  const showBubbleTemporarily = () => {
    window.clearTimeout(bubbleTimer);
    if (mode !== 'compact') return;
    bubble.classList.add('is-visible');
    scheduleCollisionCheck();
    if (bubbleCollides()) return;
    bubbleTimer = window.setTimeout(
      () => bubble.classList.remove('is-visible'),
      BUBBLE_DURATION_MS,
    );
  };

  const heroIsAboveCompactBoundary = () => {
    if (!hero) return false;
    if (compactBoundary) {
      return compactBoundary.getBoundingClientRect().top > window.innerHeight;
    }
    const siteHeader = document.querySelector<HTMLElement>('body > header');
    const headerBoundary = siteHeader?.getBoundingClientRect().bottom ?? 0;
    return hero.getBoundingClientRect().bottom > headerBoundary;
  };

  const syncHeroMode = () => {
    const nextHeroVisible = heroIsAboveCompactBoundary();
    if (nextHeroVisible === heroVisible) return;
    heroVisible = nextHeroVisible;
    updateMode(heroVisible ? 'hero' : 'compact');
    if (!heroVisible) showBubbleTemporarily();
  };

  if (hero && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(syncHeroMode, { threshold: 0 });
    observer.observe(hero);
    if (compactBoundary) observer.observe(compactBoundary);
  } else if (!hero) {
    updateMode('compact');
    showBubbleTemporarily();
  }
  syncHeroMode();

  avatar.addEventListener('click', () => {
    updateMode('open');
    window.setTimeout(() => {
      if (mode === 'open') {
        card.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
      }
    }, 0);
  });

  document.addEventListener('pointerdown', (event) => {
    if (mode !== 'open' || widget.contains(event.target as Node)) return;
    updateMode(heroVisible ? 'hero' : 'compact', true);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || mode !== 'open') return;
    updateMode(heroVisible ? 'hero' : 'compact', true);
  });

  window.addEventListener(
    'scroll',
    () => {
      syncHeroMode();
      const delta = Math.abs(window.scrollY - previousScrollY);
      previousScrollY = window.scrollY;
      if (mode === 'open' && delta > 12) updateMode(heroVisible ? 'hero' : 'compact');
      scheduleCollisionCheck();
    },
    { passive: true },
  );
  window.addEventListener(
    'resize',
    () => {
      syncHeroMode();
      scheduleCollisionCheck();
    },
    { passive: true },
  );

  const handleMediaChange = () => {
    widget.dataset.reducedMotion = String(reducedMotion.matches);
    if (mode === 'compact') showBubbleTemporarily();
  };
  mobile.addEventListener('change', handleMediaChange);
  reducedMotion.addEventListener('change', handleMediaChange);
  handleMediaChange();
}

function initializeAxLaunchTalk() {
  initializeLaunchTalkLeadTracking();
  for (const widget of document.querySelectorAll<HTMLElement>('[data-ax-launch-talk-widget]')) {
    initializeWidget(widget);
  }
}

initializeAxLaunchTalk();
document.addEventListener('astro:page-load', initializeAxLaunchTalk);
