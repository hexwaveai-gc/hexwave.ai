import {
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Wrench,
  CreditCard,
  LayoutTemplate,
  Bot,
  Mic,
} from "lucide-react";
import type { SidebarItem } from "./types";

// Threshold for showing "Add Credits" button
export const LOW_CREDITS_THRESHOLD = 2000;

export const SIDEBAR_NAV_ITEMS: SidebarItem[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Sparkles,
    href: "/explore",
    requiresAuth: false,
  },
  {
    id: "assets",
    label: "Assets",
    icon: FolderOpen,
    href: "/assets",
    requiresAuth: true,
  },
  {
    id: "video-agent",
    label: "Video Agent",
    icon: Bot,
    href: "/video-agent",
    badge: "BETA",
    requiresAuth: false,
  },
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
    href: "/templates",
    requiresAuth: false,
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    href: "/image-generator",
    requiresAuth: false,
  },
  {
    id: "video",
    label: "Video",
    icon: Video,
    href: "/ai-video-generator",
    badge: "NEW",
    requiresAuth: false,
  },
  {
    id: "audio",
    label: "Audio",
    icon: Mic,
    href: "/audio",
    requiresAuth: false,
  },
  {
    id: "tools",
    label: "All Tools",
    icon: Wrench,
    href: "/tools",
    requiresAuth: false,
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: CreditCard,
    href: "/pricing",
    requiresAuth: false,
  },
];


