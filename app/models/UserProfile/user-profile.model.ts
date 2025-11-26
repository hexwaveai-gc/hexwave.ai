/**
 * UserProfile Model
 * 
 * Extended user profile data for public profiles and social features.
 * Linked to User model via user_id (Clerk ID).
 */

import { Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

const userProfileSchema = new Mongoose.Schema(
  {
    // Clerk User ID (references User model)
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Profile username (unique, URL-friendly)
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
      index: true,
    },
    
    // Display name (can be different from username)
    display_name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    
    // Bio/description
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    
    // Profile avatar URL
    avatar_url: {
      type: String,
      default: null,
    },
    
    // Cover/banner image URL
    cover_url: {
      type: String,
      default: null,
    },
    
    // Social links
    social_links: {
      twitter: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      instagram: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      youtube: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      tiktok: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      website: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },
    },
    
    // Profile stats (denormalized for performance)
    stats: {
      likes: {
        type: Number,
        default: 0,
        min: 0,
      },
      posts: {
        type: Number,
        default: 0,
        min: 0,
      },
      views: {
        type: Number,
        default: 0,
        min: 0,
      },
      followers: {
        type: Number,
        default: 0,
        min: 0,
      },
      following: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    
    // Profile visibility
    is_public: {
      type: Boolean,
      default: true,
    },
    
    // Email (synced from Clerk for notifications)
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    
    // Verification status
    is_verified: {
      type: Boolean,
      default: false,
    },
    
    // Profile preferences
    preferences: {
      show_stats: {
        type: Boolean,
        default: true,
      },
      allow_messages: {
        type: Boolean,
        default: true,
      },
      email_notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "user_profiles",
  }
);

// Indexes for common queries
userProfileSchema.index({ username: 1 }, { unique: true });
userProfileSchema.index({ user_id: 1 }, { unique: true });
userProfileSchema.index({ email: 1 });
userProfileSchema.index({ is_public: 1, "stats.followers": -1 });
userProfileSchema.index({ createdAt: -1 });

// Social links interface
export interface ISocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

// Stats interface
export interface IProfileStats {
  likes: number;
  posts: number;
  views: number;
  followers: number;
  following: number;
}

// Preferences interface
export interface IProfilePreferences {
  show_stats: boolean;
  allow_messages: boolean;
  email_notifications: boolean;
}

// Main interface
export interface IUserProfile {
  user_id: string;
  username: string;
  display_name?: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  social_links: ISocialLinks;
  stats: IProfileStats;
  is_public: boolean;
  email: string;
  is_verified: boolean;
  preferences: IProfilePreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserProfileDocument extends IUserProfile, Document {
  _id: Mongoose.Types.ObjectId;
}

type IUserProfileModel = Model<IUserProfileDocument>;

const UserProfile: IUserProfileModel =
  Mongoose.models?.user_profiles ||
  Mongoose.model<IUserProfileDocument>("user_profiles", userProfileSchema);

export default UserProfile;

