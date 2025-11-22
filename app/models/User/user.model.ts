// Modules
import { Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

const userSchema = new Mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        customerId: { type: String, default: null },
        subscription: {
            type: new Mongoose.Schema({
                id: { type: String, required: false },
                product_id: { type: String, required: false },
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
                },
                current_period_start: { type: Number, required: false },
                current_period_ends: { type: Number, required: false },
                cancel_at_period_end: { type: Boolean, default: false },
            }),
            default: null,
        },
        availableBalance: {
            type: Number,
            default: 0,
        },
        favorites: {
            type: [
                new Mongoose.Schema(
                    {
                        url: { type: String, required: true },
                        name: { type: String, required: true },
                    },
                    { _id: false }
                ),
            ],
            default: [],
            validate: [
                {
                    validator: function (v: any) {
                        return v.length <= 100;
                    },
                    message: (props: any) => "Favorites cannot exceed 100 items",
                },
            ],
        }
    },
    {
        timestamps: true,
    }
);

// Indexes for performance-critical queries
// - subscription.status is used to query active users in cron validations
userSchema.index({ "subscription.status": 1 });
userSchema.index({ "subscription.product_id": 1 });
userSchema.index({ "subscription.current_period_ends": 1 });

export interface IUser {
    _id: string;
    name: string;
    email: string;
    customerId: string;
    subscription: {
        id: string;
        product_id: string;
        status: string;
        current_period_start: number;
        current_period_ends: number;
        cancel_at_period_end?: boolean;
        quantity: number;
    } | null;
    availableBalance: number;
    favorites: { url: string; name: string }[];
}

interface IUserDocument extends IUser, Omit<Document, "_id"> {
    _id: string;
}
interface IUserModel extends Model<IUserDocument> { }

const User: IUserModel =
    Mongoose.models?.users || Mongoose.model<IUserDocument>("users", userSchema);
export default User;