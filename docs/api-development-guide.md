# API Development Guide

> Complete guide for implementing API endpoints in Hexwave.ai

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Middleware](#authentication-middleware)
3. [API Response Utilities](#api-response-utilities)
4. [Request Validation](#request-validation)
5. [Logging System](#logging-system)
6. [Process Job Service](#process-job-service)
7. [Real-time Updates with Ably](#real-time-updates-with-ably)
8. [Rate Limiting](#rate-limiting)
9. [Complete Examples](#complete-examples)
10. [Best Practices](#best-practices)

---

## Quick Start

Here's a minimal authenticated API route:

```typescript
// app/api/example/route.ts
import { NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/auth-middleware";
import ApiResponse from "@/utils/api-response/response";
import { logInfo, logError } from "@/lib/logger";

export const GET = withAuth(
  async (req: NextRequest, authContext: AuthContext) => {
    const { userId } = authContext;
    
    try {
      const data = await fetchSomeData(userId);
      logInfo("Data fetched successfully", { userId });
      return ApiResponse.success({ data });
    } catch (error) {
      logError("Failed to fetch data", error);
      return ApiResponse.serverError();
    }
  },
  "authenticated"
);
```

---

## Authentication Middleware

The authentication middleware (`lib/api/auth-middleware`) provides a unified way to:
- Authenticate users via Clerk
- Apply rate limiting
- Check credits and subscriptions
- Track free tier usage

### Middleware Presets

| Preset | Description | Auth Required | Rate Limit | Credit Check |
|--------|-------------|---------------|------------|--------------|
| `public` | Public endpoints (no auth) | ❌ | 60/min | ❌ |
| `authenticated` | Standard authenticated routes | ✅ | 100/min | ❌ |
| `authenticated_free_tier` | Auth + stricter free tier limits | ✅ | 100/min (paid), 20/min (free) | ❌ |
| `generation` | AI generation routes | ✅ | 20/min (paid), 3/min (free) | ✅ |
| `premium` | Paid subscription required | ✅ | 100/min | ❌ |
| `admin` | Enterprise/admin only | ✅ | 100/min | ❌ |

### Using withAuth

```typescript
import { withAuth, type AuthContext } from "@/lib/api/auth-middleware";

// Basic authenticated route
export const GET = withAuth(
  async (req: NextRequest, authContext: AuthContext) => {
    const { userId, user, credits, planTier, traceId } = authContext;
    // Your logic here
  },
  "authenticated"
);

// Route with stricter free tier rate limits
export const GET = withAuth(handler, "authenticated_free_tier");

// Premium-only route
export const GET = withAuth(handler, "premium");
```

### Using withGenerationAuth

For AI generation routes that require credit deduction:

```typescript
import { withGenerationAuth, type AuthContext } from "@/lib/api/auth-middleware";
import { CREDIT_COSTS } from "@/constants/limits";

export const POST = withGenerationAuth(
  async (req: NextRequest, authContext: AuthContext) => {
    const { userId, credits, isFreeTier, trialDaysRemaining } = authContext;
    // Generation logic here
  },
  CREDIT_COSTS.IMAGE_GENERATION.STANDARD, // Credits required (for validation)
  { category: "image", toolId: "flux-pro" } // For free tier tracking
);
```

### AuthContext Properties

The middleware provides these properties in `authContext`:

```typescript
interface AuthContext {
  userId: string;              // Clerk user ID (always present for auth routes)
  user: IUser | null;          // Full user document from MongoDB
  credits: number;             // Current credit balance
  planTier: PlanTier;          // "free" | "basic" | "pro" | "enterprise" | "custom"
  isFreeTier: boolean;         // true if user is on free tier
  isActiveSubscription: boolean; // true if subscription is active/trialing
  traceId: string;             // Unique request ID for logging/tracing
  trialExpired?: boolean;      // true if free trial has expired
  trialDaysRemaining?: number; // Days remaining in trial (free tier only)
}
```

---

## API Response Utilities

Use `ApiResponse` for consistent response formatting across all endpoints.

### Import

```typescript
import ApiResponse from "@/utils/api-response/response";
```

### Success Responses

```typescript
// 200 OK - Standard success
return ApiResponse.ok({ user }, "User fetched");
return ApiResponse.success({ data }); // Alias for ok()

// 201 Created - Resource created
return ApiResponse.created({ user }, "User created successfully");

// 202 Accepted - Async operation started
return ApiResponse.processing({
  jobId: "job_123",
  status: "pending",
  estimatedTime: "10-30 seconds",
}, "Job queued for processing");
```

### Error Responses

```typescript
// 400 Bad Request - Invalid input
return ApiResponse.badRequest("Email is required");
return ApiResponse.badRequest("Invalid input", { field: "email", reason: "invalid format" });

// 401 Unauthorized - Not authenticated
return ApiResponse.unauthorized();
return ApiResponse.unauthorized("Session expired");

// 403 Forbidden - No permission
return ApiResponse.forbidden("Admin access required");
return ApiResponse.forbidden("You don't own this resource");

// 403 Insufficient Credits - Specific for credits
return ApiResponse.insufficientCredits(100, 50);
// Returns: { error: { code: "INSUFFICIENT_CREDITS", details: { required: 100, available: 50 } } }

// 404 Not Found
return ApiResponse.notFound("User not found");

// 422 Unprocessable Entity - Validation error
return ApiResponse.invalid("Age must be 18 or older", "age");

// 429 Rate Limited
return ApiResponse.rateLimit(60); // With Retry-After header

// 500 Server Error
return ApiResponse.serverError();
return ApiResponse.serverError("Database connection failed");
```

### Response Structure

All responses follow this consistent structure:

```typescript
// Success Response
{
  "success": true,
  "data": { ... },      // Optional
  "message": "...",     // Optional
  "meta": { ... }       // Optional (pagination, etc.)
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }  // Optional
  }
}
```

---

## Request Validation

Use Zod schemas for runtime validation with full TypeScript support.

### Body Validation

```typescript
import { validateBody } from "@/utils/api-response/response";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.number().int().min(18, "Must be 18 or older").optional(),
});

export const POST = withAuth(async (req, authContext) => {
  try {
    const body = await validateBody(req, createUserSchema);
    // body is typed: { email: string; name: string; age?: number }
    
    const user = await createUser(body);
    return ApiResponse.created({ user });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return ApiResponse.badRequest(
        `${firstError.path.join(".")}: ${firstError.message}`
      );
    }
    return ApiResponse.serverError();
  }
}, "authenticated");
```

### Query Parameter Validation

```typescript
import { validateQuery } from "@/utils/api-response/response";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

export const GET = withAuth(async (req, authContext) => {
  const query = validateQuery(req, querySchema);
  // query is typed: { page: number; limit: number; search?: string; status?: ... }
  
  const results = await fetchResults(query);
  return ApiResponse.success(results);
}, "authenticated");
```

---

## Logging System

The logging system uses Pino with automatic context propagation via Async Local Storage.

### Import

```typescript
import {
  logInfo,
  logError,
  logWarn,
  logDebug,
  logCredits,
  logGeneration,
  logRateLimit,
  logAuth,
  createTimer,
} from "@/lib/logger";
```

### Basic Logging

Context (traceId, userId, path, method) is automatically included:

```typescript
// Info - General information
logInfo("User profile updated", { field: "avatar", size: 1024 });

// Warning - Non-critical issues
logWarn("Deprecated API version used", { version: "v1", recommended: "v2" });

// Error - Errors and exceptions
logError("Failed to save user", error, { userId, operation: "update" });

// Debug - Development info (only in development)
logDebug("Cache miss", { key: "user_123" });
```

### Specialized Logging

```typescript
// Credit operations
logCredits("deduct", 10, { jobId: "job_123", toolId: "flux-pro" });
logCredits("refund", 10, { jobId: "job_123", reason: "job_failed" });
logCredits("add", 100, { source: "subscription_renewal" });

// Generation operations
logGeneration("started", {
  tool: "flux-pro",
  category: "image",
  creditsUsed: 10,
  isFreeTier: false,
});
logGeneration("completed", {
  tool: "flux-pro",
  category: "image",
  duration: 5000,
  imagesGenerated: 4,
});
logGeneration("failed", {
  tool: "flux-pro",
  error: "Provider timeout",
});

// Auth events
logAuth("authenticated", { userId, planTier: "pro" });
logAuth("rate_limited", { userId, rateLimitType: "GENERATION" });

// Rate limit events
logRateLimit(true, { userId, remaining: 5, limit: 20, type: "API" });
logRateLimit(false, { userId, remaining: 0, limit: 20, type: "GENERATION" });
```

### Performance Timing

```typescript
const timer = createTimer("image_generation");

// ... do work ...

const duration = timer.done({ imagesGenerated: 4 });
// Logs: "image_generation completed in 5234ms" with metadata
```

---

## Process Job Service

`ProcessJobService` is the **single source of truth** for all async job operations.

### Import

```typescript
import { ProcessJobService } from "@/lib/services/ProcessJobService";
// Or import individual functions:
import { createJob, completeJob, failJob, getJob } from "@/lib/services/ProcessJobService";
```

### Creating a Job

```typescript
const result = await ProcessJobService.createJob({
  // Required
  userId: "user_123",
  credits: 10,                    // Credits to deduct
  category: "image",              // "image" | "video" | "audio" | "avatar" | "text"
  toolId: "flux-pro",             // Model/tool identifier
  params: { prompt, width },      // Request parameters
  
  // Optional
  toolName: "FLUX Pro",           // Human-readable name
  version: "v1",                  // API version
  idempotencyKey: "unique_key",   // Prevent duplicate jobs
  expectedItems: 4,               // For progress tracking
  metadata: { source: "api" },    // Additional metadata
  expiresIn: 3600000,             // Job expiration (ms)
});

if (!result.success) {
  // Handle errors
  switch (result.errorCode) {
    case "INSUFFICIENT_CREDITS":
      return ApiResponse.insufficientCredits(10, result.availableCredits);
    case "USER_NOT_FOUND":
      return ApiResponse.notFound("User not found");
    case "DUPLICATE_JOB":
      return ApiResponse.ok({ jobId: result.jobId }, "Job already exists");
    default:
      return ApiResponse.serverError(result.error);
  }
}

// Return 202 for async processing
return ApiResponse.processing({
  jobId: result.jobId,
  transactionRef: result.transactionRef,
  status: "pending",
});
```

### Updating Job Status

```typescript
// Start processing (when external API accepts)
await ProcessJobService.startProcessing(jobId, externalJobId);

// Complete successfully
await ProcessJobService.completeJob(
  jobId,
  { images: ["url1", "url2"], metadata: { model: "flux-pro" } },
  "webhook" // actor: "system" | "webhook" | "user"
);

// Fail (automatically refunds credits)
await ProcessJobService.failJob(
  jobId,
  "Provider timeout after 60s",  // Error message
  "PROVIDER_TIMEOUT",            // Error code
  "webhook"                      // Actor
);

// Cancel (automatically refunds credits)
await ProcessJobService.cancelJob(jobId, "User requested cancellation");

// Timeout (automatically refunds credits)
await ProcessJobService.timeoutJob(jobId);
```

### Progress Updates (Multi-step Jobs)

```typescript
// Update progress for jobs generating multiple items
await ProcessJobService.updateProgress(jobId, {
  completedItems: 2,
  itemData: [{ url: "..." }, { url: "..." }],
  currentStep: "Processing item 3 of 4",
});
```

### Webhook Handling (Idempotent)

```typescript
// For providers that send their own job IDs
const result = await ProcessJobService.handleWebhook({
  externalJobId: body.job_id,
  provider: "replicate",
  status: body.status === "succeeded" ? "completed" : "failed",
  data: body.output,
  error: body.error_message,
  errorCode: body.error_code,
  payload: body, // Store raw payload
});

if (result.alreadyProcessed) {
  // Webhook was already processed (idempotent)
  return ApiResponse.ok({ duplicate: true });
}

return ApiResponse.ok({ jobId: result.jobId });
```

### Querying Jobs

```typescript
// Get single job
const job = await ProcessJobService.getJob(jobId);

// Get by external provider ID
const job = await ProcessJobService.getJobByExternalId(externalId);

// Get user's jobs with filters
const jobs = await ProcessJobService.getUserJobs(userId, {
  status: ["pending", "processing"],
  category: "image",
  toolId: "flux-pro",
  startDate: new Date("2024-01-01"),
  limit: 50,
  offset: 0,
});

// Count user's jobs
const count = await ProcessJobService.countUserJobs(userId, "processing");
```

---

## Real-time Updates with Ably

Jobs automatically publish status updates to Ably channels.

### Channel Format

```
process:{jobId}
```

### Message Format

```typescript
{
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "timeout",
  data?: { ... },      // Response data (on completion)
  error?: string,      // Error message (on failure)
  progress?: {
    completed: number,
    failed: number,
    total: number,
    percentage: number,
  },
  refunded?: boolean,  // True if credits were refunded
  refundAmount?: number,
}
```

### Frontend Integration

```typescript
import { useProcessStatusQuery } from "@/hooks/queries/use-process";

function GenerationStatus({ jobId }: { jobId: string }) {
  const { status, data, error, progress, isConnected } = useProcessStatusQuery(jobId, {
    onComplete: (data) => {
      toast.success("Generation complete!");
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error}`);
    },
  });

  if (status === "processing") {
    return <Progress value={progress?.percentage} />;
  }
  
  if (status === "completed") {
    return <ImageGrid images={data.images} />;
  }
  
  return null;
}
```

---

## Rate Limiting

Rate limiting is automatically handled by the middleware.

### Configuration

Rate limits are defined in `constants/cache.ts`:

```typescript
export const RATE_LIMIT_CONFIG = {
  PUBLIC: { requests: 60, window: "1m" },
  API: { requests: 100, window: "1m" },
  GENERATION: { requests: 20, window: "1m" },
  FREE_TIER_API: { requests: 20, window: "1m" },
  FREE_TIER_GENERATION: { requests: 3, window: "1m" },
};
```

### Rate Limit Headers

Responses include these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699123456789
```

### Free Tier Daily Limits

Free tier users have additional daily limits for generations:

| Category | Daily Limit |
|----------|-------------|
| Images | 5 |
| Videos | 1 |
| Audio | 1 |

---

## Complete Examples

### Standard CRUD Route

```typescript
// app/api/profiles/route.ts
import { NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/auth-middleware";
import ApiResponse, { validateBody, validateQuery } from "@/utils/api-response/response";
import { logInfo, logError } from "@/lib/logger";
import { z } from "zod";

// Validation schemas
const updateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
});

const querySchema = z.object({
  includeStats: z.coerce.boolean().default(false),
});

// GET /api/profiles
export const GET = withAuth(
  async (req: NextRequest, { userId }: AuthContext) => {
    try {
      const query = validateQuery(req, querySchema);
      const profile = await ProfileService.getByUserId(userId, query);
      
      if (!profile) {
        return ApiResponse.notFound("Profile not found");
      }
      
      return ApiResponse.success({ profile });
    } catch (error) {
      logError("Failed to fetch profile", error);
      return ApiResponse.serverError();
    }
  },
  "authenticated_free_tier"
);

// PUT /api/profiles
export const PUT = withAuth(
  async (req: NextRequest, { userId }: AuthContext) => {
    try {
      const body = await validateBody(req, updateSchema);
      const profile = await ProfileService.update(userId, body);
      
      logInfo("Profile updated", { fields: Object.keys(body) });
      return ApiResponse.success({ profile }, "Profile updated");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest(error.errors[0].message);
      }
      logError("Failed to update profile", error);
      return ApiResponse.serverError();
    }
  },
  "authenticated"
);
```

### AI Generation Route

```typescript
// app/api/generate/image/route.ts
import { NextRequest } from "next/server";
import { withGenerationAuth, type AuthContext } from "@/lib/api/auth-middleware";
import { ProcessJobService } from "@/lib/services/ProcessJobService";
import ApiResponse, { validateBody } from "@/utils/api-response/response";
import { logGeneration, logError, createTimer } from "@/lib/logger";
import { CREDIT_COSTS } from "@/constants/limits";
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.enum(["flux-pro", "flux-schnell", "sdxl"]),
  width: z.number().int().min(512).max(2048).default(1024),
  height: z.number().int().min(512).max(2048).default(1024),
  numImages: z.number().int().min(1).max(4).default(1),
});

export const POST = withGenerationAuth(
  async (req: NextRequest, authContext: AuthContext) => {
    const { userId, credits, isFreeTier, traceId } = authContext;
    const timer = createTimer("image_generation_request");
    
    try {
      const body = await validateBody(req, generateSchema);
      const creditCost = CREDIT_COSTS.IMAGE_GENERATION.STANDARD * body.numImages;
      
      logGeneration("started", {
        tool: body.model,
        category: "image",
        creditsUsed: creditCost,
        isFreeTier,
      });
      
      // Create job with credit deduction
      const result = await ProcessJobService.createJob({
        userId,
        credits: creditCost,
        category: "image",
        toolId: body.model,
        toolName: getModelDisplayName(body.model),
        params: body,
        expectedItems: body.numImages,
      });
      
      if (!result.success) {
        timer.done({ error: true, errorCode: result.errorCode });
        
        if (result.errorCode === "INSUFFICIENT_CREDITS") {
          return ApiResponse.insufficientCredits(creditCost, result.availableCredits);
        }
        return ApiResponse.serverError(result.error);
      }
      
      // Call external provider
      const externalJobId = await ImageProvider.generate({
        ...body,
        webhookUrl: `${process.env.APP_URL}/api/webhooks/image?jobId=${result.jobId}`,
      });
      
      // Link external job ID for webhook handling
      await ProcessJobService.linkExternalJobId(result.jobId, externalJobId, "replicate");
      await ProcessJobService.startProcessing(result.jobId, externalJobId);
      
      timer.done({ jobId: result.jobId });
      
      return ApiResponse.processing({
        jobId: result.jobId,
        status: "processing",
        estimatedTime: "10-30 seconds",
        traceId,
      });
      
    } catch (error) {
      timer.done({ error: true });
      
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest(error.errors[0].message);
      }
      
      logError("Image generation request failed", error);
      return ApiResponse.serverError();
    }
  },
  CREDIT_COSTS.IMAGE_GENERATION.STANDARD,
  { category: "image", toolId: "flux-pro" }
);
```

### Webhook Handler

```typescript
// app/api/webhooks/replicate/route.ts
import { NextRequest } from "next/server";
import { ProcessJobService } from "@/lib/services/ProcessJobService";
import ApiResponse from "@/utils/api-response/response";
import { logInfo, logError } from "@/lib/logger";
import crypto from "crypto";

// Webhooks bypass auth middleware
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get("webhook-signature");
    
    // Verify webhook signature
    if (!verifyReplicateSignature(body, signature)) {
      return ApiResponse.unauthorized("Invalid webhook signature");
    }
    
    // Handle via ProcessJobService (idempotent)
    const result = await ProcessJobService.handleWebhook({
      externalJobId: body.id,
      provider: "replicate",
      status: mapReplicateStatus(body.status),
      data: body.status === "succeeded" ? { images: body.output } : undefined,
      error: body.error,
      payload: body,
    });
    
    if (result.alreadyProcessed) {
      logInfo("Duplicate webhook received", { externalJobId: body.id });
      return ApiResponse.ok({ duplicate: true });
    }
    
    logInfo("Webhook processed", {
      jobId: result.jobId,
      externalJobId: body.id,
      status: body.status,
    });
    
    return ApiResponse.ok({ jobId: result.jobId });
    
  } catch (error) {
    logError("Webhook processing failed", error);
    return ApiResponse.serverError();
  }
}

function mapReplicateStatus(status: string): "processing" | "completed" | "failed" {
  switch (status) {
    case "succeeded": return "completed";
    case "failed":
    case "canceled": return "failed";
    default: return "processing";
  }
}

function verifyReplicateSignature(body: any, signature: string | null): boolean {
  if (!signature || !process.env.REPLICATE_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", process.env.REPLICATE_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## Best Practices

### Do's ✅

1. **Always use the middleware**
   ```typescript
   export const GET = withAuth(handler, "authenticated");
   ```

2. **Use ApiResponse for all responses**
   ```typescript
   return ApiResponse.success({ data });
   return ApiResponse.badRequest("Invalid input");
   ```

3. **Log all operations**
   ```typescript
   logInfo("User created", { userId });
   logError("Operation failed", error, { context });
   ```

4. **Validate all inputs**
   ```typescript
   const body = await validateBody(req, schema);
   ```

5. **Use ProcessJobService for async operations**
   ```typescript
   const result = await ProcessJobService.createJob({ ... });
   ```

6. **Handle all error cases**
   ```typescript
   if (!result.success) {
     if (result.errorCode === "INSUFFICIENT_CREDITS") { ... }
     if (result.errorCode === "USER_NOT_FOUND") { ... }
   }
   ```

### Don'ts ❌

1. **Don't use console.log**
   ```typescript
   // ❌ Bad
   console.log("User created");
   // ✅ Good
   logInfo("User created", { userId });
   ```

2. **Don't return raw NextResponse**
   ```typescript
   // ❌ Bad
   return NextResponse.json({ data }, { status: 200 });
   // ✅ Good
   return ApiResponse.success({ data });
   ```

3. **Don't manually check auth**
   ```typescript
   // ❌ Bad
   const { userId } = await auth();
   if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   // ✅ Good
   export const GET = withAuth(handler, "authenticated");
   ```

4. **Don't manually deduct credits**
   ```typescript
   // ❌ Bad
   await User.updateOne({ _id: userId }, { $inc: { credits: -10 } });
   // ✅ Good
   await ProcessJobService.createJob({ userId, credits: 10, ... });
   ```

5. **Don't swallow errors silently**
   ```typescript
   // ❌ Bad
   try { ... } catch (e) { return ApiResponse.serverError(); }
   // ✅ Good
   try { ... } catch (e) {
     logError("Operation failed", e);
     return ApiResponse.serverError();
   }
   ```

---

## File Reference

| File | Purpose |
|------|---------|
| `lib/api/auth-middleware/` | Authentication, rate limiting, credit checks |
| `utils/api-response/response.ts` | API response utilities |
| `lib/logger.ts` | Logging system |
| `lib/services/ProcessJobService/` | Job management |
| `lib/services/CreditService/` | Credit operations |
| `lib/ably/` | Real-time messaging |
| `constants/limits.ts` | Credit costs and limits |
| `constants/cache.ts` | Rate limit configuration |
| `app/models/ProcessJob/` | Job data model |
| `app/models/CreditLedger/` | Credit transaction model |

