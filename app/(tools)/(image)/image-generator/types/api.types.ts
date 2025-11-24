/**
 * Type definitions for Image Generation API
 * Shared between client and server
 */

import { ActiveTab } from "../store/useImageGenerationStore";

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
}

/**
 * Image generation request payload
 */
export interface ImageGenerationRequest {
  modelId: string;
  tab: ActiveTab;
  params: Record<string, any>; // Model-specific parameters
}

/**
 * Image generation API response
 */
export interface ImageGenerationResponse {
  success: boolean;
  images: string[]; // Generated image URLs
  requestId?: string;
  error?: string;
  message?: string;
}

/**
 * File field types that need Cloudinary upload
 */
export type FileFieldType = File | File[] | null | undefined;

/**
 * Check if a value is a File object
 */
export function isFile(value: any): value is File {
  return value instanceof File;
}

/**
 * Check if a value is an array of Files
 */
export function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.length > 0 && value[0] instanceof File;
}

