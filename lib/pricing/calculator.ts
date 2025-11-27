/**
 * ============================================================================
 * CENTRALIZED COST CALCULATOR
 * ============================================================================
 * 
 * Calculates user credits from 3rd party costs with platform markup.
 * 
 * This file is the ONLY place where cost calculations happen.
 * Both frontend and backend import from here for consistency.
 * 
 * Key Functions:
 * - calculateCredits: Main calculation function
 * - getModelCredits: Get credits for a specific model
 * - calculateBulkCredits: Calculate for multiple operations
 * - formatCredits: Display formatting
 */

import {
  PLATFORM_CONFIG,
  ALL_MODEL_COSTS,
  type ModelPricing,
  type CostConfig,
  type TieredCostConfig,
  type TemplateTierCostConfig,
  type ToolCategory,
} from "./config";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Input for cost calculation
 */
export interface CalculationInput {
  /** Model ID */
  modelId: string;
  
  /** Number of units (images, seconds, minutes, characters) */
  units: number;
  
  /** Optional tier for tiered pricing (e.g., "720p", "1080p", "QUALITY") */
  tier?: string;
  
  /** Optional modifiers (e.g., { resolution: "4k" }) */
  modifiers?: Record<string, string | number | boolean>;
}

/**
 * Result of cost calculation
 */
export interface CalculationResult {
  /** Total credits to charge user */
  credits: number;
  
  /** 3rd party cost in USD */
  thirdPartyCost: number;
  
  /** Platform fee in USD */
  platformFee: number;
  
  /** Total cost in USD (before credit conversion) */
  totalCostUsd: number;
  
  /** Credit breakdown details */
  breakdown: CostBreakdown;
  
  /** Formatted display string */
  display: string;
}

/**
 * Detailed cost breakdown
 */
export interface CostBreakdown {
  /** Model name */
  modelName: string;
  
  /** Pricing type used */
  pricingType: string;
  
  /** Number of units */
  units: number;
  
  /** Unit label (images, seconds, minutes, characters) */
  unitLabel: string;
  
  /** Cost per unit in USD */
  costPerUnit: number;
  
  /** Credits per unit */
  creditsPerUnit: number;
  
  /** Applied modifiers */
  appliedModifiers: string[];
  
  /** Tier used (if applicable) */
  tierUsed?: string;
}

/**
 * Model cost info for display
 */
export interface ModelCostInfo {
  modelId: string;
  name: string;
  category: ToolCategory;
  creditsPerUnit: number;
  unitLabel: string;
  pricingType: string;
  minCredits?: number;
  maxCredits?: number;
  provider: string;
}

// =============================================================================
// CORE CALCULATION FUNCTIONS
// =============================================================================

/**
 * Convert USD cost to credits with platform markup
 */
export function usdToCredits(usdAmount: number): number {
  const { CREDIT_RATIO, PLATFORM_MARGIN, MIN_CREDITS, ROUNDING } = PLATFORM_CONFIG;
  
  // Add platform margin
  const withMargin = usdAmount * (1 + PLATFORM_MARGIN);
  
  // Convert to credits
  const rawCredits = withMargin * CREDIT_RATIO;
  
  // Apply rounding
  let credits: number;
  switch (ROUNDING) {
    case "ceil":
      credits = Math.ceil(rawCredits);
      break;
    case "floor":
      credits = Math.floor(rawCredits);
      break;
    case "round":
    default:
      credits = Math.round(rawCredits);
  }
  
  // Ensure minimum
  return Math.max(credits, MIN_CREDITS);
}

/**
 * Convert credits back to USD (for display)
 */
export function creditsToUsd(credits: number): number {
  const { CREDIT_RATIO, PLATFORM_MARGIN } = PLATFORM_CONFIG;
  const usdWithMargin = credits / CREDIT_RATIO;
  return usdWithMargin / (1 + PLATFORM_MARGIN);
}

/**
 * Get unit label for pricing type
 */
function getUnitLabel(pricingType: string): string {
  switch (pricingType) {
    case "per_image":
      return "image";
    case "per_second":
      return "second";
    case "per_minute":
      return "minute";
    case "per_character":
      return "character";
    case "fixed":
      return "generation";
    case "tiered":
    case "tiered_template":
      return "generation";
    default:
      return "unit";
  }
}

/**
 * Get base cost from config
 */
function getBaseCost(cost: CostConfig, tier?: string): number {
  switch (cost.type) {
    case "per_image":
    case "per_second":
    case "per_minute":
    case "per_character":
    case "fixed":
      return cost.thirdPartyCost;
      
    case "tiered": {
      const tieredCost = cost as TieredCostConfig;
      if (tier) {
        const matchedTier = tieredCost.tiers.find(
          (t) => t.id.toLowerCase() === tier.toLowerCase()
        );
        if (matchedTier) return matchedTier.thirdPartyCost;
      }
      return tieredCost.baseCost ?? tieredCost.thirdPartyCost;
    }
    
    case "tiered_template": {
      const templateCost = cost as TemplateTierCostConfig;
      const tierKey = (tier || "standard").toLowerCase();
      switch (tierKey) {
        case "premium":
          return templateCost.premiumCost;
        case "advanced":
          return templateCost.advancedCost;
        case "standard":
        default:
          return templateCost.standardCost;
      }
    }
    
    default:
      return 0;
  }
}

/**
 * Calculate credits for a model operation
 */
export function calculateCredits(input: CalculationInput): CalculationResult {
  const { modelId, units, tier, modifiers } = input;
  
  // Get model config
  const model = ALL_MODEL_COSTS[modelId];
  if (!model) {
    return {
      credits: 0,
      thirdPartyCost: 0,
      platformFee: 0,
      totalCostUsd: 0,
      breakdown: {
        modelName: "Unknown",
        pricingType: "unknown",
        units: 0,
        unitLabel: "unit",
        costPerUnit: 0,
        creditsPerUnit: 0,
        appliedModifiers: [],
      },
      display: "Unknown model",
    };
  }
  
  // Get base cost per unit
  let baseCostPerUnit = getBaseCost(model.cost, tier);
  
  // Apply modifiers
  const appliedModifiers: string[] = [];
  if (modifiers && model.modifiers) {
    for (const modifier of model.modifiers) {
      const fieldValue = modifiers[modifier.field];
      if (fieldValue !== undefined) {
        const matchValues = Array.isArray(modifier.value) 
          ? modifier.value 
          : [modifier.value];
        
        if (matchValues.some((v) => 
          String(v).toLowerCase() === String(fieldValue).toLowerCase()
        )) {
          baseCostPerUnit *= modifier.multiplier;
          appliedModifiers.push(modifier.description || `${modifier.field}=${fieldValue}`);
        }
      }
    }
  }
  
  // Calculate totals
  const thirdPartyCost = baseCostPerUnit * units;
  const platformFee = thirdPartyCost * PLATFORM_CONFIG.PLATFORM_MARGIN;
  const totalCostUsd = thirdPartyCost + platformFee;
  
  // Convert to credits
  const credits = usdToCredits(thirdPartyCost);
  const creditsPerUnit = usdToCredits(baseCostPerUnit);
  
  const unitLabel = getUnitLabel(model.cost.type);
  
  return {
    credits,
    thirdPartyCost,
    platformFee,
    totalCostUsd,
    breakdown: {
      modelName: model.name,
      pricingType: model.cost.type,
      units,
      unitLabel,
      costPerUnit: baseCostPerUnit,
      creditsPerUnit,
      appliedModifiers,
      tierUsed: tier,
    },
    display: formatCreditsDisplay(credits, units, unitLabel),
  };
}

/**
 * Quick credit lookup for a model (1 unit, no modifiers)
 */
export function getModelCredits(
  modelId: string,
  tier?: string
): number {
  return calculateCredits({ modelId, units: 1, tier }).credits;
}

/**
 * Get model cost info for display
 */
export function getModelCostInfo(modelId: string): ModelCostInfo | null {
  const model = ALL_MODEL_COSTS[modelId];
  if (!model) return null;
  
  const baseCost = getBaseCost(model.cost, undefined);
  const creditsPerUnit = usdToCredits(baseCost);
  
  // Calculate min/max for tiered pricing
  let minCredits: number | undefined;
  let maxCredits: number | undefined;
  
  if (model.cost.type === "tiered") {
    const tieredCost = model.cost as TieredCostConfig;
    const tierCosts = tieredCost.tiers.map((t) => usdToCredits(t.thirdPartyCost));
    minCredits = Math.min(...tierCosts);
    maxCredits = Math.max(...tierCosts);
  } else if (model.cost.type === "tiered_template") {
    const templateCost = model.cost as TemplateTierCostConfig;
    minCredits = usdToCredits(templateCost.standardCost);
    maxCredits = usdToCredits(templateCost.advancedCost);
  }
  
  return {
    modelId,
    name: model.name,
    category: model.category,
    creditsPerUnit,
    unitLabel: getUnitLabel(model.cost.type),
    pricingType: model.cost.type,
    minCredits,
    maxCredits,
    provider: model.cost.provider,
  };
}

/**
 * Calculate total credits for multiple operations
 */
export function calculateBulkCredits(
  operations: CalculationInput[]
): {
  totalCredits: number;
  totalUsd: number;
  results: CalculationResult[];
} {
  const results = operations.map(calculateCredits);
  const totalCredits = results.reduce((sum, r) => sum + r.credits, 0);
  const totalUsd = results.reduce((sum, r) => sum + r.totalCostUsd, 0);
  
  return { totalCredits, totalUsd, results };
}

// =============================================================================
// FORMATTING FUNCTIONS
// =============================================================================

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  }
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toString();
}

/**
 * Format credits display with units
 */
function formatCreditsDisplay(
  credits: number,
  units: number,
  unitLabel: string
): string {
  const formatted = formatCredits(credits);
  const plural = units !== 1 ? "s" : "";
  return `${formatted} credits (${units} ${unitLabel}${plural})`;
}

/**
 * Format credit range for display
 */
export function formatCreditRange(min: number, max: number): string {
  if (min === max) {
    return formatCredits(min);
  }
  return `${formatCredits(min)} - ${formatCredits(max)}`;
}

/**
 * Get credits display for UI
 */
export function getCreditDisplay(
  modelId: string,
  units: number = 1,
  options?: {
    tier?: string;
    modifiers?: Record<string, string | number | boolean>;
    showBreakdown?: boolean;
  }
): string {
  const result = calculateCredits({
    modelId,
    units,
    tier: options?.tier,
    modifiers: options?.modifiers,
  });
  
  if (options?.showBreakdown) {
    const lines = [
      `${formatCredits(result.credits)} credits`,
      `Model: ${result.breakdown.modelName}`,
      `Rate: ${result.breakdown.creditsPerUnit} credits/${result.breakdown.unitLabel}`,
    ];
    
    if (result.breakdown.appliedModifiers.length > 0) {
      lines.push(`Modifiers: ${result.breakdown.appliedModifiers.join(", ")}`);
    }
    
    return lines.join("\n");
  }
  
  return formatCredits(result.credits);
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Check if user has sufficient credits
 */
export function hasEnoughCredits(
  userCredits: number,
  modelId: string,
  units: number,
  options?: { tier?: string; modifiers?: Record<string, string | number | boolean> }
): {
  hasEnough: boolean;
  requiredCredits: number;
  shortfall: number;
} {
  const result = calculateCredits({
    modelId,
    units,
    tier: options?.tier,
    modifiers: options?.modifiers,
  });
  
  const hasEnough = userCredits >= result.credits;
  const shortfall = hasEnough ? 0 : result.credits - userCredits;
  
  return {
    hasEnough,
    requiredCredits: result.credits,
    shortfall,
  };
}

/**
 * Calculate how many units user can afford
 */
export function calculateAffordableUnits(
  userCredits: number,
  modelId: string,
  tier?: string
): number {
  const creditsPerUnit = getModelCredits(modelId, tier);
  if (creditsPerUnit === 0) return 0;
  return Math.floor(userCredits / creditsPerUnit);
}

// =============================================================================
// CATEGORY HELPERS
// =============================================================================

/**
 * Get all models for a category
 */
export function getModelsByCategory(category: ToolCategory): ModelCostInfo[] {
  return Object.values(ALL_MODEL_COSTS)
    .filter((m) => m.category === category)
    .map((m) => getModelCostInfo(m.id))
    .filter((m): m is ModelCostInfo => m !== null);
}

/**
 * Get cheapest model in category
 */
export function getCheapestModel(category: ToolCategory): ModelCostInfo | null {
  const models = getModelsByCategory(category);
  if (models.length === 0) return null;
  
  return models.reduce((cheapest, current) =>
    current.creditsPerUnit < cheapest.creditsPerUnit ? current : cheapest
  );
}

/**
 * Get most expensive model in category
 */
export function getMostExpensiveModel(category: ToolCategory): ModelCostInfo | null {
  const models = getModelsByCategory(category);
  if (models.length === 0) return null;
  
  return models.reduce((expensive, current) =>
    current.creditsPerUnit > expensive.creditsPerUnit ? current : expensive
  );
}

// =============================================================================
// EXPORT CONFIG FOR TRANSPARENCY
// =============================================================================

/**
 * Get current platform config (useful for admin/debugging)
 */
export function getPlatformConfig() {
  return { ...PLATFORM_CONFIG };
}

/**
 * Calculate what 3rd party cost would be from user credits
 * (Reverse calculation for debugging/admin)
 */
export function getThirdPartyCostFromCredits(credits: number): number {
  return creditsToUsd(credits);
}

