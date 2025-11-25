"use client";

import { useState } from "react";
import { SIDEBAR_ITEMS } from "./constants";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarUpgradeButton } from "./SidebarUpgradeButton";
import { SidebarAuthSection } from "./SidebarAuthSection";
import { MobileNav } from "./MobileNav";
import { MobileMenuSheet } from "./MobileMenuSheet";

/**
 * Sidebar component - Client component for state management
 * Main orchestrator that composes smaller, focused components
 * 
 * @reasoning 
 * - Uses component composition to break down the monolithic sidebar
 * - Each child component has a single responsibility
 * - State management is minimal and localized (only mobile menu state)
 * - Child components can be server or client components as appropriate
 * - Easier to test, maintain, and extend individual pieces
 */
export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-[#0a0a0a] flex-col z-50 border-r border-white/5">
        {/* Logo Section */}
        <SidebarLogo />

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-2 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarNavItem key={item.id} item={item} variant="desktop" />
            ))}
          </div>
        </nav>

        {/* Bottom Section with User Profile, Auth, and Upgrade */}
        <div className="p-3 space-y-3 pb-6">
          <SidebarUserProfile variant="compact" />
          <SidebarAuthSection variant="compact" />
          <SidebarUpgradeButton variant="compact" />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileNav onMoreClick={() => setIsMobileMenuOpen(true)} />

      {/* Mobile More Menu Sheet */}
      <MobileMenuSheet 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen} 
      />
    </>
  );
}

