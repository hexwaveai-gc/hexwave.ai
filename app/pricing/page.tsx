import type { Metadata } from "next";
import Sidebar from "@/app/components/common/Sidebar";
import { PricingContent } from "./_components/pricing-content";

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description:
    "Choose the perfect Hexwave.ai plan for your creative needs. Start with a 7-day free trial, then scale with Pro, Ultimate, or Creator plans with more credits and premium features.",
  keywords: [
    "AI pricing",
    "creative AI plans",
    "image generation credits",
    "video generation subscription",
    "Hexwave pricing",
    "AI subscription",
  ],
  openGraph: {
    title: "Pricing & Plans | Hexwave.ai",
    description:
      "Start with a 7-day free trial. Scale your creativity with Pro, Ultimate, or Creator plans.",
    type: "website",
  },
};

// ============================================================================
// Server Component Page
// ============================================================================

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-20">
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#74FF52]/5 via-transparent to-transparent pointer-events-none" />
          <PricingContent />
        </div>
      </main>
    </div>
  );
}
