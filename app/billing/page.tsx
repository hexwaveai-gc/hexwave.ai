import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/common/Sidebar";
import { BillingContent } from "./_components/billing-content";

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Billing & Subscription",
  description: "Manage your Hexwave.ai subscription, view payment history, and update payment methods.",
  robots: {
    index: false,
    follow: false,
  },
};

// ============================================================================
// Server Component Page
// ============================================================================

export default async function BillingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/billing");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-20">
        <BillingContent />
      </main>
    </div>
  );
}
