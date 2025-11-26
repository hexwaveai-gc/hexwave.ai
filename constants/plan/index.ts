/**
 * Plan Constants
 * 
 * UI-related plan configurations including features, colors, and styling.
 * Imports Paddle IDs from the central paddle.ts constants file.
 */

import { Sparkles, Zap, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PADDLE_PRODUCTS,
  PADDLE_PRICES,
  PLAN_PRICING,
  getCreditsForPrice as getCredits,
  isAnnualBilling,
} from "@/constants/paddle";

// Re-export Paddle constants for convenience
export { PADDLE_PRODUCTS, PADDLE_PRICES } from "@/constants/paddle";

// ============================================================================
// TYPES
// ============================================================================

export interface PaddlePlan {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthlyPrice: number;
  savings: number;
  priceIdMonthly: string;
  priceIdAnnual: string;
  productId: string;
  credits: number;
  annualCredits: number;
  borderColor: string;
  bgGradient: string;
  iconColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  popular?: boolean;
  features: string[];
}

export interface CreditPackage {
  id: number;
  price: number;
  credits: number;
  baseCredits: number;
  bonusCredits: number;
  bonusPercent: number;
  priceId: string;
}

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export const paddlePlans: PaddlePlan[] = [
  {
    id: "pro",
    name: "Pro",
    description: "Perfect for creators getting started",
    icon: Sparkles,
    color: "blue",
    monthlyPrice: PLAN_PRICING.PRO.monthly,
    annualPrice: PLAN_PRICING.PRO.annual,
    annualMonthlyPrice: PLAN_PRICING.PRO.annualMonthly,
    savings: PLAN_PRICING.PRO.savings,
    priceIdMonthly: PADDLE_PRICES.PRO_MONTHLY,
    priceIdAnnual: PADDLE_PRICES.PRO_ANNUAL,
    productId: PADDLE_PRODUCTS.PRO,
    credits: 4000,
    annualCredits: 4000, // Monthly allocation (distributed each month)
    borderColor: "border-blue-500/30",
    bgGradient: "linear-gradient(180deg, #1e3a5f 0%, #0f172a 40%, #0a0a0a 100%)",
    iconColor: "text-blue-400",
    buttonColor: "bg-blue-600",
    buttonHoverColor: "hover:bg-blue-500",
    features: [
      "4,000 credits/month",
      "7-day media retention",
      "Fast-track generation",
      "HD video exports (1080p)",
      "Watermark-free exports",
      "All AI models",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "For professional content creators",
    icon: Zap,
    color: "purple",
    monthlyPrice: PLAN_PRICING.ULTIMATE.monthly,
    annualPrice: PLAN_PRICING.ULTIMATE.annual,
    annualMonthlyPrice: PLAN_PRICING.ULTIMATE.annualMonthly,
    savings: PLAN_PRICING.ULTIMATE.savings,
    priceIdMonthly: PADDLE_PRICES.ULTIMATE_MONTHLY,
    priceIdAnnual: PADDLE_PRICES.ULTIMATE_ANNUAL,
    productId: PADDLE_PRODUCTS.ULTIMATE,
    credits: 8000,
    annualCredits: 8000, // Monthly allocation (distributed each month)
    borderColor: "border-purple-500/30",
    bgGradient: "linear-gradient(180deg, #3b1d5e 0%, #1a0a2e 40%, #0a0a0a 100%)",
    iconColor: "text-purple-400",
    buttonColor: "bg-purple-600",
    buttonHoverColor: "hover:bg-purple-500",
    popular: true,
    features: [
      "8,000 credits/month",
      "30-day media retention",
      "Priority generation queue",
      "4K video exports",
      "Watermark-free exports",
      "All AI models + early access",
      "Priority support",
      "Advanced analytics",
      "Custom presets",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    description: "For teams and agencies",
    icon: Crown,
    color: "amber",
    monthlyPrice: PLAN_PRICING.CREATOR.monthly,
    annualPrice: PLAN_PRICING.CREATOR.annual,
    annualMonthlyPrice: PLAN_PRICING.CREATOR.annualMonthly,
    savings: PLAN_PRICING.CREATOR.savings,
    priceIdMonthly: PADDLE_PRICES.CREATOR_MONTHLY,
    priceIdAnnual: PADDLE_PRICES.CREATOR_ANNUAL,
    productId: PADDLE_PRODUCTS.CREATOR,
    credits: 20000,
    annualCredits: 20000, // Monthly allocation (distributed each month)
    borderColor: "border-amber-500/30",
    bgGradient: "linear-gradient(180deg, #78350f 0%, #451a03 40%, #0a0a0a 100%)",
    iconColor: "text-amber-400",
    buttonColor: "bg-amber-600",
    buttonHoverColor: "hover:bg-amber-500",
    features: [
      "20,000 credits/month",
      "Unlimited media retention",
      "Instant generation (no queue)",
      "8K video exports",
      "Watermark-free exports",
      "All AI models + beta access",
      "Dedicated support manager",
      "Full analytics suite",
      "Unlimited custom presets",
      "API access",
      "Team collaboration (5 seats)",
    ],
  },
];

// ============================================================================
// CREDIT PACKAGES
// ============================================================================

export const creditPackages: CreditPackage[] = [
  {
    id: 1,
    price: 5,
    credits: 600,
    baseCredits: 500,
    bonusCredits: 100,
    bonusPercent: 20,
    priceId: PADDLE_PRICES.ADDON_CREDITS,
  },
  {
    id: 2,
    price: 10,
    credits: 1200,
    baseCredits: 1000,
    bonusCredits: 200,
    bonusPercent: 20,
    priceId: PADDLE_PRICES.ADDON_CREDITS,
  },
  {
    id: 3,
    price: 25,
    credits: 3250,
    baseCredits: 2500,
    bonusCredits: 750,
    bonusPercent: 30,
    priceId: PADDLE_PRICES.ADDON_CREDITS,
  },
  {
    id: 4,
    price: 50,
    credits: 7000,
    baseCredits: 5000,
    bonusCredits: 2000,
    bonusPercent: 40,
    priceId: PADDLE_PRICES.ADDON_CREDITS,
  },
  {
    id: 5,
    price: 100,
    credits: 15000,
    baseCredits: 10000,
    bonusCredits: 5000,
    bonusPercent: 50,
    priceId: PADDLE_PRICES.ADDON_CREDITS,
  },
  {
    id: 6,
    price: 200,
    credits: 32000,
    baseCredits: 20000,
    bonusCredits: 12000,
    bonusPercent: 60,
    priceId: PADDLE_PRICES.ADDON_CREDITS,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPlanById(planId: string): PaddlePlan | undefined {
  return paddlePlans.find((plan) => plan.id === planId);
}

export function getPlanByPriceId(priceId: string): PaddlePlan | undefined {
  return paddlePlans.find(
    (plan) => plan.priceIdMonthly === priceId || plan.priceIdAnnual === priceId
  );
}

export function getPlanByProductId(productId: string): PaddlePlan | undefined {
  return paddlePlans.find((plan) => plan.productId === productId);
}

export function isAnnualPrice(priceId: string): boolean {
  return isAnnualBilling(priceId);
}

export function getCreditsForPrice(priceId: string): number {
  const plan = getPlanByPriceId(priceId);
  if (!plan) return 0;
  return isAnnualPrice(priceId) ? plan.annualCredits : plan.credits;
}

// ============================================================================
// LEGACY EXPORTS (Backward Compatibility)
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  monthlyPrice: number;
  originalMonthlyPrice: number;
  nextRenewal: number;
  discount: string;
  borderColor: string;
  bgGradient: string;
  iconColor: string;
  credits: number;
  creditsPer100: number;
  images: number;
  videos: number;
  benefits: string[];
  isNew?: boolean;
}

/** @deprecated Use paddlePlans instead */
export const plans: Plan[] = paddlePlans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  icon: plan.icon,
  color: plan.color,
  monthlyPrice: plan.monthlyPrice,
  originalMonthlyPrice: plan.monthlyPrice,
  nextRenewal: plan.monthlyPrice,
  discount: plan.savings > 0 ? `${plan.savings}%` : "",
  borderColor: plan.borderColor,
  bgGradient: plan.bgGradient,
  iconColor: plan.iconColor,
  credits: plan.credits,
  creditsPer100: (plan.monthlyPrice / plan.credits) * 100,
  images: plan.credits * 5,
  videos: Math.floor(plan.credits / 10),
  benefits: plan.features,
}));
