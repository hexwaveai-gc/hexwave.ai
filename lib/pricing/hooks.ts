"use client";

/**
 * ============================================================================
 * PRICING REACT HOOKS
 * ============================================================================
 * 
 * Client-side hooks for credit calculations and display.
 * These hooks provide reactive credit information for UI components.
 */

import { useMemo, useCallback } from "react";
import {
  calculateCredits,
  getModelCredits,
  getModelCostInfo,
  formatCredits,
  formatCreditRange,
  hasEnoughCredits,
  calculateAffordableUnits,
  getModelsByCategory,
  type CalculationInput,
  type CalculationResult,
  type ModelCostInfo,
  type ToolCategory,
} from "./index";

// =============================================================================
// TYPES
// =============================================================================

export interface UsePricingOptions {
  /** Model ID to calculate for */
  modelId: string;
  /** Number of units */
  units?: number;
  /** Tier for tiered pricing */
  tier?: string;
  /** Modifiers */
  modifiers?: Record<string, string | number | boolean>;
}

export interface UsePricingReturn {
  /** Calculated credits */
  credits: number;
  /** Full calculation result */
  result: CalculationResult;
  /** Formatted credits string */
  formatted: string;
  /** Credits per unit */
  creditsPerUnit: number;
  /** Model cost info */
  modelInfo: ModelCostInfo | null;
  /** Check if user can afford */
  canAfford: (userCredits: number) => boolean;
  /** Get shortfall amount */
  getShortfall: (userCredits: number) => number;
  /** Recalculate with different params */
  recalculate: (params: Partial<UsePricingOptions>) => CalculationResult;
}

// =============================================================================
// MAIN PRICING HOOK
// =============================================================================

/**
 * Hook for calculating and displaying credit costs
 * 
 * @example
 * ```tsx
 * function GenerateButton({ modelId, userCredits }) {
 *   const { credits, formatted, canAfford } = usePricing({
 *     modelId: "flux-pro",
 *     units: 1,
 *   });
 *   
 *   return (
 *     <button disabled={!canAfford(userCredits)}>
 *       Generate ({formatted})
 *     </button>
 *   );
 * }
 * ```
 */
export function usePricing(options: UsePricingOptions): UsePricingReturn {
  const { modelId, units = 1, tier, modifiers } = options;
  
  // Memoize the calculation
  const result = useMemo(() => {
    return calculateCredits({
      modelId,
      units,
      tier,
      modifiers,
    });
  }, [modelId, units, tier, JSON.stringify(modifiers)]);
  
  // Get model info
  const modelInfo = useMemo(() => {
    return getModelCostInfo(modelId);
  }, [modelId]);
  
  // Credits per unit
  const creditsPerUnit = useMemo(() => {
    return getModelCredits(modelId, tier);
  }, [modelId, tier]);
  
  // Formatted display
  const formatted = useMemo(() => {
    return formatCredits(result.credits);
  }, [result.credits]);
  
  // Can afford check
  const canAfford = useCallback((userCredits: number) => {
    return hasEnoughCredits(userCredits, modelId, units, { tier, modifiers }).hasEnough;
  }, [modelId, units, tier, modifiers]);
  
  // Shortfall calculation
  const getShortfall = useCallback((userCredits: number) => {
    return hasEnoughCredits(userCredits, modelId, units, { tier, modifiers }).shortfall;
  }, [modelId, units, tier, modifiers]);
  
  // Recalculate with new params
  const recalculate = useCallback((params: Partial<UsePricingOptions>) => {
    return calculateCredits({
      modelId: params.modelId ?? modelId,
      units: params.units ?? units,
      tier: params.tier ?? tier,
      modifiers: params.modifiers ?? modifiers,
    });
  }, [modelId, units, tier, modifiers]);
  
  return {
    credits: result.credits,
    result,
    formatted,
    creditsPerUnit,
    modelInfo,
    canAfford,
    getShortfall,
    recalculate,
  };
}

// =============================================================================
// AFFORDABLE UNITS HOOK
// =============================================================================

export interface UseAffordableUnitsReturn {
  /** Number of units user can afford */
  affordableUnits: number;
  /** Whether user can afford at least 1 */
  canAffordOne: boolean;
  /** Total credits for affordable units */
  totalCredits: number;
  /** Calculate for different credit amount */
  calculateFor: (credits: number) => number;
}

/**
 * Hook to calculate how many units a user can afford
 * 
 * @example
 * ```tsx
 * function ImageGenerator({ userCredits }) {
 *   const { affordableUnits, canAffordOne } = useAffordableUnits(
 *     userCredits,
 *     "flux-pro"
 *   );
 *   
 *   return (
 *     <div>
 *       You can generate up to {affordableUnits} images
 *       {!canAffordOne && <UpgradePrompt />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAffordableUnits(
  userCredits: number,
  modelId: string,
  tier?: string
): UseAffordableUnitsReturn {
  const affordableUnits = useMemo(() => {
    return calculateAffordableUnits(userCredits, modelId, tier);
  }, [userCredits, modelId, tier]);
  
  const canAffordOne = affordableUnits >= 1;
  
  const totalCredits = useMemo(() => {
    return calculateCredits({ modelId, units: affordableUnits, tier }).credits;
  }, [modelId, affordableUnits, tier]);
  
  const calculateFor = useCallback((credits: number) => {
    return calculateAffordableUnits(credits, modelId, tier);
  }, [modelId, tier]);
  
  return {
    affordableUnits,
    canAffordOne,
    totalCredits,
    calculateFor,
  };
}

// =============================================================================
// MODEL COMPARISON HOOK
// =============================================================================

export interface UseModelComparisonReturn {
  /** All models in category sorted by cost */
  models: ModelCostInfo[];
  /** Cheapest model */
  cheapest: ModelCostInfo | null;
  /** Most expensive model */
  mostExpensive: ModelCostInfo | null;
  /** Credit range display string */
  creditRange: string;
  /** Get credit difference between two models */
  getCreditsApart: (modelA: string, modelB: string) => number;
}

/**
 * Hook to compare model costs in a category
 * 
 * @example
 * ```tsx
 * function ModelSelector({ category }) {
 *   const { models, cheapest, creditRange } = useModelComparison(category);
 *   
 *   return (
 *     <div>
 *       <p>Prices range from {creditRange}</p>
 *       <p>Best value: {cheapest?.name}</p>
 *       {models.map(model => (
 *         <ModelCard key={model.modelId} model={model} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useModelComparison(category: ToolCategory): UseModelComparisonReturn {
  const models = useMemo(() => {
    return getModelsByCategory(category)
      .sort((a, b) => a.creditsPerUnit - b.creditsPerUnit);
  }, [category]);
  
  const cheapest = models[0] ?? null;
  const mostExpensive = models[models.length - 1] ?? null;
  
  const creditRange = useMemo(() => {
    if (!cheapest || !mostExpensive) return "N/A";
    return formatCreditRange(cheapest.creditsPerUnit, mostExpensive.creditsPerUnit);
  }, [cheapest, mostExpensive]);
  
  const getCreditsApart = useCallback((modelA: string, modelB: string) => {
    const creditsA = getModelCredits(modelA);
    const creditsB = getModelCredits(modelB);
    return Math.abs(creditsA - creditsB);
  }, []);
  
  return {
    models,
    cheapest,
    mostExpensive,
    creditRange,
    getCreditsApart,
  };
}

// =============================================================================
// CREDIT DISPLAY HOOK
// =============================================================================

export interface CreditDisplayOptions {
  /** Show "credits" suffix */
  showSuffix?: boolean;
  /** Show per-unit info */
  showPerUnit?: boolean;
  /** Compact format (K, M) */
  compact?: boolean;
}

/**
 * Hook for formatting credit displays
 */
export function useCreditDisplay(
  credits: number,
  options: CreditDisplayOptions = {}
) {
  const {
    showSuffix = true,
    showPerUnit = false,
    compact = true,
  } = options;
  
  const formatted = useMemo(() => {
    let value: string;
    
    if (compact) {
      value = formatCredits(credits);
    } else {
      value = credits.toLocaleString();
    }
    
    if (showSuffix) {
      value += " credits";
    }
    
    return value;
  }, [credits, compact, showSuffix]);
  
  return formatted;
}

// =============================================================================
// REAL-TIME COST PREVIEW HOOK
// =============================================================================

/**
 * Hook for real-time cost preview as user adjusts settings
 * 
 * @example
 * ```tsx
 * function VideoGenerator() {
 *   const [duration, setDuration] = useState(5);
 *   const [resolution, setResolution] = useState("720p");
 *   
 *   const preview = useCostPreview("veo3", {
 *     units: duration,
 *     modifiers: { resolution },
 *   });
 *   
 *   return (
 *     <div>
 *       <Slider value={duration} onChange={setDuration} />
 *       <p>Estimated: {preview.formatted}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCostPreview(
  modelId: string,
  options: {
    units?: number;
    tier?: string;
    modifiers?: Record<string, string | number | boolean>;
  } = {}
) {
  const { units = 1, tier, modifiers } = options;
  
  const result = useMemo(() => {
    return calculateCredits({
      modelId,
      units,
      tier,
      modifiers,
    });
  }, [modelId, units, tier, JSON.stringify(modifiers)]);
  
  const formatted = useMemo(() => {
    return formatCredits(result.credits);
  }, [result.credits]);
  
  const breakdown = useMemo(() => {
    const lines: string[] = [];
    lines.push(`${result.breakdown.modelName}`);
    lines.push(`${result.breakdown.creditsPerUnit} credits/${result.breakdown.unitLabel}`);
    lines.push(`${units} ${result.breakdown.unitLabel}${units !== 1 ? "s" : ""}`);
    
    if (result.breakdown.appliedModifiers.length > 0) {
      lines.push(...result.breakdown.appliedModifiers);
    }
    
    lines.push(`Total: ${formatted}`);
    return lines;
  }, [result, units, formatted]);
  
  return {
    credits: result.credits,
    formatted,
    breakdown,
    result,
  };
}

