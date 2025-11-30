import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/common/sidebar";
import { UsageContent } from "./_components/usage-content";

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Credit Usage History",
  description: "Track your Hexwave.ai credit usage, view transaction history, and monitor your spending patterns.",
  robots: {
    index: false,
    follow: false,
  },
};

// ============================================================================
// Server Component Page
// ============================================================================

export default async function UsagePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/usage");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-20">
        <UsageContent />
      </main>
    </div>
  );
}
