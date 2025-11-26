import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Placeholder auth function - replace with real auth in production
const auth = (req: Request) => ({ id: "fakeId" });

/**
 * Common middleware for all upload routes
 * Handles authentication and returns user metadata
 */
const authMiddleware = async ({ req }: { req: Request }) => {
  const user = await auth(req);
  if (!user) throw new UploadThingError("Unauthorized");
  return { userId: user.id };
};

/**
 * Common upload complete handler factory
 * Returns file info to client-side callback
 */
const createUploadCompleteHandler = () => async ({ 
  metadata, 
  file 
}: { 
  metadata: { userId: string }; 
  file: { ufsUrl: string; name: string; size: number } 
}) => {
  console.log("Upload complete - userId:", metadata.userId);
  console.log("File info:", file);
  
  return {
    uploadedBy: metadata.userId,
    url: file.ufsUrl,
    name: file.name,
    size: file.size,
  };
};

/**
 * FileRouter Configuration
 * Supports multiple file types with flexible file counts
 * 
 * Note: maxFileCount is set high to allow frontend control via props
 * The frontend FileUploader component enforces the actual limit
 */
export const ourFileRouter = {
  // Single image upload (optimized for single file)
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

  // Multiple images upload (up to 10)
  multiImageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

  // Single video upload
  videoUploader: f({
    video: {
      maxFileSize: "256MB",
      maxFileCount: 1,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

  // Multiple videos upload (up to 5)
  multiVideoUploader: f({
    video: {
      maxFileSize: "256MB",
      maxFileCount: 5,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

  // Single PDF upload
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

  // Multiple PDFs upload (up to 10)
  multiPdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 10,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

  // Combined file upload route (images, videos, PDFs)
  fileUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
    video: {
      maxFileSize: "256MB",
      maxFileCount: 5,
    },
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 10,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(createUploadCompleteHandler()),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Export route endpoint types for type-safe usage
export type FileRouteEndpoint = keyof OurFileRouter;
