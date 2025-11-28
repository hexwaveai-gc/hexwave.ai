/**
 * ============================================================================
 * PRICING MODULE - PUBLIC API
 * ============================================================================
 * 
 * Central export point for all pricing functionality.
 * Import from this file in both frontend and backend.
 * 
 * Usage:
 * 
 * ```typescript
 * import { 
 *   calculateCredits, 
 *   getModelCredits,
 *   formatCredits,
 *   PLATFORM_CONFIG 
 * } from "@/lib/pricing";
 * 
 * // Calculate credits for an operation
 * const result = calculateCredits({
 *   modelId: "flux-pro",
 *   units: 2, // 2 images
 * });
 * 
 * console.log(result.credits); // Credits to charge
 * console.log(result.display); // "24 credits (2 images)"
 * ```
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

export {
  // Core config
  PLATFORM_CONFIG,
  
  // Model pricing registries
  IMAGE_MODEL_COSTS,
  VIDEO_MODEL_COSTS,
  AUDIO_MODEL_COSTS,
  AVATAR_MODEL_COSTS,
  OTHER_MODEL_COSTS,
  ALL_MODEL_COSTS,
  
  // Types
  type PricingType,
  type BaseCostConfig,
  type PerUnitCostConfig,
  type FixedCostConfig,
  type TieredCostConfig,
  type TemplateTierCostConfig,
  type CostConfig,
  type CostModifier,
  type ModelPricing,
  type ToolCategory,
  
  // Model ID types
  type ImageModelId,
  type VideoModelId,
  type AudioModelId,
  type AvatarModelId,
  type OtherModelId,
  type ModelId,
} from "./config";

// =============================================================================
// CALCULATOR FUNCTIONS
// =============================================================================

export {
  // Core calculation
  calculateCredits,
  getModelCredits,
  calculateBulkCredits,
  
  // Conversion utilities
  usdToCredits,
  creditsToUsd,
  
  // Model info
  getModelCostInfo,
  getModelsByCategory,
  getCheapestModel,
  getMostExpensiveModel,
  
  // Formatting
  formatCredits,
  formatCreditRange,
  getCreditDisplay,
  
  // Validation
  hasEnoughCredits,
  calculateAffordableUnits,
  
  // Debug/Admin
  getPlatformConfig,
  getThirdPartyCostFromCredits,
  
  // Types
  type CalculationInput,
  type CalculationResult,
  type CostBreakdown,
  type ModelCostInfo,
} from "./calculator";

// =============================================================================
// RE-EXPORT REACT HOOK (conditional - only in client components)
// =============================================================================

// Note: Hook is in a separate file to avoid SSR issues
// Import directly: import { usePricing } from "@/lib/pricing/hooks";


