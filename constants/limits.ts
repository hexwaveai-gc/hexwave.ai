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
  AUDIO_GENERATION: {
    STANDARD: 20,       // Per minute of audio
    HD: 40,             // High quality audio
  },
  UPSCALE: 15,
  ENHANCE: 10,
} as const;

// =============================================================================
// FREE TIER CONFIGURATION
// =============================================================================

/**
 * Free tier trial period in days after signup
 * After this period, user must purchase a plan
 */
export const FREE_TIER_TRIAL_DAYS = 7;

/**
 * Free tier allowed tools
 * Users on free tier can only use these specific models
 */
export const FREE_TIER_ALLOWED_TOOLS = {
  /** Allowed image generation models for free tier */
  IMAGE: ["nano-banana"] as const,
  /** Allowed video generation models for free tier */
  VIDEO: ["ideogram"] as const,
  /** Allowed audio generation models for free tier */
  AUDIO: ["elevenlabs-basic"] as const,
} as const;

/**
 * Free tier daily limits per category
 */
export const FREE_TIER_DAILY_LIMITS = {
  /** Max image generations per day */
  IMAGE: 5,
  /** Max video generations per day */
  VIDEO: 1,
  /** Max audio generations per day */
  AUDIO: 1,
  /** Max total generations per day (all categories combined) */
  TOTAL: 7,
} as const;

/**
 * Free tier monthly limits per category
 */
export const FREE_TIER_MONTHLY_LIMITS = {
  /** Max image generations per month */
  IMAGE: 50,
  /** Max video generations per month */
  VIDEO: 10,
  /** Max audio generations per month */
  AUDIO: 10,
  /** Max total generations per month */
  TOTAL: 70,
} as const;

/**
 * Free tier features and restrictions
 */
export const FREE_TIER_CONFIG = {
  /** Trial period after signup (days) */
  TRIAL_DAYS: FREE_TIER_TRIAL_DAYS,
  /** Allowed tools/models per category */
  ALLOWED_TOOLS: FREE_TIER_ALLOWED_TOOLS,
  /** Daily generation limits */
  DAILY_LIMITS: FREE_TIER_DAILY_LIMITS,
  /** Monthly generation limits */
  MONTHLY_LIMITS: FREE_TIER_MONTHLY_LIMITS,
  /** Rate limit: requests per minute */
  REQUESTS_PER_MINUTE: 10,
  /** Max items in queue at once */
  MAX_QUEUE: 2,
  /** Days to retain generated media */
  RETENTION_DAYS: 7,
  /** Starting credits (one-time) */
  INITIAL_CREDITS: 50,
  /** Features available on free tier */
  FEATURES: [
    "basic_image_generation",
    "basic_video_generation", 
    "basic_audio_generation",
    "explore_gallery",
    "save_to_history",
  ] as const,
  /** Features NOT available on free tier */
  RESTRICTED_FEATURES: [
    "hd_output",
    "4k_output",
    "batch_generation",
    "priority_queue",
    "api_access",
    "custom_presets",
    "watermark_removal",
  ] as const,
} as const;

// =============================================================================
// PLAN TIER CONFIGURATIONS
// =============================================================================

/**
 * Plan tier limits and quotas
 */
export const PLAN_LIMITS = {
  FREE: {
    MONTHLY_CREDITS: FREE_TIER_CONFIG.INITIAL_CREDITS,
    MAX_QUEUE: FREE_TIER_CONFIG.MAX_QUEUE,
    RETENTION_DAYS: FREE_TIER_CONFIG.RETENTION_DAYS,
    DAILY_IMAGE: FREE_TIER_DAILY_LIMITS.IMAGE,
    DAILY_VIDEO: FREE_TIER_DAILY_LIMITS.VIDEO,
    DAILY_AUDIO: FREE_TIER_DAILY_LIMITS.AUDIO,
    MONTHLY_IMAGE: FREE_TIER_MONTHLY_LIMITS.IMAGE,
    MONTHLY_VIDEO: FREE_TIER_MONTHLY_LIMITS.VIDEO,
    MONTHLY_AUDIO: FREE_TIER_MONTHLY_LIMITS.AUDIO,
    REQUESTS_PER_MINUTE: FREE_TIER_CONFIG.REQUESTS_PER_MINUTE,
    ALLOWED_TOOLS: FREE_TIER_ALLOWED_TOOLS,
    TRIAL_DAYS: FREE_TIER_TRIAL_DAYS,
  },
  BASIC: {
    MONTHLY_CREDITS: 500,
    MAX_QUEUE: 5,
    RETENTION_DAYS: 30,
    DAILY_IMAGE: -1,          // Unlimited
    DAILY_VIDEO: 10,
    DAILY_AUDIO: 10,
    MONTHLY_IMAGE: -1,        // Unlimited
    MONTHLY_VIDEO: 100,
    MONTHLY_AUDIO: 100,
    REQUESTS_PER_MINUTE: 30,
    ALLOWED_TOOLS: "all" as const,
    TRIAL_DAYS: 0,            // No trial - paid plan
  },
  PRO: {
    MONTHLY_CREDITS: 2000,
    MAX_QUEUE: 10,
    RETENTION_DAYS: 90,
    DAILY_IMAGE: -1,          // Unlimited
    DAILY_VIDEO: -1,          // Unlimited
    DAILY_AUDIO: -1,          // Unlimited
    MONTHLY_IMAGE: -1,        // Unlimited
    MONTHLY_VIDEO: -1,        // Unlimited
    MONTHLY_AUDIO: -1,        // Unlimited
    REQUESTS_PER_MINUTE: 60,
    ALLOWED_TOOLS: "all" as const,
    TRIAL_DAYS: 0,
  },
  ULTIMATE: {
    MONTHLY_CREDITS: 8000,
    MAX_QUEUE: 20,
    RETENTION_DAYS: 180,
    DAILY_IMAGE: -1,
    DAILY_VIDEO: -1,
    DAILY_AUDIO: -1,
    MONTHLY_IMAGE: -1,
    MONTHLY_VIDEO: -1,
    MONTHLY_AUDIO: -1,
    REQUESTS_PER_MINUTE: 100,
    ALLOWED_TOOLS: "all" as const,
    TRIAL_DAYS: 0,
  },
  CREATOR: {
    MONTHLY_CREDITS: 20000,
    MAX_QUEUE: 50,
    RETENTION_DAYS: 365,
    DAILY_IMAGE: -1,
    DAILY_VIDEO: -1,
    DAILY_AUDIO: -1,
    MONTHLY_IMAGE: -1,
    MONTHLY_VIDEO: -1,
    MONTHLY_AUDIO: -1,
    REQUESTS_PER_MINUTE: 150,
    ALLOWED_TOOLS: "all" as const,
    TRIAL_DAYS: 0,
  },
  ENTERPRISE: {
    MONTHLY_CREDITS: -1,      // Unlimited
    MAX_QUEUE: 100,
    RETENTION_DAYS: -1,       // Unlimited
    DAILY_IMAGE: -1,
    DAILY_VIDEO: -1,
    DAILY_AUDIO: -1,
    MONTHLY_IMAGE: -1,
    MONTHLY_VIDEO: -1,
    MONTHLY_AUDIO: -1,
    REQUESTS_PER_MINUTE: 200,
    ALLOWED_TOOLS: "all" as const,
    TRIAL_DAYS: 0,
  },
} as const;

// =============================================================================
// HELPER TYPES
// =============================================================================

export type GenerationCategory = "image" | "video" | "audio";
export type PlanTierKey = keyof typeof PLAN_LIMITS;
export type FreeTierAllowedImageTool = typeof FREE_TIER_ALLOWED_TOOLS.IMAGE[number];
export type FreeTierAllowedVideoTool = typeof FREE_TIER_ALLOWED_TOOLS.VIDEO[number];
export type FreeTierAllowedAudioTool = typeof FREE_TIER_ALLOWED_TOOLS.AUDIO[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a tool is allowed for free tier users
 */
export function isToolAllowedForFreeTier(
  category: GenerationCategory,
  toolId: string
): boolean {
  const allowedTools = FREE_TIER_ALLOWED_TOOLS[category.toUpperCase() as keyof typeof FREE_TIER_ALLOWED_TOOLS];
  return allowedTools.includes(toolId as never);
}

/**
 * Get daily limit for a category and plan
 */
export function getDailyLimit(
  plan: PlanTierKey,
  category: GenerationCategory
): number {
  const planConfig = PLAN_LIMITS[plan];
  const key = `DAILY_${category.toUpperCase()}` as keyof typeof planConfig;
  return (planConfig[key] as number) ?? -1;
}

/**
 * Get monthly limit for a category and plan
 */
export function getMonthlyLimit(
  plan: PlanTierKey,
  category: GenerationCategory
): number {
  const planConfig = PLAN_LIMITS[plan];
  const key = `MONTHLY_${category.toUpperCase()}` as keyof typeof planConfig;
  return (planConfig[key] as number) ?? -1;
}

/**
 * Check if user's trial period has expired
 */
export function isTrialExpired(signupDate: Date): boolean {
  const trialEndDate = new Date(signupDate);
  trialEndDate.setDate(trialEndDate.getDate() + FREE_TIER_TRIAL_DAYS);
  return new Date() > trialEndDate;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(signupDate: Date): number {
  const trialEndDate = new Date(signupDate);
  trialEndDate.setDate(trialEndDate.getDate() + FREE_TIER_TRIAL_DAYS);
  const remaining = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

// =============================================================================
// OTHER LIMITS
// =============================================================================

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 0.8,  // Load more at 80% scroll
} as const;

// Rate limiting (general)
export const RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_GENERATIONS_PER_HOUR: 100,
} as const;

