// =============================================================================
// Server-side exports (for API routes and server components)
// =============================================================================
export {
  getAblyRestClient,
  publishProcessStatus,
  generateAblyTokenRequest,
} from "./server";

// =============================================================================
// Client-side exports (for React components)
// Import directly from "@/lib/ably/provider" to avoid bundling server code
// =============================================================================
export { AblyProvider, useAbly, useProcessSubscription } from "./provider";

// =============================================================================
// Types (safe to import anywhere)
// =============================================================================
export type { ProcessStatusMessage } from "./types";
