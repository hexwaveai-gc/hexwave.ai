# Credit System & Process Architecture

> Atomic credit deduction, process tracking, and automatic refunds for tool usage.

## Overview

Every tool usage (image/video generation) follows this flow:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           PROCESS LIFECYCLE                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   User Request          generateUniqueId()              External API         │
│   ───────────►   [Credit Check + Deduction]   ─────────►  Processing        │
│                         │                                    │              │
│                         ▼                                    │              │
│               ┌─────────────────┐                           │              │
│               │  MongoDB Docs   │                           │              │
│               │  - ProcessReq   │◄──────────────────────────┘              │
│               │  - CreditTxn    │        Webhook                           │
│               │  - User Balance │                                          │
│               └─────────────────┘                                          │
│                         │                                                   │
│                         ▼                                                   │
│               ┌─────────────────┐                                          │
│               │   updateProcessData()                                      │
│               │   - Update status                                          │
│               │   - Refund if failed                                       │
│               │   - Notify via Ably                                        │
│               └─────────────────┘                                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### Atomic Credit Deduction

When a user starts a generation, credits are deducted **before** processing begins. This happens atomically in a single MongoDB transaction:

1. Check user has sufficient credits
2. Deduct credits from user balance
3. Create process record with `creditsUsed`
4. Log transaction to history

If any step fails, everything rolls back.

### Automatic Refunds

When a process fails (via webhook or trigger.dev), credits are automatically refunded:

1. `updateProcessData()` receives `status: "failed"`
2. Looks up `creditsUsed` from process record
3. Refunds credits to user (with idempotency check)
4. Logs refund transaction

---

## API Reference

### generateUniqueId()

Creates a process with atomic credit deduction.

**Location:** `app/controllers/processRequest.ts`

```typescript
import { generateUniqueId } from "@/app/controllers/processRequest";

const result = await generateUniqueId({
  userId: "user_123",           // Required: Clerk user ID
  creditsToDeduct: 10,          // Required: Credits for this operation
  category: "image",            // Required: "image" | "video"
  toolName: "flux-pro",         // Required: Model/tool identifier
  data: { prompt: "..." },      // Optional: Additional metadata
});

if (result.success) {
  // Process created, credits deducted
  console.log(result.processId);
} else {
  // Handle error
  console.log(result.error);    // "INSUFFICIENT_CREDITS" | "USER_NOT_FOUND" | "TRANSACTION_FAILED"
  console.log(result.message);  // Human-readable message
  console.log(result.availableCredits); // (for INSUFFICIENT_CREDITS)
}
```

**What it creates:**

| Collection | Document |
|------------|----------|
| `request_processing` | Process record with `processId`, `status: "processing"`, `creditsUsed` |
| `credit_transactions` | DEDUCTION record linked to `processId` |
| `users` | Updates `availableBalance` (-credits) |

---

### updateProcessData()

Updates process status and handles refunds.

**Location:** `app/controllers/updateProcessData.ts`

```typescript
import { updateProcessData } from "@/app/controllers/updateProcessData";

// On success
await updateProcessData(
  processId,
  { generations: ["https://..."] },
  "completed"
);

// On failure (triggers automatic refund)
await updateProcessData(
  processId,
  { error: "API timeout" },
  "failed"
);
```

**On failure, it automatically:**
1. Updates process status to "failed"
2. Refunds `creditsUsed` to user
3. Creates REFUND transaction record
4. Publishes status via Ably

---

## Data Models

### ProcessRequest

```typescript
// Collection: request_processing
{
  processId: string,        // UUID
  userId: string,           // Clerk user ID
  status: "processing" | "completed" | "failed",
  creditsUsed: number,      // Credits deducted for this process
  category: "image" | "video",
  toolName: string,         // e.g., "flux-pro", "kling-ai"
  data: {
    req: { ... },           // Input parameters
    generations?: [...],    // Output URLs
    error?: string,         // Error message
  },
  createdAt: Date,
  updatedAt: Date,
}
```

### CreditTransaction

```typescript
// Collection: credit_transactions
{
  userId: string,
  processId: string | null,  // null for CREDIT_ADDED
  type: "DEDUCTION" | "REFUND" | "CREDIT_ADDED",
  amount: number,            // Always positive
  category: "image" | "video" | null,
  toolName: string | null,
  description: string,       // "Image generation with flux-pro"
  status: "SUCCESS" | "PENDING" | "FAILED",
  createdAt: Date,
}
```

### User (credit fields)

```typescript
// Collection: users
{
  _id: string,              // Clerk user ID
  availableBalance: number, // Current credit balance
  // ... other fields
}
```

---

## Implementation Flow

### 1. API Route (Starting a Process)

```typescript
// app/api/generate-image/route.ts
import { generateUniqueId } from "@/app/controllers/processRequest";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { prompt, model } = await req.json();
  
  // Get credits required for this model
  const creditsRequired = getModelCredits(model);

  // Atomic: check balance + deduct + create process
  const result = await generateUniqueId({
    userId,
    creditsToDeduct: creditsRequired,
    category: "image",
    toolName: model,
    data: { prompt },
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: result.error === "INSUFFICIENT_CREDITS" ? 402 : 500 }
    );
  }

  // Call external API with webhook URL
  await externalApi.generate({
    prompt,
    webhook: `${BASE_URL}/api/webhook/image?processId=${result.processId}`,
  });

  return NextResponse.json({ processId: result.processId });
}
```

### 2. Webhook Handler

```typescript
// app/api/webhook/image/route.ts
import { updateProcessData } from "@/app/controllers/updateProcessData";

export async function POST(req: NextRequest) {
  const processId = req.nextUrl.searchParams.get("processId");
  const body = await req.json();

  if (body.status === "success") {
    await updateProcessData(
      processId,
      { generations: body.images },
      "completed"
    );
  } else {
    // Credits automatically refunded
    await updateProcessData(
      processId,
      { error: body.error },
      "failed"
    );
  }

  return NextResponse.json({ ok: true });
}
```

### 3. Frontend Integration

```tsx
import { useProcessStatusQuery, useStartProcess } from "@/hooks/queries";
import { useInvalidateCredits } from "@/hooks/queries/use-credits";

function ImageGenerator() {
  const [processId, setProcessId] = useState<string | null>(null);
  const invalidateCredits = useInvalidateCredits();
  
  const { status, data, error } = useProcessStatusQuery(processId, {
    onComplete: () => {
      // Refresh credit balance in UI
      invalidateCredits(userId);
    },
    onError: () => {
      // Credits were refunded, refresh balance
      invalidateCredits(userId);
    },
  });

  const handleGenerate = async () => {
    const res = await fetch("/api/generate-image", { ... });
    const { processId } = await res.json();
    setProcessId(processId);
    invalidateCredits(userId); // Show deducted balance
  };
}
```

---

## Credit Service Functions

**Location:** `lib/credits/index.ts`

| Function | Purpose |
|----------|---------|
| `getUserCredits(userId)` | Get user's current balance |
| `hasEnoughCredits(userId, amount)` | Check if user can afford operation |
| `addCredits(options)` | Add credits (subscription, purchase) |
| `refundCredits(options)` | Refund credits (with idempotency) |
| `getTransactionHistory(userId, options)` | Get paginated transactions |

---

## Frontend Hooks

**Location:** `hooks/queries/use-credits.ts`

```typescript
import { 
  useUserCredits,        // Fetch balance with caching
  useTransactionHistory, // Fetch transactions with pagination
  useCreditsCheck,       // Simple hasEnough() helper
  useInvalidateCredits,  // Invalidate cache after changes
} from "@/hooks/queries";

// Example: Display balance
const { data, isLoading } = useUserCredits(userId);
// data?.availableBalance

// Example: Check before action
const { hasEnough } = useCreditsCheck(userId);
if (!hasEnough(requiredCredits)) {
  showUpgradeModal();
}
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/credits/balance` | GET | Get user's credit balance |
| `/api/credits/transactions` | GET | Get transaction history (paginated) |

---

## Error Handling

### Insufficient Credits (402)

```typescript
// API returns
{
  error: "INSUFFICIENT_CREDITS",
  message: "Insufficient credits. Required: 10, Available: 5",
  availableCredits: 5
}
```

### User Not Found

```typescript
{
  error: "USER_NOT_FOUND",
  message: "User not found"
}
```

---

## Idempotency

**Refunds are idempotent.** If a webhook is received multiple times:

1. First call: Refund processed, REFUND transaction created
2. Subsequent calls: Existing REFUND found, skip (no duplicate refund)

This is checked via:
```typescript
const existingRefund = await CreditTransaction.findOne({
  processId,
  type: "REFUND",
  status: "SUCCESS",
});
```

---

## File Structure

```
├── app/
│   ├── api/
│   │   └── credits/
│   │       ├── balance/route.ts      # GET balance
│   │       └── transactions/route.ts # GET history
│   ├── controllers/
│   │   ├── processRequest.ts         # generateUniqueId()
│   │   └── updateProcessData.ts      # updateProcessData() + refund
│   └── models/
│       ├── CreditTransaction/
│       │   └── creditTransaction.model.ts
│       ├── processRequest/
│       │   └── processRequestmodel.ts
│       └── User/
│           └── user.model.ts
├── hooks/
│   └── queries/
│       └── use-credits.ts            # TanStack Query hooks
└── lib/
    └── credits/
        ├── index.ts                  # Credit service functions
        └── types.ts                  # TypeScript interfaces
```

---

## Quick Reference

```typescript
// Start a process with credits
const result = await generateUniqueId({
  userId,
  creditsToDeduct: 10,
  category: "image",
  toolName: "flux-pro",
});

// Complete a process
await updateProcessData(processId, { generations }, "completed");

// Fail a process (auto-refunds)
await updateProcessData(processId, { error }, "failed");

// Frontend: Get balance
const { data } = useUserCredits(userId);

// Frontend: Check credits
const { hasEnough } = useCreditsCheck(userId);

// Frontend: Refresh after changes
const invalidate = useInvalidateCredits();
invalidate(userId);
```

