import type { VantaRingsEffect, VantaRingsFactory } from 'vanta/dist/vanta.rings.min';

const compactViewport = window.matchMedia('(max-width: 720px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const ringPalette = [0x70b8ff, 0x2997ff, 0x1769e0, 0x1437d7, 0x79b0bc];

const shouldDisableRings = () => compactViewport.matches || reducedMotion.matches;

const resolveRingsFactory = (module: { default: unknown }): VantaRingsFactory => {
  const directExport = module.default;
  if (typeof directExport === 'function') return directExport as VantaRingsFactory;

  const nestedExport =
    typeof directExport === 'object' && directExport !== null && 'default' in directExport
      ? directExport.default
      : undefined;
  if (typeof nestedExport === 'function') return nestedExport as VantaRingsFactory;

  throw new TypeError('Vanta RINGS factory is unavailable');
};

const RING_SPEED_MULTIPLIER = 1.56;

const tuneRings = (effect: VantaRingsEffect) => {
  effect.rings?.forEach((ring, index) => {
    const color = ringPalette[index % ringPalette.length];
    if (color !== undefined) ring.material?.color?.setHex(color);
    if (typeof ring.speed === 'number') ring.speed *= RING_SPEED_MULTIPLIER;
  });

  // Vanta RINGS offsets its group by default; Ceal keeps the rotation centered.
  if (effect.cont?.position) effect.cont.position.x = 0;
};

export const initCealRings = () => {
  const target = document.querySelector<HTMLElement>('[data-ceal-rings]');
  if (!target || target.dataset.ringsBound === 'true') return;

  target.dataset.ringsBound = 'true';
  let disposed = false;
  let effect: VantaRingsEffect | undefined;
  let observer: IntersectionObserver | undefined;
  let initialization: Promise<void> | undefined;

  const destroyEffect = () => {
    effect?.destroy();
    effect = undefined;
    delete target.dataset.ringsReady;
  };

  const mountEffect = async () => {
    if (disposed || effect || initialization || shouldDisableRings()) return;

    const pending = (async () => {
      try {
        const [ringsModule, THREE] = await Promise.all([
          import('vanta/dist/vanta.rings.min'),
          import('three'),
        ]);

        if (disposed || shouldDisableRings() || !target.isConnected) return;

        const nextEffect = resolveRingsFactory(ringsModule as { default: unknown })({
          el: target,
          THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 320,
          minWidth: 320,
          scale: 1.35,
          scaleMobile: 2,
          backgroundColor: 0x052653,
          backgroundAlpha: 0,
        });

        tuneRings(nextEffect);
        effect = nextEffect;
        target.dataset.ringsReady = 'true';
      } catch {
        // The CSS gradient remains as the complete visual fallback.
        target.dataset.ringsUnavailable = 'true';
      }
    })();

    initialization = pending;
    await pending;
    if (initialization === pending) initialization = undefined;
  };

  const observeTarget = () => {
    observer?.disconnect();
    observer = undefined;
    if (disposed || effect || shouldDisableRings()) return;

    if (!('IntersectionObserver' in window)) {
      void mountEffect();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        observer = undefined;
        void mountEffect();
      },
      { rootMargin: '700px 0px' },
    );
    observer.observe(target);
  };

  const handlePreferenceChange = () => {
    if (shouldDisableRings()) {
      observer?.disconnect();
      observer = undefined;
      destroyEffect();
      return;
    }

    delete target.dataset.ringsUnavailable;
    observeTarget();
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    compactViewport.removeEventListener('change', handlePreferenceChange);
    reducedMotion.removeEventListener('change', handlePreferenceChange);
    destroyEffect();
    delete target.dataset.ringsBound;
  };

  compactViewport.addEventListener('change', handlePreferenceChange);
  reducedMotion.addEventListener('change', handlePreferenceChange);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  window.addEventListener('pagehide', cleanup, { once: true });
  observeTarget();
};
