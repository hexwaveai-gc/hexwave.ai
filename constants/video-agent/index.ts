// ============================================================================
// VIDEO AGENT TYPES & CONSTANTS
// Uses raw template preview data directly since templateNames may be null
// ============================================================================

import { TEMPLATES as HEYGEN_TEMPLATES } from "@/constants/avatar/heygenTemplates";

// ============================================================================
// AVATAR TYPES
// ============================================================================

export interface Avatar {
  id: string;
  name: string;
  previewUrl: string;
  videoUrl?: string | null;
  category: AvatarCategory;
  isFavorite?: boolean;
}

export type AvatarCategory =
  | "all"
  | "professional"
  | "lifestyle"
  | "ugc"
  | "community"
  | "favorites";

export interface AvatarCategoryItem {
  id: AvatarCategory;
  label: string;
}

// ============================================================================
// AVATAR CATEGORIES
// ============================================================================

export const AVATAR_CATEGORIES: AvatarCategoryItem[] = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "ugc", label: "UGC" },
  { id: "community", label: "Community" },
  { id: "favorites", label: "Favorites" },
];

// ============================================================================
// DURATION OPTIONS
// ============================================================================

export type DurationOption = "auto" | "15s" | "30s" | "60s" | "90s";

export interface DurationItem {
  id: DurationOption;
  label: string;
  seconds?: number;
}

export const DURATION_OPTIONS: DurationItem[] = [
  { id: "auto", label: "Auto" },
  { id: "15s", label: "15s", seconds: 15 },
  { id: "30s", label: "30s", seconds: 30 },
  { id: "60s", label: "60s", seconds: 60 },
  { id: "90s", label: "90s", seconds: 90 },
];

// ============================================================================
// DEVICE TYPES
// ============================================================================

export type DeviceType = "mobile" | "desktop";

// ============================================================================
// AVATAR NAMES (to give friendly names to avatars)
// ============================================================================

const AVATAR_NAMES = [
  "Alex", "Jordan", "Morgan", "Casey", "Riley", "Quinn", "Avery", "Taylor",
  "Jamie", "Cameron", "Drew", "Skyler", "Reese", "Parker", "Blake", "Hayden",
  "Emerson", "Rowan", "Sage", "Phoenix", "River", "Finley", "Dakota", "Charlie",
  "Peyton", "Logan", "Kendall", "Addison", "Bailey", "Harper", "Mackenzie", "Sydney",
  "Madison", "Kennedy", "Ainsley", "Elliot", "Sawyer", "Rory", "Jessie", "Robin",
];

const CATEGORIES: AvatarCategory[] = ["professional", "lifestyle", "ugc", "community"];

// ============================================================================
// TRANSFORM RAW TEMPLATES TO AVATARS
// Uses preview URLs directly, filtering duplicates
// ============================================================================

const seenUrls = new Set<string>();

export const AVATARS: Avatar[] = HEYGEN_TEMPLATES
  .filter((template) => {
    // Filter out duplicate URLs
    if (seenUrls.has(template.previewUrl)) return false;
    seenUrls.add(template.previewUrl);
    return true;
  })
  .map((template, index) => ({
    id: `avatar-${index}`,
    name: template.templateName || AVATAR_NAMES[index % AVATAR_NAMES.length],
    previewUrl: template.previewUrl,
    videoUrl: template.videoUrl,
    category: CATEGORIES[index % CATEGORIES.length],
    isFavorite: index < 4, // First 4 are favorites
  }));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get avatars filtered by category
 */
export function getAvatarsByCategory(category: AvatarCategory): Avatar[] {
  if (category === "all") {
    return AVATARS;
  }
  if (category === "favorites") {
    return AVATARS.filter((avatar) => avatar.isFavorite);
  }
  return AVATARS.filter((avatar) => avatar.category === category);
}

/**
 * Get a single avatar by ID
 */
export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find((avatar) => avatar.id === id);
}

/**
 * Search avatars by name
 */
export function searchAvatars(query: string): Avatar[] {
  const lowercaseQuery = query.toLowerCase().trim();
  if (!lowercaseQuery) return AVATARS;

  return AVATARS.filter((avatar) =>
    avatar.name.toLowerCase().includes(lowercaseQuery)
  );
}

// ============================================================================
// PROMPT PLACEHOLDERS
// ============================================================================

export const PROMPT_PLACEHOLDERS = [
  "Generate a video optimized for my platform and goals",
  "Create a product demo video for my SaaS application",
  "Make a training video explaining our company policies",
  "Create a promotional video for our new product launch",
  "Generate a personalized greeting video for customers",
  "Create a video that tells a compelling story and connects emotionally",
];

/**
 * Get a random prompt placeholder
 */
export function getRandomPlaceholder(): string {
  return PROMPT_PLACEHOLDERS[Math.floor(Math.random() * PROMPT_PLACEHOLDERS.length)];
}
