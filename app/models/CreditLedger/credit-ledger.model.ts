/**
 * CreditLedger Model
 * 
 * Separate collection for credit transactions providing:
 * - Full audit trail of all credit operations
 * - Double-entry bookkeeping style ledger
 * - Source validation for credits
 * - Dashboard-ready transaction history
 */

import { Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

// Transaction types for credits
export type CreditTransactionType = 
  | "subscription_credit"      // Credits from subscription purchase
  | "subscription_renewal"     // Credits from subscription renewal
  | "addon_purchase"           // One-time credit purchase
  | "usage_deduction"          // Credits used for generation
  | "refund"                   // Refunded credits
  | "manual_adjustment"        // Admin manual adjustment
  | "bonus"                    // Promotional/referral bonus
  | "expiry"                   // Expired credits
  | "rollback"                 // System rollback
  | "sync_adjustment";         // Paddle sync adjustment

// Transaction status
export type CreditTransactionStatus = 
  | "completed"
  | "pending"
  | "failed"
  | "reversed";

// Source of the transaction
export type CreditSource = 
  | "paddle_webhook"
  | "paddle_api"
  | "system"
  | "admin"
  | "api"
  | "sync";

const creditLedgerSchema = new Mongoose.Schema(
  {
    // User reference (Clerk user ID)
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    
    // Transaction identification
    transaction_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Credit operation details
    type: {
      type: String,
      enum: [
        "subscription_credit",
        "subscription_renewal",
        "addon_purchase",
        "usage_deduction",
        "refund",
        "manual_adjustment",
        "bonus",
        "expiry",
        "rollback",
        "sync_adjustment",
      ],
      required: true,
      index: true,
    },
    
    // Amount (positive for credit, negative for debit)
    amount: {
      type: Number,
      required: true,
    },
    
    // Running balance after this transaction
    balance_before: {
      type: Number,
      required: true,
    },
    balance_after: {
      type: Number,
      required: true,
    },
    
    // Transaction status
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "reversed"],
      default: "completed",
      index: true,
    },
    
    // Source of transaction
    source: {
      type: String,
      enum: ["paddle_webhook", "paddle_api", "system", "admin", "api", "sync"],
      required: true,
      index: true,
    },
    
    // Human readable description
    description: {
      type: String,
      required: true,
    },
    
    // Payment provider references (for payment-related transactions)
    transaction_id: {
      type: String,
      sparse: true,
      index: true,
    },
    subscription_id: {
      type: String,
      sparse: true,
      index: true,
    },
    customer_id: {
      type: String,
      sparse: true,
    },
    price_id: {
      type: String,
      sparse: true,
    },
    product_id: {
      type: String,
      sparse: true,
    },
    
    // Usage tracking (for deductions)
    usage_details: {
      type: new Mongoose.Schema({
        operation_type: String,      // e.g., "image_generation", "video_generation"
        model_id: String,            // Model used
        quality: String,             // Quality setting
        generation_id: String,       // Reference to the generation
      }, { _id: false }),
      required: false,
    },
    
    // Related transaction (for refunds/reversals)
    related_transaction_ref: {
      type: String,
      sparse: true,
      index: true,
    },
    
    // Metadata for additional context
    metadata: {
      type: Map,
      of: Mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    
    // IP address for audit
    ip_address: {
      type: String,
      required: false,
    },
    
    // Idempotency key to prevent duplicate transactions
    idempotency_key: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "credit_ledger",
  }
);

// Compound indexes for efficient queries
// User transactions by date
creditLedgerSchema.index({ user_id: 1, createdAt: -1 });

// User transactions by type
creditLedgerSchema.index({ user_id: 1, type: 1, createdAt: -1 });

// User transactions by status
creditLedgerSchema.index({ user_id: 1, status: 1, createdAt: -1 });

// Transaction lookup
creditLedgerSchema.index({ transaction_id: 1 }, { sparse: true });

// For reconciliation queries
creditLedgerSchema.index({ 
  user_id: 1, 
  type: 1, 
  status: 1, 
  createdAt: -1 
});

// For dashboard aggregations
creditLedgerSchema.index({
  user_id: 1,
  type: 1,
  createdAt: 1,
});

// Interface for usage details
export interface IUsageDetails {
  operation_type?: string;
  model_id?: string;
  quality?: string;
  generation_id?: string;
}

// Interface for credit ledger entry
export interface ICreditLedgerEntry {
  user_id: string;
  transaction_ref: string;
  type: CreditTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: CreditTransactionStatus;
  source: CreditSource;
  description: string;
  transaction_id?: string;
  subscription_id?: string;
  customer_id?: string;
  price_id?: string;
  product_id?: string;
  usage_details?: IUsageDetails;
  related_transaction_ref?: string;
  metadata?: Map<string, unknown>;
  ip_address?: string;
  idempotency_key?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ICreditLedgerDocument extends Omit<ICreditLedgerEntry, '_id'>, Document {}

type ICreditLedgerModel = Model<ICreditLedgerDocument>;

const CreditLedger: ICreditLedgerModel =
  Mongoose.models?.credit_ledger || 
  Mongoose.model<ICreditLedgerDocument>("credit_ledger", creditLedgerSchema);

export default CreditLedger;

