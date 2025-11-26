import {
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Wrench,
} from "lucide-react";
import { SidebarItem } from "./types";

/**
 * Main navigation items for the sidebar
 * Centralized to avoid duplication and ensure consistency
 */
export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Sparkles,
    href: "/explore",
  },
  {
    id: "assets",
    label: "Assets",
    icon: FolderOpen,
    href: "/assets",
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    href: "/image-generator",
  },
  {
    id: "video",
    label: "Video",
    icon: Video,
    href: "/ai-video-generator",
    badge: "NEW",
  },
  {
    id: "tools",
    label: "All Tools",
    icon: Wrench,
    href: "/tools",
  },
];

/**
 * Filter items for mobile navigation
 * Excludes "All Tools" as it appears in the More menu
 */
export const MOBILE_NAV_ITEMS = SIDEBAR_ITEMS.filter(
  (item) => item.id !== "tools"
);

