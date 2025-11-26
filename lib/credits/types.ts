/**
 * Credit System Type Definitions
 * 
 * Provides TypeScript interfaces for the credit deduction,
 * refund, and transaction history system.
 */

// =============================================================================
// Transaction Types
// =============================================================================

/**
 * Types of credit transactions
 * - DEDUCTION: Credits used for tool usage (image/video generation)
 * - REFUND: Credits returned due to process failure
 * - CREDIT_ADDED: Credits added via subscription or purchase
 */
export type CreditTransactionType = "DEDUCTION" | "REFUND" | "CREDIT_ADDED";

/**
 * Status of a credit transaction
 */
export type CreditTransactionStatus = "SUCCESS" | "PENDING" | "FAILED";

/**
 * Tool categories for credit transactions
 */
export type ToolCategory = "image" | "video";

// =============================================================================
// Credit Transaction Model
// =============================================================================

/**
 * Credit transaction record interface
 * Stored in CreditTransaction collection for audit trail
 */
export interface ICreditTransaction {
  _id?: string;
  userId: string;
  processId: string | null; // null for CREDIT_ADDED (no associated process)
  type: CreditTransactionType;
  amount: number; // Always positive, direction determined by type
  
  // Tool context (for DEDUCTION/REFUND)
  category: ToolCategory | null;
  toolName: string | null;
  
  // Metadata
  description: string;
  status: CreditTransactionStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

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

// =============================================================================
// Credit Service Types
// =============================================================================

/**
 * Options for deducting credits
 */
export interface DeductCreditsOptions {
  userId: string;
  amount: number;
  processId: string;
  category: ToolCategory;
  toolName: string;
  description?: string;
}

/**
 * Options for refunding credits
 */
export interface RefundCreditsOptions {
  userId: string;
  amount: number;
  processId: string;
  category: ToolCategory;
  toolName: string;
  description?: string;
}

/**
 * Options for adding credits
 */
export interface AddCreditsOptions {
  userId: string;
  amount: number;
  description: string;
  /** Optional: source of credits (subscription, purchase, promo) */
  source?: "subscription" | "purchase" | "promo" | "admin";
}

/**
 * Result from credit operations
 */
export interface CreditOperationResult {
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}

/**
 * User credit balance info
 */
export interface UserCreditInfo {
  userId: string;
  availableBalance: number;
  hasEnoughCredits: (amount: number) => boolean;
}

