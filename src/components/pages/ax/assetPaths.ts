const AX_IMAGE_ROOT = '/images/pages/ax';
const AX_VISUAL_ROOT = `${AX_IMAGE_ROOT}/visuals`;
const AX_CAROUSEL_ROOT = `${AX_VISUAL_ROOT}/carousel`;

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

export const axAssetPaths = {
  brandLogo: `${AX_IMAGE_ROOT}/brand/corca-ax-white.svg`,
  partnerNetworkLogo: `${AX_VISUAL_ROOT}/OAI_PartnerNetwork_SelectPartner_Portrait.svg`,
  heroVideo: '/video/ax/B-0715-A_seamless_loop_video_of_a_maj.webm',
  logos: {
    organizations: Array.from(
      { length: 10 },
      (_, index) => `${AX_IMAGE_ROOT}/logos/high-logo0${index + 1}.png`,
    ),
    tyche: `${AX_IMAGE_ROOT}/logos/tyche.png`,
  },
  scenes: {
    hero: responsiveVisual('01-hero'),
    gap: responsiveVisual('02-gap'),
    decision: responsiveVisual('03-decision'),
    pair: responsiveVisual('04-pair'),
    layers: responsiveVisual('05-layers'),
    final: responsiveVisual('06-final'),
    championPeople: responsiveVisual('09-champion-people'),
  },
  carousel: {
    context: carouselVisual('context'),
    operations: carouselVisual('operations'),
    responsibility: carouselVisual('responsibility'),
  },
} as const;
