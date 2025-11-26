/**
 * Paddle Configuration
 * 
 * Re-exports from @/constants/paddle plus server-side configuration.
 * Use this file for server-side Paddle operations.
 */

// Re-export all constants and helpers from central file
export {
  PADDLE_PRODUCTS,
  PADDLE_PRICES,
  PLAN_CREDITS,
  PLAN_PRICING,
  MONTHLY_CREDITS,
  PRODUCT_TO_TIER,
  PRICE_TO_PLAN_NAME,
  PRICE_TO_PRODUCT,
  ANNUAL_PRICE_IDS,
  WEBHOOK_EVENTS,
  PADDLE_STATUS_MAP,
  getCreditsForPrice,
  getPlanNameFromPriceId,
  getProductIdFromPriceId,
  isAnnualBilling,
  getBillingCycle,
  type PaddleProductId,
  type PaddlePriceId,
} from "@/constants/paddle";

// ============================================================================
// SERVER-SIDE CONFIGURATION
// ============================================================================

/** Paddle API configuration (server-side only) */
export const PADDLE_CONFIG = {
  apiKey: process.env.PADDLE_API_KEY || "",
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || "",
  environment: (process.env.PADDLE_ENVIRONMENT || "sandbox") as "sandbox" | "production",
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
} as const;

/**
 * Validate required environment variables
 * @throws Error if required variables are missing
 */
export function validatePaddleConfig(): void {
  if (!PADDLE_CONFIG.apiKey) {
    throw new Error("Missing required environment variable: PADDLE_API_KEY");
  }
  if (!PADDLE_CONFIG.webhookSecret) {
    throw new Error("Missing required environment variable: PADDLE_WEBHOOK_SECRET");
  }
}

/**
 * Get checkout redirect URLs
 */
export function getCheckoutUrls() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    success: `${baseUrl}/pricing/success`,
    cancel: `${baseUrl}/pricing/cancel`,
  };
}
