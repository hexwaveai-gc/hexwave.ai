"use client";

import { Menu } from "lucide-react";
import { MOBILE_NAV_ITEMS } from "./constants";
import { SidebarNavItem } from "./SidebarNavItem";

interface MobileNavProps {
  onMoreClick: () => void;
}

/**
 * MobileNav component - Client component
 * Renders the mobile bottom navigation bar
 * 
 * @reasoning Client component needed for click handlers and active state tracking
 * Uses composition by reusing SidebarNavItem with mobile variant
 */
export function MobileNav({ onMoreClick }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-around z-50 px-2 safe-area-pb">
      {MOBILE_NAV_ITEMS.map((item) => (
        <SidebarNavItem key={item.id} item={item} variant="mobile" />
      ))}
      
      {/* More Menu Button */}
      <button
        onClick={onMoreClick}
        className="flex flex-col items-center justify-center gap-1 w-14 h-full text-white/60"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-medium">More</span>
      </button>
    </div>
  );
}

