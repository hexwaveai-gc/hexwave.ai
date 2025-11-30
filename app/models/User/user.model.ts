/**
 * User Model
 * 
 * Core user schema with subscription and balance tracking.
 * Credit history is stored in separate CreditLedger collection.
 */

import { Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

const userSchema = new Mongoose.Schema(
  {
    // Clerk User ID as primary key
    _id: { 
      type: String, 
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Note: index defined via schema.index() below for consistency
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    
    // Paddle customer ID for payment tracking
    customerId: { 
      type: String, 
      default: null,
      // Note: index defined via schema.index() below with sparse option
    },
    
    // Subscription details
    subscription: {
      type: new Mongoose.Schema({
        // Paddle Subscription ID
        id: { 
          type: String, 
          required: false,
          // Note: indexed via parent schema for compound queries
        },
        // Paddle Customer ID (duplicated for quick access)
        customerId: { 
          type: String, 
          required: false,
        },
        // Paddle Product ID
        product_id: { 
          type: String, 
          required: false,
          // Note: indexed via parent schema.index()
        },
        // Paddle Price ID
        price_id: { 
          type: String, 
          required: false,
        },
        // Latest Paddle Transaction ID
        transaction_id: {
          type: String,
          required: false,
          // Note: indexed via parent schema.index() with sparse option
        },
        
        // Subscription Status
        status: {
          type: String,
          enum: [
            "trialing",
            "active",
            "incomplete",
            "incomplete_expired",
            "past_due",
            "canceled",
            "unpaid",
            "paused",
            "inactive",
            "expired",
          ],
          required: false,
          // Note: indexed via parent schema.index()
        },
        
        // Billing Period (Unix timestamps in ms)
        current_period_start: { 
          type: Number, 
          required: false,
        },
        current_period_ends: { 
          type: Number, 
          required: false,
          // Note: indexed via parent schema.index()
        },
        
        // Subscription Details
        cancel_at_period_end: { 
          type: Boolean, 
          default: false,
        },
        canceled_at: { 
          type: Number, 
          required: false,
        },
        cancel_reason: {
          type: String,
          enum: [
            "user_requested",
            "payment_failed",
            "billing_issue",
            "upgrade",
            "downgrade",
            "other",
          ],
          required: false,
        },
        
        // Billing Cycle
        // Note: "annual" is the standard value (previously "yearly" was used)
        billing_cycle: {
          type: String,
          enum: ["monthly", "annual", "yearly", "quarterly", "weekly", "lifetime"],
          required: false,
        },
           
        // Plan tier for quick access
        // Tiers match plan IDs: pro, ultimate, creator
        plan_tier: {
          type: String,
          enum: ["free", "pro", "ultimate", "creator"],
          required: false,
        },

        // Plan name for display
        plan_name: {
          type: String,
          required: false,
        },
        
        // Renewal Information (Unix timestamps in ms)
        next_payment_date: { 
          type: Number, 
          required: false,
        },
        last_payment_date: { 
          type: Number, 
          required: false,
        },
        last_payment_amount: {
          type: Number,
          required: false,
        },

        // Subscription History (Unix timestamps in ms)
        started_at: { 
          type: Number, 
          required: false,
        },
        ended_at: { 
          type: Number, 
          required: false,
        },

        // Monthly credit distribution for annual plans (Unix timestamps in ms)
        next_credit_date: {
          type: Number,
          required: false,
        },
        last_credit_date: {
          type: Number,
          required: false,
        },

        // Subscription change tracking (preserved from previous subscription for transaction.completed)
        // These are set by subscription.created and cleared by transaction.completed
        // Used to detect: tier upgrades (Pro → Ultimate) and billing cycle changes (monthly → annual)
        previous_product_id: {
          type: String,
          required: false,
        },
        previous_price_id: {
          type: String,
          required: false,
        },
        previous_plan_tier: {
          type: String,
          enum: ["free", "pro", "ultimate", "creator"],
          required: false,
        },
        previous_billing_cycle: {
          type: String,
          enum: ["monthly", "annual", "yearly", "quarterly", "weekly", "lifetime"],
          required: false,
        },
        subscription_changed_at: {
          type: Number,
          required: false,
        },
        
        // Metadata for tracking additional info
        metadata: {
          type: Map,
          of: String,
          required: false,
        },
      }, { _id: false }),
      default: null,
    },
    
    // Credit balance (source of truth)
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Last balance verification timestamp
    balance_verified_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes for performance-critical queries
// Note: Avoid using `index: true` in field definitions to prevent duplicate indexes

// Email uniqueness (required for user lookup)
userSchema.index({ email: 1 }, { unique: true });

// Customer ID for Paddle integration
userSchema.index({ customerId: 1 }, { sparse: true });

// Subscription lookups
userSchema.index({ "subscription.id": 1 }, { sparse: true });
userSchema.index({ "subscription.status": 1 });
userSchema.index({ "subscription.product_id": 1 });
userSchema.index({ "subscription.current_period_ends": 1 });
userSchema.index({ "subscription.transaction_id": 1 }, { sparse: true });

// Compound indexes for common queries
userSchema.index({ 
  "subscription.status": 1, 
  "subscription.current_period_ends": 1 
});
userSchema.index({ 
  "subscription.status": 1, 
  "subscription.current_period_ends": 1,
  "subscription.cancel_at_period_end": 1,
});
userSchema.index({ 
  "subscription.billing_cycle": 1,
  "subscription.status": 1,
});
userSchema.index({ 
  "subscription.plan_tier": 1,
  "subscription.status": 1,
});

// Sort index
userSchema.index({ createdAt: -1 });

// Subscription interface
export interface ISubscription {
  id?: string;
  customerId?: string;
  product_id?: string;
  price_id?: string;
  transaction_id?: string;
  status?: 
    | "trialing"
    | "active"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "paused"
    | "inactive"
    | "expired";
  current_period_start?: number;
  current_period_ends?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
  cancel_reason?: 
    | "user_requested"
    | "payment_failed"
    | "billing_issue"
    | "upgrade"
    | "downgrade"
    | "other";
  billing_cycle?: "monthly" | "annual" | "yearly" | "lifetime";
  plan_tier?: "free" | "pro" | "ultimate" | "creator";
  plan_name?: string;
  next_payment_date?: number;
  last_payment_date?: number;
  last_payment_amount?: number;
  started_at?: number;
  ended_at?: number;
  next_credit_date?: number; // For annual plans - when next monthly credits are due
  last_credit_date?: number; // For annual plans - when credits were last added
  // Subscription change tracking (set by subscription.created, cleared by transaction.completed)
  // Used to detect: tier upgrades (Pro → Ultimate) and billing cycle changes (monthly → annual)
  previous_product_id?: string;
  previous_price_id?: string;
  previous_plan_tier?: "free" | "pro" | "ultimate" | "creator";
  previous_billing_cycle?: "monthly" | "annual" | "yearly" | "lifetime";
  subscription_changed_at?: number;
  metadata?: Map<string, string>;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  customerId: string | null;
  subscription: ISubscription | null;
  credits: number;
  balance_verified_at: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserDocument extends IUser, Omit<Document, "_id"> {
  _id: string;
}

type IUserModel = Model<IUserDocument>

const User: IUserModel =
  Mongoose.models?.users || Mongoose.model<IUserDocument>("users", userSchema);

export default User;
