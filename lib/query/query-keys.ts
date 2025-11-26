/**
 * Query Keys Factory
 *
 * Type-safe query key management following the factory pattern.
 * This approach provides:
 * - Consistent key structure across the app
 * - Type safety and autocomplete
 * - Easy invalidation of related queries
 *
 * Pattern: ['entity', 'scope', ...params]
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */

// =============================================================================
// User Query Keys
// =============================================================================

export const userKeys = {
  /** Base key for all user queries */
  all: ["user"] as const,

  /** Single user by ID */
  detail: (userId: string) => ["user", userId] as const,

  /** User credits */
  credits: (userId: string) => ["user", userId, "credits"] as const,

  /** User preferences/settings */
  preferences: (userId: string) => ["user", userId, "preferences"] as const,

  /** User subscription info */
  subscription: (userId: string) => ["user", userId, "subscription"] as const,
};

// =============================================================================
// Image Generation Query Keys
// =============================================================================

export interface ImageFilters {
  status?: "pending" | "completed" | "failed";
  model?: string;
  page?: number;
  limit?: number;
}

export const imageKeys = {
  /** Base key for all image queries */
  all: ["images"] as const,

  /** List of images with filters */
  list: (filters?: ImageFilters) => ["images", "list", filters ?? {}] as const,

  /** Single image by ID */
  detail: (imageId: string) => ["images", imageId] as const,

  /** Image generation history */
  history: (userId: string, page?: number) =>
    ["images", "history", userId, page ?? 1] as const,
};

// =============================================================================
// Video Generation Query Keys
// =============================================================================

export interface VideoFilters {
  status?: "pending" | "processing" | "completed" | "failed";
  model?: string;
  page?: number;
  limit?: number;
}

export const videoKeys = {
  /** Base key for all video queries */
  all: ["videos"] as const,

  /** List of videos with filters */
  list: (filters?: VideoFilters) => ["videos", "list", filters ?? {}] as const,

  /** Single video by ID */
  detail: (videoId: string) => ["videos", videoId] as const,

  /** Video generation history */
  history: (userId: string, page?: number) =>
    ["videos", "history", userId, page ?? 1] as const,
};

// =============================================================================
// Model Configuration Query Keys
// =============================================================================

export const modelKeys = {
  /** Base key for all model queries */
  all: ["models"] as const,

  /** List of available models by type */
  list: (type: "image" | "video") => ["models", "list", type] as const,

  /** Single model configuration */
  detail: (modelId: string) => ["models", modelId] as const,
};

// =============================================================================
// Explore Page Query Keys
// =============================================================================

export interface ExploreFilters {
  tab?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const exploreKeys = {
  /** Base key for all explore queries */
  all: ["explore"] as const,

  /** Featured content */
  featured: () => ["explore", "featured"] as const,

  /** Explore content with filters */
  list: (filters?: ExploreFilters) =>
    ["explore", "list", filters ?? {}] as const,
};

// =============================================================================
// Unified Query Keys Object
// =============================================================================

/**
 * Unified query keys for the entire application
 *
 * Usage:
 * ```ts
 * // In a query
 * useQuery({ queryKey: queryKeys.user.detail(userId), queryFn: fetchUser })
 *
 * // For invalidation
 * queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
 * ```
 */
export const queryKeys = {
  user: userKeys,
  images: imageKeys,
  videos: videoKeys,
  models: modelKeys,
  explore: exploreKeys,
} as const;

// =============================================================================
// Type Exports
// =============================================================================

export type UserKeys = typeof userKeys;
export type ImageKeys = typeof imageKeys;
export type VideoKeys = typeof videoKeys;
export type ModelKeys = typeof modelKeys;
export type ExploreKeys = typeof exploreKeys;
export type QueryKeys = typeof queryKeys;

