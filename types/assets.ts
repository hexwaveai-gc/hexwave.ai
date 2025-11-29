/**
 * Assets Types
 * 
 * Types for user-generated content and shared library
 */

import type { JobStatus, ToolCategory } from "@/app/models/ProcessJob";

// =============================================================================
// ASSET TYPES
// =============================================================================

export type AssetType = "image" | "video" | "audio" | "all";

export interface AssetAuthor {
  userId: string;
  name: string;
  avatar?: string;
  verified?: boolean;
}

export interface AssetMetadata {
  /** Original prompt used for generation */
  prompt?: string;
  /** Model/tool used for generation */
  model?: string;
  /** Duration in seconds (for video/audio) */
  duration?: number;
  /** Dimensions for images/videos */
  width?: number;
  height?: number;
  /** File size in bytes */
  fileSize?: number;
  /** Additional tool-specific metadata */
  extra?: Record<string, unknown>;
}

export interface Asset {
  id: string;
  jobId: string;
  userId: string;
  
  /** Type of asset */
  type: AssetType;
  
  /** Category from the job */
  category: ToolCategory;
  
  /** Tool used to generate */
  toolId: string;
  toolName?: string;
  
  /** Asset URLs */
  url: string;
  thumbnailUrl?: string;
  
  /** Display info */
  title?: string;
  description?: string;
  
  /** Sharing status */
  isShared: boolean;
  sharedAt?: Date;
  
  /** Engagement (for shared assets) */
  likes: number;
  views: number;
  
  /** Metadata */
  metadata: AssetMetadata;
  
  /** Author info (populated for shared/library assets) */
  author?: AssetAuthor;
  
  /** Job status */
  status: JobStatus;
  
  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface AssetsFilters {
  type?: AssetType;
  status?: JobStatus | JobStatus[];
  search?: string;
  sortBy?: "createdAt" | "likes" | "views";
  sortOrder?: "asc" | "desc";
}

export interface AssetsResponse {
  assets: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface LibraryFilters extends AssetsFilters {
  /** Filter by specific user */
  authorId?: string;
  /** Filter by trending/recent */
  trending?: boolean;
}

export interface ShareAssetPayload {
  jobId: string;
  title?: string;
  description?: string;
}

export interface ShareAssetResponse {
  success: boolean;
  asset: Asset;
}

export interface UnshareAssetResponse {
  success: boolean;
  message: string;
}

// =============================================================================
// STATS TYPES
// =============================================================================

export interface AssetStats {
  totalImages: number;
  totalVideos: number;
  totalAudio: number;
  totalShared: number;
  totalLikes: number;
  totalViews: number;
}

export interface AssetsWithStats {
  assets: Asset[];
  stats: AssetStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}



