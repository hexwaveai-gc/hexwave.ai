/**
 * Shared UI parameters for Nano Banana Pro model
 * Used by both dual-image-generator and single-image-generator
 * Single source of truth for frontend parameter definitions
 */

import { ToolParameter } from "@/config/types";

/**
 * Nano Banana Pro aspect ratio parameter configuration
 * Matches the backend settings.js but excludes "auto" (handled by backend logic)
 */
export const NANO_BANANA_PRO_ASPECT_RATIO_PARAM: ToolParameter = {
  type: "select",
  label: "Aspect Ratio",
  defaultValue: "1:1",
  required: false,
  isAdvanced: true,
  options: [
    { value: "1:1", label: "Square (1:1)" },
    { value: "21:9", label: "Ultra Wide (21:9)" },
    { value: "16:9", label: "Wide (16:9)" },
    { value: "4:3", label: "Landscape (4:3)" },
    { value: "3:2", label: "Landscape (3:2)" },
    { value: "5:4", label: "Landscape (5:4)" },
    { value: "2:3", label: "Portrait (2:3)" },
    { value: "3:4", label: "Portrait (3:4)" },
    { value: "4:5", label: "Portrait (4:5)" },
    { value: "9:16", label: "Portrait (9:16)" },
  ],
};

/**
 * Nano Banana Pro resolution parameter configuration
 * Matches the backend settings.js exactly
 */
export const NANO_BANANA_PRO_RESOLUTION_PARAM: ToolParameter = {
  type: "select",
  label: "Resolution",
  defaultValue: "1K",
  required: false,
  isAdvanced: true,
  options: [
    { value: "1K", label: "1K (Standard)" },
    { value: "2K", label: "2K (High Quality)" },
    { value: "4K", label: "4K (Ultra Quality)" },
  ],
};

/**
 * Complete Nano Banana Pro parameters for use in tool configs
 * @param models - Array of model IDs this applies to (e.g., ["nano-banana-pro"])
 */
export function getNanoBananaProParams(
  models: string[]
): Record<string, ToolParameter> {
  return {
    aspectRatio: {
      ...NANO_BANANA_PRO_ASPECT_RATIO_PARAM,
      models,
    },
    resolution: {
      ...NANO_BANANA_PRO_RESOLUTION_PARAM,
      models,
    },
  };
}
