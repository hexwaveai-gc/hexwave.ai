// Modules
import { Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

const userSchema = new Mongoose.Schema(
    {
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
        customerId: { 
            type: String, 
            default: null,
            index: true,
        },
        subscription: {
            type: new Mongoose.Schema({
                // Stripe/Payment Provider IDs
                id: { 
                    type: String, 
                    required: false,
                    index: true,
                    sparse: true,
                },
                customerId: { 
                    type: String, 
                    required: false,
                },
                product_id: { 
                    type: String, 
                    required: false,
                    index: true,
                },
                price_id: { 
                    type: String, 
                    required: false,
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
                
                // Billing Period
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
                   
                plan_tier: {
                    type: String,
                    enum: ["free", "basic", "pro", "enterprise", "custom"],
                    required: false,
                },
                
                // Renewal Information
                next_payment_date: { 
                    type: Number, 
                    required: false,
                },
                last_payment_date: { 
                    type: Number, 
                    required: false,
                }, 

                // Subscription History
                started_at: { 
                    type: Number, 
                    required: false,
                },
                ended_at: { 
                    type: Number, 
                    required: false,
                },
                
                // Metadata for tracking
                metadata: {
                    type: Map,
                    of: String,
                    required: false,
                },
            }, { _id: false }),
            default: null,
        },
        availableBalance: {
            type: Number,
            default: 0
        }, 
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

// Indexes for performance-critical queries
// - email is used for user lookup (unique index)
userSchema.index({ email: 1 }, { unique: true });

// - subscription queries for active users and billing
userSchema.index({ "subscription.status": 1 });
userSchema.index({ "subscription.product_id": 1 });
userSchema.index({ "subscription.current_period_ends": 1 });

// - customerId for Stripe integration
userSchema.index({ customerId: 1 }, { sparse: true });

// - compound indexes for subscription queries
userSchema.index({ 
    "subscription.status": 1, 
    "subscription.current_period_ends": 1 
});

// - compound index for active subscriptions expiring soon
userSchema.index({ 
    "subscription.status": 1, 
    "subscription.current_period_ends": 1,
    "subscription.cancel_at_period_end": 1,
});

// - index for billing cycle queries
userSchema.index({ 
    "subscription.billing_cycle": 1,
    "subscription.status": 1,
});

// - index for plan tier queries
userSchema.index({ 
    "subscription.plan_tier": 1,
    "subscription.status": 1,
});

// - index for trial tracking
userSchema.index({ 
    "subscription.trial_end": 1,
    "subscription.status": 1,
});

// - createdAt for analytics and reporting
userSchema.index({ createdAt: -1 });

export interface IUser {
    _id: string;
    name: string;
    email: string;
    customerId: string | null;
    subscription: {
        // Stripe/Payment Provider IDs
        id?: string;
        customerId?: string;
        product_id?: string;
        price_id?: string;
        
        // Subscription Status
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
        
        // Billing Period
        current_period_start?: number;
        current_period_ends?: number;
        
        // Cancellation
        cancel_at_period_end?: boolean;
        canceled_at?: number;
        cancel_reason?: 
            | "user_requested"
            | "payment_failed"
            | "billing_issue"
            | "upgrade"
            | "downgrade"
            | "other";
         
        
        // Billing Cycle
        billing_cycle?: "monthly" | "yearly" | "lifetime";
          
        plan_tier?: "free" | "basic" | "pro" | "enterprise" | "custom";
        
        // Payment Tracking
        next_payment_date?: number;
        last_payment_date?: number;
        last_payment_amount?: number;
          
    } | null;
    availableBalance: number; 
}

interface IUserDocument extends IUser, Omit<Document, "_id"> {
    _id: string;
}

type IUserModel = Model<IUserDocument>

const User: IUserModel =
    Mongoose.models?.users || Mongoose.model<IUserDocument>("users", userSchema);

export default User;