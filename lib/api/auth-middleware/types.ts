/**
 * Auth Middleware Types
 * 
 * Type definitions for the centralized API authentication middleware.
 * Covers authentication, rate limiting, credits, and subscription checks.
 */

import type { NextRequest } from "next/server";
import type { RateLimitType } from "@/constants/cache";
import type { IUser, ISubscription } from "@/app/models/User/user.model";

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * Plan tier for access control
 */
export type PlanTier = "free" | "basic" | "pro" | "ultimate" | "creator" | "enterprise" | "custom";

/**
 * Subscription status for access control
 */
export type SubscriptionStatus = 
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

/**
 * Generation category for tool restrictions
 */
export type GenerationCategory = "image" | "video" | "audio";

/**
 * Configuration options for auth middleware
 */
export interface AuthMiddlewareOptions {
  /**
   * Skip authentication check entirely (for public routes)
   * @default false
   */
  skipAuth?: boolean;

  /**
   * Skip rate limiting
   * @default false
   */
  skipRateLimit?: boolean;

  /**
   * Rate limit type to apply
   * @default "API"
   */
  rateLimitType?: RateLimitType;

  /**
   * Custom rate limit identifier (overrides default userId/IP)
   */
  customRateLimitId?: string;

  /**
   * Required credits to process request
   * If set, will check user has enough credits
   * @default undefined (no credit check)
   */
  requiredCredits?: number;

  /**
   * Skip credit check (useful for read-only routes)
   * @default false
   */
  skipCreditCheck?: boolean;

  /**
   * Minimum plan tier required to access route
   * If not set, all authenticated users can access
   * @default undefined (all plans)
   */
  minimumPlanTier?: PlanTier;

  /**
   * Specific plan tiers allowed to access
   * Overrides minimumPlanTier if both are set
   */
  allowedPlanTiers?: PlanTier[];

  /**
   * Require an active subscription
   * @default false
   */
  requireActiveSubscription?: boolean;

  /**
   * Allowed subscription statuses
   * @default ["active", "trialing"]
   */
  allowedSubscriptionStatuses?: SubscriptionStatus[];

  /**
   * Apply stricter rate limits for free tier users
   * @default true
   */
  applyFreeTierLimits?: boolean;

  /**
   * Rate limit type to apply for free tier users
   * If set, free tier users will use this rate limit instead of rateLimitType
   * @default undefined (use rateLimitType for all users)
   */
  freeTierRateLimitType?: RateLimitType;

  /**
   * Allow access to free tier users (with limitations)
   * @default true
   */
  allowFreeTier?: boolean;

  /**
   * Check if free tier trial period (7 days) has expired
   * If expired, require subscription
   * @default false (only check on generation routes)
   */
  checkTrialExpiry?: boolean;

  /**
   * Generation category for category-specific limits
   * Used to check free tier limits per category (image: 5/day, video: 1/day, audio: 1/day)
   */
  generationCategory?: GenerationCategory;

  /**
   * Tool/model ID being used
   * Used to validate if tool is allowed for free tier users
   */
  toolId?: string;

  /**
   * Custom validator function for additional checks
   */
  customValidator?: (context: AuthContext) => Promise<ValidationResult>;

  /**
   * Description for logging/debugging
   */
  routeDescription?: string;
}

// =============================================================================
// CONTEXT & RESULTS
// =============================================================================

/**
 * Authenticated user context passed to route handlers
 */
export interface AuthContext {
  /** Clerk user ID */
  userId: string;

  /** User document from database */
  user: IUser;

  /** User's subscription info (null if no subscription) */
  subscription: ISubscription | null;

  /** User's current credit balance */
  credits: number;

  /** User's plan tier */
  planTier: PlanTier;

  /** Whether user has an active subscription */
  hasActiveSubscription: boolean;

  /** Whether user is on free tier */
  isFreeTier: boolean;

  /** Days remaining in free tier trial (0 if expired or not on free tier) */
  trialDaysRemaining: number;

  /** Whether the 7-day trial period has expired */
  isTrialExpired: boolean;

  /** 
   * UUIDv7 Trace ID for distributed tracing
   * Chronologically sortable, automatically included in all logs
   */
  traceId: string;

  /** 
   * @deprecated Use traceId instead
   */
  requestId?: string;

  /** Rate limit info */
  rateLimit: {
    remaining: number;
    limit: number;
    reset: number;
  };
}

/**
 * Result from custom validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Success result from middleware
 */
export interface AuthMiddlewareSuccess {
  success: true;
  context: AuthContext;
  /** Rate limit headers to add to response */
  headers: Record<string, string>;
  /** Pending promise for rate limit analytics */
  pending: Promise<unknown>;
}

/**
 * Error result from middleware
 */
export interface AuthMiddlewareError {
  success: false;
  error: AuthErrorType;
  message: string;
  statusCode: number;
  /** Rate limit headers to add to response */
  headers?: Record<string, string>;
  /** Pending promise for rate limit analytics */
  pending?: Promise<unknown>;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Combined middleware result
 */
export type AuthMiddlewareResult = AuthMiddlewareSuccess | AuthMiddlewareError;

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Possible error types from auth middleware
 */
export type AuthErrorType =
  | "UNAUTHORIZED"          // Not authenticated
  | "FORBIDDEN"             // Authenticated but not allowed
  | "RATE_LIMITED"          // Too many requests
  | "INSUFFICIENT_CREDITS"  // Not enough credits
  | "SUBSCRIPTION_REQUIRED" // Needs active subscription
  | "PLAN_UPGRADE_REQUIRED" // Needs higher tier plan
  | "FREE_TIER_LIMIT"       // Free tier daily/monthly limit reached
  | "USER_NOT_FOUND"        // User doesn't exist in DB
  | "VALIDATION_FAILED"     // Custom validation failed
  | "INTERNAL_ERROR";       // Server error

/**
 * Error response shape for API
 */
export interface AuthErrorResponse {
  error: AuthErrorType;
  message: string;
  details?: {
    requiredCredits?: number;
    availableCredits?: number;
    requiredPlan?: PlanTier;
    currentPlan?: PlanTier;
    retryAfter?: number;
    upgradeUrl?: string;
  };
}

// =============================================================================
// ROUTE HANDLER TYPES
// =============================================================================

/**
 * Enhanced request with auth context
 */
export interface AuthenticatedRequest extends NextRequest {
  auth: AuthContext;
}

/**
 * Type for authenticated route handlers
 */
export type AuthenticatedRouteHandler<T = unknown> = (
  request: NextRequest,
  context: AuthContext
) => Promise<T>;

// =============================================================================
// FREE TIER LIMITS
// =============================================================================

/**
 * Free tier limitations configuration
 */
export interface FreeTierLimits {
  /** Daily generation limit */
  dailyGenerations: number;
  /** Monthly generation limit */
  monthlyGenerations: number;
  /** Requests per minute */
  requestsPerMinute: number;
  /** Max queue size */
  maxQueueSize: number;
  /** Features available */
  features: string[];
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Preset route protection configurations
 */
export type ProtectionPreset = 
  | "public"                   // No auth required, public rate limit
  | "authenticated"            // Auth required, standard API rate limit
  | "authenticated_free_tier"  // Auth required, 20 req/min for free users
  | "generation"               // Auth + stricter rate limit for AI generation
  | "premium"                  // Active subscription required
  | "admin";                   // Enterprise/admin only


