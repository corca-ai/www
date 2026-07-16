# AX mobile partner badge design QA

- Source visual truth: `/var/folders/7h/y3scb0kd5kgbsx6hy5ltzz580000gn/T/codex-clipboard-97140313-b2cc-45ca-b2db-15ea462e6ab0.png`
- Supplemental pre-port layout reference: `/Users/tommy/Documents/XT/output/corca-ax-public-site/app/globals.css`
- Implementation screenshot: `/tmp/ax-mobile-after-final.png`
- Primary viewport: `390 × 844`
- Additional responsive checks: `320 × 667`, `720 × 900`, and `1280 × 720`
- State: Korean AX hero, initial page load, scroll position 0

## Full-view comparison evidence

The reported mobile state omitted the OpenAI Select Partner badge and placed the hero copy at the top of the image. The corrected render restores the supplied portrait badge at the upper-left of the hero and places the centered copy below it. At 390 px wide, the badge is 100 × 115 px at `top: 183px; left: 16px`; the hero copy starts at 319 px, leaving 21 px of clear vertical separation. The page has no horizontal overflow.

## Focused region comparison evidence

The hero's upper region contains the full scope of the requested change, so a separate crop was unnecessary. Direct element measurements confirmed that the badge remains visible, keeps its source aspect ratio, and does not collide with the eyebrow or headline. At 320 px wide the badge scales to 88 × 101 px and retains a 10 px gap before the copy.

## Findings and comparison history

1. **Initial — blocked, P1:** the mobile media query set `.partner-network-logo` to `display: none`, removing an important partner credential. Fixed by restoring the existing source asset and retaining its fixed hero placement.
2. **Initial — blocked, P1:** `.hero-copy.grid-shell` used `top: 44px; bottom: auto`, pulling the title into the missing badge's space. Fixed by restoring the established bottom-anchored hero rhythm with `top: auto; bottom: 140px`.
3. **First revision — blocked, P2:** the 100 px badge and copy overlapped vertically by 10 px at a 320 px viewport. Fixed by scaling only the badge at narrow widths with `width: min(100px, 27.5vw)`.
4. **Final revision — passed:** badge/copy gaps are 10 px at 320 px and 21 px at 390 px, with no horizontal overflow. The 720 px breakpoint and desktop layout remain intact.

## Required fidelity surfaces

- Fonts and typography: existing Pretendard typography, weights, line heights, authored line breaks, and gradient headline treatment are unchanged.
- Spacing and layout rhythm: partner badge and hero copy now follow the original pre-port vertical hierarchy; CTA and scroll link remain inside the hero.
- Colors and visual tokens: no color, gradient, opacity, or semantic token changes.
- Image quality and asset fidelity: the original `OAI_PartnerNetwork_SelectPartner_Portrait.svg` is reused without replacement or distortion.
- Copy and content: all Korean and localized AX copy remains unchanged.

## Functional verification

- Hero CTA remains visible and targets `#ax-contact`.
- Badge retains the alt text `OpenAI Partner Network Select Partner`.
- Browser console produced no warnings or errors in the verified state.
- Biome, Astro diagnostics, knip, and the production build passed.

final result: passed
