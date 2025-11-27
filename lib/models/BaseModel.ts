import { Schema, Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

/**
 * Standard Status Types for all Hexwave.ai tool operations
 */
export type ProcessStatus = "processing" | "completed" | "failed";

/**
 * Standard Error Interface for consistent error handling
 */
export interface IProcessError {
  statusCode: number;
  errorMessage: string;
  errorType?: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

/**
 * Base interface for all Hexwave.ai tool models
 * Provides standardized fields that should be present in all schemas
 */
export interface IBaseModel {
  processId: string;
  userId: string;
  status: ProcessStatus;
  error?: IProcessError | null;
  generations: string[]; // Array of URLs, texts, or other generated content
  metadata: Record<string, unknown>; // Dynamic metadata for tool-specific requirements
  creditsUsed?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base Document interface extending Mongoose Document
 */
export interface IBaseDocument extends IBaseModel, Document {
  // Instance methods
  markCompleted(
    generations?: string[],
    metadata?: Record<string, unknown>
  ): Promise<this>;
  markFailed(
    statusCode: number,
    errorMessage: string,
    metadata?: Record<string, unknown>,
    errorType?: string,
    details?: Record<string, unknown>
  ): Promise<this>;
  updateProgress(metadata?: Record<string, unknown>): Promise<this>;
}

/**
 * Base Model interface with static methods
 */
export interface IBaseModelStatics<T extends IBaseDocument>
  extends Model<T> {
  findByUser(
    userId: string,
    options?: { status?: string; limit?: number; sort?: Record<string, number> }
  ): Promise<T[]>;
  findByProcessId(processId: string, userId?: string): Promise<T | null>;
  getPaginatedGenerations(options: {
    userId: string;
    status?: ProcessStatus | "all";
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    startDate?: Date | string;
    endDate?: Date | string;
    metadataFilter?: Record<string, unknown>;
  }): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>;
}

/**
 * Standard Error Schema for consistent error structure
 */
const ErrorSchema = new Schema(
  {
    statusCode: {
      type: Number,
      required: true,
      min: 100,
      max: 599,
    },
    errorMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    errorType: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Base Schema configuration that all models should extend
 * Provides standardized fields and indexes for optimal performance
 */
export function createBaseSchema(
  metadataFields: Record<string, unknown> = {}
): Schema {
  const schema = new Schema(
    {
      // Core identification fields
      processId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },
      userId: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      // Process status and error handling
      status: {
        type: String,
        enum: ["processing", "completed", "failed"],
        default: "processing",
        required: true,
        index: true,
      },
      error: {
        type: ErrorSchema,
        default: null,
      },

      // Generated content and metadata
      generations: {
        type: [String],
        default: [],
      },
      metadata: {
        type: Schema.Types.Mixed,
        default: {},
        ...metadataFields,
        // Common metadata fields for all tools
        isFavorite: { type: Boolean, default: false },
        shared: { type: Boolean, default: false },
        feedbackGiven: { type: Boolean, default: false },
        feedbackId: { type: String, trim: true },
        feedbackVerdict: {
          type: String,
          enum: ["positive", "negative"],
          default: null,
        },
        feedbackTimestamp: { type: Date },
      },
      creditsUsed: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

  // Compound indexes for better query performance
  schema.index({ userId: 1, status: 1 });
  schema.index({ userId: 1, createdAt: -1 });
  schema.index({ processId: 1, userId: 1 });
  schema.index({ createdAt: -1 });

  return schema;
}

/**
 * Add instance methods to schema
 */
function addInstanceMethods<T extends IBaseDocument>(schema: Schema): void {
  schema.methods.markCompleted = async function (
    generations: string[] = [],
    metadata: Record<string, unknown> = {}
  ): Promise<T> {
    this.status = "completed";
    this.generations = [...(this.generations || []), ...generations];
    this.metadata = { ...this.metadata, ...metadata };
    return await this.save();
  };

  schema.methods.markFailed = async function (
    statusCode: number,
    errorMessage: string,
    metadata: Record<string, unknown> = {},
    errorType?: string,
    details?: Record<string, unknown>
  ): Promise<T> {
    this.status = "failed";
    this.error = {
      statusCode,
      errorMessage,
      errorType,
      details,
      timestamp: new Date(),
    };
    this.metadata = { ...this.metadata, ...metadata };
    return await this.save();
  };

  schema.methods.updateProgress = async function (
    metadata: Record<string, unknown> = {}
  ): Promise<T> {
    this.metadata = { ...this.metadata, ...metadata };
    return await this.save();
  };
}

/**
 * Add static methods to schema
 */
function addStaticMethods<T extends IBaseDocument>(schema: Schema): void {
  schema.statics.findByUser = async function (
    userId: string,
    options: { status?: string; limit?: number; sort?: Record<string, number> } = {}
  ): Promise<T[]> {
    const query = this.find({ userId });
    if (options.status) query.where({ status: options.status });
    if (options.limit) query.limit(options.limit);
    query.sort(options.sort || { createdAt: -1 });
    return await query;
  };

  schema.statics.findByProcessId = async function (
    processId: string,
    userId?: string
  ): Promise<T | null> {
    const query = this.findOne({ processId });
    if (userId) query.where({ userId });
    return await query;
  };

  schema.statics.getPaginatedGenerations = async function (options: {
    userId: string;
    status?: ProcessStatus | "all";
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    startDate?: Date | string;
    endDate?: Date | string;
    metadataFilter?: Record<string, unknown>;
  }) {
    const {
      userId,
      status = "all",
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
      metadataFilter = {},
    } = options;

    // Build query filter
    const filter: Record<string, unknown> = { userId };

    // Add status filter if not 'all'
    if (status !== "all") {
      filter.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
      filter.createdAt = dateFilter;
    }

    // Add metadata filters
    Object.keys(metadataFilter).forEach((key) => {
      filter[`metadata.${key}`] = metadataFilter[key];
    });

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, number> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute count and find queries in parallel
    const [data, total] = await Promise.all([
      this.find(filter).sort(sort).limit(limit).skip(skip).lean(),
      this.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  };
}

/**
 * Base Model Factory
 * Creates a standardized model with proper indexing and validation
 * Uses global Mongoose.models pattern for single database
 */
export function createBaseModel<T extends IBaseDocument>(
  collectionName: string,
  modelName: string,
  metadataFields: Record<string, unknown> = {},
  additionalIndexes: Array<{
    fields: Record<string, number>;
    options?: Record<string, unknown>;
  }> = []
): Model<T> & IBaseModelStatics<T> {
  // Check if model already exists to avoid re-compilation
  if (Mongoose.models[modelName]) {
    return Mongoose.models[modelName] as Model<T> & IBaseModelStatics<T>;
  }

  // Create schema with base fields
  const schema = createBaseSchema(metadataFields);

  // Set collection name
  schema.set("collection", collectionName);

  // Add additional indexes
  additionalIndexes.forEach(({ fields, options }) => {
    schema.index(fields, options);
  });

  // Add instance methods
  addInstanceMethods<T>(schema);

  // Add static methods
  addStaticMethods<T>(schema);

  // Create and return the model
  return Mongoose.model<T>(
    modelName,
    schema,
    collectionName
  ) as Model<T> & IBaseModelStatics<T>;
}

/**
 * Export types for use in other files
 */
export type { IBaseDocument, IBaseModel, IProcessError };




