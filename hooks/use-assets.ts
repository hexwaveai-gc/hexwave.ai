/**
 * useAssets Hook
 * 
 * TanStack Query hook for fetching and managing user assets
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { 
  AssetsWithStats, 
  AssetsResponse, 
  AssetsFilters, 
  LibraryFilters,
  ShareAssetPayload,
  ShareAssetResponse,
  UnshareAssetResponse,
  AssetType,
} from "@/types/assets";

// =============================================================================
// QUERY KEYS
// =============================================================================

export const assetsKeys = {
  all: ["assets"] as const,
  lists: () => [...assetsKeys.all, "list"] as const,
  list: (filters: AssetsFilters) => [...assetsKeys.lists(), filters] as const,
  infinite: (filters: AssetsFilters) => [...assetsKeys.all, "infinite", filters] as const,
  library: {
    all: ["library"] as const,
    lists: () => [...assetsKeys.library.all, "list"] as const,
    list: (filters: LibraryFilters) => [...assetsKeys.library.lists(), filters] as const,
    infinite: (filters: LibraryFilters) => [...assetsKeys.library.all, "infinite", filters] as const,
  },
} as const;

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function fetchAssets(filters: AssetsFilters & { page?: number; limit?: number }): Promise<AssetsWithStats> {
  const params: Record<string, string | number | boolean | undefined> = {
    type: filters.type,
    status: Array.isArray(filters.status) ? filters.status.join(",") : filters.status,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  };
  
  return api.get<AssetsWithStats>("/api/assets", params);
}

async function fetchLibrary(filters: LibraryFilters & { page?: number; limit?: number }): Promise<AssetsResponse> {
  const params: Record<string, string | number | boolean | undefined> = {
    type: filters.type,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    trending: filters.trending,
    authorId: filters.authorId,
    page: filters.page,
    limit: filters.limit,
  };
  
  return api.get<AssetsResponse>("/api/assets/library", params);
}

async function shareAsset(payload: ShareAssetPayload): Promise<ShareAssetResponse> {
  return api.post<ShareAssetResponse>("/api/assets/share", payload);
}

async function unshareAsset(jobId: string): Promise<UnshareAssetResponse> {
  return api.delete<UnshareAssetResponse>(`/api/assets/share?jobId=${jobId}`);
}

// =============================================================================
// HOOKS
// =============================================================================

interface UseAssetsOptions {
  type?: AssetType;
  status?: AssetsFilters["status"];
  search?: string;
  sortBy?: AssetsFilters["sortBy"];
  sortOrder?: AssetsFilters["sortOrder"];
  page?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching user's own assets with pagination
 */
export function useAssets(options: UseAssetsOptions = {}) {
  const { enabled = true, page = 1, limit = 20, ...filters } = options;

  return useQuery({
    queryKey: assetsKeys.list({ ...filters, page, limit } as AssetsFilters),
    queryFn: () => fetchAssets({ ...filters, page, limit }),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for infinite scrolling of user's assets
 */
export function useInfiniteAssets(options: Omit<UseAssetsOptions, "page"> = {}) {
  const { enabled = true, limit = 20, ...filters } = options;

  return useInfiniteQuery({
    queryKey: assetsKeys.infinite(filters as AssetsFilters),
    queryFn: ({ pageParam = 1 }) => fetchAssets({ ...filters, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled,
    staleTime: 30 * 1000,
  });
}

interface UseLibraryOptions {
  type?: AssetType;
  search?: string;
  sortBy?: LibraryFilters["sortBy"];
  sortOrder?: LibraryFilters["sortOrder"];
  trending?: boolean;
  authorId?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching shared library assets with pagination
 */
export function useLibrary(options: UseLibraryOptions = {}) {
  const { enabled = true, page = 1, limit = 20, ...filters } = options;

  return useQuery({
    queryKey: assetsKeys.library.list({ ...filters, page, limit } as LibraryFilters),
    queryFn: () => fetchLibrary({ ...filters, page, limit }),
    enabled,
    staleTime: 60 * 1000, // 1 minute for library (less fresh needed)
  });
}

/**
 * Hook for infinite scrolling of library assets
 */
export function useInfiniteLibrary(options: Omit<UseLibraryOptions, "page"> = {}) {
  const { enabled = true, limit = 20, ...filters } = options;

  return useInfiniteQuery({
    queryKey: assetsKeys.library.infinite(filters as LibraryFilters),
    queryFn: ({ pageParam = 1 }) => fetchLibrary({ ...filters, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for sharing an asset to the library
 */
export function useShareAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shareAsset,
    onSuccess: () => {
      // Invalidate both user assets and library
      queryClient.invalidateQueries({ queryKey: assetsKeys.all });
      queryClient.invalidateQueries({ queryKey: assetsKeys.library.all });
    },
  });
}

/**
 * Hook for unsharing an asset from the library
 */
export function useUnshareAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unshareAsset,
    onSuccess: () => {
      // Invalidate both user assets and library
      queryClient.invalidateQueries({ queryKey: assetsKeys.all });
      queryClient.invalidateQueries({ queryKey: assetsKeys.library.all });
    },
  });
}





