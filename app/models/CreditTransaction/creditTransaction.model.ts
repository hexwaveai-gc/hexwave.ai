/**
 * Credit Transaction Model
 * 
 * Tracks all credit operations (deductions, refunds, additions)
 * for user transaction history and auditing.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  CreditTransactionType,
  CreditTransactionStatus,
  ToolCategory,
  ICreditTransaction,
} from "@/lib/credits/types";


export interface ICreditTransactionDocument
  extends Omit<ICreditTransaction, "_id">,
    Document {}


const CreditTransactionSchema = new Schema<ICreditTransactionDocument>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    processId: {
      type: String,
      default: null,
      index: true,
      sparse: true, // Allow null values while maintaining index
    },
    type: {
      type: String,
      enum: ["DEDUCTION", "REFUND", "CREDIT_ADDED"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["image", "video", null],
      default: null,
    },
    toolName: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED"],
      default: "SUCCESS",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "credit_transactions",
  }
);



// Compound index for user transaction history queries
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });

// Compound index for finding transactions by type
CreditTransactionSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Index for finding refunds by processId (idempotency check)
CreditTransactionSchema.index({ processId: 1, type: 1 });

// Index for admin/analytics queries
CreditTransactionSchema.index({ type: 1, createdAt: -1 });
CreditTransactionSchema.index({ status: 1, createdAt: -1 });

CreditTransactionSchema.statics.findByUser = async function (
  userId: string,
  options: {
    type?: CreditTransactionType;
    limit?: number;
    skip?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<ICreditTransactionDocument[]> {
  const query: Record<string, unknown> = { userId };

  if (options.type) {
    query.type = options.type;
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      (query.createdAt as Record<string, Date>).$gte = options.startDate;
    }
    if (options.endDate) {
      (query.createdAt as Record<string, Date>).$lte = options.endDate;
    }
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 50)
    .lean();
};

CreditTransactionSchema.statics.hasRefundForProcess = async function (
  processId: string
): Promise<boolean> {
  const existingRefund = await this.findOne({
    processId,
    type: "REFUND",
    status: "SUCCESS",
  });
  return !!existingRefund;
};

CreditTransactionSchema.statics.getTransactionSummary = async function (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalDeducted: number;
  totalRefunded: number;
  totalAdded: number;
  netChange: number;
}> {
  const matchStage: Record<string, unknown> = { userId };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      (matchStage.createdAt as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (matchStage.createdAt as Record<string, Date>).$lte = endDate;
    }
  }

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const summary = {
    totalDeducted: 0,
    totalRefunded: 0,
    totalAdded: 0,
    netChange: 0,
  };

  for (const item of result) {
    switch (item._id) {
      case "DEDUCTION":
        summary.totalDeducted = item.total;
        break;
      case "REFUND":
        summary.totalRefunded = item.total;
        break;
      case "CREDIT_ADDED":
        summary.totalAdded = item.total;
        break;
    }
  }

  summary.netChange =
    summary.totalAdded + summary.totalRefunded - summary.totalDeducted;

  return summary;
};


export interface ICreditTransactionModel
  extends Model<ICreditTransactionDocument> {
  findByUser(
    userId: string,
    options?: {
      type?: CreditTransactionType;
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ICreditTransactionDocument[]>;

  hasRefundForProcess(processId: string): Promise<boolean>;

  getTransactionSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalDeducted: number;
    totalRefunded: number;
    totalAdded: number;
    netChange: number;
  }>;
}


const CreditTransaction: ICreditTransactionModel =
  (mongoose.models.credit_transactions as ICreditTransactionModel) ||
  mongoose.model<ICreditTransactionDocument, ICreditTransactionModel>(
    "credit_transactions",
    CreditTransactionSchema
  );

export default CreditTransaction;

