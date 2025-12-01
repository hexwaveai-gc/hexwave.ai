/**
 * ============================================================================
 * CENTRALIZED PRICING CONFIGURATION
 * ============================================================================
 * 
 * Single source of truth for ALL pricing across the platform.
 * 
 * This file handles:
 * - 3rd party API costs (what we pay)
 * - Platform markup calculation (40% margin by default)
 * - Virtual credit conversion (1$ = 200 credits)
 * - All pricing types (per_image, per_second, per_minute, fixed, tiered)
 * 
 * To add a new model:
 * 1. Add entry to the appropriate MODEL_COSTS section
 * 2. Specify the 3rd party cost and pricing type
 * 3. The system automatically calculates user credits with platform fee
 * 
 * To change pricing strategy:
 * 1. Update PLATFORM_CONFIG values
 * 2. All costs are automatically recalculated
 */

// =============================================================================
// PLATFORM CONFIGURATION
// =============================================================================

/**
 * Core platform pricing configuration
 * 
 * CREDIT_RATIO: How many credits equal $1
 * PLATFORM_MARGIN: Percentage markup on 3rd party costs (0.40 = 40%)
 * 
 * Formula: User Credits = (3rd Party Cost × (1 + PLATFORM_MARGIN)) × CREDIT_RATIO
 * 
 * Example with $0.04 API cost:
 * - With margin: $0.04 × 1.40 = $0.056
 * - User credits: $0.056 × 200 = 11.2 credits (rounded to 12)
 */
export const PLATFORM_CONFIG = {
  /** Credits per dollar (1$ = 200 credits) */
  CREDIT_RATIO: 200,
  
  /** Platform margin on top of 3rd party costs (40% = 0.40) */
  PLATFORM_MARGIN: 0.40,
  
  /** Minimum credits to charge for any operation */
  MIN_CREDITS: 1,
  
  /** Credit rounding strategy: "ceil" | "floor" | "round" */
  ROUNDING: "ceil" as const,
} as const;

// =============================================================================
// PRICING TYPES
// =============================================================================

/**
 * Supported pricing models across all tools
 */
export type PricingType = 
  | "per_image"      // Cost per image generated
  | "per_second"     // Cost per second of video/audio
  | "per_minute"     // Cost per minute of audio
  | "per_character"  // Cost per character (TTS)
  | "fixed"          // Fixed cost per generation
  | "tiered"         // Resolution/quality-based pricing
  | "tiered_template"; // Template tier-based (e.g., Vidu)

/**
 * Base cost configuration
 */
export interface BaseCostConfig {
  /** 3rd party API cost in USD */
  thirdPartyCost: number;
  
  /** Pricing type */
  type: PricingType;
  
  /** Provider name (for tracking) */
  provider: string;
  
  /** Human-readable description */
  description?: string;
  
  /** Whether this model is active */
  isActive?: boolean;
  
  /** Minimum units (e.g., min 5 seconds) */
  minUnits?: number;
  
  /** Maximum units */
  maxUnits?: number;
}

/**
 * Per-unit cost config (per_image, per_second, per_minute, per_character)
 */
export interface PerUnitCostConfig extends BaseCostConfig {
  type: "per_image" | "per_second" | "per_minute" | "per_character";
}

/**
 * Fixed cost config
 */
export interface FixedCostConfig extends BaseCostConfig {
  type: "fixed";
  /** Fixed duration included (for display) */
  includedDuration?: number;
}

/**
 * Tiered cost config (resolution-based)
 */
export interface TieredCostConfig extends BaseCostConfig {
  type: "tiered";
  /** Base cost (fallback) */
  baseCost?: number;
  /** Tier-specific costs */
  tiers: {
    id: string;
    label: string;
    thirdPartyCost: number;
  }[];
}

/**
 * Template tier cost config (for models like Vidu)
 */
export interface TemplateTierCostConfig extends BaseCostConfig {
  type: "tiered_template";
  /** Standard tier cost */
  standardCost: number;
  /** Premium tier cost */
  premiumCost: number;
  /** Advanced tier cost */
  advancedCost: number;
}

export type CostConfig = 
  | PerUnitCostConfig 
  | FixedCostConfig 
  | TieredCostConfig 
  | TemplateTierCostConfig;

// =============================================================================
// TOOL CATEGORIES
// =============================================================================

export type ToolCategory = "image" | "video" | "audio" | "avatar" | "ugc" | "other";

export interface ModelPricing {
  /** Unique model identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Tool category */
  category: ToolCategory;
  
  /** Cost configuration */
  cost: CostConfig;
  
  /** Special cost modifiers (e.g., 4K = 2x cost) */
  modifiers?: CostModifier[];
}

export interface CostModifier {
  /** Condition field (e.g., "resolution", "quality") */
  field: string;
  
  /** Condition value (e.g., "4k", "ultra") */
  value: string | string[];
  
  /** Multiplier to apply */
  multiplier: number;
  
  /** Description */
  description?: string;
}

// =============================================================================
// IMAGE GENERATION PRICING
// =============================================================================

export const IMAGE_MODEL_COSTS: Record<string, ModelPricing> = {
  // FLUX Models (fal.ai)
  "flux-1-1-pro": {
    id: "flux-1-1-pro",
    name: "FLUX 1.1 Pro",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "fal.ai",
      description: "Updated pro version with improved detail",
    },
  },
  "flux-1-1-pro-ultra": {
    id: "flux-1-1-pro-ultra",
    name: "FLUX 1.1 Pro Ultra",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.06,
      provider: "fal.ai",
      description: "Ultimate FLUX with maximum quality",
    },
  },
  "flux-pro": {
    id: "flux-pro",
    name: "FLUX Pro",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "fal.ai",
    },
  },
  "flux-pro-kontext": {
    id: "flux-pro-kontext",
    name: "FLUX Pro Kontext",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "fal.ai",
    },
  },
  "flux-pro-kontext-max": {
    id: "flux-pro-kontext-max",
    name: "FLUX Pro Kontext Max",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.08,
      provider: "fal.ai",
    },
  },
  "flux-dev": {
    id: "flux-dev",
    name: "FLUX Dev",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.025,
      provider: "fal.ai",
    },
  },
  
  // Ideogram Models
  "ideogram-v2": {
    id: "ideogram-v2",
    name: "Ideogram V2",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.08,
      provider: "fal.ai",
    },
  },
  "ideogram-v2-turbo": {
    id: "ideogram-v2-turbo",
    name: "Ideogram V2 Turbo",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  "ideogram-v2a": {
    id: "ideogram-v2a",
    name: "Ideogram V2a",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "fal.ai",
    },
  },
  "ideogram-v2a-turbo": {
    id: "ideogram-v2a-turbo",
    name: "Ideogram V2a Turbo",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.025,
      provider: "fal.ai",
    },
  },
  "ideogram-v3": {
    id: "ideogram-v3",
    name: "Ideogram V3",
    category: "image",
    cost: {
      type: "tiered",
      thirdPartyCost: 0.06, // Default (balanced)
      provider: "fal.ai",
      tiers: [
        { id: "TURBO", label: "Turbo", thirdPartyCost: 0.03 },
        { id: "BALANCED", label: "Balanced", thirdPartyCost: 0.06 },
        { id: "QUALITY", label: "Quality", thirdPartyCost: 0.09 },
      ],
    },
  },
  
  // Stable Diffusion Models
  "stable-diffusion-3": {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.048,
      provider: "fal.ai",
    },
  },
  "stable-diffusion-3-5": {
    id: "stable-diffusion-3-5",
    name: "Stable Diffusion 3.5",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.065,
      provider: "fal.ai",
    },
  },
  "stable-diffusion-3-5-large": {
    id: "stable-diffusion-3-5-large",
    name: "SD 3.5 Large",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.084,
      provider: "fal.ai",
    },
  },
  "stable-diffusion-3-5-large-turbo": {
    id: "stable-diffusion-3-5-large-turbo",
    name: "SD 3.5 Large Turbo",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.042,
      provider: "fal.ai",
    },
  },
  "sdxl": {
    id: "sdxl",
    name: "SDXL",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.012,
      provider: "fal.ai",
    },
  },
  
  // Recraft
  "recraft-v3": {
    id: "recraft-v3",
    name: "Recraft V3",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "fal.ai",
    },
  },
  
  // Google Models
  "imagen-3": {
    id: "imagen-3",
    name: "Imagen 3",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  "imagen-4": {
    id: "imagen-4",
    name: "Imagen 4",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.06,
      provider: "fal.ai",
    },
  },
  "gemini-25-flash-image": {
    id: "gemini-25-flash-image",
    name: "Gemini 2.5 Flash",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.039,
      provider: "fal.ai",
    },
  },
  
  // Luma
  "luma-photon": {
    id: "luma-photon",
    name: "Luma Photon",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.024,
      provider: "fal.ai",
    },
  },
  "luma-photon-flash": {
    id: "luma-photon-flash",
    name: "Luma Photon Flash",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.012,
      provider: "fal.ai",
    },
  },
  
  // ByteDance Models
  "seedream-v3": {
    id: "seedream-v3",
    name: "Seedream V3",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.03,
      provider: "fal.ai (ByteDance)",
    },
  },
  "seedream-v4": {
    id: "seedream-v4",
    name: "Seedream V4",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.03,
      provider: "fal.ai (ByteDance)",
    },
  },
  "dreamina-v31": {
    id: "dreamina-v31",
    name: "Dreamina V3.1",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.03,
      provider: "fal.ai (ByteDance)",
    },
  },
  
  // Other Models
  "qwen-image": {
    id: "qwen-image",
    name: "Qwen Image",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.02,
      provider: "fal.ai",
    },
  },
  "runwaygen4": {
    id: "runwaygen4",
    name: "Runway Gen-4",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.08,
      provider: "Replicate (Runway)",
    },
  },
  "wan-v2-2-a14b": {
    id: "wan-v2-2-a14b",
    name: "Wan 2.2 14B",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.03,
      provider: "fal.ai",
    },
  },
  "wan-25": {
    id: "wan-25",
    name: "Wan 2.5",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  "hunyuan-v3": {
    id: "hunyuan-v3",
    name: "Hunyuan V3",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.10,
      provider: "fal.ai (Tencent)",
    },
  },
  "nano-banana-pro": {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.15,
      provider: "fal.ai",
    },
    modifiers: [
      {
        field: "resolution",
        value: "4k",
        multiplier: 2,
        description: "4K resolution doubles the cost",
      },
    ],
  },
  "midjourney": {
    id: "midjourney",
    name: "Midjourney",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.10,
      provider: "fal.ai",
    },
  },
  "dall-e-3": {
    id: "dall-e-3",
    name: "DALL-E 3",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "OpenAI",
    },
  },
  "gpt-image-1": {
    id: "gpt-image-1",
    name: "GPT Image 1",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.05,
      provider: "OpenAI",
    },
  },
  "leonardo-phoenix": {
    id: "leonardo-phoenix",
    name: "Leonardo Phoenix",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  "leonardo-photoreal": {
    id: "leonardo-photoreal",
    name: "Leonardo Photoreal",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  "reve": {
    id: "reve",
    name: "Reve",
    category: "image",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.04,
      provider: "fal.ai",
    },
  },
};

// =============================================================================
// VIDEO GENERATION PRICING
// =============================================================================

export const VIDEO_MODEL_COSTS: Record<string, ModelPricing> = {
  // Veo (Google)
  "veo3": {
    id: "veo3",
    name: "Veo 3",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.35,
      provider: "fal.ai (Google)",
      description: "Google's advanced video generation with audio",
    },
  },
  "veo3-1": {
    id: "veo3-1",
    name: "Veo 3.1",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.40,
      provider: "fal.ai (Google)",
    },
  },
  "veo2": {
    id: "veo2",
    name: "Veo 2",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.35,
      provider: "fal.ai (Google)",
    },
  },
  
  // Kling Models
  "kling-v1": {
    id: "kling-v1",
    name: "Kling V1",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.05,
      provider: "fal.ai (Kuaishou)",
    },
  },
  "kling-v1-5": {
    id: "kling-v1-5",
    name: "Kling V1.5",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.06,
      provider: "fal.ai (Kuaishou)",
    },
  },
  "kling-v1-6": {
    id: "kling-v1-6",
    name: "Kling V1.6",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.07,
      provider: "fal.ai (Kuaishou)",
    },
  },
  "kling-v2": {
    id: "kling-v2",
    name: "Kling V2",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.10,
      provider: "fal.ai (Kuaishou)",
    },
  },
  "kling-v2-1": {
    id: "kling-v2-1",
    name: "Kling V2.1",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.15,
      provider: "fal.ai (Kuaishou)",
    },
  },
  "kling-v2-master": {
    id: "kling-v2-master",
    name: "Kling V2 Master",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.20,
      provider: "fal.ai (Kuaishou)",
    },
  },
  
  // Wan Models
  "wan-animate-replace": {
    id: "wan-animate-replace",
    name: "Wan 2.2 Replace",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.08,
      provider: "fal.ai",
    },
  },
  "wan-animate-move": {
    id: "wan-animate-move",
    name: "Wan 2.2 Animate",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.08,
      provider: "fal.ai",
    },
  },
  "wan-t2v": {
    id: "wan-t2v",
    name: "Wan Text-to-Video",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.06,
      provider: "fal.ai",
    },
  },
  "wan-i2v": {
    id: "wan-i2v",
    name: "Wan Image-to-Video",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.06,
      provider: "fal.ai",
    },
  },
  
  // Runway
  "runway-gen3": {
    id: "runway-gen3",
    name: "Runway Gen-3",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.05,
      provider: "Replicate (Runway)",
    },
  },
  "runway-gen3-turbo": {
    id: "runway-gen3-turbo",
    name: "Runway Gen-3 Turbo",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.025,
      provider: "Replicate (Runway)",
    },
  },
  
  // Luma
  "luma-dream-machine": {
    id: "luma-dream-machine",
    name: "Luma Dream Machine",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.032,
      provider: "fal.ai (Luma)",
    },
  },
  "luma-ray": {
    id: "luma-ray",
    name: "Luma Ray",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.05,
      provider: "fal.ai (Luma)",
    },
  },
  "luma-ray2": {
    id: "luma-ray2",
    name: "Luma Ray 2",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.05,
      provider: "fal.ai (Luma)",
    },
  },
  "luma-ray2-flash": {
    id: "luma-ray2-flash",
    name: "Luma Ray 2 Flash",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.02,
      provider: "fal.ai (Luma)",
    },
  },
  
  // Minimax (Hailuo)
  "minimax-video-01": {
    id: "minimax-video-01",
    name: "Minimax Video-01",
    category: "video",
    cost: {
      type: "fixed",
      thirdPartyCost: 0.25,
      includedDuration: 6,
      provider: "fal.ai (Minimax)",
    },
  },
  "minimax-video-01-live": {
    id: "minimax-video-01-live",
    name: "Minimax Video-01 Live",
    category: "video",
    cost: {
      type: "fixed",
      thirdPartyCost: 0.25,
      includedDuration: 6,
      provider: "fal.ai (Minimax)",
    },
  },
  "hailuo-i2v-01": {
    id: "hailuo-i2v-01",
    name: "Hailuo I2V-01",
    category: "video",
    cost: {
      type: "fixed",
      thirdPartyCost: 0.30,
      includedDuration: 5,
      provider: "fal.ai (Hailuo)",
    },
  },
  "hailuo-i2v-01-live": {
    id: "hailuo-i2v-01-live",
    name: "Hailuo I2V-01 Live",
    category: "video",
    cost: {
      type: "fixed",
      thirdPartyCost: 0.25,
      includedDuration: 6,
      provider: "fal.ai (Hailuo)",
    },
  },
  
  // Pika
  "pika-v1-5": {
    id: "pika-v1-5",
    name: "Pika V1.5",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.035,
      provider: "fal.ai",
    },
  },
  "pika-v2": {
    id: "pika-v2",
    name: "Pika V2",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  "pika-v2-1": {
    id: "pika-v2-1",
    name: "Pika V2.1",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.05,
      provider: "fal.ai",
    },
  },
  
  // Vidu (with template tiers)
  "vidu-reference": {
    id: "vidu-reference",
    name: "Vidu Reference",
    category: "video",
    cost: {
      type: "tiered_template",
      thirdPartyCost: 0.20, // Default
      standardCost: 0.20,
      premiumCost: 0.30,
      advancedCost: 0.50,
      provider: "fal.ai (Vidu)",
    },
  },
  
  // HunyuanVideo
  "hunyuan-video": {
    id: "hunyuan-video",
    name: "Hunyuan Video",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.10,
      provider: "fal.ai (Tencent)",
    },
  },
  
  // CogVideo
  "cogvideox-5b": {
    id: "cogvideox-5b",
    name: "CogVideoX 5B",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.02,
      provider: "fal.ai",
    },
  },
  
  // LTX Video
  "ltx-video-v09": {
    id: "ltx-video-v09",
    name: "LTX Video 0.9",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.004,
      provider: "fal.ai",
    },
  },
  "ltx-video-v095": {
    id: "ltx-video-v095",
    name: "LTX Video 0.95",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.004,
      provider: "fal.ai",
    },
  },
  
  // Mochi
  "mochi-v1": {
    id: "mochi-v1",
    name: "Mochi V1",
    category: "video",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.03,
      provider: "fal.ai",
    },
  },
};

// =============================================================================
// AUDIO GENERATION PRICING
// =============================================================================

export const AUDIO_MODEL_COSTS: Record<string, ModelPricing> = {
  // ElevenLabs TTS
  "elevenlabs-multilingual-v2": {
    id: "elevenlabs-multilingual-v2",
    name: "ElevenLabs Multilingual V2",
    category: "audio",
    cost: {
      type: "per_character",
      thirdPartyCost: 0.00003, // $0.03 per 1000 chars
      provider: "ElevenLabs",
    },
  },
  "elevenlabs-turbo-v2-5": {
    id: "elevenlabs-turbo-v2-5",
    name: "ElevenLabs Turbo V2.5",
    category: "audio",
    cost: {
      type: "per_character",
      thirdPartyCost: 0.000018, // $0.018 per 1000 chars
      provider: "ElevenLabs",
    },
  },
  "elevenlabs-flash-v2-5": {
    id: "elevenlabs-flash-v2-5",
    name: "ElevenLabs Flash V2.5",
    category: "audio",
    cost: {
      type: "per_character",
      thirdPartyCost: 0.000015, // $0.015 per 1000 chars
      provider: "ElevenLabs",
    },
  },
  
  // Voice Cloning
  "elevenlabs-voice-clone": {
    id: "elevenlabs-voice-clone",
    name: "ElevenLabs Voice Clone",
    category: "audio",
    cost: {
      type: "fixed",
      thirdPartyCost: 0.50, // Per clone
      provider: "ElevenLabs",
    },
  },
  
  // Sound Effects
  "elevenlabs-sfx": {
    id: "elevenlabs-sfx",
    name: "ElevenLabs Sound Effects",
    category: "audio",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.01,
      provider: "ElevenLabs",
    },
  },
  
  // Music Generation
  "suno-v3-5": {
    id: "suno-v3-5",
    name: "Suno V3.5",
    category: "audio",
    cost: {
      type: "per_minute",
      thirdPartyCost: 0.05,
      provider: "Suno",
    },
  },
  "suno-v4": {
    id: "suno-v4",
    name: "Suno V4",
    category: "audio",
    cost: {
      type: "per_minute",
      thirdPartyCost: 0.10,
      provider: "Suno",
    },
  },
  "udio-v1": {
    id: "udio-v1",
    name: "Udio V1",
    category: "audio",
    cost: {
      type: "per_minute",
      thirdPartyCost: 0.08,
      provider: "Udio",
    },
  },
};

// =============================================================================
// AVATAR GENERATION PRICING
// =============================================================================

export const AVATAR_MODEL_COSTS: Record<string, ModelPricing> = {
  // HeyGen
  "heygen-avatar-v2": {
    id: "heygen-avatar-v2",
    name: "HeyGen Avatar V2",
    category: "avatar",
    cost: {
      type: "per_minute",
      thirdPartyCost: 0.10,
      provider: "HeyGen",
    },
  },
  "heygen-avatar-v3": {
    id: "heygen-avatar-v3",
    name: "HeyGen Avatar V3",
    category: "avatar",
    cost: {
      type: "per_minute",
      thirdPartyCost: 0.12,
      provider: "HeyGen",
    },
  },
  
  // Hedra
  "hedra-character": {
    id: "hedra-character",
    name: "Hedra Character",
    category: "avatar",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.04,
      provider: "Hedra",
    },
  },
  
  // Sync Labs
  "synclabs-lip-sync": {
    id: "synclabs-lip-sync",
    name: "Sync Labs Lip Sync",
    category: "avatar",
    cost: {
      type: "per_second",
      thirdPartyCost: 0.02,
      provider: "Sync Labs",
    },
  },
};

// =============================================================================
// UGC / OTHER TOOLS PRICING
// =============================================================================

export const OTHER_MODEL_COSTS: Record<string, ModelPricing> = {
  // Upscale
  "image-upscale-2x": {
    id: "image-upscale-2x",
    name: "Image Upscale 2x",
    category: "other",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.01,
      provider: "fal.ai",
    },
  },
  "image-upscale-4x": {
    id: "image-upscale-4x",
    name: "Image Upscale 4x",
    category: "other",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.02,
      provider: "fal.ai",
    },
  },
  
  // Background Removal
  "background-removal": {
    id: "background-removal",
    name: "Background Removal",
    category: "other",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.01,
      provider: "fal.ai",
    },
  },
  
  // Face Swap
  "face-swap": {
    id: "face-swap",
    name: "Face Swap",
    category: "other",
    cost: {
      type: "per_image",
      thirdPartyCost: 0.02,
      provider: "fal.ai",
    },
  },
};

// =============================================================================
// COMBINED PRICING REGISTRY
// =============================================================================

/**
 * All model costs combined - Single source of truth
 */
export const ALL_MODEL_COSTS: Record<string, ModelPricing> = {
  ...IMAGE_MODEL_COSTS,
  ...VIDEO_MODEL_COSTS,
  ...AUDIO_MODEL_COSTS,
  ...AVATAR_MODEL_COSTS,
  ...OTHER_MODEL_COSTS,
};

// =============================================================================
// HELPER TYPES FOR EXPORTS
// =============================================================================

export type ImageModelId = keyof typeof IMAGE_MODEL_COSTS;
export type VideoModelId = keyof typeof VIDEO_MODEL_COSTS;
export type AudioModelId = keyof typeof AUDIO_MODEL_COSTS;
export type AvatarModelId = keyof typeof AVATAR_MODEL_COSTS;
export type OtherModelId = keyof typeof OTHER_MODEL_COSTS;
export type ModelId = keyof typeof ALL_MODEL_COSTS;





