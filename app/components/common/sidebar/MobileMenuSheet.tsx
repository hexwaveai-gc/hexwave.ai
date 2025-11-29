"use client";

import Link from "next/link";
import { Wrench, ChevronRight, Receipt, BarChart3, UserCircle, HelpCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarUpgradeButton } from "./SidebarUpgradeButton";
import { SidebarAuthSection } from "./SidebarAuthSection";
import { useUserStore, selectHasActiveSubscription } from "@/store";

interface MobileMenuSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * MobileMenuSheet component - Client component
 * Renders the mobile menu drawer with additional options
 * 
 * @reasoning Client component needed for Sheet state management
 * Uses composition to reuse UserProfile, UpgradeButton, and AuthSection components
 * Shows billing/usage options for subscribers
 */
export function MobileMenuSheet({ isOpen, onOpenChange }: MobileMenuSheetProps) {
  const handleClose = () => onOpenChange(false);
  const { isSignedIn } = useUser();
  const hasActiveSubscription = useUserStore(selectHasActiveSubscription);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="bg-[#0a0a0a] border-white/10 text-white rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-2 mt-6">
          {/* User Profile Section */}
          <SidebarUserProfile variant="expanded" />

          {/* Upgrade to Pro / Credits Display */}
          <SidebarUpgradeButton variant="expanded" onClose={handleClose} />

          {/* Profile Link - Always visible for signed in users */}
          {isSignedIn && (
            <Link
              href="/profile"
              onClick={handleClose}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-white/70" />
                <span className="text-white">Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </Link>
          )}

          {/* Billing & Usage - Only for subscribers */}
          {isSignedIn && hasActiveSubscription && (
            <>
              <Link
                href="/billing"
                onClick={handleClose}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-white/70" />
                  <span className="text-white">Billing & Plans</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </Link>

              <Link
                href="/usage"
                onClick={handleClose}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-white/70" />
                  <span className="text-white">Usage History</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </Link>
            </>
          )}

          {/* All Tools Link */}
          <Link
            href="/tools"
            onClick={handleClose}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-white/70" />
              <span className="text-white">All Tools</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </Link>

          {/* Help Link */}
          <Link
            href="/help"
            onClick={handleClose}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-white/70" />
              <span className="text-white">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </Link>

          {/* Sign Out / Sign In */}
          <SidebarAuthSection variant="expanded" onClose={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

