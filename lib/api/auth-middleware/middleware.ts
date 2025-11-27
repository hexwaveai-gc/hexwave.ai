/**
 * Auth Middleware - Core Logic
 * 
 * Centralized authentication, rate limiting, credits, and subscription checks.
 * This is the single source of truth for all API route protection.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import { ApiResponse, STATUS } from "@/utils/api-response/response";
import User, { type IUser } from "@/app/models/User/user.model";
import {
  checkRateLimit,
  createRateLimitHeaders,
  getRateLimitIdentifier,
} from "@/lib/rate-limiter";
import {
  logInfo,
  logWarn,
  logError,
  logDebug,
  logAuth,
  logRateLimit,
  logFreeTierUsage,
  getTraceId,
  createTimer,
} from "@/lib/logger";
import {
  FREE_TIER_CONFIG,
  FREE_TIER_DAILY_LIMITS,
  FREE_TIER_MONTHLY_LIMITS,
  FREE_TIER_TRIAL_DAYS,
  isToolAllowedForFreeTier,
  isTrialExpired,
  getTrialDaysRemaining,
  type GenerationCategory,
} from "@/constants/limits";
import type {
  AuthMiddlewareOptions,
  AuthMiddlewareResult,
  AuthMiddlewareSuccess,
  AuthMiddlewareError,
  AuthContext,
  AuthErrorType,
  PlanTier,
  FreeTierLimits,
  ProtectionPreset,
} from "./types";
import { redis } from "@/lib/redis";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Plan tier hierarchy for comparison
 */
const PLAN_TIER_LEVELS: Record<PlanTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  ultimate: 3,
  creator: 4,
  enterprise: 5,
  custom: 6,
};

/**
 * Free tier limits configuration (exported for use in other modules)
 */
export const FREE_TIER_LIMITS: FreeTierLimits = {
  dailyGenerations: FREE_TIER_DAILY_LIMITS.TOTAL,
  monthlyGenerations: FREE_TIER_MONTHLY_LIMITS.TOTAL,
  requestsPerMinute: FREE_TIER_CONFIG.REQUESTS_PER_MINUTE,
  maxQueueSize: FREE_TIER_CONFIG.MAX_QUEUE,
  features: [...FREE_TIER_CONFIG.FEATURES],
};

/**
 * Active subscription statuses
 */
const ACTIVE_STATUSES = ["active", "trialing"] as const;

/**
 * Preset configurations for common route types
 */
export const PROTECTION_PRESETS: Record<ProtectionPreset, AuthMiddlewareOptions> = {
  public: {
    skipAuth: true,
    skipRateLimit: false,
    rateLimitType: "PUBLIC",
    skipCreditCheck: true,
  },
  authenticated: {
    skipAuth: false,
    skipRateLimit: false,
    rateLimitType: "API",
    skipCreditCheck: true,
  },
  /** 
   * Authenticated with stricter free tier rate limits (20 req/min for free users)
   * Use for routes like /api/me, /api/paddle/checkout
   */
  authenticated_free_tier: {
    skipAuth: false,
    skipRateLimit: false,
    rateLimitType: "API",
    freeTierRateLimitType: "FREE_TIER_API", // 20 req/min for free users
    skipCreditCheck: true,
  },
  generation: {
    skipAuth: false,
    skipRateLimit: false,
    rateLimitType: "GENERATION",
    freeTierRateLimitType: "FREE_TIER_GENERATION", // 3 req/min for free users
    skipCreditCheck: false,
    applyFreeTierLimits: true,
    checkTrialExpiry: true,
  },
  premium: {
    skipAuth: false,
    skipRateLimit: false,
    rateLimitType: "API",
    requireActiveSubscription: true,
    allowFreeTier: false,
  },
  admin: {
    skipAuth: false,
    skipRateLimit: false,
    rateLimitType: "API",
    minimumPlanTier: "enterprise",
    requireActiveSubscription: true,
    allowFreeTier: false,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

/**
 * Compare plan tiers
 */
function isPlanTierSufficient(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return PLAN_TIER_LEVELS[userTier] >= PLAN_TIER_LEVELS[requiredTier];
}

/**
 * Get plan tier from user subscription
 */
function getUserPlanTier(user: IUser | null): PlanTier {
  if (!user?.subscription?.plan_tier) {
    return "free";
  }
  
  const tier = user.subscription.plan_tier as PlanTier;
  return PLAN_TIER_LEVELS[tier] !== undefined ? tier : "free";
}

/**
 * Check if user has active subscription
 */
function hasActiveSubscription(user: IUser | null): boolean {
  if (!user?.subscription?.status) {
    return false;
  }
  return ACTIVE_STATUSES.includes(user.subscription.status as typeof ACTIVE_STATUSES[number]);
}

/**
 * Create error result
 */
function createError(
  error: AuthErrorType,
  message: string,
  statusCode: number,
  details?: Record<string, unknown>,
  headers?: Record<string, string>,
  pending?: Promise<unknown>
): AuthMiddlewareError {
  return {
    success: false,
    error,
    message,
    statusCode,
    details,
    headers,
    pending,
  };
}

/**
 * Create success result
 */
function createSuccess(
  context: AuthContext,
  headers: Record<string, string>,
  pending: Promise<unknown>
): AuthMiddlewareSuccess {
  return {
    success: true,
    context,
    headers,
    pending,
  };
}

/**
 * Get Redis key for free tier daily limit by category
 */
function getFreeTierDailyKey(userId: string, category?: GenerationCategory): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (category) {
    return `free_tier:daily:${category}:${userId}:${date}`;
  }
  return `free_tier:daily:total:${userId}:${date}`;
}

/**
 * Get Redis key for free tier monthly limit by category
 */
function getFreeTierMonthlyKey(userId: string, category?: GenerationCategory): string {
  const date = new Date().toISOString().slice(0, 7); // YYYY-MM
  if (category) {
    return `free_tier:monthly:${category}:${userId}:${date}`;
  }
  return `free_tier:monthly:total:${userId}:${date}`;
}

// =============================================================================
// CORE MIDDLEWARE FUNCTION
// =============================================================================

/**
 * Main authentication middleware
 * 
 * Performs all security checks in order:
 * 1. Rate limiting (can be applied even for unauthenticated requests)
 * 2. Authentication (Clerk)
 * 3. User lookup (database)
 * 4. Trial expiry check (for free tier)
 * 5. Subscription validation
 * 6. Plan tier check
 * 7. Tool restriction check (for free tier)
 * 8. Credit check
 * 9. Free tier limits (if applicable)
 * 10. Custom validation (if provided)
 * 
 * @param request - Next.js request object
 * @param options - Middleware configuration options
 * @returns AuthMiddlewareResult - Success with context or error with details
 */
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<AuthMiddlewareResult> {
  // traceId is set by the logging context (via AsyncLocalStorage)
  // Use fallback if not in context (e.g., manual usage)
  const traceId = getTraceId() || `trace_${Date.now().toString(36)}`;
  const timer = createTimer("auth_middleware");
  
  // Destructure options with defaults
  const {
    skipAuth = false,
    skipRateLimit = false,
    rateLimitType = "API",
    freeTierRateLimitType,
    customRateLimitId,
    requiredCredits,
    skipCreditCheck = false,
    minimumPlanTier,
    allowedPlanTiers,
    requireActiveSubscription = false,
    allowedSubscriptionStatuses = ["active", "trialing"],
    applyFreeTierLimits = true,
    allowFreeTier = true,
    checkTrialExpiry = false,
    generationCategory,
    toolId,
    customValidator,
    routeDescription = "API route",
  } = options;

  let rateLimitHeaders: Record<string, string> = {};
  let rateLimitPending: Promise<unknown> = Promise.resolve();
  let userId: string | null = null;

  try {
    // =========================================================================
    // STEP 1: Get User ID (needed for rate limiting)
    // =========================================================================
    
    if (!skipAuth) {
      const authResult = await auth();
      userId = authResult.userId;
    }

    const clientIp = getClientIp(request);

    // =========================================================================
    // STEP 2: Rate Limiting
    // =========================================================================
    
    if (!skipRateLimit) {
      const rateLimitId = customRateLimitId || getRateLimitIdentifier(userId, clientIp);
      const rateLimitResult = await checkRateLimit(rateLimitId, rateLimitType);
      
      rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      rateLimitPending = rateLimitResult.pending;

      logRateLimit(rateLimitResult.success, {
        traceId,
        userId: userId || undefined,
        type: rateLimitType,
        remaining: rateLimitResult.remaining,
        limit: rateLimitResult.limit,
        reset: rateLimitResult.reset,
      });

      if (!rateLimitResult.success) {
        logAuth("rate_limited", {
          traceId,
          userId: userId || undefined,
          path: request.nextUrl.pathname,
        });

        return createError(
          "RATE_LIMITED",
          `Too many requests. Please try again after ${new Date(rateLimitResult.reset).toISOString()}`,
          429,
          {
            retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }

    // =========================================================================
    // STEP 3: Authentication Check
    // =========================================================================
    
    if (!skipAuth && !userId) {
      logAuth("unauthorized", {
        traceId,
        path: request.nextUrl.pathname,
      });

      return createError(
        "UNAUTHORIZED",
        "Authentication required. Please sign in to access this resource.",
        401,
        undefined,
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // If auth is skipped, return early with minimal context
    if (skipAuth) {
      const minimalContext: AuthContext = {
        userId: "anonymous",
        user: null as unknown as IUser,
        subscription: null,
        credits: 0,
        planTier: "free",
        hasActiveSubscription: false,
        isFreeTier: true,
        trialDaysRemaining: 0,
        isTrialExpired: true,
        traceId,
        rateLimit: {
          remaining: 0,
          limit: 0,
          reset: 0,
        },
      };

      return createSuccess(minimalContext, rateLimitHeaders, rateLimitPending);
    }

    // =========================================================================
    // STEP 4: Database Lookup
    // =========================================================================
    
    await dbConnect();
    const user = await User.findById(userId).lean<IUser>();

    if (!user) {
      logError("User not found in database", null, { 
        userId: userId!, 
        traceId,
        path: request.nextUrl.pathname,
      });
      
      return createError(
        "USER_NOT_FOUND",
        "User account not found. Please contact support if this issue persists.",
        404,
        undefined,
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // =========================================================================
    // STEP 5: Derive User Properties
    // =========================================================================
    
    const planTier = getUserPlanTier(user);
    const isActiveSubscription = hasActiveSubscription(user);
    const isFreeTier = planTier === "free" || !isActiveSubscription;
    
    // Calculate trial status
    const userCreatedAt = user.createdAt ? new Date(user.createdAt) : new Date();
    const trialExpired = isTrialExpired(userCreatedAt);
    const trialDaysRemaining = getTrialDaysRemaining(userCreatedAt);

    // =========================================================================
    // STEP 5.5: Free Tier Rate Limiting (stricter limits for free users)
    // =========================================================================
    
    if (!skipRateLimit && isFreeTier && freeTierRateLimitType) {
      const freeTierRateLimitId = `free_tier:${userId}`;
      const freeTierRateLimitResult = await checkRateLimit(freeTierRateLimitId, freeTierRateLimitType);
      
      // Update headers with free tier limits
      rateLimitHeaders = createRateLimitHeaders(freeTierRateLimitResult);
      rateLimitPending = freeTierRateLimitResult.pending;

      logRateLimit(freeTierRateLimitResult.success, {
        userId: userId || undefined,
        type: freeTierRateLimitType,
        remaining: freeTierRateLimitResult.remaining,
        limit: freeTierRateLimitResult.limit,
        reset: freeTierRateLimitResult.reset,
        isFreeTier: true,
      });

      if (!freeTierRateLimitResult.success) {
        logAuth("rate_limited", {
          userId: userId || undefined,
          path: request.nextUrl.pathname,
          reason: "free_tier_rate_limit",
          limitType: freeTierRateLimitType,
        });

        return createError(
          "RATE_LIMITED",
          `Free tier rate limit exceeded. You can make ${freeTierRateLimitResult.limit} requests per minute. Upgrade your plan for higher limits.`,
          429,
          {
            retryAfter: Math.ceil((freeTierRateLimitResult.reset - Date.now()) / 1000),
            limit: freeTierRateLimitResult.limit,
            remaining: freeTierRateLimitResult.remaining,
            reset: freeTierRateLimitResult.reset,
            isFreeTier: true,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }

    // =========================================================================
    // STEP 6: Trial Expiry Check (for free tier)
    // =========================================================================
    
    if (isFreeTier && checkTrialExpiry && trialExpired) {
      logAuth("failure", {
        traceId,
        userId,
        reason: "trial_expired",
        trialDaysRemaining: 0,
        signupDate: userCreatedAt.toISOString(),
      });

      return createError(
        "SUBSCRIPTION_REQUIRED",
        `Your ${FREE_TIER_TRIAL_DAYS}-day free trial has expired. Please upgrade to continue using the service.`,
        403,
        {
          trialExpired: true,
          trialDays: FREE_TIER_TRIAL_DAYS,
          signupDate: userCreatedAt.toISOString(),
          upgradeUrl: "/pricing",
        },
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // =========================================================================
    // STEP 7: Free Tier Access Check
    // =========================================================================
    
    if (isFreeTier && !allowFreeTier) {
      logAuth("failure", {
        traceId,
        userId,
        reason: "free_tier_not_allowed",
        planTier,
      });

      return createError(
        "SUBSCRIPTION_REQUIRED",
        "This feature requires an active subscription. Please upgrade your plan.",
        403,
        {
          currentPlan: planTier,
          upgradeUrl: "/pricing",
        },
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // =========================================================================
    // STEP 8: Subscription Status Check
    // =========================================================================
    
    if (requireActiveSubscription && !isActiveSubscription) {
      logAuth("failure", {
        traceId,
        userId,
        reason: "subscription_required",
        currentStatus: user.subscription?.status || "none",
      });

      return createError(
        "SUBSCRIPTION_REQUIRED",
        "An active subscription is required to access this feature.",
        403,
        {
          currentStatus: user.subscription?.status || "none",
          requiredStatuses: allowedSubscriptionStatuses,
          upgradeUrl: "/pricing",
        },
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // Check subscription status against allowed statuses
    if (
      user.subscription?.status &&
      !isFreeTier &&
      !allowedSubscriptionStatuses.includes(user.subscription.status as typeof allowedSubscriptionStatuses[number])
    ) {
      logAuth("failure", {
        traceId,
        userId,
        reason: "invalid_subscription_status",
        currentStatus: user.subscription.status,
      });

      return createError(
        "SUBSCRIPTION_REQUIRED",
        `Your subscription status (${user.subscription.status}) does not allow access to this feature.`,
        403,
        {
          currentStatus: user.subscription.status,
          requiredStatuses: allowedSubscriptionStatuses,
        },
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // =========================================================================
    // STEP 9: Plan Tier Check
    // =========================================================================
    
    // Check allowed plan tiers (takes precedence)
    if (allowedPlanTiers && allowedPlanTiers.length > 0) {
      if (!allowedPlanTiers.includes(planTier)) {
        logAuth("failure", {
          traceId,
          userId,
          reason: "plan_tier_not_allowed",
          currentPlan: planTier,
          requiredPlans: allowedPlanTiers,
        });

        return createError(
          "PLAN_UPGRADE_REQUIRED",
          `This feature is only available for ${allowedPlanTiers.join(", ")} plans.`,
          403,
          {
            currentPlan: planTier,
            requiredPlans: allowedPlanTiers,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }
    // Check minimum plan tier
    else if (minimumPlanTier && !isPlanTierSufficient(planTier, minimumPlanTier)) {
      logAuth("failure", {
        traceId,
        userId,
        reason: "plan_tier_insufficient",
        currentPlan: planTier,
        requiredPlan: minimumPlanTier,
      });

      return createError(
        "PLAN_UPGRADE_REQUIRED",
        `This feature requires ${minimumPlanTier} plan or higher.`,
        403,
        {
          currentPlan: planTier,
          requiredPlan: minimumPlanTier,
          upgradeUrl: "/pricing",
        },
        rateLimitHeaders,
        rateLimitPending
      );
    }

    // =========================================================================
    // STEP 10: Tool Restriction Check (for free tier)
    // =========================================================================
    
    if (isFreeTier && generationCategory && toolId) {
      const isAllowed = isToolAllowedForFreeTier(generationCategory, toolId);
      
      if (!isAllowed) {
        const allowedTools = FREE_TIER_CONFIG.ALLOWED_TOOLS[generationCategory.toUpperCase() as keyof typeof FREE_TIER_CONFIG.ALLOWED_TOOLS];
        
        logAuth("failure", {
          traceId,
          userId,
          reason: "tool_not_allowed_free_tier",
          category: generationCategory,
          requestedTool: toolId,
          allowedTools,
        });

        return createError(
          "PLAN_UPGRADE_REQUIRED",
          `The tool "${toolId}" is not available on the free tier. Upgrade to access all tools.`,
          403,
          {
            currentPlan: planTier,
            requestedTool: toolId,
            allowedTools: [...allowedTools],
            category: generationCategory,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }

    // =========================================================================
    // STEP 11: Free Tier Limits Check (Category-specific)
    // =========================================================================
    
    if (isFreeTier && applyFreeTierLimits && !skipCreditCheck) {
      // Get category-specific limits
      const category = generationCategory || "image";
      const categoryUpper = category.toUpperCase() as keyof typeof FREE_TIER_DAILY_LIMITS;
      
      const dailyLimit = FREE_TIER_DAILY_LIMITS[categoryUpper] || FREE_TIER_DAILY_LIMITS.TOTAL;
      const monthlyLimit = FREE_TIER_MONTHLY_LIMITS[categoryUpper] || FREE_TIER_MONTHLY_LIMITS.TOTAL;
      
      // Get Redis keys
      const dailyKey = getFreeTierDailyKey(userId!, category);
      const monthlyKey = getFreeTierMonthlyKey(userId!, category);
      const dailyTotalKey = getFreeTierDailyKey(userId!);
      const monthlyTotalKey = getFreeTierMonthlyKey(userId!);

      // Get current counts
      const [dailyCount, monthlyCount, dailyTotal, monthlyTotal] = await Promise.all([
        redis.get<number>(dailyKey),
        redis.get<number>(monthlyKey),
        redis.get<number>(dailyTotalKey),
        redis.get<number>(monthlyTotalKey),
      ]);

      const currentDaily = dailyCount || 0;
      const currentMonthly = monthlyCount || 0;
      const currentDailyTotal = dailyTotal || 0;
      const currentMonthlyTotal = monthlyTotal || 0;

      logFreeTierUsage({
        traceId,
        userId,
        category,
        dailyUsed: currentDaily,
        dailyLimit,
        monthlyUsed: currentMonthly,
        monthlyLimit,
      });

      // Check category-specific daily limit
      if (currentDaily >= dailyLimit) {
        return createError(
          "FREE_TIER_LIMIT",
          `You've reached your daily limit of ${dailyLimit} ${category} generations. Upgrade for unlimited access.`,
          429,
          {
            category,
            dailyLimit,
            dailyUsed: currentDaily,
            monthlyLimit,
            monthlyUsed: currentMonthly,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }

      // Check category-specific monthly limit
      if (currentMonthly >= monthlyLimit) {
        return createError(
          "FREE_TIER_LIMIT",
          `You've reached your monthly limit of ${monthlyLimit} ${category} generations. Upgrade for more.`,
          429,
          {
            category,
            monthlyLimit,
            monthlyUsed: currentMonthly,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }

      // Check total daily limit
      if (currentDailyTotal >= FREE_TIER_DAILY_LIMITS.TOTAL) {
        return createError(
          "FREE_TIER_LIMIT",
          `You've reached your total daily limit of ${FREE_TIER_DAILY_LIMITS.TOTAL} generations. Upgrade for unlimited access.`,
          429,
          {
            totalDailyLimit: FREE_TIER_DAILY_LIMITS.TOTAL,
            totalDailyUsed: currentDailyTotal,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }

      // Check total monthly limit
      if (currentMonthlyTotal >= FREE_TIER_MONTHLY_LIMITS.TOTAL) {
        return createError(
          "FREE_TIER_LIMIT",
          `You've reached your total monthly limit of ${FREE_TIER_MONTHLY_LIMITS.TOTAL} generations. Upgrade for more.`,
          429,
          {
            totalMonthlyLimit: FREE_TIER_MONTHLY_LIMITS.TOTAL,
            totalMonthlyUsed: currentMonthlyTotal,
            upgradeUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }

    // =========================================================================
    // STEP 12: Credit Check
    // =========================================================================
    
    if (!skipCreditCheck && requiredCredits !== undefined && requiredCredits > 0) {
      const availableCredits = user.credits || 0;

      if (availableCredits < requiredCredits) {
        logAuth("failure", {
          traceId,
          userId,
          reason: "insufficient_credits",
          requiredCredits,
          availableCredits,
        });

        return createError(
          "INSUFFICIENT_CREDITS",
          `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`,
          402,
          {
            requiredCredits,
            availableCredits,
            purchaseUrl: "/pricing",
          },
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }

    // =========================================================================
    // STEP 13: Custom Validation
    // =========================================================================
    
    // Build auth context for custom validator
    const authContext: AuthContext = {
      userId: userId!,
      user,
      subscription: user.subscription,
      credits: user.credits || 0,
      planTier,
      hasActiveSubscription: isActiveSubscription,
      isFreeTier,
      trialDaysRemaining,
      isTrialExpired: trialExpired,
      traceId,
      rateLimit: {
        remaining: parseInt(rateLimitHeaders["X-RateLimit-Remaining"] || "0"),
        limit: parseInt(rateLimitHeaders["X-RateLimit-Limit"] || "0"),
        reset: parseInt(rateLimitHeaders["X-RateLimit-Reset"] || "0"),
      },
    };

    if (customValidator) {
      const validationResult = await customValidator(authContext);
      
      if (!validationResult.valid) {
        logAuth("failure", {
          traceId,
          userId,
          reason: "custom_validation_failed",
          error: validationResult.error,
        });

        return createError(
          "VALIDATION_FAILED",
          validationResult.error || "Request validation failed",
          validationResult.statusCode || 400,
          undefined,
          rateLimitHeaders,
          rateLimitPending
        );
      }
    }

    // =========================================================================
    // SUCCESS
    // =========================================================================
    
    const duration = timer.done({ userId, planTier, isFreeTier });
    
    logAuth("success", {
      traceId,
      userId,
      planTier,
      isFreeTier,
      trialDaysRemaining: isFreeTier ? trialDaysRemaining : undefined,
      path: request.nextUrl.pathname,
      duration,
    });

    return createSuccess(authContext, rateLimitHeaders, rateLimitPending);

  } catch (error) {
    timer.done({ error: true });
    
    logError("Auth middleware error", error, {
      traceId,
      userId: userId || undefined,
      path: request.nextUrl.pathname,
      operation: "auth_middleware",
    });

    return createError(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500,
      undefined,
      rateLimitHeaders,
      rateLimitPending
    );
  }
}

// =============================================================================
// INCREMENT FREE TIER USAGE
// =============================================================================

/**
 * Increment free tier usage counters after successful generation
 * Call this AFTER the generation succeeds
 * 
 * @param userId - User ID
 * @param category - Generation category (image, video, audio)
 */
export async function incrementFreeTierUsage(
  userId: string,
  category: GenerationCategory = "image"
): Promise<void> {
  // Category-specific keys
  const dailyKey = getFreeTierDailyKey(userId, category);
  const monthlyKey = getFreeTierMonthlyKey(userId, category);
  
  // Total keys
  const dailyTotalKey = getFreeTierDailyKey(userId);
  const monthlyTotalKey = getFreeTierMonthlyKey(userId);

  try {
    // Increment all counters with appropriate TTLs
    await Promise.all([
      // Category-specific
      redis.incr(dailyKey).then(() => redis.expire(dailyKey, 86400)), // 24 hours
      redis.incr(monthlyKey).then(() => redis.expire(monthlyKey, 2592000)), // 30 days
      // Total
      redis.incr(dailyTotalKey).then(() => redis.expire(dailyTotalKey, 86400)),
      redis.incr(monthlyTotalKey).then(() => redis.expire(monthlyTotalKey, 2592000)),
    ]);

    logDebug("Free tier usage incremented", {
      userId,
      category,
    });
  } catch (error) {
    logError("Failed to increment free tier usage", error, { 
      userId, 
      category,
      operation: "increment_free_tier_usage",
    });
    // Don't throw - this is non-critical
  }
}

/**
 * Get current free tier usage for a user
 */
export async function getFreeTierUsage(
  userId: string,
  category?: GenerationCategory
): Promise<{
  daily: number;
  monthly: number;
  dailyTotal: number;
  monthlyTotal: number;
}> {
  try {
    const [daily, monthly, dailyTotal, monthlyTotal] = await Promise.all([
      category ? redis.get<number>(getFreeTierDailyKey(userId, category)) : Promise.resolve(0),
      category ? redis.get<number>(getFreeTierMonthlyKey(userId, category)) : Promise.resolve(0),
      redis.get<number>(getFreeTierDailyKey(userId)),
      redis.get<number>(getFreeTierMonthlyKey(userId)),
    ]);

    return {
      daily: daily || 0,
      monthly: monthly || 0,
      dailyTotal: dailyTotal || 0,
      monthlyTotal: monthlyTotal || 0,
    };
  } catch (error) {
    logError("Failed to get free tier usage", error, { userId, category });
    return { daily: 0, monthly: 0, dailyTotal: 0, monthlyTotal: 0 };
  }
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create a JSON error response from middleware error using ApiResponse
 */
export function createErrorResponse(error: AuthMiddlewareError): NextResponse {
  const response = ApiResponse.error(
    error.error,
    error.message,
    error.statusCode,
    error.details
  );
  
  // Add custom headers if provided
  if (error.headers) {
    Object.entries(error.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * Add rate limit headers to an existing response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  headers: Record<string, string>
): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

