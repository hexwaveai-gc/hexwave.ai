"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuthModal } from "@/app/providers/AuthModalProvider";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SIDEBAR_NAV_ITEMS } from "./constants";
import type { SidebarItem } from "./types";

export function SidebarNavigation() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { openSignIn } = useAuthModal();

  const handleNavClick = (e: React.MouseEvent, item: SidebarItem) => {
    if (item.requiresAuth && !isSignedIn) {
      e.preventDefault();
      openSignIn();
    }
  };

  return (
    <nav className="flex-1 py-2 px-2 overflow-y-auto">
      <div className="flex flex-col gap-2">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              onClick={handleNavClick}
            />
          );
        })}
      </div>
    </nav>
  );
}


