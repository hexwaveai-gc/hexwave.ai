"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuthModal } from "@/app/providers/AuthModalProvider";

export function SidebarUpgradeButton() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useAuthModal();

  if (isSignedIn) {
    return (
      <Link
        href="/pricing"
        className="flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] transition-colors font-semibold"
        title="Upgrade Plan"
      >
        <Zap className="w-4 h-4 flex-shrink-0" />
        <span className="text-[9px] text-center leading-tight">Upgrade</span>
      </Link>
    );
  }

  return (
    <button
      onClick={openSignIn}
      className="flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] transition-colors font-semibold w-full"
      title="Get Started"
    >
      <Zap className="w-4 h-4 flex-shrink-0" />
      <span className="text-[9px] text-center leading-tight">Get Started</span>
    </button>
  );
}


