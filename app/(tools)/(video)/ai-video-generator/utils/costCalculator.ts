/**
 * Cost Calculator Utility
 * Handles all 4 cost types across 76 video models:
 * 1. per_second - Cost per second of video (most common)
 * 2. fixed - Flat rate per video
 * 3. tiered - Resolution-based pricing
 * 4. tiered_template - Template tier-based pricing (Vidu)
 */

import { ModelType } from "../types/index.types";
import { CostResult, TemplateTier, formatCredits } from "../types/cost.types";

/**
 * Vidu template tier mappings
 * Maps template IDs to their respective tiers
 */
const VIDU_TEMPLATE_TIERS: Record<string, TemplateTier> = {
  // STANDARD tier templates (0.2M credits)
  hug: "STANDARD",
  kiss: "STANDARD",
  dance: "STANDARD",
  walk: "STANDARD",
  
  // PREMIUM tier templates (0.3M credits)
  cinematic_zoom: "PREMIUM",
  action_sequence: "PREMIUM",
  dramatic_reveal: "PREMIUM",
  
  // ADVANCED tier templates (0.5M credits)
  multi_character: "ADVANCED",
  complex_scene: "ADVANCED",
  vfx_heavy: "ADVANCED",
};

/**
 * Get template tier from template ID
 */
export function getTemplateTier(templateId: string): TemplateTier {
  return VIDU_TEMPLATE_TIERS[templateId] || "STANDARD";
}

/**
 * Calculate cost for a model based on current field values
 * Returns detailed cost breakdown
 */
export function calculateCost(
  model: ModelType,
  fieldValues: Record<string, any>
): CostResult {
  const { cost } = model;
  
  if (!cost) {
    return {
      amount: 0,
      currency: "credits",
      breakdown: ["No cost information available"],
      display: "Unknown",
    };
  }
  
  switch (cost.type) {
    case "per_second":
      return calculatePerSecondCost(model, fieldValues);
      
    case "fixed":
      return calculateFixedCost(model, fieldValues);
      
    case "tiered":
      return calculateTieredCost(model, fieldValues);
      
    case "tiered_template":
      return calculateTieredTemplateCost(model, fieldValues);
      
    default:
      return {
        amount: 0,
        currency: "credits",
        breakdown: ["Unknown cost type"],
        display: "Unknown",
      };
  }
}

/**
 * Calculate per-second cost
 * Formula: cost.value * duration
 */
function calculatePerSecondCost(
  model: ModelType,
  fieldValues: Record<string, any>
): CostResult {
  const { cost } = model;
  const perSecondRate = cost.value || 0;
  
  // Get duration from field values or model defaults
  const durationStr = fieldValues.duration || 
                     model.fieldOptions?.duration?.default || 
                     model.capabilities?.fixedDuration?.toString() || 
                     "5";
  const duration = parseInt(durationStr);
  
  const totalCost = perSecondRate * duration;
  
  return {
    amount: totalCost,
    currency: "credits",
    perUnit: perSecondRate,
    duration,
    breakdown: [
      `Rate: ${perSecondRate}M credits/second`,
      `Duration: ${duration} seconds`,
      `Total: ${perSecondRate} × ${duration} = ${totalCost}M`,
    ],
    display: formatCredits(totalCost),
  };
}

/**
 * Calculate fixed cost
 * Formula: cost.value (flat rate)
 */
function calculateFixedCost(
  model: ModelType,
  fieldValues: Record<string, any>
): CostResult {
  const { cost } = model;
  const fixedCost = cost.value || 0;
  
  // Check if there's a fixed duration for display
  const duration = model.capabilities?.fixedDuration;
  const durationInfo = duration ? ` (${duration} seconds)` : "";
  
  return {
    amount: fixedCost,
    currency: "credits",
    breakdown: [
      `Fixed cost${durationInfo}`,
      `Total: ${fixedCost}M credits`,
    ],
    display: formatCredits(fixedCost),
  };
}

/**
 * Calculate tiered cost (resolution-based)
 * Formula: tier.value * duration
 * Tier is determined by resolution selection
 */
function calculateTieredCost(
  model: ModelType,
  fieldValues: Record<string, any>
): CostResult {
  const { cost } = model;
  
  // Get selected resolution
  const resolution = fieldValues.resolution || 
                    model.fieldOptions?.resolution?.default || 
                    "720p";
  
  // Find matching tier
  const tier = cost.tiers?.find((t) => t.resolution === resolution);
  const perSecondRate = tier?.value || cost.base_value || 0;
  
  // Get duration
  const durationStr = fieldValues.duration || 
                     model.fieldOptions?.duration?.default || 
                     "5";
  const duration = parseInt(durationStr);
  
  const totalCost = perSecondRate * duration;
  
  return {
    amount: totalCost,
    currency: "credits",
    perUnit: perSecondRate,
    duration,
    breakdown: [
      `Resolution: ${resolution}`,
      `Rate: ${perSecondRate}M credits/second`,
      `Duration: ${duration} seconds`,
      `Total: ${perSecondRate} × ${duration} = ${totalCost}M`,
    ],
    display: formatCredits(totalCost),
  };
}

/**
 * Calculate tiered template cost (Vidu models)
 * Formula: cost[tier_value]
 * Tier is determined by template selection
 */
function calculateTieredTemplateCost(
  model: ModelType,
  fieldValues: Record<string, any>
): CostResult {
  const { cost } = model;
  
  // Get selected template
  const templateId = fieldValues.template || 
                    model.fieldOptions?.template?.default || 
                    "hug";
  
  // Determine tier
  const tier = getTemplateTier(templateId);
  
  // Get cost for this tier
  const tierKey = `${tier.toLowerCase()}_value` as keyof typeof cost;
  const templateCost = (cost[tierKey] as number) || cost.standard_value || 0;
  
  return {
    amount: templateCost,
    currency: "credits",
    breakdown: [
      `Template: ${templateId}`,
      `Tier: ${tier}`,
      `Cost: ${templateCost}M credits`,
    ],
    display: formatCredits(templateCost),
  };
}

/**
 * Calculate cost difference when changing settings
 * Useful for showing "This will cost X more/less"
 */
export function calculateCostDifference(
  model: ModelType,
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): number {
  const oldCost = calculateCost(model, oldValues);
  const newCost = calculateCost(model, newValues);
  return newCost.amount - oldCost.amount;
}

/**
 * Get cost range for a model
 * Useful for showing "From X to Y credits"
 */
export function getCostRange(model: ModelType): { min: number; max: number } {
  const { cost } = model;
  
  switch (cost.type) {
    case "per_second": {
      const rate = cost.value || 0;
      const durations = model.fieldOptions?.duration?.options || ["5"];
      const minDuration = Math.min(...durations.map((d) => parseInt(String(d))));
      const maxDuration = Math.max(...durations.map((d) => parseInt(String(d))));
      return {
        min: rate * minDuration,
        max: rate * maxDuration,
      };
    }
    
    case "fixed": {
      const amount = cost.value || 0;
      return { min: amount, max: amount };
    }
    
    case "tiered": {
      const rates = cost.tiers?.map((t) => t.value) || [cost.base_value || 0];
      const durations = model.fieldOptions?.duration?.options || ["5"];
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);
      const minDuration = Math.min(...durations.map((d) => parseInt(String(d))));
      const maxDuration = Math.max(...durations.map((d) => parseInt(String(d))));
      return {
        min: minRate * minDuration,
        max: maxRate * maxDuration,
      };
    }
    
    case "tiered_template": {
      const standardCost = cost.standard_value || 0;
      const premiumCost = cost.premium_value || standardCost;
      const advancedCost = cost.advanced_value || premiumCost;
      return {
        min: standardCost,
        max: advancedCost,
      };
    }
    
    default:
      return { min: 0, max: 0 };
  }
}

/**
 * Format cost range for display
 */
export function formatCostRange(model: ModelType): string {
  const { min, max } = getCostRange(model);
  
  if (min === max) {
    return formatCredits(min);
  }
  
  return `${formatCredits(min)} - ${formatCredits(max)}`;
}

/**
 * Get default field values for cost calculation
 */
export function getDefaultFieldValues(model: ModelType): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  if (model.fieldOptions) {
    for (const [fieldName, fieldOption] of Object.entries(model.fieldOptions)) {
      if (fieldOption && fieldOption.default !== undefined) {
        defaults[fieldName] = fieldOption.default;
      }
    }
  }
  
  return defaults;
}

