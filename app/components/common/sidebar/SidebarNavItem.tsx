"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./types";

interface SidebarNavItemProps {
  item: SidebarItem;
  variant?: "desktop" | "mobile";
}

/**
 * SidebarNavItem component - Client component
 * Renders a single navigation item with active state
 * 
 * @reasoning Client component needed for usePathname hook to track active state
 * Supports both desktop and mobile variants for consistent styling
 */
export function SidebarNavItem({ item, variant = "desktop" }: SidebarNavItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  
  // Check if current path matches this item
  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

  if (variant === "mobile") {
    return (
      <Link
        key={item.id}
        href={item.href}
        className={`flex flex-col items-center justify-center gap-1 w-14 h-full relative ${
          isActive ? "text-[#74FF52]" : "text-white/60"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-[#74FF52]" : ""}`} />
        <span className="text-[10px] font-medium">{item.label}</span>
        {item.badge && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-[#74FF52] rounded-full" />
        )}
      </Link>
    );
  }

  return (
    <Link
      key={item.id}
      href={item.href}
      className={`group flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all relative ${
        isActive
          ? "bg-white/10 text-[#74FF52]"
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
      title={item.label}
    >
      <Icon
        className={`w-6 h-6 shrink-0 transition-transform group-hover:scale-110 ${
          isActive ? "text-[#74FF52]" : ""
        }`}
      />
      <span className="text-[10px] font-medium text-center leading-tight">
        {item.label}
      </span>
      {item.badge && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] bg-[#74FF52] text-[#0a0a0a] rounded-full font-bold leading-none shadow-[0_0_10px_rgba(116,255,82,0.3)]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

