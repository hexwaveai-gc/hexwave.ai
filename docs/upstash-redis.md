# Upstash Redis Guide

> HTTP-based Redis for caching and rate limiting in serverless environments.

## Quick Start

```typescript
import { cacheGetOrSet, cacheSet, cacheDelete } from "@/lib/cache";
import { checkRateLimit, rateLimitMiddleware } from "@/lib/rate-limiter";
import { TTL_MEDIUM, CACHE_PREFIX } from "@/constants/cache";

// Cache data
const user = await cacheGetOrSet(
  `user:${userId}`,
  () => fetchUserFromDB(userId),
  TTL_MEDIUM
);

// Rate limit
const { success, remaining } = await checkRateLimit(userId, "API");
```

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Configuration](#configuration)
3. [Caching Data](#caching-data)
4. [Rate Limiting](#rate-limiting)
5. [Best Practices](#best-practices)
6. [Developer Guide: Adding New Features](#developer-guide-adding-new-features)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### Why Upstash Redis?

| Feature | Benefit |
|---------|---------|
| **HTTP-based** | Works in serverless (Vercel, Cloudflare) |
| **Pay-per-request** | Cost effective for variable traffic |
| **Global** | Low latency worldwide |
| **Managed** | No infrastructure to maintain |

### When to Use

✅ **Use Redis caching for:**
- Database query results
- API response caching
- Session data
- Configuration that rarely changes
- Rate limiting
- Distributed locks

❌ **Don't use for:**
- Primary data storage (use a database)
- Very large objects (> 1MB)
- Data that must never be lost

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  API Route  │────▶│  lib/cache  │────▶│   Upstash   │
│             │◀────│             │◀────│    Redis    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  lib/redis  │  (Singleton Client)
                    └─────────────┘
```

---

## Configuration

### Environment Variables

```bash
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Project Files

| File | Purpose |
|------|---------|
| `lib/redis.ts` | Singleton Redis client |
| `lib/cache.ts` | Cache utility functions |
| `lib/rate-limiter.ts` | Rate limiting utilities |
| `constants/cache.ts` | TTL values and prefixes |

### Client Configuration (Already Applied)

```typescript
// lib/redis.ts
const client = new Redis({
  enableAutoPipelining: true,  // Batch commands in same tick
  retry: { retries: 5, backoff: exponential },
  readYourWrites: true,        // Consistency guarantee
});
```

---

## Caching Data

### Import

```typescript
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheGetOrSet,
  cacheExists,
  buildCacheKey,
  CACHE_PREFIX,
} from "@/lib/cache";
import { TTL_SHORT, TTL_MEDIUM, TTL_LONG } from "@/constants/cache";
```

### Available TTL Values

| Constant | Duration | Use For |
|----------|----------|---------|
| `TTL_SHORT` | 1 minute | Real-time data, sessions |
| `TTL_MEDIUM` | 5 minutes | API responses, user prefs |
| `TTL_LONG` | 1 hour | Config data, static content |
| `TTL_EXTENDED` | 24 hours | Analytics, aggregated data |
| `TTL_WEEK` | 7 days | Model configs, references |

### Cache Key Prefixes

```typescript
CACHE_PREFIX.USER        // "user"
CACHE_PREFIX.SESSION     // "session"
CACHE_PREFIX.CONFIG      // "config"
CACHE_PREFIX.API         // "api"
CACHE_PREFIX.MODEL       // "model"
CACHE_PREFIX.GENERATION  // "gen"
CACHE_PREFIX.IMAGE       // "image"
CACHE_PREFIX.VIDEO       // "video"
```

### Basic Operations

#### Set a Value

```typescript
// Simple set with default TTL (5 minutes)
await cacheSet("user:123", userData);

// Set with custom TTL
await cacheSet("config:models", modelConfig, TTL_LONG);

// Set with key builder
const key = buildCacheKey(CACHE_PREFIX.USER, "123");
await cacheSet(key, userData, TTL_MEDIUM);
```

#### Get a Value

```typescript
const user = await cacheGet<User>("user:123");

if (user) {
  // Cache hit
  return user;
} else {
  // Cache miss - fetch from database
}
```

#### Delete a Value

```typescript
// Single key
await cacheDelete("user:123");

// Pattern-based deletion (use sparingly)
await cacheInvalidatePattern("user:*");
```

#### Check Existence

```typescript
const exists = await cacheExists("user:123");
```

### Cache-Aside Pattern (Recommended)

The most common and recommended pattern:

```typescript
import { cacheGetOrSet } from "@/lib/cache";

// Automatically: check cache → if miss, fetch → cache result → return
const user = await cacheGetOrSet(
  `user:${userId}`,
  async () => {
    // This only runs on cache miss
    return await db.user.findById(userId);
  },
  TTL_MEDIUM
);
```

### Hash Operations

For objects with multiple fields that you want to update independently:

```typescript
import { cacheHashSet, cacheHashGet, cacheHashGetAll } from "@/lib/cache";

// Set individual field
await cacheHashSet("user:123:prefs", "theme", "dark");
await cacheHashSet("user:123:prefs", "language", "en");

// Get single field
const theme = await cacheHashGet<string>("user:123:prefs", "theme");

// Get all fields
const prefs = await cacheHashGetAll<UserPrefs>("user:123:prefs");
```

### Counter Operations

For analytics, rate counting, etc.:

```typescript
import { cacheIncrement, cacheDecrement } from "@/lib/cache";

// Increment (returns new value)
const views = await cacheIncrement("post:123:views");

// Increment by amount
const score = await cacheIncrement("user:123:score", 10);

// Decrement
const remaining = await cacheDecrement("user:123:credits");
```

### Convenience Functions

Pre-built functions with automatic key prefixing:

```typescript
import {
  cacheUserData,
  getCachedUserData,
  invalidateUserCache,
  cacheConfig,
  getCachedConfig,
} from "@/lib/cache";

// User data
await cacheUserData(userId, userData, TTL_MEDIUM);
const user = await getCachedUserData<User>(userId);
await invalidateUserCache(userId);

// Config data
await cacheConfig("image-models", modelList, TTL_LONG);
const models = await getCachedConfig<Model[]>("image-models");
```

---

## Rate Limiting

### Import

```typescript
import {
  checkRateLimit,
  rateLimitMiddleware,
  createRateLimitHeaders,
  getRateLimitIdentifier,
} from "@/lib/rate-limiter";
```

### Pre-configured Limiters

| Type | Requests | Window | Use For |
|------|----------|--------|---------|
| `API` | 100 | 1 minute | General API endpoints |
| `GENERATION` | 10 | 1 minute | Image/video generation |
| `AUTH` | 5 | 1 minute | Login/signup (brute force protection) |
| `PUBLIC` | 200 | 1 minute | Public/read-only endpoints |

### Basic Rate Limiting

```typescript
import { waitUntil } from "@vercel/functions";

export async function POST(request: Request) {
  const userId = getUserId(request);
  
  const result = await checkRateLimit(userId, "GENERATION");
  
  // IMPORTANT: Always handle pending for analytics
  waitUntil(result.pending);
  
  if (!result.success) {
    return Response.json(
      { error: "Rate limit exceeded", retryAfter: result.reset },
      { status: 429 }
    );
  }
  
  // Continue with API logic...
}
```

### Using the Middleware Helper

Simpler approach for Next.js API routes:

```typescript
import { waitUntil } from "@vercel/functions";
import { rateLimitMiddleware, getRateLimitIdentifier } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  // Get identifier (prefers userId, falls back to IP)
  const userId = getUserId(request);
  const ip = request.headers.get("x-forwarded-for");
  const identifier = getRateLimitIdentifier(userId, ip);
  
  // Check rate limit
  const { response, pending, headers } = await rateLimitMiddleware(
    identifier,
    "GENERATION"
  );
  
  // IMPORTANT: Handle analytics
  waitUntil(pending);
  
  // If rate limited, return 429 response
  if (response) {
    return response;
  }
  
  // Continue with your logic...
  const result = await generateImage(params);
  
  // Optionally add rate limit headers to response
  return Response.json(result, { headers });
}
```

### Rate Limit Response Format

When rate limited, clients receive:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again after 2024-01-15T10:30:00.000Z",
  "retryAfter": 45
}
```

With headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312200000
```

### Creating Custom Rate Limiters

When predefined limiters don't fit:

```typescript
import { createCustomRateLimiter } from "@/lib/rate-limiter";

// 5 requests per hour for expensive operations
const expensiveOpLimiter = createCustomRateLimiter(
  5,      // requests
  "1h",   // window
  "@hexwave/ratelimit:expensive"
);

// Usage
const result = await expensiveOpLimiter.limit(identifier);
```

---

## Best Practices

### ✅ Do

1. **Use cache-aside pattern** - `cacheGetOrSet` handles the logic for you
2. **Set appropriate TTLs** - Match TTL to how often data changes
3. **Use key prefixes** - Always use `CACHE_PREFIX.*` for organization
4. **Handle cache failures gracefully** - All functions return fallback values on error
5. **Use `waitUntil` for rate limit analytics** - Required in serverless environments
6. **Invalidate on mutation** - Clear cache when data changes

### ❌ Don't

1. **Don't cache sensitive data without encryption** - PII, passwords, tokens
2. **Don't set TTL too high for volatile data** - Stale data causes issues
3. **Don't use `cacheInvalidatePattern` frequently** - SCAN is expensive
4. **Don't cache null/undefined intentionally** - Use a sentinel value instead
5. **Don't ignore rate limit `pending`** - Analytics won't work

### Cache Invalidation Strategy

```typescript
// GOOD: Invalidate after mutation
async function updateUser(userId: string, data: UserUpdate) {
  await db.user.update(userId, data);
  await invalidateUserCache(userId);
}

// GOOD: Invalidate related caches
async function deletePost(postId: string, userId: string) {
  await db.post.delete(postId);
  await cacheDelete(`post:${postId}`);
  await cacheDelete(`user:${userId}:posts`); // Related cache
}

// AVOID: Pattern invalidation (unless necessary)
await cacheInvalidatePattern("user:*"); // Expensive!
```

---

## Developer Guide: Adding New Features

### Adding a New Cache Key Prefix

**Step 1: Add to constants** `constants/cache.ts`

```typescript
export const CACHE_PREFIX = {
  // ... existing
  PAYMENT: "payment",      // New prefix for payment data
  ANALYTICS: "analytics",  // New prefix for analytics
} as const;
```

**Step 2: Use in your code**

```typescript
import { buildCacheKey, CACHE_PREFIX } from "@/lib/cache";

const key = buildCacheKey(CACHE_PREFIX.PAYMENT, `invoice:${invoiceId}`);
// Result: "payment:invoice:inv_123"
```

### Adding a New TTL Value

**Step 1: Add to constants** `constants/cache.ts`

```typescript
// Very short TTL for real-time data
export const TTL_REALTIME = 10; // 10 seconds

// Monthly for reference data
export const TTL_MONTH = 2592000; // 30 days
```

**Step 2: Use in cache operations**

```typescript
import { TTL_REALTIME, TTL_MONTH } from "@/constants/cache";

await cacheSet("status:live", liveData, TTL_REALTIME);
await cacheSet("ref:countries", countries, TTL_MONTH);
```

### Adding a New Rate Limit Type

**Step 1: Add configuration** `constants/cache.ts`

```typescript
export const RATE_LIMIT_CONFIG = {
  // ... existing
  WEBHOOK: {
    requests: 50,
    window: "1m", // 50 webhooks per minute
  },
  EXPORT: {
    requests: 3,
    window: "1h", // 3 exports per hour
  },
} as const;
```

**Step 2: Create the limiter** `lib/rate-limiter.ts`

```typescript
export const webhookRateLimiter = createRateLimiter("WEBHOOK");
export const exportRateLimiter = createRateLimiter("EXPORT");
```

**Step 3: Use in API routes**

```typescript
const result = await checkRateLimit(identifier, "WEBHOOK");
```

### Adding Domain-Specific Cache Functions

Create a new file for complex caching logic:

```typescript
// lib/cache/generation-cache.ts
import { cacheGetOrSet, cacheDelete, buildCacheKey, CACHE_PREFIX } from "@/lib/cache";
import { TTL_EXTENDED } from "@/constants/cache";

interface GenerationResult {
  id: string;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * Cache a generation result
 */
export async function cacheGenerationResult(
  generationId: string,
  result: GenerationResult
): Promise<boolean> {
  const key = buildCacheKey(CACHE_PREFIX.GENERATION, generationId);
  return cacheSet(key, result, TTL_EXTENDED);
}

/**
 * Get cached generation result
 */
export async function getCachedGeneration(
  generationId: string
): Promise<GenerationResult | null> {
  const key = buildCacheKey(CACHE_PREFIX.GENERATION, generationId);
  return cacheGet<GenerationResult>(key);
}

/**
 * Get or fetch generation result
 */
export async function getGenerationWithCache(
  generationId: string,
  fetcher: () => Promise<GenerationResult>
): Promise<GenerationResult> {
  const key = buildCacheKey(CACHE_PREFIX.GENERATION, generationId);
  return cacheGetOrSet(key, fetcher, TTL_EXTENDED);
}

/**
 * Invalidate generation cache
 */
export async function invalidateGenerationCache(
  generationId: string
): Promise<number> {
  const key = buildCacheKey(CACHE_PREFIX.GENERATION, generationId);
  return cacheDelete(key);
}
```

### Checklist: Adding Caching to a Feature

- [ ] **Identify cacheable data** - What data is read frequently, changes rarely?
- [ ] **Choose TTL** - Match to data volatility
- [ ] **Choose key prefix** - Use existing or create new in constants
- [ ] **Implement caching** - Use `cacheGetOrSet` pattern
- [ ] **Add invalidation** - Clear cache on mutations
- [ ] **Handle errors** - Cache functions return safe fallbacks
- [ ] **Test cache miss** - Verify fetcher runs correctly
- [ ] **Test cache hit** - Verify cached data is returned

---

## Common Patterns

### Caching Database Queries

```typescript
// In your data access layer
export async function getUserById(userId: string): Promise<User | null> {
  return cacheGetOrSet(
    `user:${userId}`,
    async () => {
      const user = await db.user.findUnique({ where: { id: userId } });
      return user;
    },
    TTL_MEDIUM
  );
}

// Invalidate when user is updated
export async function updateUser(userId: string, data: UpdateData) {
  const user = await db.user.update({ where: { id: userId }, data });
  await cacheDelete(`user:${userId}`);
  return user;
}
```

### Caching API Responses

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelType = searchParams.get("type") || "all";
  
  // Cache key includes query parameters
  const cacheKey = `api:models:${modelType}`;
  
  const models = await cacheGetOrSet(
    cacheKey,
    async () => {
      return await fetchModelsFromProvider(modelType);
    },
    TTL_LONG
  );
  
  return Response.json(models);
}
```

### Caching with User Context

```typescript
// User-specific cache
const userPrefs = await cacheGetOrSet(
  `user:${userId}:preferences`,
  () => fetchUserPreferences(userId),
  TTL_MEDIUM
);

// Shared cache (same for all users)
const globalConfig = await cacheGetOrSet(
  "config:global",
  () => fetchGlobalConfig(),
  TTL_LONG
);
```

### Rate Limiting with Fallback

```typescript
export async function POST(request: Request) {
  const identifier = getRateLimitIdentifier(userId, ip);
  
  try {
    const { response, pending } = await rateLimitMiddleware(identifier, "API");
    waitUntil(pending);
    
    if (response) return response;
  } catch (error) {
    // If rate limiter fails, allow request but log error
    console.error("Rate limiter error:", error);
    // Optionally: use in-memory fallback rate limiting
  }
  
  // Continue processing...
}
```

### Distributed Lock

Use `cacheSetIfNotExists` for simple distributed locks:

```typescript
import { cacheSetIfNotExists, cacheDelete } from "@/lib/cache";

async function processWithLock(jobId: string) {
  const lockKey = `lock:job:${jobId}`;
  const lockTTL = 30; // 30 seconds
  
  // Try to acquire lock
  const acquired = await cacheSetIfNotExists(lockKey, Date.now(), lockTTL);
  
  if (!acquired) {
    throw new Error("Job is already being processed");
  }
  
  try {
    // Do the work
    await processJob(jobId);
  } finally {
    // Release lock
    await cacheDelete(lockKey);
  }
}
```

### Caching Null Results

When you want to cache "not found" results to prevent repeated DB queries:

```typescript
const CACHE_NULL_SENTINEL = "__NULL__";

async function getUserOrNull(userId: string): Promise<User | null> {
  const cacheKey = `user:${userId}`;
  const cached = await cacheGet<User | typeof CACHE_NULL_SENTINEL>(cacheKey);
  
  // Check for sentinel value
  if (cached === CACHE_NULL_SENTINEL) {
    return null;
  }
  
  if (cached) {
    return cached;
  }
  
  // Cache miss - fetch from DB
  const user = await db.user.findUnique({ where: { id: userId } });
  
  // Cache result (including null as sentinel)
  await cacheSet(cacheKey, user ?? CACHE_NULL_SENTINEL, TTL_SHORT);
  
  return user;
}
```

---

## Troubleshooting

### Cache Miss Despite Setting Value

**Possible causes:**
- TTL expired
- Key mismatch (typo, different prefix)
- Cache was invalidated

**Debug:**
```typescript
// Check if key exists and TTL
const exists = await cacheExists(key);
const ttl = await cacheTTL(key);
console.log({ key, exists, ttl });
```

### Rate Limiter Not Working

**Check:**
1. Is `UPSTASH_REDIS_REST_URL` set correctly?
2. Are you using the correct identifier?
3. Is `waitUntil` being called for analytics?

**Debug:**
```typescript
const result = await checkRateLimit(identifier, "API");
console.log({
  identifier,
  success: result.success,
  remaining: result.remaining,
  limit: result.limit,
  reset: new Date(result.reset),
});
```

### High Redis Latency

**Solutions:**
- Enable auto-pipelining (already configured)
- Use regional Redis instance closest to your servers
- Batch operations where possible
- Use ephemeral cache for rate limiting (already configured)

### Environment Variables Not Found

```
Error: Missing Upstash Redis credentials
```

**Fix:**
1. Check `.env.local` has the variables
2. Restart the dev server
3. Verify variable names match exactly

---

## Project Configuration

### Default Settings

| Setting | Value | Location |
|---------|-------|----------|
| Auto Pipelining | Enabled | `lib/redis.ts` |
| Retry Count | 5 | `lib/redis.ts` |
| Retry Backoff | Exponential | `lib/redis.ts` |
| Read Your Writes | Enabled | `lib/redis.ts` |
| Rate Limit Analytics | Enabled | `lib/rate-limiter.ts` |
| Ephemeral Cache | Enabled | `lib/rate-limiter.ts` |

### Files Reference

| File | Purpose |
|------|---------|
| `lib/redis.ts` | Singleton Redis client |
| `lib/cache.ts` | Cache utility functions |
| `lib/rate-limiter.ts` | Rate limiting utilities |
| `constants/cache.ts` | TTL and prefix constants |

---

## Quick Reference

```typescript
// ===== IMPORTS =====
import { cacheGet, cacheSet, cacheDelete, cacheGetOrSet } from "@/lib/cache";
import { checkRateLimit, rateLimitMiddleware } from "@/lib/rate-limiter";
import { TTL_SHORT, TTL_MEDIUM, TTL_LONG, CACHE_PREFIX } from "@/constants/cache";

// ===== CACHING =====
// Get
const data = await cacheGet<T>(key);

// Set
await cacheSet(key, value, TTL_MEDIUM);

// Delete
await cacheDelete(key);

// Get or fetch (RECOMMENDED)
const data = await cacheGetOrSet(key, fetcher, TTL_MEDIUM);

// ===== RATE LIMITING =====
// Check
const { success, remaining } = await checkRateLimit(identifier, "API");

// Middleware (in API route)
const { response, pending } = await rateLimitMiddleware(identifier, "GENERATION");
waitUntil(pending);
if (response) return response;

// ===== KEY BUILDING =====
const key = buildCacheKey(CACHE_PREFIX.USER, userId);
// → "user:123"
```

