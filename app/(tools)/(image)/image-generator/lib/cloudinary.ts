/**
 * Cloudinary Upload Utility (Mocked)
 * 
 * This is a mock implementation for testing.
 * Replace with actual Cloudinary SDK integration when ready.
 */

import { CloudinaryUploadResponse } from "../types/api.types";

/**
 * Mock Cloudinary configuration
 */
const MOCK_CLOUD_NAME = "duhygs5ck";
const MOCK_UPLOAD_FOLDER = "image-generator-temp";

/**
 * Generate a mock Cloudinary URL
 * Format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
 */
function generateMockCloudinaryUrl(file: File): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
  const extension = file.name.split(".").pop() || "jpg";
  
  // Sanitize filename
  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);
  
  const publicId = `${MOCK_UPLOAD_FOLDER}/${timestamp}_${randomId}_${sanitizedFileName}`;
  
  return `https://res.cloudinary.com/${MOCK_CLOUD_NAME}/image/upload/${publicId}.${extension}`;
}

/**
 * Upload a single file to Cloudinary (mocked)
 * 
 * @param file - File object to upload
 * @returns Promise resolving to Cloudinary upload response
 */
export async function uploadToCloudinary(
  file: File
): Promise<CloudinaryUploadResponse> {
  // Mock upload delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }
  
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error(`Invalid file type. Expected image, got: ${file.type}`);
  }
  
  const url = generateMockCloudinaryUrl(file);
  const publicId = url.split("/").slice(-1)[0].replace(/\.[^/.]+$/, "");
  const format = file.name.split(".").pop() || "jpg";
  
  // Get image dimensions (mocked)
  const dimensions = await getImageDimensions(file);
  
  return {
    url,
    publicId,
    format,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * Upload multiple files to Cloudinary (mocked)
 * 
 * @param files - Array of File objects to upload
 * @returns Promise resolving to array of Cloudinary upload responses
 */
export async function uploadMultipleToCloudinary(
  files: File[]
): Promise<CloudinaryUploadResponse[]> {
  // Upload files in parallel (with rate limiting in real implementation)
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
}

/**
 * Get image dimensions from File (mocked)
 * In real implementation, this would read the actual image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Return default dimensions if image fails to load
      resolve({ width: 1024, height: 1024 });
    };
    
    img.src = url;
  });
}

/**
 * Extract Cloudinary URL from response
 */
export function extractCloudinaryUrl(response: CloudinaryUploadResponse): string {
  return response.url;
}

/**
 * Extract Cloudinary URLs from multiple responses
 */
export function extractCloudinaryUrls(responses: CloudinaryUploadResponse[]): string[] {
  return responses.map(extractCloudinaryUrl);
}

