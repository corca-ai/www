const AX_IMAGE_ROOT = '/images/pages/ax';
const AX_VISUAL_ROOT = `${AX_IMAGE_ROOT}/visuals`;
const AX_CAROUSEL_ROOT = `${AX_VISUAL_ROOT}/carousel`;
const AX_BACKGROUND_ROOT = `${AX_IMAGE_ROOT}/backgrounds`;
const AX_LOGO_ROOT = `${AX_IMAGE_ROOT}/logos`;
const AX_OPTIMIZED_LOGO_ROOT = `${AX_LOGO_ROOT}/v1`;

const logoAsset = (name: string) => ({
  webp: `${AX_OPTIMIZED_LOGO_ROOT}/${name}.webp`,
  png: `${AX_LOGO_ROOT}/${name}.png`,
});

const responsiveVisual = (name: string) => ({
  mobileAvif: `${AX_VISUAL_ROOT}/${name}-mobile.avif`,
  mobileWebp: `${AX_VISUAL_ROOT}/${name}-mobile.webp`,
  wideAvif: `${AX_VISUAL_ROOT}/${name}-wide.avif`,
  wideWebp: `${AX_VISUAL_ROOT}/${name}-wide.webp`,
});

const carouselVisual = (name: string) => ({
  mobileAvif: `${AX_CAROUSEL_ROOT}/${name}-mobile.avif`,
  mobileWebp: `${AX_CAROUSEL_ROOT}/${name}-mobile.webp`,
  wideAvif: `${AX_CAROUSEL_ROOT}/${name}-wide.avif`,
  wideWebp: `${AX_CAROUSEL_ROOT}/${name}-wide.webp`,
});

const backgroundVisual = (name: string) => ({
  mobileAvif: `${AX_BACKGROUND_ROOT}/${name}-mobile.avif`,
  mobileWebp: `${AX_BACKGROUND_ROOT}/${name}-mobile.webp`,
  wideAvif: `${AX_BACKGROUND_ROOT}/${name}-wide.avif`,
  wideWebp: `${AX_BACKGROUND_ROOT}/${name}-wide.webp`,
});

export const axAssetPaths = {
  brandLogo: `${AX_IMAGE_ROOT}/brand/corca-ax-white.svg`,
  partnerNetworkLogo: `${AX_VISUAL_ROOT}/OAI_PartnerNetwork_SelectPartner_Portrait.svg`,
  heroVideo: '/video/ax/B-0715-A_seamless_loop_video_of_a_maj.webm',
  logos: {
    organizations: Array.from({ length: 10 }, (_, index) => logoAsset(`high-logo0${index + 1}`)),
    kyowon: logoAsset('kyowon'),
    tyche: logoAsset('tyche'),
  },
  scenes: {
    hero: responsiveVisual('01-hero'),
    gap: responsiveVisual('02-gap'),
    pair: responsiveVisual('04-pair'),
    layers: responsiveVisual('05-layers'),
    final: responsiveVisual('06-final'),
    championPeople: responsiveVisual('09-champion-people'),
  },
  backgrounds: {
    bottleneck: backgroundVisual('07-bottleneck-space'),
    method: backgroundVisual('08-method-graphite-v2'),
  },
  carousel: {
    context: carouselVisual('context'),
    operations: carouselVisual('operations'),
    responsibility: carouselVisual('responsibility'),
  },
} as const;
