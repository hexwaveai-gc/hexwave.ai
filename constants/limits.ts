/**
 * Application Limits & Constraints
 * 
 * Configuration values for file sizes, quotas, and other limits.
 */

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,     // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024,    // 100MB
  MAX_AUDIO_SIZE: 25 * 1024 * 1024,     // 25MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
} as const;

// Generation limits
export const GENERATION_LIMITS = {
  MAX_IMAGES_PER_REQUEST: 4,
  MAX_PROMPT_LENGTH: 4000,
  MAX_NEGATIVE_PROMPT_LENGTH: 1000,
  MIN_IMAGE_DIMENSION: 256,
  MAX_IMAGE_DIMENSION: 2048,
} as const;

// Credit costs
export const CREDIT_COSTS = {
  IMAGE_GENERATION: {
    STANDARD: 10,
    HD: 20,
    ULTRA: 40,
  },
  VIDEO_GENERATION: {
    SHORT: 50,          // 5 seconds
    MEDIUM: 100,        // 10 seconds
    LONG: 200,          // 20+ seconds
  },
  UPSCALE: 15,
  ENHANCE: 10,
} as const;

// Plan tiers
export const PLAN_LIMITS = {
  FREE: {
    MONTHLY_CREDITS: 50,
    MAX_QUEUE: 2,
    RETENTION_DAYS: 7,
  },
  BASIC: {
    MONTHLY_CREDITS: 500,
    MAX_QUEUE: 5,
    RETENTION_DAYS: 30,
  },
  PRO: {
    MONTHLY_CREDITS: 2000,
    MAX_QUEUE: 10,
    RETENTION_DAYS: 90,
  },
  ENTERPRISE: {
    MONTHLY_CREDITS: -1,    // Unlimited
    MAX_QUEUE: 50,
    RETENTION_DAYS: 365,
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 0.8,  // Load more at 80% scroll
} as const;

// Rate limiting
export const RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_GENERATIONS_PER_HOUR: 100,
} as const;

