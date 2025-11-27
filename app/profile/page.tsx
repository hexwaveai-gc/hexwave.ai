import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/common/Sidebar";
import { ProfileContent } from "./_components/profile-content";

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View and edit your Hexwave.ai profile, manage your settings, and showcase your creations.",
  robots: {
    index: false, // Don't index user profile pages
    follow: false,
  },
};

// ============================================================================
// Server Component Page
// ============================================================================

export default async function ProfilePage() {
  // Server-side auth check
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/profile");
  }

  // Get Clerk user data for fallback
  const clerkUser = await currentUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      <main className="flex-1 ml-20">
        <ProfileContent
          clerkImageUrl={clerkUser?.imageUrl}
          clerkFullName={clerkUser?.fullName || clerkUser?.firstName || undefined}
        />
      </main>
    </div>
  );
}
