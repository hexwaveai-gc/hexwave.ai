/**
 * Assets Page Constants
 */

import { Image, Video, Music, FolderOpen, Sparkles, TrendingUp, Clock, Heart } from "lucide-react";

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

export const assetsTabs = [
  {
    id: "all",
    label: "All",
    icon: FolderOpen,
  },
  {
    id: "images",
    label: "Images",
    icon: Image,
  },
  {
    id: "videos",
    label: "Videos",
    icon: Video,
  },
  {
    id: "audio",
    label: "Audio",
    icon: Music,
  },
  {
    id: "library",
    label: "Library",
    icon: Sparkles,
    badge: "Community",
  },
] as const;

export type AssetsTabId = typeof assetsTabs[number]["id"];

// =============================================================================
// SORT OPTIONS
// =============================================================================

export const sortOptions = [
  {
    id: "newest",
    label: "Newest First",
    icon: Clock,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  },
  {
    id: "oldest",
    label: "Oldest First",
    icon: Clock,
    sortBy: "createdAt" as const,
    sortOrder: "asc" as const,
  },
  {
    id: "most-liked",
    label: "Most Liked",
    icon: Heart,
    sortBy: "likes" as const,
    sortOrder: "desc" as const,
  },
  {
    id: "trending",
    label: "Trending",
    icon: TrendingUp,
    sortBy: "views" as const,
    sortOrder: "desc" as const,
  },
] as const;

export type SortOptionId = typeof sortOptions[number]["id"];

// =============================================================================
// LIBRARY FILTERS
// =============================================================================

export const libraryFilters = [
  {
    id: "recent",
    label: "Recent",
    icon: Clock,
  },
  {
    id: "trending",
    label: "Trending",
    icon: TrendingUp,
  },
  {
    id: "most-liked",
    label: "Most Liked",
    icon: Heart,
  },
] as const;

export type LibraryFilterId = typeof libraryFilters[number]["id"];

// =============================================================================
// MAP FUNCTIONS
// =============================================================================

export function tabIdToAssetType(tabId: AssetsTabId): "all" | "image" | "video" | "audio" {
  switch (tabId) {
    case "images":
      return "image";
    case "videos":
      return "video";
    case "audio":
      return "audio";
    default:
      return "all";
  }
}



