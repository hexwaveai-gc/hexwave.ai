import { createBaseModel, IBaseDocument } from "@/lib/models/BaseModel";

/**
 * Image Generator Metadata Interface
 * Defines tool-specific metadata for AI image generation
 */
interface IImageGenMetadata {
  [key: string]: unknown; // Index signature for compatibility with Record<string, unknown>

  // Core generation parameters (required)
  prompt: string;
  model: string;

  // Image properties
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string; // "png", "jpg", "webp"

  // Generation parameters
  aspectRatio?: string; // "1:1", "9:16", "16:9"
  mode?: string; // "generation", "edit"

  // LoRA model specific
  loraType?: string; // "instagirl", etc.

  // Image input URL
  sourceImageUrl?: string; // Input image URL (for single-image tools)

  // Timing fields
  timestamp?: number; // Unix timestamp
  completedAt?: Date; // Completion timestamp
}

/**
 * Image Generator Document Interface
 * Extends base document with image generation specific metadata
 */
interface IImageGen extends IBaseDocument {
  metadata: IImageGenMetadata;
}

/**
 * Schema definition for image generator metadata validation
 */
const imageGenMetadataSchema = {
  prompt: { type: String, required: true },
  model: { type: String, required: true },
  dimensions: { type: Object, required: false },
  format: { type: String, required: false },
  aspectRatio: { type: String, required: false },
  mode: { type: String, required: false },
  loraType: { type: String, required: false },
  sourceImageUrl: { type: String, required: false },
  timestamp: { type: Number, required: false },
  completedAt: { type: Date, required: false },
};

/**
 * Get or create the Image Generator Model
 * Uses the standardized BaseModel pattern for consistency
 * @returns Model<IImageGen> - The Image Generator model instance
 */
export function getImageGenModel() {
  return createBaseModel<IImageGen>(
    "image_generations", // Collection name
    "ImageGen", // Model name
    imageGenMetadataSchema,
    [
      // Additional indexes for this tool
      { fields: { "metadata.model": 1 } },
      { fields: { "metadata.prompt": 1 } },
    ]
  );
}

/**
 * Export types for use in other files
 */
export type { IImageGen, IImageGenMetadata };


