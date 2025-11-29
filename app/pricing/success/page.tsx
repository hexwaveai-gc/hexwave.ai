"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "@/app/components/common/Sidebar";
import { useUser, useRefetchUserData } from "@/hooks";

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function PricingSuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // TanStack Query hooks
  const { credits, planName } = useUser();
  const refetchUser = useRefetchUserData();

  const checkoutId = searchParams.get("checkout_id");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    // Short delay to allow webhook to process, then refetch user data
    const timer = setTimeout(async () => {
      // Force refetch to get updated credits and subscription
      await refetchUser();
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [refetchUser]);

  return (
    <div className="text-center">
      {isLoading ? (
        <>
          <div className="w-20 h-20 rounded-full bg-[#74FF52]/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-[#74FF52] animate-spin" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Processing your subscription...</h1>
          <p className="text-white/60 mb-8">
            Please wait while we set up your account.
          </p>
        </>
      ) : (
        <>
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-[#74FF52]/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-[#74FF52]" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-4">Welcome to Hexwave!</h1>
          <p className="text-white/60 mb-4">
            Your {planName} subscription has been activated successfully.
          </p>
          {credits > 0 && (
            <p className="text-[#74FF52] font-semibold text-lg mb-8">
              {credits.toLocaleString()} credits added to your account!
            </p>
          )}

          {/* Confirmation Details */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-8 text-left">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#74FF52]" />
              What&apos;s next?
            </h2>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 text-[#74FF52] text-xs font-bold">1</span>
                <span>Your credits have been added to your account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 text-[#74FF52] text-xs font-bold">2</span>
                <span>Start creating amazing AI-generated content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 text-[#74FF52] text-xs font-bold">3</span>
                <span>Access all premium features with your new plan</span>
              </li>
            </ul>
          </div>

          {/* Transaction Info */}
          {(checkoutId || transactionId) && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-8 text-left">
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
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
            >
              Explore Gallery
            </Link>
          </div>
        </>
      )}
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
      <h1 className="text-3xl font-bold mb-4">Loading...</h1>
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto px-6">
          <Suspense fallback={<LoadingFallback />}>
            <PricingSuccessContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
