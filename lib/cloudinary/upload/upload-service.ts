import { retryOperation } from "@/utils/retry-operation";
import { uploadToCloudinary } from "./cloudinary-service";
import { UploadOptions, UploadOptionsSchema, UploadResult } from "./types";

/**
 * Uploads media (image, video, audio) with retries, validation, and timeout handling.
 * 
 * @param file - The file to upload. Can be a local path, a remote URL, or a Base64 data URI.
 * @param options - Configuration options for the upload (folder, transformations, retries, etc.).
 * @returns Promise<UploadResult>
 */
export async function uploadMedia(
  file: string, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  // 1. Validate Options
  const validatedOptions = UploadOptionsSchema.parse(options);
  
  // 2. Define the upload operation
  const operation = async () => {
    // If a timeout is specified at the service level (not just passed to Cloudinary),
    // we can also handle it here if needed, but Cloudinary's timeout is usually sufficient.
    // For this implementation, we rely on Cloudinary's timeout and the retry wrapper.
    return await uploadToCloudinary(file, validatedOptions);
  };

  // 3. Execute with Retry
  try {
    return await retryOperation(operation, validatedOptions.retries);
  } catch (error) {
    console.error("[UploadService] Upload failed after retries:", error);
    throw error; // Re-throw to let the caller handle the final failure
  }
}

/**
 * Helper to upload an image specifically.
 * Sets resourceType to 'image' if not specified.
 */
export async function uploadImage(file: string, options: UploadOptions = {}) {
  return uploadMedia(file, { ...options, resourceType: "image" });
}

/**
 * Helper to upload a video specifically.
 * Sets resourceType to 'video' if not specified.
 */
export async function uploadVideo(file: string, options: UploadOptions = {}) {
  return uploadMedia(file, { ...options, resourceType: "video" });
}

/**
 * Helper to upload audio specifically.
 * Sets resourceType to 'video' (Cloudinary handles audio under video usually, or 'auto') 
 * but explicitly 'auto' or 'video' is safer for audio files depending on the file ext.
 * Cloudinary recommends 'video' resource type for audio uploads.
 */
export async function uploadAudio(file: string, options: UploadOptions = {}) {
  // We pass 'audio' to uploadMedia, which handles the mapping to 'video' for Cloudinary
  return uploadMedia(file, { ...options, resourceType: "audio" });
}
