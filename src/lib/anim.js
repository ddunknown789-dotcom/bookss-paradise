// Verification/accessibility switch: ?noanim renders the site in its final
// state with all scroll/entrance animations disabled.
export const NOANIM =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).has('noanim') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// Touch / coarse-pointer devices: skip the WebGL fluid cursor (it needs a
// hovering pointer to read as a cursor, and it's a battery/GPU drain on phones).
// Key off the PRIMARY pointer only — a desktop keeps the cursor at any window
// size; phones/tablets (coarse pointer / no hover) don't get it.
export const IS_TOUCH =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches

// Lighter-weight flag for thinning the particle field on small/touch screens.
export const IS_SMALL =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 820)
