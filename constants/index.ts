/**
 * Constants Index
 * 
 * Central export point for all application constants.
 */

// API constants (timeouts, retries, cache durations)
export * from "./api";

// UI constants (animations, delays, breakpoints)
export * from "./ui";

// Application limits (file sizes, credits, quotas)
export * from "./limits";

// Reusable style constants (Tailwind class combinations)
export * from "./styles";

// Paddle constants (source of truth for Paddle IDs and credit calculations)
export * from "./paddle";

// Plan constants (UI-related plan configurations)
// Note: Excludes getCreditsForPrice, PADDLE_PRODUCTS, PADDLE_PRICES to avoid conflicts with ./paddle
export {
  paddlePlans,
  creditPackages,
  getPlanById,
  getPlanByPriceId,
  getPlanByProductId,
  isAnnualPrice,
  plans,
  type PaddlePlan,
  type CreditPackage,
  type Plan,
} from "./plan";

// Tools constants (AI tools catalog data)
export * from "./tools";

// Templates constants (AI templates catalog data)
export * from "./templates";

// Audio constants (voices and audio generation)
export * from "./audio";

// Assets constants (tabs, filters, sort options)
export * from "./assets";
