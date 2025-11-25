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
  logo?: string;
  previewImage?: string;
}

// Logo paths from config
const stableDiffusionLogo = "/image-logos/stable-diffusion.webp";
const fluxLogo = "/image-logos/flux.png";
const dalleLogo = "/image-logos/dalle.webp";
const gptImage1Logo = "/image-logos/gpt-image-1.webp";
const ideogramLogo = "/image-logos/ideogram.webp";
const recraftLogo = "/image-logos/recraft.webp";
const midjourneyLogo = "/image-logos/midjourney.webp";
const lumaLogo = "/image-logos/luma.webp";
const googleLogo = "/image-logos/google.png";
const leonardoLogo = "/image-logos/leonardo.webp";
const seedreamLogo = "/bytedance.webp";
const runwayLogo = "/runway.webp";
const qwenLogo = "https://blog.galaxy.ai/logos/qwen.webp";
const tencentLogo = "/image-logos/tencent.webp";
const reveLogo = "/image-logos/reve.webp";

/**
 * Comprehensive registry of all available image generation models
 * Grouped by provider/family for better organization
 */
export const MODEL_REGISTRY: Record<string, Model> = {
  // === RUNWAY MODELS ===
  runwaygen4: {
    id: "runwaygen4",
    name: "Runway Gen-4",
    description: "Generate consistent characters and scenes with coherent style",
    category: "Runway",
    settings: runwaygen4Settings,
    credits_per_generation: 1,
    featured: true,
    logo: runwayLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1753258378/runway_gen4_xfz1ap.webp",
  },

  // === FLUX MODELS (Black Forest Labs) ===
  "flux-pro": {
    id: "flux-pro",
    name: "FLUX [pro]",
    description: "Professional model specializing in realistic and artistic compositions",
    category: "Flux",
    settings: fluxProSettings,
    credits_per_generation: 1,
    logo: fluxLogo,
    previewImage: "https://tjzk.replicate.delivery/models_models_cover_image/a36275e2-34d4-4b3d-83cd-f9aaf73c9386/https___replicate.delive_o40qpZl.webp",
  },
  "flux-dev": {
    id: "flux-dev",
    name: "Flux Dev",
    description: "Development version with experimental features",
    category: "Flux",
    settings: fluxDevSettings,
    credits_per_generation: 1,
    logo: fluxLogo,
  },
  "flux-1-1-pro": {
    id: "flux-1-1-pro",
    name: "FLUX [1.1 pro]",
    description: "Updated pro version with improved detail and consistency",
    category: "Flux",
    settings: flux11ProSettings,
    credits_per_generation: 1,
    featured: true,
    logo: fluxLogo,
    previewImage: "https://tjzk.replicate.delivery/models_models_featured_image/bd872eff-363a-4e10-8cc1-84057afa9f57/flux-1.1-cover.webp",
  },
  "flux-1-1-pro-ultra": {
    id: "flux-1-1-pro-ultra",
    name: "FLUX [1.1 pro ultra]",
    description: "Ultimate FLUX model with maximum quality and advanced features",
    category: "Flux",
    settings: flux11ProUltraSettings,
    credits_per_generation: 2,
    featured: true,
    logo: fluxLogo,
    previewImage: "https://replicate.delivery/czjl/jqtNvxYHcnLELpszvkVf0APhMkBnwzrdo205RaVB7MttqU6JA/tmppokfymld.jpg",
  },
  "flux-pro-kontext": {
    id: "flux-pro-kontext",
    name: "FLUX Kontext",
    description: "Advanced image generation with character consistency and photorealistic rendering",
    category: "Flux",
    settings: fluxProKontextSettings,
    credits_per_generation: 1,
    logo: fluxLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1748617363/flux_kontext_mvmhmn.webp",
  },

  // === OPENAI MODELS ===
  "dall-e-3": {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "Latest version of DALL-E with enhanced capabilities",
    category: "OpenAI",
    settings: dallE3Settings,
    credits_per_generation: 1,
    logo: dalleLogo,
    previewImage: "https://images.ctfassets.net/kftzwdyauwt9/4xRSuCnoKAT9ZGfMYFcRZ1/de6f1364124ed36428ab136266e33795/plategirl.png?w=3840&q=80&fm=webp",
  },

  // === IDEOGRAM MODELS ===
  "ideogram-v2": {
    id: "ideogram-v2",
    name: "Ideogram [v2]",
    description: "High-quality image generation with advanced style control",
    category: "Ideogram",
    settings: ideogramV2Settings,
    credits_per_generation: 1,
    logo: ideogramLogo,
    previewImage: "https://framerusercontent.com/images/QlUWJlYBvikprARDc1LHgfKZyAY.png?scale-down-to=1024",
  },
  "ideogram-v2-turbo": {
    id: "ideogram-v2-turbo",
    name: "Ideogram [v2 Turbo]",
    description: "Fast version of Ideogram optimized for rapid generation",
    category: "Ideogram",
    settings: ideogramV2TurboSettings,
    credits_per_generation: 1,
    logo: ideogramLogo,
    previewImage: "https://framerusercontent.com/images/DhI90wXFhTetfHA3xr95nFfjVe0.webp?scale-down-to=1024",
  },
  "ideogram-v2a": {
    id: "ideogram-v2a",
    name: "Ideogram [v2a]",
    description: "Like Ideogram v2, but faster and cheaper",
    category: "Ideogram",
    settings: ideogramV2aSettings,
    credits_per_generation: 1,
    logo: ideogramLogo,
    previewImage: "https://tjzk.replicate.delivery/xezq/0MOOj7UCadZdCJ5UrIcqZT6Kieg4e2D4Pt9HvDfXtLetWAORB/tmpdiuv41kb.png",
  },
  "ideogram-v2a-turbo": {
    id: "ideogram-v2a-turbo",
    name: "Ideogram [v2a turbo]",
    description: "Like Ideogram v2 turbo, but now faster and cheaper",
    category: "Ideogram",
    settings: ideogramV2aTurboSettings,
    credits_per_generation: 1,
    logo: ideogramLogo,
    previewImage: "https://replicate.delivery/xezq/0MOOj7UCadZdCJ5UrIcqZT6Kieg4e2D4Pt9HvDfXtLetWAORB/tmpdiuv41kb.png",
  },
  "ideogram-v3": {
    id: "ideogram-v3",
    name: "Ideogram [v3]",
    description: "Stunning realism, text rendering, and consistent styles",
    category: "Ideogram",
    settings: ideogramV3Settings,
    credits_per_generation: 1,
    featured: true,
    logo: ideogramLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1746427903/ideogram-v3_jtj9y0.webp",
  },

  // === LEONARDO MODELS ===
  "leonardo-phoenix": {
    id: "leonardo-phoenix",
    name: "Leonardo Phoenix",
    description: "High-quality images with precise style control",
    category: "Leonardo",
    settings: leonardoPhoenixSettings,
    credits_per_generation: 1,
    featured: true,
    logo: leonardoLogo,
    previewImage: "https://leonardo.ai/wp-content/uploads/2024/06/phoenix-hero-img-o.jpg",
  },
  "leonardo-photoreal": {
    id: "leonardo-photoreal",
    name: "Leonardo Photoreal v2",
    description: "Photorealistic image generation with advanced lighting control",
    category: "Leonardo",
    settings: leonardoPhotorealSettings,
    credits_per_generation: 1,
    featured: true,
    logo: leonardoLogo,
    previewImage: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/778d49fb-926b-4629-b49e-c943c96968a2/anim=false,width=450/64334842.jpeg",
  },
  "leonardo-transparency": {
    id: "leonardo-transparency",
    name: "Leonardo Transparency",
    description: "Generate images with transparent backgrounds",
    category: "Leonardo",
    settings: leonardoTransparencySettings,
    credits_per_generation: 1,
    logo: leonardoLogo,
    previewImage: "https://files.readme.io/7c410f3-Default_an_orange_cat_1.png",
  },

  // === LUMA AI MODELS ===
  "luma-photon": {
    id: "luma-photon",
    name: "Luma Photon",
    description: "High-quality creative, intelligent and personalizable image generation",
    category: "Luma",
    settings: lumaPhotonSettings,
    credits_per_generation: 1,
    featured: true,
    logo: lumaLogo,
    previewImage: "https://replicate.delivery/czjl/ZtBmm4Yw98KoJBz3Z7PnpFmgga42Skq8pL3ILGjnmDfAl87JA/tmpjbj2iy5z.jpg",
  },
  "luma-photon-flash": {
    id: "luma-photon-flash",
    name: "Luma Photon Flash",
    description: "Faster, cost-effective version of Luma Photon",
    category: "Luma",
    settings: lumaPhotonFlashSettings,
    credits_per_generation: 1,
    logo: lumaLogo,
    previewImage: "https://replicate.delivery/czjl/6iZ89qakg74mCVjFYeDk0GljoYQReoV0k7WwSjxXmCLcV53TA/tmpyf9dx02r.jpg",
  },

  // === GOOGLE MODELS ===
  "imagen-3": {
    id: "imagen-3",
    name: "Imagen 3",
    description: "Google's text-to-image model with high quality and photorealistic outputs",
    category: "Google",
    settings: imagen3Settings,
    credits_per_generation: 1,
    logo: googleLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1750502939/imagen3_trtw2i.webp",
  },
  "gemini-25-flash-image": {
    id: "gemini-25-flash-image",
    name: "Nano-Banana",
    description: "Google's state-of-the-art image model 🍌 (Gemini 2.5 Flash)",
    category: "Google",
    settings: gemini25FlashImageSettings,
    credits_per_generation: 1,
    featured: true,
    logo: googleLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1756378298/gemini_2.5_flash_nano_banana_xoxnjn.webp",
  },

  // === STABILITY AI MODELS ===
  "stable-diffusion-3": {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3",
    description: "Advanced model with improved composition and visual quality",
    category: "Stability AI",
    settings: stableDiffusion3Settings,
    credits_per_generation: 1,
    logo: stableDiffusionLogo,
    previewImage: "https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/1708563364236-12JCC98CUARGPPDOGMKB/image-90.png?format=2500w",
  },
  "stable-diffusion-3-5-large": {
    id: "stable-diffusion-3-5-large",
    name: "Stable Diffusion 3.5 Large",
    description: "Enhanced version with superior detail and artistic capabilities",
    category: "Stability AI",
    settings: stableDiffusion35LargeSettings,
    credits_per_generation: 2,
    logo: stableDiffusionLogo,
    previewImage: "https://tjzk.replicate.delivery/models_models_featured_image/4b03d178-eaf3-4458-a752-dbc76098396b/replicate-prediction-_ycGb1jN.webp",
  },
  "stable-diffusion-3-5-large-turbo": {
    id: "stable-diffusion-3-5-large-turbo",
    name: "Stable Diffusion 3.5 Large Turbo",
    description: "Fast, high-performance version optimized for quick generation",
    category: "Stability AI",
    settings: stableDiffusion35LargeTurboSettings,
    credits_per_generation: 1,
    logo: stableDiffusionLogo,
    previewImage: "https://tjzk.replicate.delivery/models_models_featured_image/9e1b4258-22bd-4a59-ba4a-ecac220a8a9b/replicate-prediction-_WU4XtaV.webp",
  },
  sdxl: {
    id: "sdxl",
    name: "Stable Diffusion XL",
    description: "Legacy base model for straightforward image generation",
    category: "Stability AI",
    settings: sdxlSettings,
    credits_per_generation: 1,
    logo: stableDiffusionLogo,
    previewImage: "https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/eba39670-66c6-4921-bdb9-19dce66f0a46/sdxl+coverimage+milkyweights.png?format=2500w",
  },

  // === BYTEDANCE MODELS ===
  "seedream-v3": {
    id: "seedream-v3",
    name: "Seedream V3",
    description: "ByteDance's advanced model with high-resolution (2K) support",
    category: "ByteDance",
    settings: seedreamV3Settings,
    credits_per_generation: 1,
    logo: seedreamLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1751877912/seed.bytedance.com_en_tech_seedream3_0_weezyc.webp",
  },
  "seedream-v4": {
    id: "seedream-v4",
    name: "Seedream V4",
    description: "Record-breaking 4K resolution image generation model by ByteDance",
    category: "ByteDance",
    settings: seedreamV4Settings,
    credits_per_generation: 1,
    featured: true,
    logo: seedreamLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1757593046/seedream4_0_j7lc3a.webp",
  },
  "wan-v2-2-a14b": {
    id: "wan-v2-2-a14b",
    name: "Wan v2.2",
    description: "High-fidelity images with enhanced prompt alignment and style adaptability",
    category: "ByteDance",
    settings: hailuo,
    credits_per_generation: 1,
    logo: qwenLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1757438128/wan_images_qirazj.webp",
  },
  "wan-25": {
    id: "wan-25",
    name: "Wan 2.5",
    description: "Enhanced aesthetics, smart charts, precise text, and complex prompt understanding",
    category: "ByteDance",
    settings: wan25Settings,
    credits_per_generation: 1,
    featured: true,
    logo: qwenLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1758882696/Wan_2.5_wkfdnl.webp",
  },
  "hunyuan-v3": {
    id: "hunyuan-v3",
    name: "Hunyuan 3.0",
    description: "Tencent's state-of-the-art model for image generation",
    category: "Tencent",
    settings: hunyuanV3Settings,
    credits_per_generation: 1,
    logo: tencentLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1759217661/Hunyuan_Image_3_osyhvc.webp",
  },
  "dreamina-v31": {
    id: "dreamina-v31",
    name: "Dreamina V3.1",
    description: "ByteDance's model with superior picture effects, precise styles, and rich details",
    category: "ByteDance",
    settings: dreaminaV31Settings,
    credits_per_generation: 1,
    logo: seedreamLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1756465464/Dreamina_3.1_buo7kt.webp",
  },

  // === MIDJOURNEY ===
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    description: "Renowned for creating stunning artistic and imaginative imagery",
    category: "Midjourney",
    settings: midjourneySettings,
    credits_per_generation: 2,
    featured: true,
    logo: midjourneyLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1745314139/midjourney_j3cv7k.webp",
  },

  // === RECRAFT ===
  "recraft-v3": {
    id: "recraft-v3",
    name: "Recraft V3",
    description: "Specialized in creating consistent, high-quality artistic illustrations",
    category: "Recraft",
    settings: recraftV3Settings,
    credits_per_generation: 1,
    featured: true,
    logo: recraftLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1750502985/recraft_v3_vsipp9.webp",
  },

  // === REVE ===
  reve: {
    id: "reve",
    name: "Reve",
    description: "Detailed visual output with strong aesthetic quality and accurate text rendering",
    category: "Reve",
    settings: reveSettings,
    credits_per_generation: 1,
    featured: true,
    logo: reveLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1760786731/reve_vu5bew.webp",
  },

  // === ALIBABA MODELS ===
  "qwen-image": {
    id: "qwen-image",
    name: "Qwen Image",
    description: "Advanced image generation with great text generation and prompt adherence",
    category: "Alibaba",
    settings: qwenImageSettings,
    credits_per_generation: 1,
    featured: true,
    logo: qwenLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1755763013/qwen_image_vfwbbx.webp",
  },

  // === GPT IMAGE MODELS ===
  "gpt-image-1": {
    id: "gpt-image-1",
    name: "GPT Image 1",
    description: "OpenAI's state-of-the-art image generation model",
    category: "OpenAI",
    settings: gptImage1Settings,
    credits_per_generation: 1,
    featured: true,
    logo: gptImage1Logo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1745657529/gpt-image-1_nk7yho.webp",
  },

  // === NANOBANANA ===
  "nano-banana-pro": {
    id: "nano-banana-pro",
    name: "Nano-Banana Pro",
    description: "Google's state-of-the-art model with thinking mode & Google Search grounding 🍌",
    category: "Google",
    settings: nanoBananaProSettings,
    credits_per_generation: 1,
    featured: true,
    logo: googleLogo,
    previewImage: "https://res.cloudinary.com/duhygs5ck/image/upload/v1756378298/gemini_2.5_flash_nano_banana_xoxnjn.webp",
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
