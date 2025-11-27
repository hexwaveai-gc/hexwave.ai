# Real-Time Process Status System

This document explains how long-running processes (image generation, video processing, etc.) communicate their status to the frontend in real-time using Ably.

## Overview

When a user triggers a long-running operation:
1. Backend creates a `processId` and stores initial data in MongoDB
2. Backend sends request to external API (with webhook URL)
3. Frontend subscribes to Ably channel for that `processId` (via AblyProvider)
4. When external API completes, webhook updates database AND publishes to Ably
5. Frontend receives instant update via Ably subscription

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │ External API│
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ POST /api/tool    │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │ generateUniqueId()│
       │                   │ (stores in MongoDB)
       │                   │                   │
       │                   │ POST with webhook │
       │                   │──────────────────>│
       │                   │                   │
       │  { processId }    │                   │
       │<──────────────────│                   │
       │                   │                   │
       │ Subscribe to      │                   │
       │ process:{id}      │                   │
       │- - - - - - - - - -│- - - - - - - - - >│ (Ably)
       │                   │                   │
       │                   │    Webhook POST   │
       │                   │<──────────────────│
       │                   │                   │
       │                   │ updateProcessData()
       │                   │ + publishToAbly() │
       │                   │                   │
       │  Real-time update │                   │
       │<- - - - - - - - - │ (via Ably)        │
       │                   │                   │
```

## Key Components

### 1. Process ID Generation (with Credit Deduction)

**File:** `app/controllers/processRequest.ts`

```typescript
import { generateUniqueId } from "@/app/controllers/processRequest";

// In your API route
const result = await generateUniqueId({
  userId,                    // Required: Clerk user ID
  creditsToDeduct: 10,       // Required: Credits for this operation
  category: "image",         // Required: "image" | "video"
  toolName: "flux-pro",      // Required: Model identifier
  data: { prompt },          // Optional: Additional metadata
});

if (!result.success) {
  // Handle error: INSUFFICIENT_CREDITS, USER_NOT_FOUND, TRANSACTION_FAILED
  return NextResponse.json({ error: result.message }, { status: 402 });
}

// Return processId to frontend
return NextResponse.json({ processId: result.processId });
```

This atomically (in a single transaction):
1. Checks user has sufficient credits
2. Deducts credits from user balance
3. Creates process record with `creditsUsed`
4. Logs transaction to `credit_transactions` collection

> **Note:** See `docs/credits-and-process-system.md` for complete credit system documentation.

### 2. Process Data Model

**File:** `app/models/processRequest/processRequestmodel.ts`

```typescript
{
  processId: string;      // UUID
  userId: string;         // Clerk user ID
  status: "processing" | "completed" | "failed";
  creditsUsed: number;    // Credits deducted for this process
  category: "image" | "video";
  toolName: string;       // Model identifier (e.g., "flux-pro")
  data: {
    req: { ... },         // Initial request data
    generations?: [...],  // Results (images, videos, etc.)
    error?: string        // Error message if failed
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Updating Process Status

**File:** `app/controllers/updateProcessData.ts`

```typescript
import { updateProcessData } from "@/app/controllers/updateProcessData";

// On success
await updateProcessData(
  processId,
  { generations: ["https://..."] },
  "completed"
);

// On failure (credits are automatically refunded)
await updateProcessData(
  processId,
  { error: "API timeout" },
  "failed"
);
```

This automatically:
1. Updates MongoDB document
2. Publishes to Ably channel `process:{processId}`
3. **If status is "failed":** Refunds `creditsUsed` to user (with idempotency check)

### 4. AblyProvider Setup

**File:** `lib/ably/provider.tsx`

The `AblyProvider` manages Ably connection lifecycle with:
- Dynamic imports to prevent SSR bundling issues
- Connection tied to Clerk authentication
- Automatic cleanup on sign out
- Connection recovery on page refresh

```tsx
// app/layout.tsx
import { AblyProvider } from "@/lib/ably/provider";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <AblyProvider>
          {children}
        </AblyProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
```

### 5. Frontend Subscription (TanStack Query + Ably)

**File:** `hooks/queries/use-process.ts`

The `useProcessStatusQuery` hook combines TanStack Query with Ably real-time subscriptions:

- **AblyProvider** manages the connection and provides subscription methods
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
- SSR-safe: Dynamic imports prevent Node.js bundling issues
- Automatic caching of completed processes
- State recovery on page refresh
- Optional fallback polling if Ably connection fails
- Automatic cache sync when Ably updates arrive
- Connection lifecycle tied to authentication

## Complete Example: Image Generator

### API Route

```typescript
// app/api/generate-image/route.ts
import { generateUniqueId } from "@/app/controllers/processRequest";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { prompt, model } = await req.json();

  // 1. Create process with atomic credit deduction
  const result = await generateUniqueId({
    userId,
    creditsToDeduct: getModelCredits(model), // e.g., 10 credits
    category: "image",
    toolName: model,
    data: { prompt },
  });

  // Handle insufficient credits or other errors
  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: result.error === "INSUFFICIENT_CREDITS" ? 402 : 500 }
    );
  }

  // 2. Call external API with webhook
  await fetch("https://external-api.com/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/image?processId=${result.processId}`,
    }),
  });

  // 3. Return processId immediately
  return NextResponse.json({ processId: result.processId });
}
```

### Webhook Handler

```typescript
// app/api/webhook/image/route.ts
import { updateProcessData } from "@/app/controllers/updateProcessData";

export async function POST(req: NextRequest) {
  const { processId } = req.nextUrl.searchParams;
  const body = await req.json();

  if (body.status === "success") {
    await updateProcessData(
      processId,
      { generations: body.images },
      "completed"
    );
  } else {
    await updateProcessData(
      processId,
      { error: body.error },
      "failed"
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
    // Hook automatically subscribes to Ably channel for real-time updates
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      
      {!isConnected && <p className="text-yellow-500">Connecting...</p>}
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

## AblyProvider API

### Context Value

```typescript
interface AblyContextValue {
  isConnected: boolean;      // Whether Ably connection is established
  isInitializing: boolean;   // Whether Ably is currently initializing
  subscribeToProcess: (      // Subscribe to a process channel
    processId: string,
    onMessage: (message: AblyMessage) => void
  ) => () => void;           // Returns unsubscribe function
}
```

### Available Hooks

**File:** `lib/ably/provider.tsx`

```typescript
import { 
  AblyProvider,           // Provider component (wrap in layout)
  useAbly,                // Access Ably context directly
  useProcessSubscription  // Subscribe to process updates
} from "@/lib/ably/provider";
```

### useProcessSubscription Hook

For custom implementations outside of TanStack Query:

```typescript
import { useProcessSubscription } from "@/lib/ably/provider";

function CustomComponent({ processId }) {
  const { isConnected } = useProcessSubscription(processId, {
    onStatusChange: (status, data) => {
      console.log("Status changed:", status);
    },
    onComplete: (data) => {
      console.log("Completed:", data);
    },
    onError: (error) => {
      console.error("Failed:", error);
    }
  });

  return <div>Connected: {isConnected ? "Yes" : "No"}</div>;
}
```

## TanStack Query Integration

The `useProcessStatusQuery` hook combines TanStack Query caching with Ably real-time subscriptions.

### Available Hooks

**File:** `hooks/queries/use-process.ts`

```typescript
import {
  useProcessStatusQuery,  // Main hook: TanStack Query + Ably
  useStartProcess,        // Mutation to start a process
  useSimulateWebhook,     // (Demo) Simulate webhook callback
  useInvalidateProcess,   // Force refetch process status
  useClearProcessCache,   // Remove process from cache
} from "@/hooks/queries/use-process";
```

### Hook Options

```typescript
useProcessStatusQuery(processId, {
  // Enable Ably real-time subscription (default: true)
  enableRealtime: true,
  
  // Enable polling as fallback (default: false)
  enablePolling: false,
  
  // Polling interval in ms (default: 5000)
  pollingInterval: 5000,
  
  // Callbacks
  onStatusChange: (status, data) => { },
  onComplete: (data) => { },
  onError: (error) => { },
});
```

### Return Values

```typescript
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
} = useProcessStatusQuery(processId);
```

### Query Keys

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
│   │           └── route.ts      # GET process status endpoint
│   ├── controllers/
│   │   ├── processRequest.ts     # generateUniqueId, getProcessRequest
│   │   └── updateProcessData.ts  # updateProcessData (+ Ably publish)
│   ├── layout.tsx                # AblyProvider setup
│   └── models/
│       └── processRequest/
│           └── processRequestmodel.ts
├── hooks/
│   └── queries/
│       ├── index.ts              # Query hooks exports
│       └── use-process.ts        # TanStack Query + Ably hook
├── lib/
│   ├── ably/
│   │   ├── provider.tsx          # AblyProvider, useAbly, useProcessSubscription
│   │   ├── server.ts             # REST client, publishProcessStatus
│   │   ├── types.ts              # ProcessStatusMessage type
│   │   └── index.ts              # Exports
│   └── query/
│       ├── query-keys.ts         # TanStack Query keys (includes processKeys)
│       └── index.ts              # Query exports
```

## Security

- **Token Auth:** Frontend gets short-lived tokens via `/api/ably/token`
- **Subscribe Only:** Frontend tokens only allow subscribing, not publishing
- **User Scoped:** Tokens include `clientId` matching the user's ID
- **Channel Pattern:** `process:*` - each process has its own channel
- **Auth Required:** AblyProvider only initializes when user is signed in

## Debugging

1. **Check MongoDB:** Verify process document exists and has correct status
2. **Check Ably Dashboard:** View real-time channel activity
3. **Browser Console:** Look for Ably connection logs
4. **Network Tab:** Verify `/api/ably/token` returns valid token
5. **Check `isConnected`:** Hook returns connection state for debugging

## Common Issues

| Issue | Solution |
|-------|----------|
| No updates received | Check `ABLY_API_KEY` is set |
| 401 on token endpoint | User not authenticated with Clerk |
| Process stuck on "processing" | Webhook not updating status |
| Hook not subscribing | Verify `processId` is not null and `isConnected` is true |
| Stale data after page refresh | Process status fetched from `/api/process/[processId]` on mount |
| Cache not updating | Ably updates automatically sync with TanStack Query cache |
| SSR build errors | Ensure AblyProvider is in layout.tsx (uses dynamic imports) |
| Connection not establishing | Check user is signed in (AblyProvider requires auth) |

## Related Documentation

- **[Credit System](./credits-and-process-system.md)** - Complete credit deduction, refund, and transaction history documentation
- **[TanStack Query](./tanstack-query.md)** - Query hooks, caching, and state management

## Demo Page

Visit `/examples/ably` to see a working demo of the complete webhook flow with:
- Interactive flow diagram
- Process status monitor
- Webhook simulation controls
- Code examples
