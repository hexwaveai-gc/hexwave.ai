"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  Clock,
  CreditCard,
  Zap,
} from "lucide-react";
import Sidebar from "@/app/components/common/sidebar";

// ============================================================================
// TYPES
// ============================================================================

type PurchaseType = "plan" | "upgrade" | "billing_change" | "credits" | "unknown";

interface PurchaseInfo {
  type: PurchaseType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Determine the purchase type based on URL parameters
 * Note: Paddle passes limited info to success URL, so we show a generic message
 */
function getPurchaseInfo(searchParams: URLSearchParams): PurchaseInfo {
  // Check for any custom parameters that might indicate purchase type
  const purchaseType = searchParams.get("type");
  
  switch (purchaseType) {
    case "upgrade":
      return {
        type: "upgrade",
        title: "Plan Upgraded Successfully!",
        description: "Your plan has been upgraded. You now have access to enhanced features and additional credits.",
        icon: <Zap className="w-10 h-10 text-[#74FF52]" />,
      };
    case "billing_change":
      return {
        type: "billing_change",
        title: "Billing Updated Successfully!",
        description: "Your billing cycle has been updated to annual. Enjoy your savings and uninterrupted access!",
        icon: <CreditCard className="w-10 h-10 text-[#74FF52]" />,
      };
    case "credits":
      return {
        type: "credits",
        title: "Credits Purchased Successfully!",
        description: "Your credit purchase is being processed. Credits will be added to your account shortly.",
        icon: <Sparkles className="w-10 h-10 text-[#74FF52]" />,
      };
    default:
      // Default message for new plan purchases or unknown type
      return {
        type: "plan",
        title: "Thank You for Your Purchase!",
        description: "Your subscription has been activated. Welcome to Hexwave!",
        icon: <CheckCircle2 className="w-10 h-10 text-[#74FF52]" />,
      };
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function PricingSuccessContent() {
  const searchParams = useSearchParams();
  const purchaseInfo = getPurchaseInfo(searchParams);
  
  const transactionId = searchParams.get("transaction_id");
  const checkoutId = searchParams.get("checkout_id");

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-[#74FF52]/20 flex items-center justify-center mx-auto mb-6">
        {purchaseInfo.icon}
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold mb-4">{purchaseInfo.title}</h1>
      <p className="text-white/60 mb-6 max-w-md mx-auto">
        {purchaseInfo.description}
      </p>

      {/* Processing Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-8 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-amber-200 font-medium text-sm mb-1">
              Processing Your Order
            </p>
            <p className="text-amber-200/70 text-xs leading-relaxed">
              Your credits and subscription updates may take a few moments to reflect in your account. 
              This usually completes within 1-2 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-8 text-left max-w-md mx-auto">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#74FF52]" />
          What&apos;s Next?
        </h2>
        <ul className="space-y-3 text-sm text-white/70">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 text-[#74FF52] text-xs font-bold">
              1
            </span>
            <span>Your credits will be added to your account automatically</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 text-[#74FF52] text-xs font-bold">
              2
            </span>
            <span>Start creating amazing AI-generated images, videos, and more</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 text-[#74FF52] text-xs font-bold">
              3
            </span>
            <span>Access all premium features included with your plan</span>
          </li>
        </ul>
      </div>

      {/* Transaction Reference */}
      {(transactionId || checkoutId) && (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-8 text-left max-w-md mx-auto">
          <p className="text-xs text-white/40 mb-1">Transaction Reference</p>
          <p className="text-sm text-white/60 font-mono break-all">
            {transactionId || checkoutId}
          </p>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/image-generator"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#74FF52] text-black font-semibold hover:bg-[#66e648] transition-colors"
        >
          Start Creating
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/billing"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
        >
          View Billing
        </Link>
      </div>

      {/* Help Text */}
      <p className="text-white/40 text-xs mt-8">
        Need help?{" "}
        <Link href="/support" className="text-[#74FF52] hover:underline">
          Contact support
        </Link>{" "}
        or check your{" "}
        <Link href="/billing" className="text-[#74FF52] hover:underline">
          billing details
        </Link>
      </p>
    </div>
  );
}

/**
 * Loading fallback for Suspense boundary
 */
function LoadingFallback() {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-[#74FF52]/20 flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-10 h-10 text-[#74FF52] animate-spin" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Processing...</h1>
      <p className="text-white/60">Please wait while we confirm your purchase.</p>
    </div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20 flex items-center justify-center py-12">
        <div className="max-w-lg w-full mx-auto px-6">
          <Suspense fallback={<LoadingFallback />}>
            <PricingSuccessContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
