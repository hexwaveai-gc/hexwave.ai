/**
 * Profile API Functions
 * 
 * API functions for user profile management.
 */

import api from "./client";

// ============================================================================
// Types
// ============================================================================

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface ProfileStats {
  likes: number;
  posts: number;
  views: number;
  followers: number;
  following: number;
}

export interface ProfilePreferences {
  show_stats: boolean;
  allow_messages: boolean;
  email_notifications: boolean;
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name?: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  social_links: SocialLinks;
  stats: ProfileStats;
  is_public: boolean;
  is_verified: boolean;
  email?: string;
  preferences?: ProfilePreferences;
}

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  social_links?: SocialLinks;
  is_public?: boolean;
  preferences?: ProfilePreferences;
}

export interface UsernameCheckResponse {
  available: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch user profile
 * @param username - Optional username to fetch (defaults to current user)
 */
export async function fetchProfile(username?: string): Promise<UserProfile> {
  return api.get<UserProfile>("/api/profile", { username });
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  return api.put<UserProfile>("/api/profile", data);
}

/**
 * Check if username is available
 */
export async function checkUsername(username: string): Promise<UsernameCheckResponse> {
  return api.post<UsernameCheckResponse>("/api/profile", { username });
}

