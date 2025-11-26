"use client";

import { useUserData, useUser } from "@/hooks";

interface UserProviderProps {
  children: React.ReactNode;
}

/**
 * UserProvider
 * 
 * Initializes and syncs the user store via TanStack Query.
 * Should be placed inside ClerkProvider and QueryProvider in the component tree.
 * 
 * Features:
 * - Fetches user data via TanStack Query on authentication
 * - Auto-syncs to Zustand store for global access
 * - Handles stale data refetching automatically (via TanStack Query)
 * - Resets store on sign out
 */
export function UserProvider({ children }: UserProviderProps) {
  // This hook handles everything:
  // - Fetches user data when signed in (via TanStack Query)
  // - Syncs data to Zustand store
  // - Resets store when signed out
  // - Auto-refetches on window focus and reconnect
  useUserData();

  return <>{children}</>;
}

// Re-export the useUser hook for convenience
export { useUser };
