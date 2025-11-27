# Real-Time Process Status System

This document explains how long-running processes (image generation, video processing, etc.) communicate their status to the frontend in real-time using Ably.

## Overview

When a user triggers a long-running operation:
1. Backend creates a `jobId` via `ProcessJobService.createJob()` with atomic credit deduction
2. Backend sends request to external API (with webhook URL)
3. Frontend subscribes to Ably channel for that `jobId` (on-demand connection)
4. When external API completes, webhook updates database AND publishes to Ably
5. Frontend receives instant update via Ably subscription
6. Connection automatically closes when job completes

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │ External API│
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ POST /api/tool    │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │ ProcessJobService │
       │                   │ .createJob()      │
       │                   │ (credit deduction + MongoDB)
       │                   │                   │
       │                   │ POST with webhook │
       │                   │──────────────────>│
       │                   │                   │
       │  { jobId }        │                   │
       │<──────────────────│                   │
       │                   │                   │
       │ On-demand connect │                   │
       │ + Subscribe to    │                   │
       │ process:{id}      │                   │
       │- - - - - - - - - -│- - - - - - - - - >│ (Ably)
       │                   │                   │
       │                   │    Webhook POST   │
       │                   │<──────────────────│
       │                   │                   │
       │                   │ ProcessJobService │
       │                   │ .completeJob() or │
       │                   │ .failJob()        │
       │                   │ + auto Ably notify│
       │                   │                   │
       │  Real-time update │                   │
       │<- - - - - - - - - │ (via Ably)        │
       │                   │                   │
       │ Auto-disconnect   │                   │
       │ (job done)        │                   │
```

## Architecture: On-Demand Connection

**Key Principle:** Ably connections are only established when needed, not when users browse the app.

### How It Works

1. **No connection on page load** - Users browsing the app have zero Ably connections
2. **Connection on subscription** - When `useProcessStatusQuery(processId)` is called with a valid processId, a connection is established
3. **Reference counting** - Multiple active processes share one connection
4. **Auto-disconnect** - When all processes complete, connection automatically closes

### Benefits

- Zero WebSocket connections for browsing users
- Reduced costs and server resources
- Connections only exist during active process monitoring
- Automatic cleanup when processes complete

## Key Components

### 1. Job Creation (with Credit Deduction)

**File:** `lib/services/ProcessJobService/index.ts`

```typescript
import { ProcessJobService } from "@/lib/services/ProcessJobService";

// In your API route
const result = await ProcessJobService.createJob({
  userId,                    // Required: Clerk user ID
  credits: 10,               // Required: Credits for this operation
  category: "image",         // Required: "image" | "video" | "audio" | "avatar"
  toolId: "flux-pro",        // Required: Model identifier
  toolName: "FLUX Pro",      // Optional: Human-readable name
  params: { prompt },        // Required: Request parameters
});

if (!result.success) {
  // Handle error: INSUFFICIENT_CREDITS, USER_NOT_FOUND, TRANSACTION_FAILED
  return NextResponse.json(
    { error: result.errorCode, message: result.error },
    { status: result.errorCode === "INSUFFICIENT_CREDITS" ? 402 : 500 }
  );
}

// Return jobId to frontend
return NextResponse.json({ jobId: result.jobId });
```

This atomically:
1. Checks user has sufficient credits (via CreditService)
2. Deducts credits from user balance
3. Creates job record with full audit trail
4. Publishes initial status to Ably

> **Note:** See `docs/credits-and-process-system.md` for complete credit system documentation.

### 2. ProcessJob Data Model

**File:** `app/models/ProcessJob/process-job.model.ts`

```typescript
{
  jobId: string;          // UUID
  userId: string;         // Clerk user ID
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "timeout";
  category: "image" | "video" | "audio" | "avatar" | "text" | "other";
  toolId: string;         // Model identifier (e.g., "flux-pro")
  toolName?: string;      // Human-readable name
  request: {
    params: {...},        // Request parameters
    version?: string,
    timestamp: Date,
  };
  response?: {
    data?: {...},         // Results
    error?: string,
    errorCode?: string,
  };
  credits: {
    charged: number,      // Credits deducted
    refunded: number,     // Credits refunded (if failed)
    deductionRef?: string,
    refundRef?: string,
  };
  progress?: {
    total: number,
    completed: number,
    failed: number,
    percentage: number,
  };
  statusHistory: [...],   // Audit trail
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Updating Job Status

**File:** `lib/services/ProcessJobService/index.ts`

```typescript
import { ProcessJobService } from "@/lib/services/ProcessJobService";

// On success
await ProcessJobService.completeJob(jobId, {
  generations: ["https://..."],
  metadata: { model: "flux-pro" },
});

// On failure (credits are automatically refunded)
await ProcessJobService.failJob(
  jobId,
  "API timeout",
  "PROVIDER_TIMEOUT"
);

// Cancel by user
await ProcessJobService.cancelJob(jobId, "User cancelled");
```

All methods automatically:
1. Update MongoDB document with status history
2. Publish to Ably channel `process:{jobId}`
3. **If status is "failed/cancelled/timeout":** Automatically refund credits

### 4. Ably Singleton Manager

**File:** `lib/ably/client.ts`

The singleton manager handles all Ably connection lifecycle:

```typescript
// Module-level singleton (no Provider needed)
// - Lazy initialization on first subscription
// - Reference counting for active subscriptions
// - Auto-connect when count: 0 → 1
// - Auto-disconnect when count: 1 → 0
```

Key functions:
- `subscribeToProcess(processId, onMessage)` - Subscribe to a process channel
- `closeConnection()` - Manually close connection
- `isConnected()` - Check connection state
- `getConnectionState()` - Get detailed connection state

### 5. Frontend Subscription (TanStack Query + Ably)

**File:** `hooks/queries/use-process.ts`

The `useProcessStatusQuery` hook combines TanStack Query with Ably real-time subscriptions:

- **Singleton Manager** handles on-demand connection and auto-disconnect
- **TanStack Query** handles initial data fetching, caching, and state recovery
- **Ably** handles real-time push updates when processes complete

```tsx
import { useProcessStatusQuery } from "@/hooks/queries/use-process";

function MyComponent({ processId }) {
  const { 
    status,       // "idle" | "processing" | "completed" | "failed"
    data,         // Result data from backend (cached by TanStack Query)
    error,        // Error message if failed
    isLoading,    // true while processing
    isConnected   // true when Ably connection is established
  } = useProcessStatusQuery(processId, {
    onComplete: (data) => {
      toast.success("Done!");
      // data is automatically cached by TanStack Query
      // Connection auto-closes after this
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  if (status === "completed") return <Result data={data} />;
}
```

**Benefits of this architecture:**
- **On-demand connections:** No connection until you have a processId
- **Auto-disconnect:** Connection closes when process completes
- **SSR-safe:** Dynamic imports prevent Node.js bundling issues
- **Automatic caching:** Completed processes cached by TanStack Query
- **State recovery:** Page refresh recovers from cache
- **Fallback polling:** Optional polling if Ably connection fails

## Complete Example: Image Generator

### API Route

```typescript
// app/api/generate-image/route.ts
import { ProcessJobService } from "@/lib/services/ProcessJobService";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { prompt, model } = await req.json();

  // 1. Create job with atomic credit deduction
  const result = await ProcessJobService.createJob({
    userId,
    credits: getModelCredits(model), // e.g., 10 credits
    category: "image",
    toolId: model,
    toolName: getModelDisplayName(model),
    params: { prompt },
  });

  // Handle insufficient credits or other errors
  if (!result.success) {
    return NextResponse.json(
      { error: result.errorCode, message: result.error },
      { status: result.errorCode === "INSUFFICIENT_CREDITS" ? 402 : 500 }
    );
  }

  // 2. Call external API with webhook
  await fetch("https://external-api.com/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/image?jobId=${result.jobId}`,
    }),
  });

  // 3. Return jobId immediately
  return NextResponse.json({ jobId: result.jobId });
}
```

### Webhook Handler

```typescript
// app/api/webhook/image/route.ts
import { ProcessJobService } from "@/lib/services/ProcessJobService";

export async function POST(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  const body = await req.json();

  if (body.status === "success") {
    await ProcessJobService.completeJob(jobId, {
      generations: body.images,
    }, "webhook");
  } else {
    // Credits automatically refunded
    await ProcessJobService.failJob(
      jobId,
      body.error || "Provider error",
      body.error_code,
      "webhook"
    );
  }

  return NextResponse.json({ ok: true });
}
```

### Frontend Component

```tsx
"use client";
import { useState } from "react";
import { useProcessStatusQuery } from "@/hooks/queries/use-process";

export function ImageGenerator() {
  const [processId, setProcessId] = useState<string | null>(null);
  
  const { status, data, error, isLoading, isConnected } = useProcessStatusQuery(processId, {
    onComplete: (data) => {
      // Process completed - data is now cached by TanStack Query
      // Ably connection automatically closes
      console.log("Generation complete:", data);
    },
    onError: (error) => {
      console.error("Generation failed:", error);
    }
  });

  const handleGenerate = async () => {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      body: JSON.stringify({ prompt: "A sunset" }),
    });
    const { processId } = await res.json();
    setProcessId(processId);
    // Hook automatically:
    // 1. Establishes Ably connection (if not already connected)
    // 2. Subscribes to process:{processId} channel
    // 3. Updates TanStack Query cache on status changes
    // 4. Auto-unsubscribes and disconnects when done
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      
      {isLoading && <p>Generating...</p>}
      {error && <p>Error: {error}</p>}
      {status === "completed" && data?.generations && (
        <img src={data.generations[0]} alt="Generated" />
      )}
    </div>
  );
}
```

## Ably Message Format

Messages published to `process:{processId}` channel:

```typescript
{
  status: "processing" | "completed" | "failed",
  processId: string,
  data?: { ... },     // Result data
  error?: string,     // Error message
  timestamp: number   // Unix timestamp
}
```

## Available Hooks

### useProcessStatusQuery (Recommended)

**File:** `hooks/queries/use-process.ts`

Main hook combining TanStack Query caching with Ably real-time:

```typescript
import { useProcessStatusQuery } from "@/hooks/queries/use-process";

const {
  // Process state
  status,          // "idle" | "processing" | "completed" | "failed"
  data,            // Result data (cached)
  error,           // Error message
  processId,       // Current process ID
  isLoading,       // true while processing

  // TanStack Query state
  isInitialLoading,// true during first fetch
  isFetching,      // true during any fetch
  isStale,         // true if data is stale

  // Connection state
  isConnected,     // true when Ably connection is established

  // Actions
  refetch,         // Force refetch from API
} = useProcessStatusQuery(processId, {
  enableRealtime: true,      // Enable Ably (default: true)
  enablePolling: false,      // Fallback polling (default: false)
  pollingInterval: 5000,     // Polling interval if enabled
  onStatusChange: (status, data) => { },
  onComplete: (data) => { },
  onError: (error) => { },
});
```

### useProcessSubscription (Low-level)

**File:** `lib/ably/provider.tsx`

For custom implementations outside TanStack Query:

```typescript
import { useProcessSubscription } from "@/lib/ably/provider";

const { isConnected, isSubscribing } = useProcessSubscription(processId, {
  onStatusChange: (status, data) => console.log("Status:", status),
  onComplete: (data) => console.log("Done:", data),
  onError: (error) => console.error("Failed:", error),
  autoUnsubscribeOnComplete: true,  // Auto-cleanup (default: true)
});
```

### Other Hooks

```typescript
import {
  useStartProcess,        // Mutation to start a process
  useSimulateWebhook,     // (Demo) Simulate webhook callback
  useInvalidateProcess,   // Force refetch process status
  useClearProcessCache,   // Remove process from cache
} from "@/hooks/queries/use-process";

import { useAblyConnection } from "@/lib/ably/provider";
const { isConnected } = useAblyConnection();  // Monitor connection state
```

## Query Keys (TanStack Query)

```typescript
import { processKeys } from "@/lib/query";

// Available keys for cache operations
processKeys.all                    // ["process"]
processKeys.detail(processId)      // ["process", processId]
processKeys.list(filters)          // ["process", "list", filters]
processKeys.userProcesses(userId)  // ["process", "user", userId, limit]

// Example: Invalidate a specific process
queryClient.invalidateQueries({ 
  queryKey: processKeys.detail(processId) 
});
```

## Environment Setup

Add to `.env.local`:

```
ABLY_API_KEY=your-ably-api-key
```

Get your API key from [Ably Dashboard](https://ably.com/accounts).

## File Structure

```
hexwave.ai/
├── app/
│   ├── api/
│   │   ├── ably/
│   │   │   └── token/
│   │   │       └── route.ts      # Token auth endpoint
│   │   └── process/
│   │       └── [processId]/
│   │           └── route.ts      # GET job status endpoint
│   └── models/
│       └── ProcessJob/
│           └── process-job.model.ts  # ProcessJob Mongoose model
├── hooks/
│   └── queries/
│       ├── index.ts              # Query hooks exports
│       └── use-process.ts        # TanStack Query + Ably hook
├── lib/
│   ├── ably/
│   │   ├── client.ts             # Singleton manager (connection lifecycle)
│   │   ├── provider.tsx          # useProcessSubscription, useAblyConnection
│   │   ├── server.ts             # REST client, publishProcessStatus
│   │   ├── types.ts              # ProcessStatusMessage type
│   │   └── index.ts              # Exports
│   ├── services/
│   │   └── ProcessJobService/
│   │       └── index.ts          # ProcessJobService (SINGLE source of truth)
│   └── query/
│       ├── query-keys.ts         # TanStack Query keys (includes processKeys)
│       └── index.ts              # Query exports
```

## Security

- **Token Auth:** Frontend gets short-lived tokens via `/api/ably/token`
- **Subscribe Only:** Frontend tokens only allow subscribing, not publishing
- **User Scoped:** Tokens include `clientId` matching the user's ID
- **Channel Pattern:** `process:*` - each process has its own channel
- **On-Demand Auth:** Token fetched only when connection is needed

## Debugging

1. **Check MongoDB:** Verify process document exists and has correct status
2. **Check Ably Dashboard:** View real-time channel activity
3. **Browser Console:** Look for Ably connection logs
4. **Network Tab:** Verify `/api/ably/token` returns valid token
5. **Check `isConnected`:** Hook returns connection state for debugging

```typescript
// Debug subscription count
import { getSubscriptionCount } from "@/lib/ably/client";
console.log("Active subscriptions:", getSubscriptionCount());
```

## Common Issues

| Issue | Solution |
|-------|----------|
| No updates received | Check `ABLY_API_KEY` is set |
| 401 on token endpoint | User not authenticated with Clerk |
| Process stuck on "processing" | Webhook not updating status |
| Hook not subscribing | Verify `processId` is not null |
| Connection not establishing | Check `/api/ably/token` endpoint works |
| Stale data after page refresh | Process status fetched from `/api/process/[processId]` on mount |
| Cache not updating | Ably updates automatically sync with TanStack Query cache |
| Multiple connections | Should only have one - check subscription count |

## Related Documentation

- **[Credit System](./credits-and-process-system.md)** - Complete credit deduction, refund, and transaction history documentation
- **[TanStack Query](./tanstack-query.md)** - Query hooks, caching, and state management

## Demo Page

Visit `/examples/ably` to see a working demo of the complete webhook flow with:
- Interactive flow diagram
- Process status monitor
- Webhook simulation controls
- Code examples
