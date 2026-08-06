declare module 'vanta/dist/vanta.rings.min' {
  import type * as Three from 'three';

  interface VantaRing {
    speed?: number;
    material?: {
      color?: {
        setHex(value: number): void;
      };
    };
  }

  export interface VantaRingsEffect {
    cont?: {
      position?: {
        x: number;
      };
    };
    rings?: VantaRing[];
    destroy(): void;
    resize(): void;
  }

  interface VantaRingsOptions {
    el: HTMLElement;
    THREE: typeof Three;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    backgroundColor?: number;
    backgroundAlpha?: number;
  }

  export type VantaRingsFactory = (options: VantaRingsOptions) => VantaRingsEffect;

  const RINGS: VantaRingsFactory;
  export default RINGS;
}
