"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import Sidebar from "@/app/components/common/Sidebar";

export default function PricingCancelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto px-6">
          <div className="text-center">
            {/* Cancel Icon */}
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-white/40" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-3xl font-bold mb-4">Checkout Cancelled</h1>
            <p className="text-white/60 mb-8">
              No worries! Your checkout was cancelled and you haven&apos;t been charged.
              You can return to the pricing page anytime to subscribe.
            </p>

            {/* Help Section */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-8 text-left">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#74FF52]" />
                Need help deciding?
              </h2>
              <p className="text-sm text-white/60 mb-4">
                If you have any questions about our plans or need help choosing the right one for you, 
                we&apos;re here to help!
              </p>
              <ul className="space-y-2 text-sm text-white/50">
                <li>• Compare all features on our pricing page</li>
                <li>• Try our free tier to explore the platform</li>
                <li>• Contact support for personalized recommendations</li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#74FF52] text-black font-semibold hover:bg-[#66e648] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Pricing
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                Explore Gallery
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

