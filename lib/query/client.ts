/**
 * TanStack Query Client Configuration
 * 
 * Centralized QueryClient with optimized defaults for the application.
 */

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 30 seconds
        staleTime: 30 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests up to 2 times
        retry: 2,
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse client across the app
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

// Query keys factory for type-safe query keys
export const queryKeys = {
  // User queries
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
    profile: (userId?: string) => [...queryKeys.user.all, "profile", userId] as const,
  },
  
  // Billing queries
  billing: {
    all: ["billing"] as const,
    details: () => [...queryKeys.billing.all, "details"] as const,
    portal: () => [...queryKeys.billing.all, "portal"] as const,
    invoice: (transactionId: string) => [...queryKeys.billing.all, "invoice", transactionId] as const,
  },
  
  // Usage/Credit queries
  usage: {
    all: ["usage"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.usage.all, "list", filters] as const,
    summary: (days: number) => [...queryKeys.usage.all, "summary", days] as const,
  },

  // Audio queries
  audio: {
    all: ["audio"] as const,
    voices: () => [...queryKeys.audio.all, "voices"] as const,
    history: (filters?: Record<string, unknown>) => [...queryKeys.audio.all, "history", filters] as const,
    generation: (id: string) => [...queryKeys.audio.all, "generation", id] as const,
  },

  // Assets queries
  assets: {
    all: ["assets"] as const,
    lists: () => [...queryKeys.assets.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.assets.lists(), filters] as const,
    infinite: (filters: Record<string, unknown>) => [...queryKeys.assets.all, "infinite", filters] as const,
    library: {
      all: ["library"] as const,
      lists: () => [...queryKeys.assets.library.all, "list"] as const,
      list: (filters: Record<string, unknown>) => [...queryKeys.assets.library.lists(), filters] as const,
      infinite: (filters: Record<string, unknown>) => [...queryKeys.assets.library.all, "infinite", filters] as const,
    },
  },
} as const;

