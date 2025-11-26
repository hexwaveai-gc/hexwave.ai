"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "./query-client";

/**
 * QueryProvider Component
 *
 * Wraps the application with TanStack Query's QueryClientProvider.
 *
 * SSR Safety:
 * - Creates QueryClient in useState to ensure each request gets its own client
 * - Prevents shared cache between different users/requests
 * - Initializer function runs once per component instance
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/ssr
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient in state to avoid shared cache between requests
  // The initializer function ensures we only create the client once
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}

