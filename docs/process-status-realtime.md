# Real-Time Process Status System

This document explains how long-running processes (image generation, video processing, etc.) communicate their status to the frontend in real-time using Ably.

## Overview

When a user triggers a long-running operation:
1. Backend creates a `processId` and stores initial data in MongoDB
2. Backend sends request to external API (with webhook URL)
3. Frontend subscribes to Ably channel for that `processId`
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

### 1. Process ID Generation

**File:** `app/controllers/processRequest.ts`

```typescript
import { generateUniqueId } from "@/app/controllers/processRequest";

// In your API route
const processId = await generateUniqueId({
  userId,
  toolName: "image-generator",
  category: "image",
  // any other data you need to track
});

// Return processId to frontend
return NextResponse.json({ processId });
```

This creates a MongoDB document with:
- `processId` - UUID
- `status` - "processing"
- `data.req` - Your initial data

### 2. Process Data Model

**File:** `app/models/processRequest/processRequestmodel.ts`

```typescript
{
  processId: string;      // UUID
  status: "processing" | "completed" | "failed";
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

// In your webhook handler
await updateProcessData(
  processId,
  { 
    generations: ["https://..."],  // Result data
  },
  "completed"  // or "failed"
);
```

This automatically:
1. Updates MongoDB document
2. Publishes to Ably channel `process:{processId}`

### 4. Frontend Subscription

**File:** `hooks/useProcessStatus.ts`

```tsx
import { useProcessStatus } from "@/hooks/useProcessStatus";

function MyComponent({ processId }) {
  const { 
    status,      // "idle" | "processing" | "completed" | "failed"
    data,        // Result data from backend
    error,       // Error message if failed
    isLoading    // true while processing
  } = useProcessStatus(processId, {
    onComplete: (data) => {
      toast.success("Done!");
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

## Complete Example: Image Generator

### API Route

```typescript
// app/api/generate-image/route.ts
import { generateUniqueId } from "@/app/controllers/processRequest";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { prompt } = await req.json();

  // 1. Create process ID
  const processId = await generateUniqueId({
    userId,
    prompt,
    toolName: "image-generator",
  });

  // 2. Call external API with webhook
  await fetch("https://external-api.com/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/image?processId=${processId}`,
    }),
  });

  // 3. Return processId immediately
  return NextResponse.json({ processId });
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
import { useProcessStatus } from "@/hooks/useProcessStatus";

export function ImageGenerator() {
  const [processId, setProcessId] = useState<string | null>(null);
  
  const { status, data, error, isLoading } = useProcessStatus(processId);

  const handleGenerate = async () => {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      body: JSON.stringify({ prompt: "A sunset" }),
    });
    const { processId } = await res.json();
    setProcessId(processId);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      
      {isLoading && <p>Generating...</p>}
      {error && <p>Error: {error}</p>}
      {status === "completed" && (
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
│   │   └── ably/
│   │       └── token/
│   │           └── route.ts      # Token auth endpoint
│   ├── controllers/
│   │   ├── processRequest.ts     # generateUniqueId, getProcessRequest
│   │   └── updateProcessData.ts  # updateProcessData (+ Ably publish)
│   └── models/
│       └── processRequest/
│           └── processRequestmodel.ts
├── hooks/
│   └── useProcessStatus.ts       # React hook for subscriptions
└── lib/
    └── ably/
        ├── server.ts             # REST client, publishProcessStatus
        ├── client.ts             # Realtime client for frontend
        └── index.ts              # Exports
```

## Security

- **Token Auth:** Frontend gets short-lived tokens via `/api/ably/token`
- **Subscribe Only:** Frontend tokens only allow subscribing, not publishing
- **User Scoped:** Tokens include `clientId` matching the user's ID
- **Channel Pattern:** `process:*` - each process has its own channel

## Debugging

1. **Check MongoDB:** Verify process document exists and has correct status
2. **Check Ably Dashboard:** View real-time channel activity
3. **Browser Console:** Look for Ably connection logs
4. **Network Tab:** Verify `/api/ably/token` returns valid token

## Common Issues

| Issue | Solution |
|-------|----------|
| No updates received | Check `ABLY_API_KEY` is set |
| 401 on token endpoint | User not authenticated with Clerk |
| Process stuck on "processing" | Webhook not updating status |
| Hook not subscribing | Verify `processId` is not null |

