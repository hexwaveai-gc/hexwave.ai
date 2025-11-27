/**
 * ProcessJobService - Centralized Job Management
 *
 * Production-grade service for managing generation jobs:
 * - Job creation with credit deduction
 * - Status updates with audit trail
 * - Automatic credit refunds on failure
 * - Webhook handling (idempotent)
 * - Real-time notifications via Ably
 *
 * This is the SINGLE source of truth for all job operations.
 */

import { v4 as uuidv4 } from "uuid";
import { dbConnect } from "@/lib/db";
import ProcessJob, {
  type IProcessJob,
  type JobStatus,
  type ToolCategory,
  type IJobRequest,
  type IStatusHistoryEntry,
  type IProgressInfo,
} from "@/app/models/ProcessJob/process-job.model";
import { CreditService } from "@/lib/services/CreditService";
import { publishProcessStatus } from "@/lib/ably";
import { logInfo, logError, logWarn, logCredits } from "@/lib/logger";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options for creating a new job
 */
export interface CreateJobOptions {
  /** User ID (Clerk) */
  userId: string;
  /** Credits required for this job */
  credits: number;
  /** Job category */
  category: ToolCategory;
  /** Tool ID (e.g., "flux-pro", "heygen") */
  toolId: string;
  /** Human-readable tool name */
  toolName?: string;
  /** Request parameters */
  params: Record<string, unknown>;
  /** API version */
  version?: string;
  /** Idempotency key to prevent duplicates */
  idempotencyKey?: string;
  /** Expected total items (for progress tracking) */
  expectedItems?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Job expiration time (ms from now) */
  expiresIn?: number;
}

/**
 * Result of job creation
 */
export interface CreateJobResult {
  success: boolean;
  jobId?: string;
  job?: IProcessJob;
  transactionRef?: string;
  error?: string;
  errorCode?: "INSUFFICIENT_CREDITS" | "USER_NOT_FOUND" | "DUPLICATE_JOB" | "TRANSACTION_FAILED" | "INTERNAL_ERROR";
  availableCredits?: number;
}

/**
 * Options for updating job status
 */
export interface UpdateJobOptions {
  /** New status */
  status: JobStatus;
  /** Response data (for completed jobs) */
  responseData?: Record<string, unknown>;
  /** Error message (for failed jobs) */
  error?: string;
  /** Error code */
  errorCode?: string;
  /** Who triggered this update */
  actor?: "system" | "user" | "webhook" | "timeout";
  /** Reason for status change */
  reason?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Skip Ably notification */
  skipNotification?: boolean;
}

/**
 * Result of job update
 */
export interface UpdateJobResult {
  success: boolean;
  job?: IProcessJob;
  refunded?: boolean;
  refundAmount?: number;
  error?: string;
}

/**
 * Options for updating job progress
 */
export interface UpdateProgressOptions {
  /** Items completed in this update */
  completedItems?: number;
  /** Items failed in this update */
  failedItems?: number;
  /** Data for completed items */
  itemData?: unknown[];
  /** Current step description */
  currentStep?: string;
  /** Error for failed items */
  error?: string;
}

/**
 * Options for handling webhooks
 */
export interface WebhookOptions {
  /** External job ID from provider */
  externalJobId: string;
  /** Provider name */
  provider: string;
  /** Webhook status */
  status: "processing" | "completed" | "failed";
  /** Response data */
  data?: Record<string, unknown>;
  /** Error message */
  error?: string;
  /** Error code */
  errorCode?: string;
  /** Raw webhook payload */
  payload?: Record<string, unknown>;
}

/**
 * Result of webhook handling
 */
export interface WebhookResult {
  success: boolean;
  jobId?: string;
  job?: IProcessJob;
  alreadyProcessed?: boolean;
  error?: string;
}

/**
 * Options for querying jobs
 */
export interface GetJobsOptions {
  status?: JobStatus | JobStatus[];
  category?: ToolCategory;
  toolId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// =============================================================================
// SERVICE CLASS
// =============================================================================

class ProcessJobServiceClass {
  private static instance: ProcessJobServiceClass;

  private constructor() {}

  public static getInstance(): ProcessJobServiceClass {
    if (!ProcessJobServiceClass.instance) {
      ProcessJobServiceClass.instance = new ProcessJobServiceClass();
    }
    return ProcessJobServiceClass.instance;
  }

  // ===========================================================================
  // JOB CREATION
  // ===========================================================================

  /**
   * Create a new job with credit deduction
   *
   * Flow:
   * 1. Check idempotency (return existing job if duplicate)
   * 2. Validate user has sufficient credits
   * 3. Deduct credits via CreditService
   * 4. Create job record
   * 5. If job creation fails, refund credits
   * 6. Notify via Ably
   */
  async createJob(options: CreateJobOptions): Promise<CreateJobResult> {
    const {
      userId,
      credits,
      category,
      toolId,
      toolName,
      params,
      version,
      idempotencyKey,
      expectedItems = 1,
      metadata,
      expiresIn,
    } = options;

    const jobId = uuidv4();
    const effectiveIdempotencyKey = idempotencyKey || `job_${jobId}`;

    try {
      await dbConnect();

      // Step 1: Check idempotency
      if (idempotencyKey) {
        const existingJob = await ProcessJob.findByIdempotencyKey(idempotencyKey);
        if (existingJob) {
          logInfo("Duplicate job request detected", {
            jobId: existingJob.jobId,
            idempotencyKey,
            userId,
          });
          return {
            success: true,
            jobId: existingJob.jobId,
            job: existingJob,
            transactionRef: existingJob.credits.deductionRef,
          };
        }
      }

      // Step 2: Validate credits
      if (credits > 0) {
        const validation = await CreditService.validateBalance(userId, credits);
        if (!validation.valid) {
          return {
            success: false,
            error: `Insufficient credits. Required: ${credits}, Available: ${validation.balance}`,
            errorCode: "INSUFFICIENT_CREDITS",
            availableCredits: validation.balance,
          };
        }
      }

      // Step 3: Deduct credits
      let transactionRef: string | undefined;
      if (credits > 0) {
        const description = this.generateCreditDescription(category, toolName || toolId, "deduction");
        
        const deductResult = await CreditService.deductCredits({
          userId,
          amount: credits,
          description,
          usageDetails: {
            operation_type: `${category}_generation`,
            model_id: toolId,
            generation_id: jobId,
          },
          idempotencyKey: effectiveIdempotencyKey,
        });

        if (!deductResult.success) {
          const errorCode = deductResult.error_code === "INSUFFICIENT_BALANCE"
            ? "INSUFFICIENT_CREDITS"
            : deductResult.error_code === "USER_NOT_FOUND"
              ? "USER_NOT_FOUND"
              : "TRANSACTION_FAILED";

          return {
            success: false,
            error: deductResult.error || "Failed to deduct credits",
            errorCode,
            availableCredits: deductResult.balance_before,
          };
        }

        transactionRef = deductResult.transaction_ref;

        logCredits("deduct", credits, {
          userId,
          jobId,
          toolId,
          category,
          transactionRef,
        });
      }

      // Step 4: Create job record
      try {
        const request: IJobRequest = {
          params,
          version,
          timestamp: new Date(),
        };

        const job = await ProcessJob.create({
          jobId,
          userId,
          status: "pending",
          category,
          toolId,
          toolName,
          request,
          credits: {
            charged: credits,
            refunded: 0,
            deductionRef: transactionRef,
            refundPending: false,
          },
          webhook: {
            received: false,
            attemptCount: 0,
          },
          progress: {
            total: expectedItems,
            completed: 0,
            failed: 0,
            percentage: 0,
          },
          idempotencyKey: effectiveIdempotencyKey,
          metadata: metadata ? new Map(Object.entries(metadata)) : undefined,
          expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
        });

        logInfo("Job created successfully", {
          jobId,
          userId,
          category,
          toolId,
          credits,
          transactionRef,
        });

        // Step 5: Notify via Ably
        await this.notifyStatus(jobId, "pending", { category, toolId });

        return {
          success: true,
          jobId,
          job,
          transactionRef,
        };

      } catch (createError) {
        // Job creation failed - refund credits
        logError("Job creation failed, initiating refund", createError, {
          jobId,
          userId,
          credits,
        });

        if (credits > 0 && transactionRef) {
          await this.refundCredits(userId, credits, jobId, transactionRef, "Job creation failed");
        }

        return {
          success: false,
          error: "Failed to create job record",
          errorCode: "INTERNAL_ERROR",
        };
      }

    } catch (error) {
      logError("Unexpected error in createJob", error, {
        jobId,
        userId,
        category,
        toolId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "INTERNAL_ERROR",
      };
    }
  }

  // ===========================================================================
  // STATUS UPDATES
  // ===========================================================================

  /**
   * Update job status with automatic refund on failure
   */
  async updateStatus(jobId: string, options: UpdateJobOptions): Promise<UpdateJobResult> {
    const {
      status,
      responseData,
      error,
      errorCode,
      actor = "system",
      reason,
      metadata,
      skipNotification = false,
    } = options;

    try {
      await dbConnect();

      const job = await ProcessJob.findByJobId(jobId);
      if (!job) {
        return {
          success: false,
          error: "Job not found",
        };
      }

      // Prevent invalid status transitions
      if (!this.isValidTransition(job.status, status)) {
        logWarn("Invalid status transition attempted", {
          jobId,
          currentStatus: job.status,
          newStatus: status,
        });
        return {
          success: false,
          error: `Invalid status transition from ${job.status} to ${status}`,
        };
      }

      // Build update
      const statusEntry: IStatusHistoryEntry = {
        status,
        timestamp: new Date(),
        actor,
        reason,
        metadata,
      };

      const updateData: Record<string, unknown> = {
        status,
        $push: { statusHistory: statusEntry },
        updatedAt: new Date(),
      };

      // Set timing fields
      if (status === "processing" && !job.startedAt) {
        updateData.startedAt = new Date();
      }

      if (["completed", "failed", "cancelled", "timeout"].includes(status)) {
        updateData.completedAt = new Date();
      }

      // Set response data
      if (responseData || error) {
        updateData.response = {
          data: responseData,
          error,
          errorCode,
        };
      }

      // Update progress for completed
      if (status === "completed" && job.progress) {
        updateData["progress.completed"] = job.progress.total;
        updateData["progress.percentage"] = 100;
      }

      const updatedJob = await ProcessJob.findOneAndUpdate(
        { jobId },
        updateData,
        { new: true }
      );

      if (!updatedJob) {
        return {
          success: false,
          error: "Failed to update job",
        };
      }

      logInfo("Job status updated", {
        jobId,
        userId: job.userId,
        previousStatus: job.status,
        newStatus: status,
        actor,
      });

      // Handle refund for failed jobs
      let refunded = false;
      let refundAmount = 0;

      if (["failed", "cancelled", "timeout"].includes(status) && job.credits.charged > 0 && job.credits.refunded === 0) {
        const refundResult = await this.refundCredits(
          job.userId,
          job.credits.charged,
          jobId,
          job.credits.deductionRef,
          reason || `Job ${status}`
        );

        if (refundResult.success) {
          refunded = true;
          refundAmount = job.credits.charged;

          // Update job with refund info
          await ProcessJob.findOneAndUpdate(
            { jobId },
            {
              "credits.refunded": job.credits.charged,
              "credits.refundRef": refundResult.transactionRef,
              "credits.refundPending": false,
            }
          );
        }
      }

      // Notify via Ably
      if (!skipNotification) {
        await this.notifyStatus(jobId, status, {
          data: responseData,
          error,
          refunded,
          refundAmount,
        });
      }

      return {
        success: true,
        job: updatedJob,
        refunded,
        refundAmount,
      };

    } catch (error) {
      logError("Error updating job status", error, { jobId, status });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark job as completed
   */
  async completeJob(
    jobId: string,
    responseData: Record<string, unknown>,
    actor: "system" | "webhook" = "system"
  ): Promise<UpdateJobResult> {
    return this.updateStatus(jobId, {
      status: "completed",
      responseData,
      actor,
      reason: "Job completed successfully",
    });
  }

  /**
   * Mark job as failed with automatic refund
   */
  async failJob(
    jobId: string,
    error: string,
    errorCode?: string,
    actor: "system" | "webhook" | "timeout" = "system"
  ): Promise<UpdateJobResult> {
    return this.updateStatus(jobId, {
      status: "failed",
      error,
      errorCode,
      actor,
      reason: error,
    });
  }

  /**
   * Cancel job with automatic refund
   */
  async cancelJob(jobId: string, reason: string): Promise<UpdateJobResult> {
    return this.updateStatus(jobId, {
      status: "cancelled",
      actor: "user",
      reason,
    });
  }

  /**
   * Mark job as timed out with automatic refund
   */
  async timeoutJob(jobId: string): Promise<UpdateJobResult> {
    return this.updateStatus(jobId, {
      status: "timeout",
      actor: "timeout",
      reason: "Job exceeded maximum processing time",
      error: "Job timed out",
      errorCode: "TIMEOUT",
    });
  }

  /**
   * Update job to processing state
   */
  async startProcessing(jobId: string, externalJobId?: string): Promise<UpdateJobResult> {
    try {
      await dbConnect();

      const updateData: Record<string, unknown> = {
        status: "processing",
        startedAt: new Date(),
        $push: {
          statusHistory: {
            status: "processing",
            timestamp: new Date(),
            actor: "system",
          },
        },
      };

      if (externalJobId) {
        updateData["webhook.externalJobId"] = externalJobId;
      }

      const job = await ProcessJob.findOneAndUpdate(
        { jobId, status: "pending" },
        updateData,
        { new: true }
      );

      if (!job) {
        return {
          success: false,
          error: "Job not found or not in pending state",
        };
      }

      await this.notifyStatus(jobId, "processing");

      return { success: true, job };

    } catch (error) {
      logError("Error starting job processing", error, { jobId });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===========================================================================
  // PROGRESS UPDATES
  // ===========================================================================

  /**
   * Update job progress (for multi-step jobs)
   */
  async updateProgress(jobId: string, options: UpdateProgressOptions): Promise<UpdateJobResult> {
    const { completedItems = 0, failedItems = 0, itemData, currentStep, error } = options;

    try {
      await dbConnect();

      const job = await ProcessJob.findByJobId(jobId);
      if (!job) {
        return { success: false, error: "Job not found" };
      }

      if (!job.progress) {
        return { success: false, error: "Job does not support progress tracking" };
      }

      const newCompleted = job.progress.completed + completedItems;
      const newFailed = job.progress.failed + failedItems;
      const total = job.progress.total;
      const percentage = Math.round(((newCompleted + newFailed) / total) * 100);

      const updateData: Record<string, unknown> = {
        "progress.completed": newCompleted,
        "progress.failed": newFailed,
        "progress.percentage": percentage,
        updatedAt: new Date(),
      };

      if (currentStep) {
        updateData["progress.currentStep"] = currentStep;
      }

      // Append item data to response
      if (itemData && itemData.length > 0) {
        updateData.$push = {
          "response.data.items": { $each: itemData },
        };
      }

      // Check if job is complete
      const isComplete = newCompleted + newFailed >= total;
      const allFailed = newFailed >= total;

      if (isComplete) {
        if (allFailed) {
          return this.failJob(jobId, error || "All items failed", "ALL_ITEMS_FAILED");
        } else {
          updateData.status = "completed";
          updateData.completedAt = new Date();
          updateData.$push = {
            ...updateData.$push,
            statusHistory: {
              status: "completed",
              timestamp: new Date(),
              actor: "system",
            },
          };
        }
      }

      const updatedJob = await ProcessJob.findOneAndUpdate(
        { jobId },
        updateData,
        { new: true }
      );

      // Notify progress
      await this.notifyStatus(jobId, updatedJob?.status || job.status, {
        progress: {
          completed: newCompleted,
          failed: newFailed,
          total,
          percentage,
        },
        items: itemData,
      });

      return { success: true, job: updatedJob || undefined };

    } catch (error) {
      logError("Error updating job progress", error, { jobId });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===========================================================================
  // WEBHOOK HANDLING
  // ===========================================================================

  /**
   * Handle webhook from external provider (idempotent)
   */
  async handleWebhook(options: WebhookOptions): Promise<WebhookResult> {
    const { externalJobId, provider, status, data, error, errorCode, payload } = options;

    try {
      await dbConnect();

      // Find job by external ID
      const job = await ProcessJob.findByExternalJobId(externalJobId);
      if (!job) {
        logWarn("Webhook received for unknown job", { externalJobId, provider });
        return {
          success: false,
          error: "Job not found",
        };
      }

      // Check if webhook already processed (idempotency)
      if (job.webhook.received && job.status !== "processing") {
        logInfo("Webhook already processed", {
          jobId: job.jobId,
          externalJobId,
          currentStatus: job.status,
        });
        return {
          success: true,
          jobId: job.jobId,
          job,
          alreadyProcessed: true,
        };
      }

      // Update webhook info
      await ProcessJob.findOneAndUpdate(
        { jobId: job.jobId },
        {
          "webhook.received": true,
          "webhook.receivedAt": new Date(),
          "webhook.provider": provider,
          $inc: { "webhook.attemptCount": 1 },
          "webhook.lastPayload": payload,
        }
      );

      // Process based on status
      let result: UpdateJobResult;

      switch (status) {
        case "completed":
          result = await this.completeJob(job.jobId, data || {}, "webhook");
          break;
        case "failed":
          result = await this.failJob(job.jobId, error || "Provider error", errorCode, "webhook");
          break;
        case "processing":
          result = await this.startProcessing(job.jobId, externalJobId);
          break;
        default:
          return {
            success: false,
            error: `Unknown webhook status: ${status}`,
          };
      }

      if (!result.success) {
        return {
          success: false,
          jobId: job.jobId,
          error: result.error,
        };
      }

      logInfo("Webhook processed successfully", {
        jobId: job.jobId,
        externalJobId,
        provider,
        status,
      });

      return {
        success: true,
        jobId: job.jobId,
        job: result.job,
      };

    } catch (error) {
      logError("Error handling webhook", error, { externalJobId, provider });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Link external job ID to our job (for providers that return ID asynchronously)
   */
  async linkExternalJobId(jobId: string, externalJobId: string, provider: string): Promise<boolean> {
    try {
      await dbConnect();

      const result = await ProcessJob.findOneAndUpdate(
        { jobId },
        {
          "webhook.externalJobId": externalJobId,
          "webhook.provider": provider,
        }
      );

      return !!result;
    } catch (error) {
      logError("Error linking external job ID", error, { jobId, externalJobId });
      return false;
    }
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<IProcessJob | null> {
    await dbConnect();
    return ProcessJob.findByJobId(jobId);
  }

  /**
   * Get job by external provider ID
   */
  async getJobByExternalId(externalJobId: string): Promise<IProcessJob | null> {
    await dbConnect();
    return ProcessJob.findByExternalJobId(externalJobId);
  }

  /**
   * Get user's jobs
   */
  async getUserJobs(userId: string, options?: GetJobsOptions): Promise<IProcessJob[]> {
    await dbConnect();

    const query: Record<string, unknown> = { userId };

    if (options?.status) {
      query.status = Array.isArray(options.status)
        ? { $in: options.status }
        : options.status;
    }

    if (options?.category) {
      query.category = options.category;
    }

    if (options?.toolId) {
      query.toolId = options.toolId;
    }

    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    return ProcessJob.find(query)
      .sort({ createdAt: -1 })
      .skip(options?.offset || 0)
      .limit(options?.limit || 50);
  }

  /**
   * Count user's jobs
   */
  async countUserJobs(userId: string, status?: JobStatus | JobStatus[]): Promise<number> {
    await dbConnect();
    return ProcessJob.countUserJobs(userId, status);
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /**
   * Refund credits for a job
   */
  private async refundCredits(
    userId: string,
    amount: number,
    jobId: string,
    originalTransactionRef?: string,
    reason?: string
  ): Promise<{ success: boolean; transactionRef?: string }> {
    try {
      const description = reason
        ? `Refund: ${reason}`
        : `Refund for job ${jobId}`;

      const result = await CreditService.refundCredits({
        userId,
        amount,
        description,
        relatedTransactionRef: originalTransactionRef,
        source: "system",
        metadata: {
          jobId,
          reason: reason || "job_failed",
        },
      });

      if (result.success) {
        logCredits("refund", amount, {
          userId,
          jobId,
          reason,
          transactionRef: result.transaction_ref,
        });
      } else {
        logError("Failed to refund credits", new Error(result.error || "Unknown"), {
          userId,
          jobId,
          amount,
        });
      }

      return {
        success: result.success,
        transactionRef: result.transaction_ref,
      };

    } catch (error) {
      logError("Exception refunding credits", error, { userId, jobId, amount });
      return { success: false };
    }
  }

  /**
   * Notify job status via Ably
   */
  private async notifyStatus(
    jobId: string,
    status: JobStatus,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await publishProcessStatus(jobId, {
        status,
        data,
      });
      logInfo("Published job status to Ably", { jobId, status });
    } catch (error) {
      // Non-blocking - log but don't throw
      logError("Failed to publish job status to Ably", error, { jobId, status });
    }
  }

  /**
   * Generate credit transaction description
   */
  private generateCreditDescription(
    category: ToolCategory,
    toolName: string,
    type: "deduction" | "refund"
  ): string {
    const categoryLabel = {
      image: "Image",
      video: "Video",
      audio: "Audio",
      text: "Text",
      avatar: "Avatar",
      other: "Content",
    }[category];

    if (type === "refund") {
      return `Refund: Failed ${categoryLabel.toLowerCase()} generation with ${toolName}`;
    }

    return `${categoryLabel} generation with ${toolName}`;
  }

  /**
   * Check if status transition is valid
   */
  private isValidTransition(currentStatus: JobStatus, newStatus: JobStatus): boolean {
    const validTransitions: Record<JobStatus, JobStatus[]> = {
      pending: ["processing", "failed", "cancelled", "timeout"],
      processing: ["completed", "failed", "cancelled", "timeout"],
      completed: [], // Terminal state
      failed: [], // Terminal state
      cancelled: [], // Terminal state
      timeout: [], // Terminal state
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export singleton instance
export const ProcessJobService = ProcessJobServiceClass.getInstance();

// Export convenience functions
export const createJob = (options: CreateJobOptions) => ProcessJobService.createJob(options);
export const getJob = (jobId: string) => ProcessJobService.getJob(jobId);
export const updateJobStatus = (jobId: string, options: UpdateJobOptions) =>
  ProcessJobService.updateStatus(jobId, options);
export const completeJob = (jobId: string, data: Record<string, unknown>) =>
  ProcessJobService.completeJob(jobId, data);
export const failJob = (jobId: string, error: string, errorCode?: string) =>
  ProcessJobService.failJob(jobId, error, errorCode);
export const cancelJob = (jobId: string, reason: string) =>
  ProcessJobService.cancelJob(jobId, reason);
export const updateJobProgress = (jobId: string, options: UpdateProgressOptions) =>
  ProcessJobService.updateProgress(jobId, options);
export const handleWebhook = (options: WebhookOptions) =>
  ProcessJobService.handleWebhook(options);
export const linkExternalJobId = (jobId: string, externalJobId: string, provider: string) =>
  ProcessJobService.linkExternalJobId(jobId, externalJobId, provider);
export const getUserJobs = (userId: string, options?: GetJobsOptions) =>
  ProcessJobService.getUserJobs(userId, options);

// Export types
export type {
  CreateJobOptions,
  CreateJobResult,
  UpdateJobOptions,
  UpdateJobResult,
  UpdateProgressOptions,
  WebhookOptions,
  WebhookResult,
  GetJobsOptions,
};


