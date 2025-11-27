/**
 * Process System Type Definitions
 *
 * Provides TypeScript interfaces for the process creation,
 * tracking, and credit deduction system.
 */

// =============================================================================
// Tool Categories
// =============================================================================

/**
 * Tool categories for process tracking
 */
export type ToolCategory = "image" | "video" | "audio" | "text" | "demo" | "other";

// =============================================================================
// generateUniqueId Options & Results
// =============================================================================

/**
 * Options for generating a process with credit deduction
 */
export interface GenerateProcessOptions {
  /** User ID (from Clerk) - Required */
  userId: string;

  /** Credits to deduct for this process - Required */
  creditsToDeduct: number;

  /** Tool category (image/video) - Required */
  category: ToolCategory;

  /** Tool/model name (e.g., "flux-pro", "kling-ai") - Required */
  toolName: string;

  /** Additional metadata to store with the process */
  data?: Record<string, unknown>;
}

/**
 * Error types for process generation
 */
export type GenerateProcessErrorType =
  | "INSUFFICIENT_CREDITS"
  | "USER_NOT_FOUND"
  | "TRANSACTION_FAILED";

/**
 * Success result from generateUniqueId
 */
export interface GenerateProcessSuccess {
  success: true;
  processId: string;
  transactionRef?: string;
}

/**
 * Error result from generateUniqueId
 */
export interface GenerateProcessError {
  success: false;
  error: GenerateProcessErrorType;
  message: string;
  availableCredits?: number; // Included for INSUFFICIENT_CREDITS
}

/**
 * Result type from generateUniqueId
 */
export type GenerateProcessResult = GenerateProcessSuccess | GenerateProcessError;

