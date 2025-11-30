"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Loader2,
  Receipt,
  Zap,
  ArrowRight,
  RefreshCw,
  Coins,
  Heart,
  Gift,
  Sparkles,
  Clock,
  DollarSign,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBilling, useBillingAction, useOpenPortal } from "@/hooks";
import { useUserStore, selectCredits } from "@/store";
import type { BillingTransaction } from "@/lib/api";

// ============================================================================
// Paddle Types (extends the global type from UpgradePlanModal)
// ============================================================================

// Note: Paddle global type is already declared in UpgradePlanModal.tsx
// We just need to use it here - the extended Checkout.open with transactionId
// is supported by Paddle.js but not in the base type declaration
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import UpgradePlanModal from "@/app/components/common/planModal/UpgradePlanModal";

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "text-green-400 bg-green-400/10";
    case "past_due":
      return "text-yellow-400 bg-yellow-400/10";
    case "paused":
      return "text-blue-400 bg-blue-400/10";
    case "canceled":
      return "text-red-400 bg-red-400/10";
    default:
      return "text-white/60 bg-white/10";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return <CheckCircle className="w-4 h-4" />;
    case "past_due":
      return <AlertCircle className="w-4 h-4" />;
    case "paused":
      return <Pause className="w-4 h-4" />;
    case "canceled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysRemaining(endDateStr: string): number {
  if (!endDateStr) return 0;
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if user has the highest plan tier (Creator Annual)
 */
function isHighestPlan(planTier: string | undefined, billingCycle: string | undefined): boolean {
  const tier = planTier?.toLowerCase();
  const cycle = billingCycle?.toLowerCase();
  return tier === "creator" && cycle === "annual";
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subValue?: string;
  valueColor?: string;
}

function StatCard({ icon, label, value, subValue, valueColor = "text-white" }: StatCardProps) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
        {icon}
        {label}
      </div>
      <div className={cn("text-xl font-semibold", valueColor)}>{value}</div>
      {subValue && <p className="text-xs text-white/40 mt-0.5">{subValue}</p>}
    </div>
  );
}

function TransactionRow({ transaction: tx }: { transaction: BillingTransaction }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          tx.status === "completed" ? "bg-green-400/10" : "bg-white/10"
        )}>
          {tx.status === "completed" ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Clock className="w-5 h-5 text-white/50" />
          )}
        </div>
        <div>
          <p className="font-medium">{tx.description}</p>
          <p className="text-sm text-white/50">{formatDate(tx.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold">{tx.amount}</span>
        {tx.invoice_url && (
          <a
            href={tx.invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Download Invoice"
          >
            <Download className="w-4 h-4 text-white/50" />
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Cancel Confirmation Dialog
// ============================================================================

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  planName: string;
  creditsPerPeriod: number;
  currentPeriodEnds: string;
  billingCycle: string;
  startedAt?: string;
}

/**
 * Calculate the actual subscription end date
 * For annual plans: 1 year from started_at
 * For monthly plans: current_period_ends
 */
function getSubscriptionEndDate(
  currentPeriodEnds: string,
  billingCycle: string,
  startedAt?: string
): string {
  // For monthly plans, period ends is the cancellation date
  if (billingCycle === "monthly") {
    return currentPeriodEnds;
  }
  
  // For annual plans, calculate 1 year from start date
  if ((billingCycle === "annual" || billingCycle === "yearly") && startedAt) {
    const startDate = new Date(startedAt);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate.toISOString();
  }
  
  // Fallback to current_period_ends
  return currentPeriodEnds;
}

/**
 * Calculate remaining monthly credit assignments for annual plans
 * 
 * Annual plan = 12 total credit assignments (one per month)
 * - First credit: On subscription start date
 * - Last credit: 11 months after start (month before subscription ends)
 * 
 * Example: Started Dec 1, 2025
 * - Dec 2025: First credit (already received)
 * - Jan - Nov 2026: Remaining 11 credits
 * - Dec 1, 2026: Subscription ends (no credit)
 */
function getRemainingCreditAssignments(
  billingCycle: string,
  startedAt?: string
): number {
  if (billingCycle !== "annual" && billingCycle !== "yearly") return 0;
  if (!startedAt) return 0;
  
  const startDate = new Date(startedAt);
  const now = new Date();
  
  // Calculate how many months have elapsed since subscription started
  // (including the start month itself where user already got credits)
  const yearsDiff = now.getFullYear() - startDate.getFullYear();
  const monthsDiff = now.getMonth() - startDate.getMonth();
  let monthsElapsed = yearsDiff * 12 + monthsDiff;
  
  // If we haven't reached the credit day this month yet, don't count this month as elapsed
  // (This handles the case where user subscribed on 15th and today is 10th of a later month)
  const startDay = startDate.getDate();
  const currentDay = now.getDate();
  if (currentDay < startDay) {
    monthsElapsed -= 1;
  }
  
  // Add 1 because the start month counts as the first assignment
  const assignmentsReceived = monthsElapsed + 1;
  
  // Total assignments for annual plan is 12
  const totalAssignments = 12;
  
  // Remaining = 12 - assignments already received
  const remaining = totalAssignments - assignmentsReceived;
  
  return Math.max(0, remaining);
}

function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  planName,
  creditsPerPeriod,
  currentPeriodEnds,
  billingCycle,
  startedAt,
}: CancelConfirmDialogProps) {
  const isAnnual = billingCycle === "annual" || billingCycle === "yearly";
  
  // Get the actual subscription end date (not next credit date)
  const subscriptionEndDate = getSubscriptionEndDate(currentPeriodEnds, billingCycle, startedAt);
  
  // Calculate remaining monthly credit assignments based on start date
  const remainingAssignments = getRemainingCreditAssignments(billingCycle, startedAt);
  const remainingCredits = remainingAssignments * creditsPerPeriod;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#151515] border-white/10 text-white max-w-lg">
        <AlertDialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <AlertDialogTitle className="text-xl text-center">
            We&apos;d hate to see you go! 💔
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/60 text-center space-y-4">
            <p className="text-base">
              Are you sure you want to cancel your <span className="text-white font-semibold">{planName}</span> plan?
            </p>
            
            <div className="bg-white/5 rounded-xl p-4 space-y-3 text-left">
              {/* Subscription cancellation date - BILLING PERIOD END */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>
                  Your subscription will end on{" "}
                  <span className="text-red-400 font-semibold">{formatDate(subscriptionEndDate)}</span>
                  {isAnnual && (
                    <span className="text-white/40 text-sm ml-1">(end of annual billing period)</span>
                  )}
                </span>
              </div>

              {/* What you'll lose */}
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-[#74FF52] mt-0.5 flex-shrink-0" />
                <span>
                  After that date, you&apos;ll lose access to{" "}
                  <span className="text-[#74FF52] font-semibold">{creditsPerPeriod.toLocaleString()}</span> credits per month
                </span>
              </div>
              
              {/* Premium features */}
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Premium features will be removed after your subscription ends</span>
              </div>

              {/* Annual plan specific: Continue getting monthly credits */}
              {isAnnual && remainingAssignments > 0 && (
                <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                  <Coins className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="text-blue-400 font-semibold">Good news:</span> You&apos;ll continue receiving{" "}
                    <span className="text-blue-400 font-semibold">{remainingAssignments}</span> more monthly credit assignments 
                    (<span className="text-blue-400 font-semibold">{remainingCredits.toLocaleString()}</span> total credits) until your subscription ends
                  </span>
                </div>
              )}

              {/* No refund notice */}
              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/50 text-sm">
                  No refunds will be issued. You&apos;ll retain full access until{" "}
                  <span className="text-white/70">{formatDate(subscriptionEndDate)}</span>.
                </span>
              </div>
            </div>

            <p className="text-sm text-white/50">
              Need help? Our support team is here for you. Maybe we can work something out!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row gap-3 mt-4">
          <AlertDialogCancel 
            className="flex-1 bg-[#74FF52] text-black font-semibold border-0 hover:bg-[#66e648]"
            disabled={isLoading}
          >
            Keep My Plan 🎉
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="flex-1 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Cancel Anyway"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function BillingContent() {
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const credits = useUserStore(selectCredits);

  // Queries & Mutations
  const { data: billingData, isLoading } = useBilling();
  const billingAction = useBillingAction();
  const openPortal = useOpenPortal();

  // Load Paddle.js on mount
  useEffect(() => {
    const loadPaddle = async () => {
      if (window.Paddle) {
        setPaddleLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/paddle/checkout");
        const result = await response.json();
        
        // API response is wrapped: { success, data: { clientToken, environment } }
        const config = result.data || result;

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
  }, []);

  const handleAction = async (action: "cancel" | "pause" | "resume" | "reactivate") => {
    setError(null);
    try {
      await billingAction.mutateAsync(action);
      if (action === "cancel") {
        setShowCancelDialog(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleManageBilling = async () => {
    if (!paddleLoaded || !window.Paddle) {
      setError("Payment system is still loading. Please try again.");
      return;
    }

    setError(null);
    
    try {
      const result = await openPortal.mutateAsync();
      
      if (result.transactionId) {
        // Open Paddle.js overlay with the transaction ID
        window.Paddle.Checkout.open({
          transactionId: result.transactionId,
          settings: {
            displayMode: "overlay",
            theme: "dark",
          },
        });
      } else {
        setError("Could not open billing portal. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#74FF52]" />
      </div>
    );
  }

  const sub = billingData?.subscription;
  const actionLoading = billingAction.isPending ? billingAction.variables : null;

  // Check if user has the highest plan tier
  const hasHighestPlan = sub ? isHighestPlan(sub.plan_tier, sub.billing_cycle) : false;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-white/60">Manage your subscription and view invoices</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* No Subscription */}
      {!sub && (
        <div className="bg-[#151515] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#74FF52]/10 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-[#74FF52]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Subscribe to a plan to unlock more credits and premium features.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#74FF52] text-black font-semibold rounded-xl hover:bg-[#66e648] transition-colors"
          >
            <Zap className="w-4 h-4" />
            View Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Subscription Details */}
      {sub && (
        <div className="space-y-6">
          {/* Scheduled Cancellation Banner */}
          {sub.cancel_at_period_end && sub.status !== "canceled" && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-300">Subscription Scheduled for Cancellation</p>
                <p className="text-sm text-white/60">
                  Your {sub.plan_name} plan will be canceled on{" "}
                  <span className="text-yellow-400 font-medium">
                    {formatDate(sub.current_period_ends)}
                  </span>
                  {" "}({getDaysRemaining(sub.current_period_ends)} days remaining).
                  {(sub.billing_cycle === "annual" || sub.billing_cycle === "yearly") && (
                    <span className="block mt-1 text-blue-400">
                      You&apos;ll continue receiving monthly credits until then.
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleAction("reactivate")}
                disabled={actionLoading === "reactivate"}
                className="px-4 py-2 bg-yellow-500 text-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {actionLoading === "reactivate" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Keep Subscription
                  </>
                )}
              </button>
            </div>
          )}

          {/* Trial Banner */}
          {sub.is_trialing && sub.trial_ends_at && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-300">You&apos;re on a free trial!</p>
                <p className="text-sm text-white/60">
                  Trial ends on {formatDate(sub.trial_ends_at)} ({getDaysRemaining(sub.trial_ends_at)} days remaining)
                </p>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-400 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {/* Current Plan Card */}
          <div className="bg-[#151515] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{sub.plan_name} Plan</h2>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                      getStatusColor(sub.status)
                    )}>
                      {getStatusIcon(sub.status)}
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                    {sub.billing_cycle && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60">
                        {sub.billing_cycle === "annual" ? "Annual" : "Monthly"}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">
                    {sub.unit_price && (
                      <span className="text-white font-medium">{sub.unit_price}</span>
                    )}
                    {sub.unit_price && " / "}
                    {sub.billing_cycle === "annual" ? "year" : "month"}
                    {sub.cancel_at_period_end && (
                      <span className="text-yellow-400 ml-2">• Cancels at period end</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Cancel Plan Button - Only show if active and not scheduled to cancel */}
                  {sub.status === "active" && !sub.cancel_at_period_end && (
                    <button
                      onClick={handleCancelClick}
                      disabled={actionLoading === "cancel"}
                      className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "cancel" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Cancel Plan"
                      )}
                    </button>
                  )}

                  {/* Reactivate Button - Show if scheduled to cancel */}
                  {sub.cancel_at_period_end && sub.status !== "canceled" && (
                    <button
                      onClick={() => handleAction("reactivate")}
                      disabled={actionLoading === "reactivate"}
                      className="px-4 py-2 text-sm bg-[#74FF52] text-black font-medium rounded-lg hover:bg-[#66e648] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === "reactivate" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Reactivate
                        </>
                      )}
                    </button>
                  )}

                  {/* Resume Button - Show if paused */}
                  {sub.status === "paused" && (
                    <button
                      onClick={() => handleAction("resume")}
                      disabled={actionLoading === "resume"}
                      className="px-4 py-2 text-sm bg-[#74FF52] text-black font-medium rounded-lg hover:bg-[#66e648] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === "resume" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Resume
                        </>
                      )}
                    </button>
                  )}

                  {/* Update Payment Method Button - Opens Paddle Overlay */}
                  <button
                    onClick={handleManageBilling}
                    disabled={openPortal.isPending || !paddleLoaded}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {openPortal.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Update Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Details Grid - 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              <StatCard
                icon={<Coins className="w-4 h-4" />}
                label="Credits Balance"
                value={credits.toLocaleString()}
                subValue={`${sub.credits_per_period.toLocaleString()} credits/month`}
                valueColor="text-[#74FF52]"
              />
              <StatCard
                icon={<CalendarClock className="w-4 h-4" />}
                label="Member Since"
                value={formatShortDate(sub.started_at || sub.current_period_start)}
                subValue={sub.billing_cycle === "annual" ? "Annual subscription" : "Monthly subscription"}
              />
              <StatCard
                icon={<DollarSign className="w-4 h-4" />}
                label="Next Billing"
                value={
                  sub.cancel_at_period_end 
                    ? "—" 
                    : (sub.next_billing_amount || sub.unit_price || "—")
                }
                subValue={
                  sub.cancel_at_period_end 
                    ? "Subscription ends" 
                    : `on ${formatShortDate(sub.next_billing_date || sub.current_period_ends)}`
                }
                valueColor={sub.cancel_at_period_end ? "text-white/50" : "text-white"}
              />
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                label="Next Credits"
                value={
                  sub.cancel_at_period_end 
                    ? "—" 
                    : `+${sub.credits_per_period.toLocaleString()}`
                }
                subValue={
                  sub.cancel_at_period_end 
                    ? "No credits after cancellation" 
                    : formatShortDate(sub.next_credit_date || sub.current_period_ends)
                }
                valueColor={sub.cancel_at_period_end ? "text-white/50" : "text-[#74FF52]"}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "grid gap-4",
            hasHighestPlan ? "grid-cols-1 md:grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}>
            {/* Buy More Credits - Always show */}
            <button
              onClick={() => setShowCreditsModal(true)}
              className="p-5 bg-[#151515] border border-white/10 rounded-xl hover:border-white/20 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#74FF52]/10 flex items-center justify-center group-hover:bg-[#74FF52]/20 transition-colors">
                  <Zap className="w-6 h-6 text-[#74FF52]" />
                </div>
                <div>
                  <h3 className="font-medium">Buy More Credits</h3>
                  <p className="text-sm text-white/50">Add credits without changing your plan</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 ml-auto group-hover:text-white/60 transition-colors" />
              </div>
            </button>

            {/* Upgrade Plan - Only show if NOT on highest plan */}
            {!hasHighestPlan && (
              <Link
                href="/pricing"
                className="p-5 bg-[#151515] border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upgrade Plan</h3>
                    <p className="text-sm text-white/50">Get more credits per month</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/30 ml-auto group-hover:text-white/60 transition-colors" />
                </div>
              </Link>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-[#151515] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-white/50" />
                <h2 className="text-lg font-semibold">Payment History</h2>
              </div>
            </div>

            {billingData?.transactions && billingData.transactions.length > 0 ? (
              <div className="divide-y divide-white/10">
                {billingData.transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/50">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {sub && (
        <CancelConfirmDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={() => handleAction("cancel")}
          isLoading={actionLoading === "cancel"}
          planName={sub.plan_name}
          creditsPerPeriod={sub.credits_per_period}
          currentPeriodEnds={sub.current_period_ends}
          billingCycle={sub.billing_cycle}
          startedAt={sub.started_at}
        />
      )}

      {/* Add Credits Modal */}
      <UpgradePlanModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
      />
    </div>
  );
}
