"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Calendar,
  Clock,
  Download,
  ExternalLink,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBilling, useBillingAction, useOpenPortal } from "@/hooks";
import { useUserStore, selectCredits } from "@/store";
import type { BillingTransaction, BillingSubscription } from "@/lib/api";

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
// Main Component
// ============================================================================

export function BillingContent() {
  const [error, setError] = useState<string | null>(null);
  const credits = useUserStore(selectCredits);

  // Queries & Mutations
  const { data: billingData, isLoading } = useBilling();
  const billingAction = useBillingAction();
  const openPortal = useOpenPortal();

  const handleAction = async (action: "cancel" | "pause" | "resume" | "reactivate") => {
    setError(null);
    try {
      await billingAction.mutateAsync(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleUpdatePayment = () => {
    openPortal.mutate();
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-white/60">Manage your subscription, payment methods, and view invoices</p>
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
                  </div>
                  <p className="text-white/60 text-sm">
                    {sub.billing_cycle === "yearly" ? "Annual" : "Monthly"} billing
                    {sub.cancel_at_period_end && (
                      <span className="text-yellow-400 ml-2">• Cancels at period end</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {sub.status === "active" && !sub.cancel_at_period_end && (
                    <button
                      onClick={() => handleAction("cancel")}
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

                  {sub.cancel_at_period_end && (
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

                  <Link
                    href="/pricing"
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                  >
                    Change Plan
                  </Link>
                </div>
              </div>
            </div>

            {/* Plan Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              <StatCard
                icon={<Coins className="w-4 h-4" />}
                label="Credits"
                value={credits.toLocaleString()}
                subValue={`${sub.credits_per_period.toLocaleString()}/month`}
                valueColor="text-[#74FF52]"
              />
              <StatCard
                icon={<Calendar className="w-4 h-4" />}
                label="Current Period"
                value={formatDate(sub.current_period_ends)}
                subValue="ends"
              />
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="Next Payment"
                value={sub.next_payment_date ? formatDate(sub.next_payment_date) : "N/A"}
                subValue={sub.next_payment_amount}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </div>
                <button
                  onClick={handleUpdatePayment}
                  disabled={openPortal.isPending}
                  className="text-sm font-medium text-[#74FF52] hover:underline flex items-center gap-1"
                >
                  {openPortal.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Update"}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/pricing"
              className="p-5 bg-[#151515] border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
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
            </Link>

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
    </div>
  );
}
