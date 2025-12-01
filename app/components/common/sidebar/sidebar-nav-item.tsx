import Link from "next/link";
import type { SidebarItem } from "./types";

interface SidebarNavItemProps {
  item: SidebarItem;
  isActive: boolean;
  onClick: (e: React.MouseEvent, item: SidebarItem) => void;
}

export function SidebarNavItem({ item, isActive, onClick }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={(e) => onClick(e, item)}
      className={`group flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors relative ${
        isActive
          ? "bg-white/10 text-[#74FF52]"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
      title={item.label}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#74FF52]" : ""}`}
      />
      <span className="text-[10px] font-medium text-center leading-tight">
        {item.label}
      </span>
      {item.badge && (
        <span className="absolute -top-0.5 -right-0.5 px-1 py-0.5 text-[8px] bg-[#74FF52] text-[#0a0a0a] rounded font-semibold leading-none">
          {item.badge}
        </span>
      )}
    </Link>
  );
}


