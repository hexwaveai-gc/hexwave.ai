/**
 * File Upload Utilities
 * Handles chunked upload, dimension validation, duration extraction
 */

/**
 * Convert file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Chunked file upload for large files
 * Shows progress as it processes
 */
export async function chunkUpload(
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let processedChunks = 0;
  
  // For now, just convert to base64 with progress simulation
  // In production, this would upload chunks to a server
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };
    
    reader.onload = () => {
      onProgress(100);
      resolve(reader.result as string);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get video duration from file
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      reject(new Error("Failed to load video metadata"));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      window.URL.revokeObjectURL(img.src);
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
      });
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image dimensions against constraints
 */
export async function validateImageDimensions(
  file: File,
  constraints?: {
    minAspectRatio?: number;
    maxAspectRatio?: number;
    minWidth?: number;
    minHeight?: number;
  }
): Promise<{ valid: boolean; error?: string }> {
  try {
    const { width, height, aspectRatio } = await getImageDimensions(file);
    
    if (constraints?.minAspectRatio && aspectRatio < constraints.minAspectRatio) {
      return {
        valid: false,
        error: `Image aspect ratio must be at least ${constraints.minAspectRatio}:1`,
      };
    }
    
    if (constraints?.maxAspectRatio && aspectRatio > constraints.maxAspectRatio) {
      return {
        valid: false,
        error: `Image aspect ratio must be at most ${constraints.maxAspectRatio}:1`,
      };
    }
    
    if (constraints?.minWidth && width < constraints.minWidth) {
      return {
        valid: false,
        error: `Image width must be at least ${constraints.minWidth}px`,
      };
    }
    
    if (constraints?.minHeight && height < constraints.minHeight) {
      return {
        valid: false,
        error: `Image height must be at least ${constraints.minHeight}px`,
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to validate image dimensions",
    };
  }
}

/**
 * Validate video duration
 */
export async function validateVideoDuration(
  file: File,
  maxDuration: number
): Promise<{ valid: boolean; error?: string }> {
  try {
    const duration = await getVideoDuration(file);
    
    if (duration > maxDuration) {
      return {
        valid: false,
        error: `Video must be ${maxDuration} seconds or less (current: ${duration.toFixed(1)}s)`,
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to validate video duration",
    };
  }
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSize: number
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File must be ${maxSizeMB}MB or less (current: ${fileSizeMB}MB)`,
    };
  }
  
  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

