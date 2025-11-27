"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import {
  Check,
  ArrowRight,
  AlertCircle,
  Gift,
  Loader2,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { paddlePlans, creditPackages, type PaddlePlan, type CreditPackage } from "@/constants/plan";
import { useUser } from "@/hooks";
import CreditCard from "./CreditCard";

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
          items: Array<{ priceId: string; quantity: number }>;
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
  description: "7 days to explore",
  icon: Gift,
  credits: 100,
  features: [
    { text: "100 credits to start", included: true },
    { text: "1-day media retention", included: true, highlight: true },
    { text: "Watermarked exports", included: true, highlight: true },
    { text: "Basic models only", included: true },
  ],
};

// ============================================================================
// Plan Hierarchy
// ============================================================================

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

function getPlanKey(planId: string | null, billingCycle: string | null): PlanKey {
  if (!planId) return "free";
  return `${planId.toLowerCase()}_${billingCycle === "yearly" || billingCycle === "annual" ? "annual" : "monthly"}` as PlanKey;
}

function canUpgrade(currentPlanKey: PlanKey, targetPlanKey: PlanKey): boolean {
  return PLAN_HIERARCHY[targetPlanKey] > PLAN_HIERARCHY[currentPlanKey];
}

// ============================================================================
// Component
// ============================================================================

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradePlanModal({
  open,
  onOpenChange,
}: UpgradePlanModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { subscription, hasActiveSubscription, credits } = useUser();

  // Default to credits tab if user has active subscription
  const defaultTab = hasActiveSubscription ? "credits" : "plans";

  // Get current plan key
  const currentPlanKey = useMemo(() => {
    if (!hasActiveSubscription || !subscription) return "free";
    const planId = subscription.plan_tier || subscription.plan_name?.toLowerCase();
    return getPlanKey(planId || null, subscription.billing_cycle || null);
  }, [hasActiveSubscription, subscription]);

  // Load Paddle.js script
  useEffect(() => {
    if (!open) return;

    const loadPaddle = async () => {
      if (window.Paddle) {
        setPaddleLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/paddle/checkout");
        const config = await response.json();

        if (!config.clientToken) {
          console.error("Paddle client token not configured");
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
        script.async = true;

        script.onload = () => {
          if (window.Paddle) {
            if (config.environment === "sandbox") {
              window.Paddle.Environment.set("sandbox");
            }
            window.Paddle.Initialize({ token: config.clientToken });
            setPaddleLoaded(true);
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("[Paddle] Error loading config:", error);
      }
    };

    loadPaddle();
  }, [open]);

  const handleSelectPlan = async (plan: PaddlePlan | null, cycle: "monthly" | "annual") => {
    if (!plan) return;

    if (!isSignedIn) {
      onOpenChange(false);
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    if (!paddleLoaded || !window.Paddle) {
      console.error("Paddle not loaded yet");
      return;
    }

    const loadingKey = `${plan.id}-${cycle}`;
    setIsLoading(loadingKey);

    try {
      const priceId = cycle === "annual" ? plan.priceIdAnnual : plan.priceIdMonthly;

      const response = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, billingCycle: cycle }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to get checkout data:", data.error);
        setIsLoading(null);
        return;
      }

      window.Paddle.Checkout.open({
        items: data.checkoutData.items,
        customer: data.checkoutData.customer,
        customData: data.checkoutData.customData,
        settings: data.checkoutData.settings,
      });
    } catch (error) {
      console.error("Error initiating checkout:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handlePurchaseCredits = async (pkg: CreditPackage) => {
    if (!isSignedIn) {
      onOpenChange(false);
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    if (!paddleLoaded || !window.Paddle) {
      console.error("Paddle not loaded yet");
      return;
    }

    setIsLoading(`credits-${pkg.id}`);

    try {
      const response = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: pkg.priceId,
          quantity: pkg.price / 5, // Adjust based on base credit price
          credits: pkg.credits,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to get checkout data:", data.error);
        setIsLoading(null);
        return;
      }

      window.Paddle.Checkout.open({
        items: data.checkoutData.items,
        customer: data.checkoutData.customer,
        customData: data.checkoutData.customData,
        settings: data.checkoutData.settings,
      });
    } catch (error) {
      console.error("Error initiating checkout:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const getButtonState = (planId: string, cycle: "monthly" | "annual") => {
    const targetKey = `${planId}_${cycle}` as PlanKey;

    if (currentPlanKey === targetKey) {
      return { label: "Current Plan", disabled: true, variant: "current" as const };
    }

    if (canUpgrade(currentPlanKey, targetKey)) {
      return { label: "Upgrade", disabled: false, variant: "upgrade" as const };
    }

    return { label: "Contact Support", disabled: true, variant: "downgrade" as const };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 flex flex-col overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:top-4 [&>button]:right-4">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade Plan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <Tabs defaultValue={defaultTab} className="w-full flex flex-col flex-1 min-h-0">
            {/* Header with Tabs */}
            <div className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/10 px-6 pt-4 pb-0">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {hasActiveSubscription ? "Add Credits" : "Choose Your Plan"}
                  </h2>
                  {hasActiveSubscription && (
                    <p className="text-sm text-white/50">
                      Current balance: <span className="text-[#74FF52] font-semibold">{credits.toLocaleString()}</span> credits
                    </p>
                  )}
                </div>
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                  <TabsTrigger
                    value="plans"
                    className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                  >
                    Plans
                  </TabsTrigger>
                  <TabsTrigger
                    value="credits"
                    className="px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                  >
                    Credits
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Current Plan Banner */}
              {hasActiveSubscription && subscription && (
                <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#74FF52]/10 border border-[#74FF52]/30">
                  <div className="w-2 h-2 rounded-full bg-[#74FF52] animate-pulse" />
                  <span className="text-sm text-[#74FF52] font-medium">
                    {subscription.plan_name}{" "}
                    {subscription.billing_cycle === "annual" ? "(Annual)" : "(Monthly)"}
                  </span>
                </div>
              )}
            </div>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-0 px-6 py-6 flex-1 overflow-y-auto min-h-0">
              {/* Billing Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={cn(
                      "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      billingCycle === "monthly"
                        ? "bg-[#74FF52] text-black"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={cn(
                      "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      billingCycle === "annual"
                        ? "bg-[#74FF52] text-black"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    Annual
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        billingCycle === "annual"
                          ? "bg-black/20 text-black"
                          : "bg-[#74FF52]/20 text-[#74FF52]"
                      )}
                    >
                      SAVE 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Free Tier */}
                <FreeTierCard isCurrentPlan={currentPlanKey === "free"} isSignedIn={!!isSignedIn} />

                {/* Paid Plans */}
                {paddlePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billingCycle={billingCycle}
                    buttonState={getButtonState(plan.id, billingCycle)}
                    isLoading={isLoading === `${plan.id}-${billingCycle}`}
                    paddleLoaded={paddleLoaded}
                    onSelect={() => handleSelectPlan(plan, billingCycle)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits" className="mt-0 px-6 py-6 flex-1 overflow-y-auto min-h-0">
              {/* Info Banner */}
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/70">
                  <span className="text-white font-medium">Note:</span> Credits never expire as long as your subscription is active. They cannot be refunded or transferred.
                </p>
              </div>

              {/* Credit Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg) => (
                  <CreditCard
                    key={pkg.id}
                    pkg={pkg}
                    onPurchase={handlePurchaseCredits}
                    isLoading={isLoading === `credits-${pkg.id}`}
                    paddleLoaded={paddleLoaded}
                  />
                ))}
              </div>

              {/* Current Credits */}
              {hasActiveSubscription && (
                <div className="mt-6 p-4 rounded-xl bg-[#74FF52]/10 border border-[#74FF52]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-[#74FF52]" />
                      <div>
                        <p className="text-sm text-white/60">Your current balance</p>
                        <p className="text-2xl font-bold text-[#74FF52]">
                          {credits.toLocaleString()} credits
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Free Tier Card (Compact)
// ============================================================================

function FreeTierCard({ isCurrentPlan, isSignedIn }: { isCurrentPlan: boolean; isSignedIn: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 p-5",
        isCurrentPlan && "ring-2 ring-[#74FF52]/50",
        "border-white/10 hover:border-white/20"
      )}
      style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)" }}
    >
      {isCurrentPlan && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#74FF52] text-black text-[10px] font-bold flex items-center gap-1">
          <Check className="w-2.5 h-2.5" />
          CURRENT
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Gift className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h3 className="text-base font-bold">{FREE_TIER.name}</h3>
          <p className="text-xs text-white/50">{FREE_TIER.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">$0</span>
          <span className="text-xs text-white/50">/7 days</span>
        </div>
      </div>

      <div className="mb-4 p-2 rounded-lg bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Credits</span>
          <span className="text-sm font-bold text-white/80">{FREE_TIER.credits}</span>
        </div>
      </div>

      <ul className="space-y-1.5 mb-4">
        {FREE_TIER.features.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                feature.highlight ? "bg-yellow-500/20" : "bg-white/10"
              )}
            >
              {feature.highlight ? (
                <AlertCircle className="w-2.5 h-2.5 text-yellow-500" />
              ) : (
                <Check className="w-2.5 h-2.5 text-white/60" />
              )}
            </div>
            <span className={cn("text-xs", feature.highlight ? "text-yellow-500/80" : "text-white/50")}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div className="w-full py-2 px-4 rounded-lg font-medium bg-white/5 text-white/50 text-center border border-white/10 text-sm">
          Current Plan
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full py-2 text-sm bg-white/5 border-white/10 hover:bg-white/10"
        >
          {isSignedIn ? "Start Creating" : "Start Free Trial"}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Plan Card (Compact)
// ============================================================================

interface PlanCardProps {
  plan: PaddlePlan;
  billingCycle: "monthly" | "annual";
  buttonState: { label: string; disabled: boolean; variant: "current" | "upgrade" | "downgrade" };
  isLoading: boolean;
  paddleLoaded: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, billingCycle, buttonState, isLoading, paddleLoaded, onSelect }: PlanCardProps) {
  const Icon = plan.icon;
  const price = billingCycle === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const credits = plan.credits;

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 p-5",
        plan.popular && buttonState.variant !== "downgrade"
          ? "border-[#74FF52]/50 shadow-lg shadow-[#74FF52]/10"
          : "border-white/10",
        buttonState.variant === "current" && "ring-2 ring-[#74FF52]/50",
        buttonState.variant === "downgrade" && "opacity-50",
        buttonState.variant !== "downgrade" && "hover:border-white/20"
      )}
      style={{ background: plan.bgGradient }}
    >
      {/* Badges */}
      {plan.popular && buttonState.variant !== "current" && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#74FF52] text-black text-[10px] font-bold">
          POPULAR
        </div>
      )}
      {buttonState.variant === "current" && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#74FF52] text-black text-[10px] font-bold flex items-center gap-1">
          <Check className="w-2.5 h-2.5" />
          CURRENT
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            plan.color === "blue" && "bg-blue-500/20",
            plan.color === "purple" && "bg-purple-500/20",
            plan.color === "amber" && "bg-amber-500/20"
          )}
        >
          <Icon className={cn("w-4 h-4", plan.iconColor)} />
        </div>
        <div>
          <h3 className="text-base font-bold">{plan.name}</h3>
          <p className="text-xs text-white/50 line-clamp-1">{plan.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">${price}</span>
          <span className="text-xs text-white/50">/mo</span>
        </div>
        {billingCycle === "annual" && plan.savings > 0 && (
          <p className="text-[10px] text-[#74FF52]">Save {plan.savings}% annually</p>
        )}
      </div>

      <div className="mb-4 p-2 rounded-lg bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Credits/mo</span>
          <span className="text-sm font-bold text-[#74FF52]">{credits.toLocaleString()}</span>
        </div>
      </div>

      <ul className="space-y-1.5 mb-4">
        {plan.features.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-[#74FF52]" />
            </div>
            <span className="text-xs text-white/60 line-clamp-1">{feature}</span>
          </li>
        ))}
      </ul>

      {buttonState.variant === "downgrade" ? (
        <div className="w-full py-2 px-4 rounded-lg font-medium bg-white/5 text-white/30 text-center border border-white/5 cursor-not-allowed text-sm">
          Contact Support
        </div>
      ) : (
        <Button
          onClick={onSelect}
          disabled={isLoading || !paddleLoaded || buttonState.disabled}
          className={cn(
            "w-full py-2 text-sm font-semibold transition-all duration-200",
            buttonState.variant === "current" && "bg-white/5 text-white/50 border border-white/10",
            buttonState.variant === "upgrade" && (
              plan.popular
                ? "bg-[#74FF52] text-black hover:bg-[#66e648]"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
            )
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {buttonState.label}
              {buttonState.variant === "upgrade" && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
