/**
 * ProcessJob Model
 *
 * Central model for tracking all generation jobs (image, video, audio, etc.)
 * Handles:
 * - Job lifecycle (pending → processing → completed/failed/cancelled)
 * - Credit tracking (charged, refunded)
 * - Webhook processing (idempotent)
 * - Real-time status updates
 * - Audit trail (status history)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Job status lifecycle:
 * - pending: Job created, credits deducted, waiting to start
 * - processing: Job is being processed by provider
 * - completed: Job finished successfully
 * - failed: Job failed (credits refunded)
 * - cancelled: Job cancelled by user (credits refunded)
 * - timeout: Job timed out (credits refunded)
 */
export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout";

/**
 * Tool category for the job
 */
export type ToolCategory = "image" | "video" | "audio" | "text" | "avatar" | "other";

/**
 * Status history entry for audit trail
 */
export interface IStatusHistoryEntry {
  status: JobStatus;
  timestamp: Date;
  reason?: string;
  actor?: "system" | "user" | "webhook" | "timeout";
  metadata?: Record<string, unknown>;
}

/**
 * Request data structure
 */
export interface IJobRequest {
  /** Original request parameters */
  params: Record<string, unknown>;
  /** API version (for backward compatibility) */
  version?: string;
  /** Request timestamp */
  timestamp: Date;
}

/**
 * Response data structure
 */
export interface IJobResponse {
  /** Successful response data */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Error code for categorization */
  errorCode?: string;
  /** Provider-specific response */
  providerResponse?: Record<string, unknown>;
}

/**
 * Credit tracking
 */
export interface ICreditInfo {
  /** Credits charged when job created */
  charged: number;
  /** Credits refunded (on failure/cancellation) */
  refunded: number;
  /** Reference to deduction transaction in CreditLedger */
  deductionRef?: string;
  /** Reference to refund transaction in CreditLedger */
  refundRef?: string;
  /** Whether refund is pending */
  refundPending: boolean;
}

/**
 * Webhook tracking
 */
export interface IWebhookInfo {
  /** Whether webhook has been received */
  received: boolean;
  /** Timestamp of webhook receipt */
  receivedAt?: Date;
  /** External job ID from provider */
  externalJobId?: string;
  /** Provider name */
  provider?: string;
  /** Number of webhook attempts */
  attemptCount: number;
  /** Last webhook payload (for debugging) */
  lastPayload?: Record<string, unknown>;
}

/**
 * Progress tracking (for multi-step jobs)
 */
export interface IProgressInfo {
  /** Total expected items (e.g., images) */
  total: number;
  /** Completed items */
  completed: number;
  /** Failed items */
  failed: number;
  /** Current percentage (0-100) */
  percentage: number;
  /** Current step description */
  currentStep?: string;
}

/**
 * ProcessJob Document Interface
 */
export interface IProcessJob extends Document {
  // Core Identifiers
  jobId: string;
  userId: string;

  // Status
  status: JobStatus;
  statusHistory: IStatusHistoryEntry[];

  // Job Details
  category: ToolCategory;
  toolId: string;
  toolName?: string;

  // Request/Response
  request: IJobRequest;
  response?: IJobResponse;

  // Credit Tracking
  credits: ICreditInfo;

  // Webhook Tracking
  webhook: IWebhookInfo;

  // Progress (for multi-step jobs)
  progress?: IProgressInfo;

  // Timing
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;

  // Idempotency
  idempotencyKey?: string;

  // Metadata
  metadata?: Map<string, unknown>;

  // Virtual fields
  readonly isComplete: boolean;
  readonly isFailed: boolean;
  readonly isRefundable: boolean;
  readonly duration: number | null;
}

/**
 * Static methods interface
 */
export interface IProcessJobModel extends Model<IProcessJob> {
  findByJobId(jobId: string): Promise<IProcessJob | null>;
  findByExternalJobId(externalJobId: string): Promise<IProcessJob | null>;
  findByIdempotencyKey(key: string): Promise<IProcessJob | null>;
  findUserJobs(
    userId: string,
    options?: {
      status?: JobStatus | JobStatus[];
      category?: ToolCategory;
      limit?: number;
      offset?: number;
    }
  ): Promise<IProcessJob[]>;
  countUserJobs(userId: string, status?: JobStatus | JobStatus[]): Promise<number>;
}

// =============================================================================
// SCHEMA
// =============================================================================

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled", "timeout"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    reason: String,
    actor: {
      type: String,
      enum: ["system", "user", "webhook", "timeout"],
      default: "system",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const JobRequestSchema = new Schema<IJobRequest>(
  {
    params: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    version: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const JobResponseSchema = new Schema<IJobResponse>(
  {
    data: Schema.Types.Mixed,
    error: String,
    errorCode: String,
    providerResponse: Schema.Types.Mixed,
  },
  { _id: false }
);

const CreditInfoSchema = new Schema<ICreditInfo>(
  {
    charged: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    refunded: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductionRef: String,
    refundRef: String,
    refundPending: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const WebhookInfoSchema = new Schema<IWebhookInfo>(
  {
    received: {
      type: Boolean,
      default: false,
    },
    receivedAt: Date,
    externalJobId: {
      type: String,
      index: true,
      sparse: true,
    },
    provider: String,
    attemptCount: {
      type: Number,
      default: 0,
    },
    lastPayload: Schema.Types.Mixed,
  },
  { _id: false }
);

const ProgressInfoSchema = new Schema<IProgressInfo>(
  {
    total: {
      type: Number,
      default: 1,
      min: 1,
    },
    completed: {
      type: Number,
      default: 0,
      min: 0,
    },
    failed: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStep: String,
  },
  { _id: false }
);

const ProcessJobSchema = new Schema<IProcessJob, IProcessJobModel>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled", "timeout"],
      required: true,
      default: "pending",
      index: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    category: {
      type: String,
      enum: ["image", "video", "audio", "text", "avatar", "other"],
      required: true,
      index: true,
    },
    toolId: {
      type: String,
      required: true,
      index: true,
    },
    toolName: String,
    request: {
      type: JobRequestSchema,
      required: true,
    },
    response: JobResponseSchema,
    credits: {
      type: CreditInfoSchema,
      required: true,
      default: () => ({
        charged: 0,
        refunded: 0,
        refundPending: false,
      }),
    },
    webhook: {
      type: WebhookInfoSchema,
      default: () => ({
        received: false,
        attemptCount: 0,
      }),
    },
    progress: ProgressInfoSchema,
    startedAt: Date,
    completedAt: Date,
    expiresAt: {
      type: Date,
      index: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "process_jobs",
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// Compound indexes for common queries
ProcessJobSchema.index({ userId: 1, status: 1, createdAt: -1 });
ProcessJobSchema.index({ userId: 1, category: 1, createdAt: -1 });
ProcessJobSchema.index({ userId: 1, createdAt: -1 });
ProcessJobSchema.index({ status: 1, createdAt: -1 });
ProcessJobSchema.index({ "webhook.externalJobId": 1 }, { sparse: true });
ProcessJobSchema.index({ "credits.refundPending": 1 }, { sparse: true });
// TTL index for auto-cleanup of old completed jobs (optional, 90 days)
ProcessJobSchema.index(
  { completedAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { status: "completed" } }
);

// =============================================================================
// VIRTUALS
// =============================================================================

ProcessJobSchema.virtual("isComplete").get(function () {
  return this.status === "completed";
});

ProcessJobSchema.virtual("isFailed").get(function () {
  return ["failed", "cancelled", "timeout"].includes(this.status);
});

ProcessJobSchema.virtual("isRefundable").get(function () {
  return (
    this.isFailed &&
    this.credits.charged > 0 &&
    this.credits.refunded === 0 &&
    !this.credits.refundPending
  );
});

ProcessJobSchema.virtual("duration").get(function () {
  if (!this.startedAt) return null;
  const endTime = this.completedAt || new Date();
  return endTime.getTime() - this.startedAt.getTime();
});

// =============================================================================
// STATIC METHODS
// =============================================================================

ProcessJobSchema.statics.findByJobId = function (jobId: string) {
  return this.findOne({ jobId });
};

ProcessJobSchema.statics.findByExternalJobId = function (externalJobId: string) {
  return this.findOne({ "webhook.externalJobId": externalJobId });
};

ProcessJobSchema.statics.findByIdempotencyKey = function (key: string) {
  return this.findOne({ idempotencyKey: key });
};

ProcessJobSchema.statics.findUserJobs = function (
  userId: string,
  options?: {
    status?: JobStatus | JobStatus[];
    category?: ToolCategory;
    limit?: number;
    offset?: number;
  }
) {
  const query: Record<string, unknown> = { userId };

  if (options?.status) {
    query.status = Array.isArray(options.status)
      ? { $in: options.status }
      : options.status;
  }

  if (options?.category) {
    query.category = options.category;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(options?.offset || 0)
    .limit(options?.limit || 50);
};

ProcessJobSchema.statics.countUserJobs = function (
  userId: string,
  status?: JobStatus | JobStatus[]
) {
  const query: Record<string, unknown> = { userId };

  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }

  return this.countDocuments(query);
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Add initial status to history on create
ProcessJobSchema.pre("save", function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      actor: "system",
    });
  }
  next();
});

// =============================================================================
// MODEL
// =============================================================================

const ProcessJob =
  (mongoose.models.ProcessJob as IProcessJobModel) ||
  mongoose.model<IProcessJob, IProcessJobModel>("ProcessJob", ProcessJobSchema);

export default ProcessJob;


