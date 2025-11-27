import { QueryClient } from "@tanstack/react-query";
import {
  DEFAULT_QUERY_OPTIONS,
  DEFAULT_MUTATION_OPTIONS,
} from "@/constants/query";

/**
 * Creates a new QueryClient with optimal default configuration
 *
 * This factory function is used to create fresh QueryClient instances,
 * which is essential for:
 * - SSR: Each request needs its own QueryClient to avoid shared cache
 * - Client: Creating the initial QueryClient in useState
 *
 * Best Practices Applied:
 * - staleTime > 0 to avoid immediate refetch after hydration
 * - Reasonable gcTime for memory management
 * - Retry with exponential backoff
 * - Window focus refetch disabled for better UX
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: DEFAULT_QUERY_OPTIONS,
      mutations: DEFAULT_MUTATION_OPTIONS,
    },
  });
}

/**
 * Browser-side QueryClient singleton
 *
 * On the browser, we want to reuse the same QueryClient across the app.
 * This prevents recreating the client on every navigation while still
 * allowing SSR to create fresh clients per request.
 */
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets the QueryClient for use in components
 *
 * - Server: Always creates a new QueryClient (SSR isolation)
 * - Browser: Returns singleton instance (state persistence)
 *
 * This pattern is recommended by TanStack Query for Next.js App Router:
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export function getQueryClient(): QueryClient {
  // Server: always create a new query client
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  // Browser: use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}





