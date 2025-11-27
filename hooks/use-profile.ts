/**
 * Profile Hooks
 * 
 * TanStack Query hooks for profile operations.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/client";
import {
  fetchProfile,
  updateProfile,
  checkUsername,
  type UserProfile,
  type UpdateProfileData,
} from "@/lib/api";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook for fetching user profile
 */
export function useProfile(username?: string, enabled: boolean = true) {
  return useQuery<UserProfile>({
    queryKey: queryKeys.user.profile(username),
    queryFn: () => fetchProfile(username),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for checking username availability
 */
export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ["username-check", username],
    queryFn: () => checkUsername(username),
    enabled: username.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData(
        queryKeys.user.profile(undefined),
        updatedProfile
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

