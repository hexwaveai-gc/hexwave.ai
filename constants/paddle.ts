/**
 * Paddle Configuration Constants
 * 
 * Single source of truth for all Paddle-related IDs and configuration.
 * Import this file for Paddle product/price IDs, credit mappings, etc.
 */

// ============================================================================
// PRODUCT IDs
// ============================================================================

export const PADDLE_PRODUCTS = {
  PRO: "pro_01kb0jenzv3vz04zp16g4qmk4k",
  ULTIMATE: "pro_01kb0jjz493ecvk5zyx1h2cb8m",
  CREATOR: "pro_01kb0jqezssqwz612c7jc738y4",
  ADDON: "pro_01kb0jttzcm5s39b11azkpb9bz",
} as const;

export type PaddleProductId = (typeof PADDLE_PRODUCTS)[keyof typeof PADDLE_PRODUCTS];

// ============================================================================
// PRICE IDs
// ============================================================================

export const PADDLE_PRICES = {
  // Pro Plan
  PRO_MONTHLY: "pri_01kb0jgmc9m3qym1jz1kmcrbre",
  PRO_ANNUAL: "pri_01kb0jjhfnbx54vsvsxxn4nfc6",

  // Ultimate Plan
  ULTIMATE_MONTHLY: "pri_01kb0jkrthda3qnyjc79hz0k8h",
  ULTIMATE_ANNUAL: "pri_01kb0jq5pwjgfsdahzysna8dk5",

  // Creator Plan
  CREATOR_MONTHLY: "pri_01kb0jrkr4c74krb8p61tp8mfs",
  CREATOR_ANNUAL: "pri_01kb0jta4c34b53f7bb7wfq318",

  // Add-on credits
  ADDON_CREDITS: "pri_01kb0jvyfk3v1cj284kgvvz3sq",
} as const;

export type PaddlePriceId = (typeof PADDLE_PRICES)[keyof typeof PADDLE_PRICES];

// ============================================================================
// CREDITS MAPPING
// ============================================================================

/** 
 * Credits per plan - Monthly allocation
 * 
 * For annual plans: Credits are distributed MONTHLY, not all at once.
 * Users get their monthly allocation on subscription start and each month thereafter.
 */
export const PLAN_CREDITS: Record<string, number> = {
  // Pro Plan - 4,000 credits/month
  [PADDLE_PRICES.PRO_MONTHLY]: 4000,
  [PADDLE_PRICES.PRO_ANNUAL]: 4000, // Monthly allocation (distributed each month)

  // Ultimate Plan - 8,000 credits/month
  [PADDLE_PRICES.ULTIMATE_MONTHLY]: 8000,
  [PADDLE_PRICES.ULTIMATE_ANNUAL]: 8000, // Monthly allocation (distributed each month)

  // Creator Plan - 20,000 credits/month
  [PADDLE_PRICES.CREATOR_MONTHLY]: 20000,
  [PADDLE_PRICES.CREATOR_ANNUAL]: 20000, // Monthly allocation (distributed each month)

  // Add-on - 100 credits per unit ($1 = 100 credits)
  [PADDLE_PRICES.ADDON_CREDITS]: 100,
};

/** Monthly credits by product (for display purposes) */
export const MONTHLY_CREDITS: Record<string, number> = {
  [PADDLE_PRODUCTS.PRO]: 4000,
  [PADDLE_PRODUCTS.ULTIMATE]: 8000,
  [PADDLE_PRODUCTS.CREATOR]: 20000,
};

// ============================================================================
// PRICING (USD)
// ============================================================================

export const PLAN_PRICING = {
  PRO: {
    monthly: 29,
    annual: 288,
    annualMonthly: 24, // $288/12
    savings: 17, // % saved with annual
  },
  ULTIMATE: {
    monthly: 39,
    annual: 468,
    annualMonthly: 39, // $468/12
    savings: 0,
  },
  CREATOR: {
    monthly: 99,
    annual: 1020,
    annualMonthly: 85, // $1020/12
    savings: 14, // % saved with annual
  },
} as const;

// ============================================================================
// TIER MAPPING
// ============================================================================

/** 
 * Map product ID to plan tier
 * Tiers match plan IDs for consistency: pro, ultimate, creator
 */
export const PRODUCT_TO_TIER: Record<string, "pro" | "ultimate" | "creator" | "free"> = {
  [PADDLE_PRODUCTS.PRO]: "pro",
  [PADDLE_PRODUCTS.ULTIMATE]: "ultimate",
  [PADDLE_PRODUCTS.CREATOR]: "creator",
};

/** Map price ID to plan name */
export const PRICE_TO_PLAN_NAME: Record<string, string> = {
  [PADDLE_PRICES.PRO_MONTHLY]: "Pro",
  [PADDLE_PRICES.PRO_ANNUAL]: "Pro",
  [PADDLE_PRICES.ULTIMATE_MONTHLY]: "Ultimate",
  [PADDLE_PRICES.ULTIMATE_ANNUAL]: "Ultimate",
  [PADDLE_PRICES.CREATOR_MONTHLY]: "Creator",
  [PADDLE_PRICES.CREATOR_ANNUAL]: "Creator",
  [PADDLE_PRICES.ADDON_CREDITS]: "Credit Add-on",
};

/** Map price ID to product ID */
export const PRICE_TO_PRODUCT: Record<string, string> = {
  [PADDLE_PRICES.PRO_MONTHLY]: PADDLE_PRODUCTS.PRO,
  [PADDLE_PRICES.PRO_ANNUAL]: PADDLE_PRODUCTS.PRO,
  [PADDLE_PRICES.ULTIMATE_MONTHLY]: PADDLE_PRODUCTS.ULTIMATE,
  [PADDLE_PRICES.ULTIMATE_ANNUAL]: PADDLE_PRODUCTS.ULTIMATE,
  [PADDLE_PRICES.CREATOR_MONTHLY]: PADDLE_PRODUCTS.CREATOR,
  [PADDLE_PRICES.CREATOR_ANNUAL]: PADDLE_PRODUCTS.CREATOR,
  [PADDLE_PRICES.ADDON_CREDITS]: PADDLE_PRODUCTS.ADDON,
};

/** Annual price IDs */
export const ANNUAL_PRICE_IDS = [
  PADDLE_PRICES.PRO_ANNUAL,
  PADDLE_PRICES.ULTIMATE_ANNUAL,
  PADDLE_PRICES.CREATOR_ANNUAL,
] as const;

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

export const WEBHOOK_EVENTS = {
  SUBSCRIPTION_CREATED: "subscription.created",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  SUBSCRIPTION_CANCELED: "subscription.canceled",
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_PAUSED: "subscription.paused",
  SUBSCRIPTION_RESUMED: "subscription.resumed",
  TRANSACTION_COMPLETED: "transaction.completed",
  TRANSACTION_PAYMENT_FAILED: "transaction.payment_failed",
  // Adjustment/refund events
  ADJUSTMENT_CREATED: "adjustment.created",
  ADJUSTMENT_UPDATED: "adjustment.updated",
} as const;

/** Paddle status to internal status mapping */
export const PADDLE_STATUS_MAP: Record<string, string> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  paused: "paused",
  canceled: "canceled",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get credits for a given price ID
 */
export function getCreditsForPrice(priceId: string, quantity: number = 1): number {
  const baseCredits = PLAN_CREDITS[priceId] || 0;

  // For add-on purchases, multiply by quantity
  if (priceId === PADDLE_PRICES.ADDON_CREDITS) {
    return baseCredits * quantity;
  }

  return baseCredits;
}

/**
 * Get plan name from price ID
 */
export function getPlanNameFromPriceId(priceId: string): string {
  return PRICE_TO_PLAN_NAME[priceId] || "Unknown";
}

/**
 * Get product ID from price ID
 */
export function getProductIdFromPriceId(priceId: string): string | null {
  return PRICE_TO_PRODUCT[priceId] || null;
}

/**
 * Check if price is annual billing
 */
export function isAnnualBilling(priceId: string): boolean {
  return ANNUAL_PRICE_IDS.includes(priceId as any);
}

/**
 * Get billing cycle from price ID
 */
export function getBillingCycle(priceId: string): "monthly" | "annual" {
  return isAnnualBilling(priceId) ? "annual" : "monthly";
}

