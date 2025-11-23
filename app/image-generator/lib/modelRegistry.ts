/**
 * Centralized Model Registry for Image Generation
 * Contains all available image generation models with their settings and metadata
 * Organized by provider/family for easy maintenance
 */

// Runway Models
import runwaygen4Settings from "./models/runwaygen4/settings";

// Flux Models (Black Forest Labs)
import fluxProSettings from "./models/flux-pro/settings";
import fluxDevSettings from "./models/flux-dev/settings";
import flux11ProSettings from "./models/flux-1-1-pro/settings";
import flux11ProUltraSettings from "./models/flux-1-1-pro-ultra/settings";
import fluxProKontextSettings from "./models/flux-pro-kontext/settings";

// OpenAI Models
import { dallE3Settings } from "./models/dall-e-3/settings";

// Ideogram Models
import ideogramV2Settings from "./models/ideogram-v2/settings";
import ideogramV2TurboSettings from "./models/ideogram-v2-turbo/settings";
import ideogramV2aSettings from "./models/ideogram-v2a/settings";
import ideogramV2aTurboSettings from "./models/ideogram-v2a-turbo/settings";
import ideogramV3Settings from "./models/ideogram-v3/settings";

// Leonardo Models
import { leonardoPhoenixSettings } from "./models/leonardo-phoenix/settings";
import { leonardoPhotorealSettings } from "./models/leonardo-photoreal/settings";
import { leonardoTransparencySettings } from "./models/leonardo-transparency/settings";

// Luma AI Models
import lumaPhotonSettings from "./models/luma-photon/settings";
import lumaPhotonFlashSettings from "./models/luma-photon-flash/settings";

// Google Models
import imagen3Settings from "./models/imagen-3/settings";
import gemini25FlashImageSettings from "./models/gemini-25-flash-image/settings";

// Stability AI Models
import stableDiffusion3Settings from "./models/stable-diffusion-3/settings";
// Note: stable-diffusion-3-5 has no settings file
import { stableDiffusion35LargeSettings } from "./models/stable-diffusion-3-5-large/settings";
import { stableDiffusion35LargeTurboSettings } from "./models/stable-diffusion-3-5-large-turbo/settings";
import sdxlSettings from "./models/sdxl/settings";

// ByteDance Models
import seedreamV3Settings from "./models/seedream-v3/settings";
import seedreamV4Settings from "./models/seedream-v4/settings";
import hailuo from "./models/wan-v2-2-a14b/settings";
import wan25Settings from "./models/wan-25/settings";
import hunyuanV3Settings from "./models/hunyuan-v3/settings";
import dreaminaV31Settings from "./models/dreamina-v31/settings";

// Other Models
import { midjourneySettings } from "./models/midjourney/settings";
import recraftV3Settings from "./models/recraft-v3/settings";
import reveSettings from "./models/reve/settings";
import qwenImageSettings from "./models/qwen-image/settings";
import { gptImage1Settings } from "./models/gpt-image-1/settings";
import nanoBananaProSettings from "./models/nano-banana-pro/settings";

export type ModelSettings = Record<string, any>;

export interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: ModelSettings;
  credits_per_generation?: number;
  featured?: boolean;
}

/**
 * Comprehensive registry of all available image generation models
 * Grouped by provider/family for better organization
 */
export const MODEL_REGISTRY: Record<string, Model> = {
  // === RUNWAY MODELS ===
  runwaygen4: {
    id: "runwaygen4",
    name: "Runway Gen-4",
    description: "High-quality image generation with reference support",
    category: "Runway",
    settings: runwaygen4Settings,
    credits_per_generation: 1,
    featured: true,
  },

  // === FLUX MODELS (Black Forest Labs) ===
  "flux-pro": {
    id: "flux-pro",
    name: "Flux Pro",
    description: "Fast and flexible professional image generation",
    category: "Flux",
    settings: fluxProSettings,
    credits_per_generation: 1,
    featured: true,
  },
  "flux-dev": {
    id: "flux-dev",
    name: "Flux Dev",
    description: "Development version with experimental features",
    category: "Flux",
    settings: fluxDevSettings,
    credits_per_generation: 1,
  },
  "flux-1-1-pro": {
    id: "flux-1-1-pro",
    name: "Flux 1.1 Pro",
    description: "Latest professional version with improved quality",
    category: "Flux",
    settings: flux11ProSettings,
    credits_per_generation: 1,
    featured: true,
  },
  "flux-1-1-pro-ultra": {
    id: "flux-1-1-pro-ultra",
    name: "Flux 1.1 Pro Ultra",
    description: "Ultra high-quality generation with enhanced details",
    category: "Flux",
    settings: flux11ProUltraSettings,
    credits_per_generation: 2,
  },
  "flux-pro-kontext": {
    id: "flux-pro-kontext",
    name: "Flux Pro Kontext",
    description: "Context-aware generation with improved coherence",
    category: "Flux",
    settings: fluxProKontextSettings,
    credits_per_generation: 1,
  },

  // === OPENAI MODELS ===
  "dall-e-3": {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "OpenAI's latest image generation model",
    category: "OpenAI",
    settings: dallE3Settings,
    credits_per_generation: 1,
    featured: true,
  },

  // === IDEOGRAM MODELS ===
  "ideogram-v2": {
    id: "ideogram-v2",
    name: "Ideogram v2",
    description: "Text rendering and creative image generation",
    category: "Ideogram",
    settings: ideogramV2Settings,
    credits_per_generation: 1,
  },
  "ideogram-v2-turbo": {
    id: "ideogram-v2-turbo",
    name: "Ideogram v2 Turbo",
    description: "Faster version with quick generation times",
    category: "Ideogram",
    settings: ideogramV2TurboSettings,
    credits_per_generation: 1,
  },
  "ideogram-v2a": {
    id: "ideogram-v2a",
    name: "Ideogram v2a",
    description: "Advanced v2 with improved quality",
    category: "Ideogram",
    settings: ideogramV2aSettings,
    credits_per_generation: 1,
  },
  "ideogram-v2a-turbo": {
    id: "ideogram-v2a-turbo",
    name: "Ideogram v2a Turbo",
    description: "Fast advanced generation",
    category: "Ideogram",
    settings: ideogramV2aTurboSettings,
    credits_per_generation: 1,
  },
  "ideogram-v3": {
    id: "ideogram-v3",
    name: "Ideogram v3",
    description: "Latest version with enhanced capabilities",
    category: "Ideogram",
    settings: ideogramV3Settings,
    credits_per_generation: 1,
    featured: true,
  },

  // === LEONARDO MODELS ===
  "leonardo-phoenix": {
    id: "leonardo-phoenix",
    name: "Leonardo Phoenix",
    description: "High-quality artistic image generation",
    category: "Leonardo",
    settings: leonardoPhoenixSettings,
    credits_per_generation: 1,
    featured: true,
  },
  "leonardo-photoreal": {
    id: "leonardo-photoreal",
    name: "Leonardo Photoreal",
    description: "Photorealistic image generation",
    category: "Leonardo",
    settings: leonardoPhotorealSettings,
    credits_per_generation: 1,
  },
  "leonardo-transparency": {
    id: "leonardo-transparency",
    name: "Leonardo Transparency",
    description: "Generate images with transparent backgrounds",
    category: "Leonardo",
    settings: leonardoTransparencySettings,
    credits_per_generation: 1,
  },

  // === LUMA AI MODELS ===
  "luma-photon": {
    id: "luma-photon",
    name: "Luma Photon",
    description: "Fast and efficient photorealistic generation",
    category: "Luma",
    settings: lumaPhotonSettings,
    credits_per_generation: 1,
    featured: true,
  },
  "luma-photon-flash": {
    id: "luma-photon-flash",
    name: "Luma Photon Flash",
    description: "Lightning-fast image generation",
    category: "Luma",
    settings: lumaPhotonFlashSettings,
    credits_per_generation: 1,
  },

  // === GOOGLE MODELS ===
  "imagen-3": {
    id: "imagen-3",
    name: "Imagen 3",
    description: "Google's advanced image generation model",
    category: "Google",
    settings: imagen3Settings,
    credits_per_generation: 1,
    featured: true,
  },
  "gemini-25-flash-image": {
    id: "gemini-25-flash-image",
    name: "Gemini 2.5 Flash Image",
    description: "Fast image generation powered by Gemini",
    category: "Google",
    settings: gemini25FlashImageSettings,
    credits_per_generation: 1,
  },

  // === STABILITY AI MODELS ===
  "stable-diffusion-3": {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3",
    description: "Open model with high-quality outputs",
    category: "Stability AI",
    settings: stableDiffusion3Settings,
    credits_per_generation: 1,
  },
  "stable-diffusion-3-5-large": {
    id: "stable-diffusion-3-5-large",
    name: "Stable Diffusion 3.5 Large",
    description: "Large model for maximum quality",
    category: "Stability AI",
    settings: stableDiffusion35LargeSettings,
    credits_per_generation: 2,
    featured: true,
  },
  "stable-diffusion-3-5-large-turbo": {
    id: "stable-diffusion-3-5-large-turbo",
    name: "Stable Diffusion 3.5 Large Turbo",
    description: "Fast large model generation",
    category: "Stability AI",
    settings: stableDiffusion35LargeTurboSettings,
    credits_per_generation: 1,
  },
  sdxl: {
    id: "sdxl",
    name: "SDXL",
    description: "Stable Diffusion XL for high-resolution images",
    category: "Stability AI",
    settings: sdxlSettings,
    credits_per_generation: 1,
  },

  // === BYTEDANCE MODELS ===
  "seedream-v3": {
    id: "seedream-v3",
    name: "Seedream v3",
    description: "Creative image generation",
    category: "ByteDance",
    settings: seedreamV3Settings,
    credits_per_generation: 1,
  },
  "seedream-v4": {
    id: "seedream-v4",
    name: "Seedream v4",
    description: "Latest version with improved quality",
    category: "ByteDance",
    settings: seedreamV4Settings,
    credits_per_generation: 1,
  },
  "wan-v2-2-a14b": {
    id: "wan-v2-2-a14b",
    name: "Hailuo (Wan v2.2)",
    description: "Advanced generation with fine control",
    category: "ByteDance",
    settings: hailuo,
    credits_per_generation: 1,
  },
  "wan-25": {
    id: "wan-25",
    name: "Wan 2.5",
    description: "Latest Wan model with enhanced capabilities",
    category: "ByteDance",
    settings: wan25Settings,
    credits_per_generation: 1,
  },
  "hunyuan-v3": {
    id: "hunyuan-v3",
    name: "Hunyuan v3",
    description: "Chinese-focused image generation",
    category: "ByteDance",
    settings: hunyuanV3Settings,
    credits_per_generation: 1,
  },
  "dreamina-v31": {
    id: "dreamina-v31",
    name: "Dreamina v3.1",
    description: "Dream-like artistic image generation",
    category: "ByteDance",
    settings: dreaminaV31Settings,
    credits_per_generation: 1,
  },

  // === MIDJOURNEY ===
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    description: "Industry-leading artistic image generation",
    category: "Midjourney",
    settings: midjourneySettings,
    credits_per_generation: 2,
    featured: true,
  },

  // === RECRAFT ===
  "recraft-v3": {
    id: "recraft-v3",
    name: "Recraft v3",
    description: "Vector and design-focused image generation",
    category: "Recraft",
    settings: recraftV3Settings,
    credits_per_generation: 1,
  },

  // === REVE ===
  reve: {
    id: "reve",
    name: "Reve",
    description: "Fast and efficient image generation",
    category: "Reve",
    settings: reveSettings,
    credits_per_generation: 1,
  },

  // === ALIBABA MODELS ===
  "qwen-image": {
    id: "qwen-image",
    name: "Qwen Image",
    description: "Alibaba's image generation model",
    category: "Alibaba",
    settings: qwenImageSettings,
    credits_per_generation: 1,
  },

  // === GPT IMAGE MODELS ===
  "gpt-image-1": {
    id: "gpt-image-1",
    name: "GPT Image 1",
    description: "GPT-powered image understanding and generation",
    category: "OpenAI",
    settings: gptImage1Settings,
    credits_per_generation: 1,
  },

  // === NANOBANANA ===
  "nano-banana-pro": {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Professional-grade creative generation",
    category: "NanoBanana",
    settings: nanoBananaProSettings,
    credits_per_generation: 1,
  },
};

/**
 * Get model configuration by ID
 * @param modelId - Unique model identifier
 * @returns Model configuration or undefined if not found
 */
export const getModelById = (modelId: string): Model | undefined => {
  return MODEL_REGISTRY[modelId];
};

/**
 * Get all available models
 * @returns Array of all model configurations
 */
export const getAllModels = (): Model[] => {
  return Object.values(MODEL_REGISTRY);
};

/**
 * Get models filtered by category
 * @param category - Model category/provider name
 * @returns Array of models in the specified category
 */
export const getModelsByCategory = (category: string): Model[] => {
  return Object.values(MODEL_REGISTRY).filter(
    (model) => model.category === category
  );
};

/**
 * Get all featured models (recommended for users)
 * @returns Array of featured model configurations
 */
export const getFeaturedModels = (): Model[] => {
  return Object.values(MODEL_REGISTRY).filter((model) => model.featured);
};

/**
 * Get all unique categories
 * @returns Array of unique category names
 */
export const getAllCategories = (): string[] => {
  const categories = Object.values(MODEL_REGISTRY).map(
    (model) => model.category
  );
  return [...new Set(categories)].sort();
};

/**
 * Search models by name or description
 * @param query - Search query string
 * @returns Array of matching models
 */
export const searchModels = (query: string): Model[] => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(MODEL_REGISTRY).filter(
    (model) =>
      model.name.toLowerCase().includes(lowercaseQuery) ||
      model.description.toLowerCase().includes(lowercaseQuery) ||
      model.category.toLowerCase().includes(lowercaseQuery)
  );
};
