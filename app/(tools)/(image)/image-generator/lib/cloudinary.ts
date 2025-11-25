import { CloudinaryUploadResponse } from "../types/api.types";

const DEFAULT_OPTIONS = {
  folder: "image-generator",
  resourceType: "image" as const,
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function validateFile(file: File) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`Invalid file type. Expected image, got: ${file.type}`);
  }
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  await validateFile(file);
  const fileBase64 = await fileToBase64(file);
  
  // Call API route instead of importing server-side Cloudinary
  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file: fileBase64,
      options: DEFAULT_OPTIONS,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  const result = await response.json();

  return {
    url: result.secureUrl || result.url,
    publicId: result.publicId,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

export async function uploadMultipleToCloudinary(files: File[]): Promise<CloudinaryUploadResponse[]> {
  return Promise.all(files.map((file) => uploadToCloudinary(file)));
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

