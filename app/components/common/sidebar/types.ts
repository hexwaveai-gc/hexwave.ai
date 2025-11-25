import { LucideIcon } from "lucide-react";

/**
 * Represents a single navigation item in the sidebar
 */
export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  matchPaths?: string[]; // Additional paths that should activate this item
  badge?: string;
}

