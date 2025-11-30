"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Check,
  ArrowRight,
  Star,
  X,
  Clock,
  AlertCircle,
  Gift,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { paddlePlans, type PaddlePlan } from "@/constants/plan";
import { useUser } from "@/hooks";
import { useAuthModal } from "@/app/providers/AuthModalProvider";

// ============================================================================
// Paddle Types
// ============================================================================

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: "sandbox" | "production") => void };
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: {
          transactionId?: string;
          items?: Array<{ priceId: string; quantity: number }>;
          customer?: { email: string };
          customData?: Record<string, string>;
          settings?: {
            successUrl?: string;
            displayMode?: "overlay" | "inline";
            theme?: "light" | "dark";
            locale?: string;
          };
        }) => void;
      };
    };
  }
}

// ============================================================================
// Free Tier Configuration
// ============================================================================

const FREE_TIER = {
  id: "free",
  name: "Free Trial",
  description: "7 days to explore Hexwave",
  icon: Gift,
  color: "gray",
  monthlyPrice: 0,
  annualPrice: 0,
  annualMonthlyPrice: 0,
  savings: 0,
  credits: 100,
  iconColor: "text-white/60",
  bgGradient: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
  features: [
    { text: "100 credits to start", included: true },
    { text: "1-day media retention", included: true, highlight: true },
    { text: "Limited image generation", included: true },
    { text: "Limited video generation", included: true },
    { text: "Watermarked exports", included: true, highlight: true },
    { text: "Basic models only", included: true },
    { text: "Community support", included: true },
  ],
  limitations: [
    "HD exports",
    "Priority queue",
    "Custom presets",
    "API access",
  ],
};

// ============================================================================
// Plan Hierarchy for Upgrade Logic
// ============================================================================

/**
 * Plan hierarchy using plan IDs (pro, ultimate, creator)
 * Higher number = higher tier plan
 * 
 * Upgrade rules:
 * - Users can upgrade from lower to higher tier (e.g., pro → ultimate → creator)
 * - Users can upgrade from monthly to annual on the same tier
 * - Users cannot downgrade (must contact support)
 */
const PLAN_HIERARCHY = {
  free: 0,
  pro_monthly: 1,
  pro_annual: 2,
  ultimate_monthly: 3,
  ultimate_annual: 4,
  creator_monthly: 5,
  creator_annual: 6,
};

type PlanKey = keyof typeof PLAN_HIERARCHY;

/**
 * Maps database plan_tier values to plan IDs used in the hierarchy
 * Tiers now match plan IDs directly: pro, ultimate, creator
 * Legacy tiers (basic, enterprise, custom) are mapped for backward compatibility
 */
const TIER_TO_PLAN_ID: Record<string, string> = {
  // Direct mappings (current)
  pro: "pro",
  ultimate: "ultimate",
  creator: "creator",
  free: "free",
  // Legacy mappings (backward compatibility for old data)
  basic: "pro",
  enterprise: "ultimate",
  custom: "creator",
};

function getPlanKey(planIdOrTier: string | null, billingCycle: string | null): PlanKey {
  if (!planIdOrTier) return "free";
  
  const normalizedInput = planIdOrTier.toLowerCase();
  
  // First, check if it's a tier name that needs mapping
  const planId = TIER_TO_PLAN_ID[normalizedInput] || normalizedInput;
  
  const cycle = billingCycle === "yearly" || billingCycle === "annual" ? "annual" : "monthly";
  const key = `${planId}_${cycle}` as PlanKey;
  
  // Validate the key exists in hierarchy, fallback to free if not
  return key in PLAN_HIERARCHY ? key : "free";
}

/**
 * Determines if user can upgrade from current plan to target plan
 * 
 * Allowed upgrades:
 * - Monthly → Annual (same tier): pro_monthly → pro_annual ✓
 * - Lower → Higher tier: pro → ultimate → creator ✓
 * - Monthly lower → Annual higher: pro_monthly → ultimate_annual ✓
 * 
 * Not allowed (requires support):
 * - Downgrade to lower tier
 * - Annual → Monthly (same tier)
 */
function canUpgrade(currentPlanKey: PlanKey, targetPlanKey: PlanKey): boolean {
  const currentRank = PLAN_HIERARCHY[currentPlanKey] ?? -1;
  const targetRank = PLAN_HIERARCHY[targetPlanKey] ?? -1;
  
  return targetRank > currentRank;
} 

// ============================================================================
// Component
// ============================================================================

export function PricingContent() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [paddleError, setPaddleError] = useState<string | null>(null);
  const router = useRouter();
  const { isSignedIn } = useAuth(); 
  const { openSignUp } = useAuthModal();

  // TanStack Query hook - auto-fetches when signed in
  const { subscription, hasActiveSubscription } = useUser();

  // Get user's current billing cycle (if they have an active subscription)
  const userBillingCycle = useMemo(() => {
    if (!hasActiveSubscription || !subscription?.billing_cycle) return null;
    return subscription.billing_cycle === "annual" ? "annual" : "monthly";
  }, [hasActiveSubscription, subscription]);

  // Only lock billing toggle if user is on annual plan (can't downgrade to monthly without support)
  // Monthly users CAN upgrade to annual
  const isBillingCycleLocked = userBillingCycle === "annual";
  
  // If user is on annual plan, lock to annual. Otherwise, allow toggle.
  const effectiveBillingCycle = isBillingCycleLocked ? "annual" : billingCycle;

  // Get current plan key
  const currentPlanKey = useMemo(() => {
    if (!hasActiveSubscription || !subscription) return "free";
    const planId = subscription.plan_tier || subscription.plan_name?.toLowerCase();
    return getPlanKey(planId, subscription.billing_cycle);
  }, [hasActiveSubscription, subscription]);

  // Load Paddle.js script - only when user is signed in
  useEffect(() => {
    // Don't load Paddle until we know the auth state
    if (!isSignedIn) {
      return;
    }

    const loadPaddle = async () => {
      if (window.Paddle) {
        setPaddleLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/paddle/checkout");
        const config = await response.json();

        if (!response.ok) {
          console.error("[Paddle] Failed to get config:", response.status);
          // Retry after a short delay if auth might not be ready
          setTimeout(loadPaddle, 1000);
          return;
        }

        // API response is wrapped: { success: true, data: { environment, clientToken } }
        const paddleConfig = config.data;
        
        if (!paddleConfig?.clientToken) {
          console.error("[Paddle] Client token not configured - please set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
          setPaddleError("Payment system not configured. Please contact support.");
          return;
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="paddle.com"]');
        if (existingScript) {
          // Script exists, just initialize
          if (window.Paddle) {
            if (paddleConfig.environment === "sandbox") {
              window.Paddle.Environment.set("sandbox");
            }
            window.Paddle.Initialize({ token: paddleConfig.clientToken });
            setPaddleLoaded(true);
          }
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
        script.async = true;

        script.onload = () => {
          if (window.Paddle) {
            if (paddleConfig.environment === "sandbox") {
              window.Paddle.Environment.set("sandbox");
            }
            window.Paddle.Initialize({ token: paddleConfig.clientToken });
            setPaddleLoaded(true);
          }
        };

        script.onerror = () => {
          console.error("[Paddle] Failed to load Paddle.js script");
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("[Paddle] Error loading config:", error);
      }
    };

    loadPaddle();
  }, [isSignedIn]);

  const handleSelectPlan = async (plan: PaddlePlan | null) => {
    // If user is not signed in, open sign-up modal
    if (!isSignedIn) {
      openSignUp();
      return;
    }

    if (!plan) return; // Free tier - no action needed for signed-in users

    // Use the effective billing cycle (locked to user's current cycle if they have a subscription)
    const cycle = effectiveBillingCycle;
    const loadingKey = `${plan.id}-${cycle}`;
    setIsLoading(loadingKey);

    try {
      const priceId = cycle === "annual" ? plan.priceIdAnnual : plan.priceIdMonthly;

      const response = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, billingCycle: cycle }),
      });

      const response_data = await response.json();

      if (!response_data.success) {
        // Display user-friendly error message
        const errorMessage = response_data.error?.message || "Failed to process request";
        console.error("Checkout/Upgrade error:", errorMessage);
        alert(errorMessage);
        setIsLoading(null);
        return;
      }

      const { action } = response_data.data;

      // ========================================================================
      // UPGRADE PATH: Subscription was updated via Paddle API
      // ========================================================================
      if (action === "upgraded") {
        const { message, redirectUrl } = response_data.data;
        
        // Show success message
        alert(message || "Your subscription has been updated successfully!");
        
        // Redirect to success page
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        return;
      }

      // ========================================================================
      // NEW SUBSCRIPTION PATH: Open Paddle.js checkout overlay
      // ========================================================================
      if (action === "checkout") {
        // Check if Paddle is loaded for new subscriptions
        if (!paddleLoaded || !window.Paddle) {
          console.error("Paddle not loaded yet");
          if (paddleError) {
            alert(paddleError);
          }
          setIsLoading(null);
          return;
        }

        const { checkoutData } = response_data.data;

        window.Paddle?.Checkout.open({
          items: checkoutData.items,
          customer: checkoutData.customer,
          customData: checkoutData.customData,
          settings: checkoutData.settings,
        });
      }
    } catch (error) {
      console.error("Error processing plan selection:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const getButtonState = (planId: string) => {
    // If user is not signed in, show "Get Started" for all plans
    if (!isSignedIn) {
      return { label: "Get Started", disabled: false, variant: "get-started" as const };
    }

    // Use the effective billing cycle (locked to user's current cycle if they have a subscription)
    const targetKey = `${planId}_${effectiveBillingCycle}` as PlanKey;

    if (currentPlanKey === targetKey) {
      return { label: "Current Plan", disabled: true, variant: "current" as const };
    }

    if (canUpgrade(currentPlanKey, targetKey)) {
      return { label: "Upgrade", disabled: false, variant: "upgrade" as const };
    }

    // Don't show downgrade option - contact support instead
    return { label: "Contact Support", disabled: true, variant: "downgrade" as const };
  };

  return (
    <div className="container mx-auto px-6 py-16 relative z-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74FF52]/10 border border-[#74FF52]/20 mb-6">
          <Star className="w-4 h-4 text-[#74FF52]" />
          <span className="text-sm text-[#74FF52] font-medium">Scale your creativity</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          Pick your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74FF52] to-[#52ff9f]">
            plan
          </span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Start with 7-day free trial. Scale your creativity with higher limits, priority access, and the newest features first.
        </p>

        {/* Current Plan Banner */}
        {hasActiveSubscription && subscription && (
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#74FF52]/10 border border-[#74FF52]/30">
            <div className="w-2 h-2 rounded-full bg-[#74FF52] animate-pulse" />
            <span className="text-[#74FF52] font-medium">
              Current Plan: {subscription.plan_name}{" "}
              {subscription.billing_cycle === "annual" ? "(Annual)" : "(Monthly)"}
            </span>
            {subscription.cancel_at_period_end && (
              <span className="text-yellow-400 text-sm">(Cancels at period end)</span>
            )}
          </div>
        )}
      </div>

      {/* Billing Toggle */}
      <div className="flex flex-col items-center gap-3 mb-12">
        <div className={cn(
          "inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10",
          isBillingCycleLocked && "opacity-60"
        )}>
          <button
            onClick={() => !isBillingCycleLocked && setBillingCycle("monthly")}
            disabled={isBillingCycleLocked}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              effectiveBillingCycle === "monthly"
                ? "bg-[#74FF52] text-black"
                : "text-white/60 hover:text-white",
              isBillingCycleLocked && "cursor-not-allowed"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => !isBillingCycleLocked && setBillingCycle("annual")}
            disabled={isBillingCycleLocked}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
              effectiveBillingCycle === "annual"
                ? "bg-[#74FF52] text-black"
                : "text-white/60 hover:text-white",
              isBillingCycleLocked && "cursor-not-allowed"
            )}
          >
            Annual
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                effectiveBillingCycle === "annual"
                  ? "bg-black/20 text-black"
                  : "bg-[#74FF52]/20 text-[#74FF52]"
              )}
            >
              Save up to 17%
            </span>
          </button>
        </div>
        {isBillingCycleLocked && (
          <p className="text-xs text-white/50 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            You&apos;re on an annual plan. Contact support to switch to monthly billing.
          </p>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Free Tier Card */}
        <FreeTierCard 
          isCurrentPlan={currentPlanKey === "free"} 
          isSignedIn={!!isSignedIn}
          onGetStarted={openSignUp}
        />

        {/* Paid Plans */}
        {paddlePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={effectiveBillingCycle}
            buttonState={getButtonState(plan.id)}
            isLoading={isLoading === `${plan.id}-${effectiveBillingCycle}`}
            paddleLoaded={paddleLoaded}
            isSignedIn={!!isSignedIn}
            onSelect={() => handleSelectPlan(plan)}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-white/40 text-sm">
          7-day free trial for new users. All plans include a 7-day money-back guarantee.
        </p>
        <p className="text-white/30 text-xs mt-2">
          Prices shown exclude applicable taxes. Cancel anytime.
        </p>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}

// ============================================================================
// Free Tier Card
// ============================================================================

function FreeTierCard({ isCurrentPlan, isSignedIn, onGetStarted }: { isCurrentPlan: boolean; isSignedIn: boolean; onGetStarted: () => void }) {
  const router = useRouter();
  const { hasActiveSubscription } = useUser();

  // Only show as current plan if user is signed in AND on free tier AND doesn't have active subscription
  const showAsCurrentPlan = isSignedIn && isCurrentPlan && !hasActiveSubscription;

  return (
    <div 
      className={cn(
        "relative rounded-2xl border transition-all duration-300 group",
        showAsCurrentPlan ? "border-white/20 ring-2 ring-white/20" : "border-white/10 hover:border-white/20"
      )} 
      style={{ background: FREE_TIER.bgGradient }}
    >
      {/* Badge */}
      {showAsCurrentPlan ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1.5">
          <Check className="w-3 h-3" />
          CURRENT PLAN
        </div>
      ) : (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          7-DAY TRIAL
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Plan Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{FREE_TIER.name}</h3>
            <p className="text-sm text-white/50">{FREE_TIER.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-bold">$0</span>
            <span className="text-white/50">/7 days</span>
          </div>
          <p className="text-sm text-white/40 mt-1">No credit card required</p>
        </div>

        {/* Credits Badge */}
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Starting credits</span>
            <span className="text-lg font-bold text-white/80">{FREE_TIER.credits}</span>
          </div>
        </div>

        {/* CTA Button */}
        {!isSignedIn ? (
          <button
            onClick={onGetStarted}
            className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : showAsCurrentPlan ? (
          <div className="w-full py-3 px-6 rounded-xl font-semibold bg-white/5 text-white/50 text-center border border-white/10">
            Current Plan
          </div>
        ) : hasActiveSubscription ? (
          <div className="w-full py-3 px-6 rounded-xl font-semibold bg-white/5 text-white/30 text-center border border-white/5 cursor-not-allowed">
            <span className="text-xs">You have an active subscription</span>
          </div>
        ) : (
          <button
            onClick={() => router.push("/explore")}
            className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10"
          >
            Start Creating
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm font-medium text-white/60 mb-4">Free trial includes:</p>
          <ul className="space-y-3">
            {FREE_TIER.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  feature.highlight ? "bg-yellow-500/20" : "bg-white/10"
                )}>
                  {feature.highlight ? (
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                  ) : (
                    <Check className="w-3 h-3 text-white/60" />
                  )}
                </div>
                <span className={cn(
                  "text-sm",
                  feature.highlight ? "text-yellow-500/80" : "text-white/50"
                )}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Limitations */}
          <p className="text-sm font-medium text-white/40 mt-4 mb-2">Not included:</p>
          <ul className="space-y-2">
            {FREE_TIER.limitations.map((limitation, index) => (
              <li key={index} className="flex items-center gap-2">
                <X className="w-3 h-3 text-white/30" />
                <span className="text-xs text-white/30">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Plan Card
// ============================================================================

interface PlanCardProps {
  plan: PaddlePlan;
  billingCycle: "monthly" | "annual";
  buttonState: { label: string; disabled: boolean; variant: "current" | "upgrade" | "downgrade" | "get-started" };
  isLoading: boolean;
  paddleLoaded: boolean;
  isSignedIn: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, billingCycle, buttonState, isLoading, paddleLoaded, isSignedIn, onSelect }: PlanCardProps) {
  const Icon = plan.icon;
  const price = billingCycle === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const totalPrice = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const monthlyCredits = plan.credits;

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 group",
        plan.popular && buttonState.variant !== "downgrade"
          ? "border-[#74FF52]/50 shadow-lg shadow-[#74FF52]/10"
          : "border-white/10",
        buttonState.variant === "current" && "ring-2 ring-[#74FF52]/50",
        buttonState.variant === "downgrade" && "opacity-50",
        buttonState.variant !== "downgrade" && "hover:scale-[1.02] hover:border-white/20"
      )}
      style={{ background: plan.bgGradient }}
    >
      {/* Badges */}
      {plan.popular && buttonState.variant !== "current" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#74FF52] text-black text-xs font-bold">
          MOST POPULAR
        </div>
      )}
      {buttonState.variant === "current" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#74FF52] text-black text-xs font-bold flex items-center gap-1.5">
          <Check className="w-3 h-3" />
          CURRENT PLAN
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Plan Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              plan.color === "blue" && "bg-blue-500/20",
              plan.color === "purple" && "bg-purple-500/20",
              plan.color === "amber" && "bg-amber-500/20"
            )}
          >
            <Icon className={cn("w-5 h-5", plan.iconColor)} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-sm text-white/50">{plan.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-bold">${price}</span>
            <span className="text-white/50">/month</span>
          </div>
          {billingCycle === "annual" && (
            <p className="text-sm text-white/40 mt-1">
              ${totalPrice} billed annually
              {plan.savings > 0 && (
                <span className="ml-2 text-[#74FF52]">Save {plan.savings}%</span>
              )}
            </p>
          )}
        </div>

        {/* Credits Badge */}
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Credits included</span>
            <span className="text-lg font-bold text-[#74FF52]">
              {monthlyCredits.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            per month {billingCycle === "annual" && "(billed annually)"}
          </p>
        </div>

        {/* CTA Button */}
        {buttonState.variant === "downgrade" ? (
          <div className="w-full py-3 px-6 rounded-xl font-semibold bg-white/5 text-white/30 text-center border border-white/5 cursor-not-allowed">
            <span className="text-xs">Contact support to change plan</span>
          </div>
        ) : (
          <button
            onClick={onSelect}
            disabled={
              isLoading || 
              buttonState.disabled || 
              // Only require Paddle for new subscriptions (get-started), not upgrades
              (isSignedIn && buttonState.variant === "get-started" && !paddleLoaded)
            }
            className={cn(
              "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed",
              buttonState.variant === "current" && "bg-white/5 text-white/50 border border-white/10",
              buttonState.variant === "get-started" && (
                plan.popular
                  ? "bg-[#74FF52] text-black hover:bg-[#66e648]"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              ),
              buttonState.variant === "upgrade" && (
                plan.popular
                  ? "bg-[#74FF52] text-black hover:bg-[#66e648]"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              )
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {buttonState.label}
                {(buttonState.variant === "upgrade" || buttonState.variant === "get-started") && (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                )}
              </>
            )}
          </button>
        )}

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm font-medium text-white/60 mb-4">What&apos;s included:</p>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#74FF52]" />
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FAQ Section
// ============================================================================

function FAQSection() {
  const faqs = [
    {
      q: "What are credits?",
      a: "Credits are used to generate images and videos. Different operations cost different amounts of credits based on the model and quality settings used.",
    },
    {
      q: "How does the 7-day free trial work?",
      a: "New users get a 7-day free trial with 100 credits to explore Hexwave. During the trial, files are retained for 1 day and exports have a watermark. Upgrade anytime to remove limitations.",
    },
    {
      q: "Can I upgrade my plan?",
      a: "Yes! You can upgrade your plan at any time. When upgrading, you'll be charged the prorated difference and get instant access to your new plan's features and credits.",
    },
    {
      q: "How do credits work for annual plans?",
      a: "Annual plans receive credits on a monthly basis, same as monthly plans. You get your monthly credit allocation at the start of each month. Credits purchased as add-ons never expire as long as your account is active.",
    },
    {
      q: "What happens to my media during the free trial?",
      a: "During the 7-day free trial, generated media is retained for 1 day. After upgrading to a paid plan, your media retention extends based on your plan (up to unlimited on Creator).",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay through our secure payment processor Paddle.",
    },
  ];

  return (
    <div className="mt-24 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">{faq.q}</h3>
            <p className="text-white/60 text-sm">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

