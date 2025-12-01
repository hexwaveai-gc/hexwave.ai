"use client";

import { SidebarLogo } from "./sidebar-logo";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarAuthSection } from "./sidebar-auth-section";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-19 bg-[#0a0a0a] flex flex-col z-50">
      <SidebarLogo />
      <SidebarNavigation />
      <SidebarAuthSection />
    </aside>
  );
}

// Default export for backward compatibility
export default Sidebar;


