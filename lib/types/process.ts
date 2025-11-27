/**
 * Process System Types
 *
 * Centralized type definitions for the process/job management system.
 * These types are used across the application for job handling.
 */

// =============================================================================
// RE-EXPORTS FROM MODELS & SERVICES
// =============================================================================

// Re-export types from ProcessJob model
export type {
  JobStatus,
  ToolCategory,
  IStatusHistoryEntry,
  IJobRequest,
  IJobResponse,
  ICreditInfo,
  IWebhookInfo,
  IProgressInfo,
  IProcessJob,
} from "@/app/models/ProcessJob/process-job.model";

// Re-export types from ProcessJobService
export type {
  CreateJobOptions,
  CreateJobResult,
  UpdateJobOptions,
  UpdateJobResult,
  UpdateProgressOptions,
  WebhookOptions,
  WebhookResult,
  GetJobsOptions,
} from "@/lib/services/ProcessJobService";

// =============================================================================
// LEGACY TYPES (For backward compatibility)
// =============================================================================

/**
 * @deprecated Use CreateJobOptions from ProcessJobService
 */
export interface GenerateProcessOptions {
  userId: string;
  creditsToDeduct: number;
  category: string | null;
  toolName: string | null;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
  version?: string;
}

/**
 * @deprecated Use CreateJobResult from ProcessJobService
 */
export interface GenerateProcessResult {
  success: boolean;
  processId?: string;
  jobId?: string;
  transactionRef?: string;
  error?: string;
  message?: string;
  availableCredits?: number;
}

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Tool configuration for job creation
 */
export interface ToolConfig {
  /** Unique tool identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Tool category */
  category: "image" | "video" | "audio" | "text" | "avatar" | "other";
  /** Credits required per operation */
  creditsPerOperation: number;
  /** Whether tool supports progress tracking */
  supportsProgress?: boolean;
  /** Default number of expected items */
  defaultExpectedItems?: number;
  /** Provider name (for webhooks) */
  provider?: string;
}

/**
 * Job summary for dashboard/listing
 */
export interface JobSummary {
  jobId: string;
  status: string;
  category: string;
  toolId: string;
  toolName?: string;
  creditsUsed: number;
  progress?: {
    completed: number;
    failed: number;
    total: number;
    percentage: number;
  };
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
}

/**
 * Webhook payload from external providers
 */
export interface WebhookPayload {
  /** External job ID */
  jobId: string;
  /** Status from provider */
  status: "processing" | "completed" | "failed";
  /** Response data */
  data?: Record<string, unknown>;
  /** Error message */
  error?: string;
  /** Error code */
  errorCode?: string;
  /** Raw payload for debugging */
  raw?: Record<string, unknown>;
}

/**
 * Job creation response (API response format)
 */
export interface JobCreationResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: string;
    category: string;
    toolId: string;
    creditsCharged: number;
    transactionRef?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: {
      availableCredits?: number;
      requiredCredits?: number;
    };
  };
}

/**
 * Job status response (API response format)
 */
export interface JobStatusResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: string;
    progress?: {
      completed: number;
      failed: number;
      total: number;
      percentage: number;
    };
    response?: {
      data?: Record<string, unknown>;
      error?: string;
    };
    credits: {
      charged: number;
      refunded: number;
    };
    timing: {
      createdAt: string;
      startedAt?: string;
      completedAt?: string;
      duration?: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Real-time status update (Ably message format)
 */
export interface RealtimeStatusUpdate {
  jobId: string;
  status: string;
  data?: {
    progress?: {
      completed: number;
      failed: number;
      total: number;
      percentage: number;
    };
    items?: unknown[];
    error?: string;
    refunded?: boolean;
    refundAmount?: number;
  };
  timestamp: number;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Job error codes
 */
export type JobErrorCode =
  | "INSUFFICIENT_CREDITS"
  | "USER_NOT_FOUND"
  | "DUPLICATE_JOB"
  | "TRANSACTION_FAILED"
  | "JOB_NOT_FOUND"
  | "INVALID_STATUS_TRANSITION"
  | "PROVIDER_ERROR"
  | "TIMEOUT"
  | "CANCELLED"
  | "ALL_ITEMS_FAILED"
  | "INTERNAL_ERROR";

/**
 * Job error with details
 */
export interface JobError {
  code: JobErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Valid job statuses
 */
export const JOB_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
  "timeout",
] as const;

/**
 * Terminal job statuses (no further transitions allowed)
 */
export const TERMINAL_STATUSES = [
  "completed",
  "failed",
  "cancelled",
  "timeout",
] as const;

/**
 * Tool categories
 */
export const TOOL_CATEGORIES = [
  "image",
  "video",
  "audio",
  "text",
  "avatar",
  "other",
] as const;

