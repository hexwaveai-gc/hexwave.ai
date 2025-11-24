/**
 * Image Generation API Service
 * 
 * Handles API calls to the image generation endpoint
 */

import { ImageGenerationRequest, ImageGenerationResponse } from "../../types/api.types";
import { buildGenerationParams } from "../parameterBuilder";
import { validateRequest } from "../validation";
import { Model } from "../modelRegistry";

/**
 * Generate image using the API
 * 
 * @param model - Selected model configuration
 * @param fieldValues - All field values from Zustand store
 * @param activeTab - Active tab type
 * @returns Promise resolving to generation response
 */
export async function generateImage(
  model: Model,
  fieldValues: Record<string, any>,
  activeTab: "text-to-image" | "image-reference" | "restyle"
): Promise<ImageGenerationResponse> {
  try {
    // Step 1: Build parameters (uploads files, normalizes field names)
    const params = await buildGenerationParams(model, fieldValues, activeTab);
    
    // Step 2: Validate parameters (client-side)
    const validation = validateRequest(
      {
        modelId: model.id,
        tab: activeTab,
        params,
      },
      model.settings
    );
    
    if (!validation.success) {
      return {
        success: false,
        images: [],
        error: validation.error || "Validation failed",
      };
    }
    
    // Step 3: Build request payload
    const requestPayload: ImageGenerationRequest = {
      modelId: model.id,
      tab: activeTab,
      params: validation.data || params,
    };
    
    // Step 4: Send API request
    const response = await fetch("/api/image-generator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });
    
    // Step 5: Parse response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        images: [],
        error: errorData.error || `API request failed with status ${response.status}`,
      };
    }
    
    const responseData: ImageGenerationResponse = await response.json();
    
    return responseData;
  } catch (error) {
    console.error("Image generation API error:", error);
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Check if API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch("/api/image-generator", {
      method: "HEAD",
    });
    return response.ok || response.status === 405; // 405 Method Not Allowed is OK for HEAD
  } catch {
    return false;
  }
}

