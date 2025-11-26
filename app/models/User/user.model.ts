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
      index: true,
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
      index: true,
    },
    
    // Subscription details
    subscription: {
      type: new Mongoose.Schema({
        // Paddle Subscription ID
        id: { 
          type: String, 
          required: false,
          index: true,
          sparse: true,
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
          index: true,
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
          index: true,
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
          index: true,
        },
        
        // Billing Period (Unix timestamps in ms)
        current_period_start: { 
          type: Number, 
          required: false,
          index: true,
        },
        current_period_ends: { 
          type: Number, 
          required: false,
          index: true,
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
        billing_cycle: {
          type: String,
          enum: ["monthly", "yearly", "quarterly", "weekly", "lifetime"],
          required: false,
        },
           
        // Plan tier for quick access
        plan_tier: {
          type: String,
          enum: ["free", "basic", "pro", "enterprise", "custom"],
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
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ "subscription.status": 1 });
userSchema.index({ "subscription.product_id": 1 });
userSchema.index({ "subscription.current_period_ends": 1 });
userSchema.index({ customerId: 1 }, { sparse: true });
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
userSchema.index({ "subscription.transaction_id": 1 }, { sparse: true });
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
  billing_cycle?: "monthly" | "yearly" | "lifetime";
  plan_tier?: "free" | "basic" | "pro" | "enterprise" | "custom";
  plan_name?: string;
  next_payment_date?: number;
  last_payment_date?: number;
  last_payment_amount?: number;
  started_at?: number;
  ended_at?: number;
  next_credit_date?: number; // For annual plans - when next monthly credits are due
  last_credit_date?: number; // For annual plans - when credits were last added
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
