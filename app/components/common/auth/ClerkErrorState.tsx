"use client";

import { RefreshCw } from "lucide-react";
import { AUTH_ERROR_MESSAGES, MAX_RETRY_ATTEMPTS } from "./constants";

// =============================================================================
// TYPES
// =============================================================================

interface ClerkErrorStateProps {
  error?: string;
  retryCount: number;
  onRetry: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Error state component for Clerk loading failures
 */
export function ClerkErrorState({
  error,
  retryCount,
  onRetry,
}: ClerkErrorStateProps) {
  const isMaxRetries = retryCount >= MAX_RETRY_ATTEMPTS;

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
      <p className="text-red-400 text-sm mb-3">
        {error || AUTH_ERROR_MESSAGES.failed_to_load_clerk_js_timeout}
      </p>
      <button
        onClick={onRetry}
        disabled={isMaxRetries}
        className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="h-4 w-4" />
        {isMaxRetries ? "Please refresh the page" : "Retry"}
      </button>
    </div>
  );
}
