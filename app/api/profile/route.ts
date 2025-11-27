/**
 * /api/profile - User Profile API
 * 
 * Handles profile CRUD operations.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import UserProfile, { type IUserProfile } from "@/app/models/UserProfile/user-profile.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/profile
 * Get current user's profile or profile by username
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    // If username provided, get public profile
    if (username) {
      const profile = await UserProfile.findOne({ 
        username: username.toLowerCase(),
        is_public: true,
      }).lean();

      if (!profile) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      // Return public profile data (exclude sensitive fields)
      return NextResponse.json({
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        cover_url: profile.cover_url,
        social_links: profile.social_links,
        stats: profile.preferences.show_stats ? profile.stats : null,
        is_verified: profile.is_verified,
      });
    }

    // Otherwise, get current user's profile
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let profile = await UserProfile.findOne({ user_id: userId }).lean();

    // If profile doesn't exist, create one
    if (!profile) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const baseUsername = generateUsername(
        clerkUser.firstName,
        clerkUser.lastName,
        clerkUser.username,
        email
      );

      // Ensure unique username
      const username = await ensureUniqueUsername(baseUsername);

      const newProfile = new UserProfile({
        user_id: userId,
        username,
        display_name: clerkUser.fullName || clerkUser.firstName || username,
        email,
        avatar_url: clerkUser.imageUrl,
        bio: "",
        social_links: {},
        stats: { likes: 0, posts: 0, views: 0, followers: 0, following: 0 },
        is_public: true,
        is_verified: false,
        preferences: {
          show_stats: true,
          allow_messages: true,
          email_notifications: true,
        },
      });

      await newProfile.save();
      profile = newProfile.toObject();
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error("[API/profile] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const {
      username,
      display_name,
      bio,
      avatar_url,
      cover_url,
      social_links,
      is_public,
      preferences,
    } = body;

    // Build update object
    const updateData: Partial<IUserProfile> = {};

    // Validate and set username
    if (username !== undefined) {
      const cleanUsername = username.toLowerCase().trim();
      
      // Validate username format
      if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        return NextResponse.json(
          { error: "Username must be 3-30 characters and only contain lowercase letters, numbers, and underscores" },
          { status: 400 }
        );
      }

      // Check if username is taken (by another user)
      const existingProfile = await UserProfile.findOne({
        username: cleanUsername,
        user_id: { $ne: userId },
      });

      if (existingProfile) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }

      updateData.username = cleanUsername;
    }

    if (display_name !== undefined) {
      updateData.display_name = display_name.trim().slice(0, 50);
    }

    if (bio !== undefined) {
      updateData.bio = bio.trim().slice(0, 500);
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    if (cover_url !== undefined) {
      updateData.cover_url = cover_url;
    }

    if (social_links !== undefined) {
      updateData.social_links = {
        twitter: social_links.twitter?.trim().slice(0, 100) || "",
        instagram: social_links.instagram?.trim().slice(0, 100) || "",
        youtube: social_links.youtube?.trim().slice(0, 100) || "",
        tiktok: social_links.tiktok?.trim().slice(0, 100) || "",
        website: social_links.website?.trim().slice(0, 200) || "",
      };
    }

    if (is_public !== undefined) {
      updateData.is_public = Boolean(is_public);
    }

    if (preferences !== undefined) {
      updateData.preferences = {
        show_stats: preferences.show_stats ?? true,
        allow_messages: preferences.allow_messages ?? true,
        email_notifications: preferences.email_notifications ?? true,
      };
    }

    // Update profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user_id: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error("[API/profile] Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate a username from user data
 */
function generateUsername(
  firstName?: string | null,
  lastName?: string | null,
  existingUsername?: string | null,
  email?: string
): string {
  // Try existing username first
  if (existingUsername) {
    return existingUsername.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
  }

  // Try first + last name
  if (firstName && lastName) {
    return `${firstName}_${lastName}`.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
  }

  // Try first name only
  if (firstName) {
    return firstName.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
  }

  // Try email prefix
  if (email) {
    return email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
  }

  // Random fallback
  return `user_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Ensure username is unique by appending random suffix if needed
 */
async function ensureUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await UserProfile.findOne({ username });
    if (!existing) {
      return username;
    }

    // Add random suffix
    const suffix = Math.random().toString(36).slice(2, 6);
    username = `${baseUsername.slice(0, 25)}_${suffix}`;
    attempts++;
  }

  // Final fallback with timestamp
  return `${baseUsername.slice(0, 20)}_${Date.now().toString(36)}`;
}

/**
 * Check username availability
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { action, username } = body;

    if (action === "check_username") {
      const cleanUsername = username?.toLowerCase().trim();

      if (!cleanUsername || !/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        return NextResponse.json({
          available: false,
          error: "Invalid username format",
        });
      }

      const existing = await UserProfile.findOne({
        username: cleanUsername,
        user_id: { $ne: userId },
      });

      return NextResponse.json({
        available: !existing,
        username: cleanUsername,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("[API/profile] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

