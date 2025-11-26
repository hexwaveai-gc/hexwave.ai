"use client";

import Link from "next/link";
import { Wrench, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarUpgradeButton } from "./SidebarUpgradeButton";
import { SidebarAuthSection } from "./SidebarAuthSection";

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
 */
export function MobileMenuSheet({ isOpen, onOpenChange }: MobileMenuSheetProps) {
  const handleClose = () => onOpenChange(false);

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

          {/* Upgrade to Pro */}
          <SidebarUpgradeButton variant="expanded" onClose={handleClose} />

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

          {/* Sign Out / Sign In */}
          <SidebarAuthSection variant="expanded" onClose={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

