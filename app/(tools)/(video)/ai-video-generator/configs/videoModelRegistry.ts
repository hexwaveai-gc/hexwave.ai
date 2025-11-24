/**
 * Video Model Registry
 * Simplified registry for video generation models used in the UI
 * Similar to image generator's model registry pattern
 * 
 * Reasoning: Centralized model configuration for ModelSelectorDialog
 * Maps UI models to backend model identifiers from models.constant.ts
 */

export interface VideoModelSettings {
  /** Duration options in seconds */
  duration?: {
    options: string[];
    default: string;
  };
  
  /** Aspect ratio options */
  aspectRatio?: {
    options: Array<{ value: string; label: string }>;
    default: string;
  };
  
  /** Resolution options */
  resolution?: {
    options: Array<{ value: string; label: string }>;
    default: string;
  };
  
  /** Whether model supports sound effects */
  supportsAudioGeneration?: boolean;
  
  /** Whether model supports image to video */
  supportsImageToVideo?: boolean;
  
  /** Whether model supports motion control */
  supportsMotionControl?: boolean;
}

export interface VideoModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  settings: VideoModelSettings;
  creditsPerSecond?: number;
  backendModelId?: string; // Maps to models.constant.ts ID
}

export const VIDEO_MODEL_REGISTRY: Record<string, VideoModel> = {
  "veo-3.1": {
    id: "veo-3.1",
    name: "Veo 3.1",
    description: "Google's most advanced AI video model with sound generation and 1080p output",
    provider: "Google",
    backendModelId: "VEO3_1",
    creditsPerSecond: 0.4,
    settings: {
      duration: {
        options: ["4", "6", "8"],
        default: "8",
      },
      aspectRatio: {
        options: [
          { value: "16:9", label: "Landscape (16:9)" },
          { value: "9:16", label: "Portrait (9:16)" },
          { value: "1:1", label: "Square (1:1)" },
        ],
        default: "16:9",
      },
      resolution: {
        options: [
          { value: "720p", label: "720p (HD)" },
          { value: "1080p", label: "1080p (Full HD)" },
        ],
        default: "720p",
      },
      supportsAudioGeneration: true,
      supportsImageToVideo: false,
      supportsMotionControl: false,
    },
  },
  "kling-1.6-standard": {
    id: "kling-1.6-standard",
    name: "Kling 1.6 Standard",
    description: "High-quality video generation with excellent motion dynamics",
    provider: "Kling",
    backendModelId: "KLING_1_6_STD",
    creditsPerSecond: 0.05,
    settings: {
      duration: {
        options: ["5", "10"],
        default: "5",
      },
      aspectRatio: {
        options: [
          { value: "16:9", label: "Landscape (16:9)" },
          { value: "9:16", label: "Portrait (9:16)" },
          { value: "1:1", label: "Square (1:1)" },
        ],
        default: "16:9",
      },
      supportsAudioGeneration: false,
      supportsImageToVideo: true,
      supportsMotionControl: true,
    },
  },
  "kling-1.6-pro": {
    id: "kling-1.6-pro",
    name: "Kling 1.6 Pro",
    description: "Professional-grade video generation with advanced features",
    provider: "Kling",
    backendModelId: "KLING_1_6_PRO",
    creditsPerSecond: 0.09,
    settings: {
      duration: {
        options: ["5", "10"],
        default: "5",
      },
      aspectRatio: {
        options: [
          { value: "16:9", label: "Landscape (16:9)" },
          { value: "9:16", label: "Portrait (9:16)" },
          { value: "1:1", label: "Square (1:1)" },
        ],
        default: "16:9",
      },
      supportsAudioGeneration: false,
      supportsImageToVideo: true,
      supportsMotionControl: true,
    },
  },
  "luma-ray2": {
    id: "luma-ray2",
    name: "Luma Ray 2",
    description: "Fast and efficient video generation with excellent quality",
    provider: "Luma AI",
    backendModelId: "LUMA_RAY2",
    creditsPerSecond: 0.05,
    settings: {
      duration: {
        options: ["5"],
        default: "5",
      },
      aspectRatio: {
        options: [
          { value: "16:9", label: "Landscape (16:9)" },
          { value: "9:16", label: "Portrait (9:16)" },
          { value: "1:1", label: "Square (1:1)" },
          { value: "4:3", label: "Classic (4:3)" },
          { value: "21:9", label: "Cinematic (21:9)" },
        ],
        default: "16:9",
      },
      supportsAudioGeneration: false,
      supportsImageToVideo: true,
      supportsMotionControl: false,
    },
  },
};

/**
 * Get a video model by its ID
 */
export const getVideoModelById = (modelId: string): VideoModel | undefined => {
  return VIDEO_MODEL_REGISTRY[modelId];
};

/**
 * Get all available video models
 */
export const getAllVideoModels = (): VideoModel[] => {
  return Object.values(VIDEO_MODEL_REGISTRY);
};

/**
 * Get models that support a specific feature
 */
export const getModelsByFeature = (feature: keyof VideoModelSettings): VideoModel[] => {
  return getAllVideoModels().filter(
    (model) => model.settings[feature] === true
  );
};

