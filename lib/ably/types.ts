// Shared types for Ably integration
// This file contains only types and no server-only imports
// Safe to import in client components

/**
 * Message types for process status updates
 */
export interface ProcessStatusMessage {
  status: "processing" | "completed" | "failed";
  processId: string;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: number;
}

