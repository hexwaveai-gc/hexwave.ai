/**
 * Services Index
 *
 * Central export point for all application services.
 */

// =============================================================================
// CREDIT SERVICE
// =============================================================================

export {
  CreditService,
  addCredits,
  deductCredits,
  refundCredits,
  getBalance,
  validateBalance,
  verifyBalance,
  syncFromPaddle,
  getUsageSummary,
  getTransactionHistory,
  type CreditOperationResult,
  type AddCreditsInput,
  type DeductCreditsInput,
  type RefundCreditsInput,
} from "./CreditService";

// =============================================================================
// PROCESS JOB SERVICE
// =============================================================================

export {
  ProcessJobService,
  createJob,
  getJob,
  updateJobStatus,
  completeJob,
  failJob,
  cancelJob,
  updateJobProgress,
  handleWebhook,
  linkExternalJobId,
  getUserJobs,
  type CreateJobOptions,
  type CreateJobResult,
  type UpdateJobOptions,
  type UpdateJobResult,
  type UpdateProgressOptions,
  type WebhookOptions,
  type WebhookResult,
  type GetJobsOptions,
} from "./ProcessJobService";

