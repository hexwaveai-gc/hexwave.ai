/**
 * Cost Calculation Types
 * Handles all 4 cost types used across 76 video models:
 * 1. per_second - Cost per second of video (most common)
 * 2. fixed - Flat rate per video
 * 3. tiered - Resolution-based pricing
 * 4. tiered_template - Template tier-based pricing (Vidu)
 */

import { ModelType } from "./index.types";

/**
 * Result of cost calculation with breakdown
 */
export interface CostResult {
  /** Total cost amount in credits */
  amount: number;
  
  /** Currency unit (always "credits" for now) */
  currency: string;
  
  /** Detailed breakdown of cost calculation */
  breakdown: string[];
  
  /** Formatted display string */
  display: string;
  
  /** Per-unit cost (for per_second or tiered) */
  perUnit?: number;
  
  /** Duration in seconds (for per_second or tiered) */
  duration?: number;
}

/**
 * Cost calculator interface
 */
export interface CostCalculator {
  /**
   * Calculate cost based on model and field values
   * @param model - The selected video model
   * @param fieldValues - Current form field values
   * @returns Cost result with breakdown
   */
  calculate(model: ModelType, fieldValues: Record<string, any>): CostResult;
}

/**
 * Template tier for Vidu models
 */
export type TemplateTier = "STANDARD" | "PREMIUM" | "ADVANCED";

/**
 * Template information with tier and cost
 */
export interface TemplateInfo {
  id: string;
  name: string;
  tier: TemplateTier;
  cost: number;
  description?: string;
  previewImage?: string;
}

/**
 * Cost breakdown item
 */
export interface CostBreakdownItem {
  label: string;
  value: string | number;
  description?: string;
}

/**
 * Format cost for display
 */
export function formatCost(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(2);
}

/**
 * Format credits display
 */
export function formatCredits(amount: number): string {
  return `${formatCost(amount)}M credits`;
}

/**
 * Calculate per-second cost from tiered pricing
 */
export function getPerSecondCost(
  model: ModelType,
  resolution?: string
): number | null {
  const { cost } = model;
  
  if (cost.type === "per_second") {
    return cost.value || null;
  }
  
  if (cost.type === "tiered" && resolution) {
    const tier = cost.tiers?.find((t) => t.resolution === resolution);
    return tier?.value || cost.base_value || null;
  }
  
  return null;
}

/**
 * Get template tier cost
 */
export function getTemplateCost(
  model: ModelType,
  tier: TemplateTier
): number | null {
  const { cost } = model;
  
  if (cost.type === "tiered_template") {
    const key = `${tier.toLowerCase()}_value` as keyof typeof cost;
    return (cost[key] as number) || null;
  }
  
  return null;
}

/**
 * Validate if a model has cost information
 */
export function hasValidCost(model: ModelType): boolean {
  return !!model.cost && !!model.cost.type;
}

