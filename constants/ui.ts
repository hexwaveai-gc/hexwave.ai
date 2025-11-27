/**
 * UI Constants
 * 
 * Configuration values for animations, delays, and UI-related settings.
 */

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  INSTANT: 0,
  FAST: 150,
  DEFAULT: 200,
  MEDIUM: 300,
  SLOW: 500,
} as const;

// Debounce & throttle delays (in milliseconds)
export const DEBOUNCE_DELAY = {
  SEARCH: 300,                // Search input debounce
  RESIZE: 150,                // Window resize
  SCROLL: 100,                // Scroll events
  INPUT: 500,                 // General input debounce
} as const;

// Toast/notification durations (in milliseconds)
export const TOAST_DURATION = {
  SHORT: 3000,
  DEFAULT: 5000,
  LONG: 8000,
  PERSISTENT: 0,              // Requires manual dismissal
} as const;

// Modal/dialog settings
export const MODAL = {
  ANIMATION_DURATION: 200,
  BACKDROP_BLUR: "sm",
  MAX_WIDTH: {
    SM: 400,
    MD: 500,
    LG: 600,
    XL: 800,
    FULL: "100%",
  },
} as const;

// Breakpoints (in pixels) - matches Tailwind defaults
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 50,
  STICKY: 100,
  FIXED: 200,
  MODAL_BACKDROP: 400,
  MODAL: 500,
  POPOVER: 600,
  TOOLTIP: 700,
  TOAST: 800,
  MAX: 9999,
} as const;

// Spacing (in pixels)
export const SPACING = {
  PAGE_PADDING: 24,
  SECTION_GAP: 24,
  ELEMENT_GAP: 16,
  CARD_PADDING: 24,
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 76,
} as const;

