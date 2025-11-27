/**
 * Image Generator API Route (Mock)
 * 
 * This is a mock implementation for testing the pipeline.
 * Replace with actual image generation logic when ready.
 * 
 * Protected by authMiddleware:
 * - Clerk authentication
 * - Rate limiting (GENERATION type)
 * - Credit check (10 credits per generation)
 * - Free tier limits (5 images/day for free users)
 * - Tool restriction (only "nano-banana" allowed for free tier)
 * - 7-day trial expiry check
 * 
 * **Logging context is automatic!**
 * Just use logInfo, logError, etc. - traceId, userId, path are auto-included.
 */

import { NextRequest } from "next/server";
import { imageGenerationRequestSchema, validateRequest } from "@/app/(tools)/(image)/image-generator/lib/validation";
import type { ImageGenerationRequest } from "@/app/(tools)/(image)/image-generator/types/api.types";
import { getModelById } from "@/app/(tools)/(image)/image-generator/lib/modelRegistry";
import { 
  withGenerationAuth, 
  incrementFreeTierUsage,
  type AuthContext 
} from "@/lib/api/auth-middleware";
import { CREDIT_COSTS } from "@/constants/limits";
import { ApiResponse } from "@/utils/api-response/response";
// Just import these - context is automatic via AsyncLocalStorage!
import { 
  logWarn, 
  logError, 
  logGeneration,
  createTimer,
} from "@/lib/logger";

/**
 * POST handler for image generation
 * 
 * Protected by withGenerationAuth:
 * - ✅ Authentication (Clerk)
 * - ✅ Rate limiting (GENERATION type - 10/min)
 * - ✅ Credit check (10 credits required)
 * - ✅ Free tier limits (5 images/day, 50 images/month)
 * - ✅ Tool restriction (only "nano-banana" for free tier)
 * - ✅ 7-day trial expiry check
 */
export const POST = withGenerationAuth(
  async (request: NextRequest, authContext: AuthContext) => {
    const { userId, credits, isFreeTier, traceId, trialDaysRemaining } = authContext;
    
    // Timer automatically includes context
    const timer = createTimer("image_generation");
    
    try {
      // Parse request body
      const body = await request.json();
      
      // logGeneration auto-includes traceId, userId, path!
      logGeneration("started", {
        tool: body.modelId,
        category: "image",
        creditsUsed: CREDIT_COSTS.IMAGE_GENERATION.STANDARD,
        isFreeTier,
        trialDaysRemaining,
        availableCredits: credits,
      });
      
      // Validate base request structure
      const baseValidation = imageGenerationRequestSchema.safeParse(body);
      if (!baseValidation.success) {
        const firstError = baseValidation.error.issues[0];
        
        // logWarn auto-includes traceId, userId, path!
        logWarn("Image generation validation failed", {
          error: `${firstError.path.join(".")}: ${firstError.message}`,
          tool: body.modelId,
        });
        
        return ApiResponse.badRequest(
          `${firstError.path.join(".")}: ${firstError.message}`,
          { images: [], traceId }
        );
      }
      
      const requestData: ImageGenerationRequest = baseValidation.data;
      
      // Get model configuration
      const model = getModelById(requestData.modelId);
      if (!model) {
        logWarn("Model not found", { modelId: requestData.modelId });
        
        return ApiResponse.notFound(`Model not found: ${requestData.modelId}`);
      }
      
      // Validate parameters against model settings
      const validation = validateRequest(requestData, model.settings);
      if (!validation.success) {
        logWarn("Parameter validation failed", {
          modelId: requestData.modelId,
          error: validation.error,
        });
        
        return ApiResponse.invalid(validation.error || "Parameter validation failed");
      }
      
      // Mock image generation - return sample image URLs
      // In real implementation, this would call the actual image generation service
      const mockImages = [
        "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800",
        "https://images.unsplash.com/photo-1707344088547-3cf7cea5ca49?w=800",
      ];
      
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Increment free tier usage counter if user is on free tier
      if (isFreeTier) {
        await incrementFreeTierUsage(userId, "image");
      }
      
      const duration = timer.done({ imagesGenerated: mockImages.length });
      
      logGeneration("completed", {
        tool: model.name,
        category: "image",
        creditsUsed: CREDIT_COSTS.IMAGE_GENERATION.STANDARD,
        imagesGenerated: mockImages.length,
        duration,
      });
      
      // Return success response
      return ApiResponse.ok(
        { images: mockImages, traceId },
        `Successfully generated ${mockImages.length} image(s) using ${model.name}`
      );
    } catch (error) {
      timer.done({ error: true });
      
      logGeneration("failed", {
        category: "image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      // logError auto-includes traceId, userId, path + error details!
      logError("Image generation failed", error, {
        operation: "image_generation",
      });
      
      return ApiResponse.serverError(
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  },
  CREDIT_COSTS.IMAGE_GENERATION.STANDARD,
  { category: "image", toolId: "nano-banana" }
);

/**
 * GET handler - API info
 */
export async function GET() {
  return ApiResponse.ok({
    name: "Image Generator API",
    version: "1.0.0",
    endpoints: {
      POST: "/api/image-generator",
    },
  });
}

