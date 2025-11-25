import { v2 as cloudinary } from "cloudinary";
import { ParsedUploadOptions, UploadResult, UploadError } from "./types";
import { UploadApiOptions } from "cloudinary";

// Ensure Cloudinary is configured
import "@/lib/cloudinary/cloudinary"; 

export async function uploadToCloudinary(
  file: string, // File path, URL, or Base64 string
  options: ParsedUploadOptions
): Promise<UploadResult> {
  // Map 'audio' to 'video' for Cloudinary as it handles audio under video resource type
  const resourceType = options.resourceType === "audio" ? "video" : options.resourceType;

  // Destructure custom options to separate them from Cloudinary options if needed, 
  // or just prepare the object. We spread options to allow passthrough params (like transformation, eager, etc.)
  // We exclude 'retries' as it's not a Cloudinary option.
  const { retries, resourceType: _rt, ...cloudinaryParams } = options;

  const cloudinaryOptions: UploadApiOptions = {
    ...cloudinaryParams,
    resource_type: resourceType as UploadApiOptions["resource_type"],
    public_id: options.publicId, // Mapping publicId (camelCase) to public_id (snake_case)
  };

  // If the user passed 'publicId' in options, we mapped it. 
  // If they passed 'public_id' directly (via passthrough), it would be in cloudinaryParams.
  // The explicit assignment above ensures our typed 'publicId' takes precedence or is handled.
  // However, we should be careful about duplication if they pass both.
  // Let's rely on the explicit mapping and spread rest.

  try {
    const result = await cloudinary.uploader.upload(file, cloudinaryOptions);

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration,
      resourceType: result.resource_type,
      bytes: result.bytes,
      createdAt: result.created_at,
    };
  } catch (error) {
    const uploadError = error as UploadError;
    throw new Error(`Cloudinary Upload Failed: ${uploadError.message || "Unknown error"}`);
  }
}