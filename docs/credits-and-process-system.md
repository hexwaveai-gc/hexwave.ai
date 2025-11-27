# Credit System & Process Architecture

> Atomic credit deduction, job tracking, and automatic refunds for tool usage.

## Overview

Every tool usage (image/video generation) follows this flow:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           JOB LIFECYCLE                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   User Request      ProcessJobService.createJob()      External API         │
│   ───────────►   [Credit Check + Deduction + Job]  ─────────►  Processing   │
│                         │                                    │              │
│                         ▼                                    │              │
│               ┌─────────────────┐                           │              │
│               │  MongoDB Docs   │                           │              │
│               │  - ProcessJob   │◄──────────────────────────┘              │
│               │  - CreditLedger │        Webhook                           │
│               │  - User.credits │                                          │
│               └─────────────────┘                                          │
│                         │                                                   │
│                         ▼                                                   │
│               ┌─────────────────┐                                          │
│               │   ProcessJobService                                        │
│               │   .completeJob() / .failJob()                              │
│               │   - Update status + history                                │
│               │   - Auto-refund if failed                                  │
│               │   - Notify via Ably                                        │
│               └─────────────────┘                                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### Atomic Credit Deduction

When a user starts a generation, credits are deducted **before** processing begins. This happens atomically via `ProcessJobService.createJob()`:

1. Check idempotency (return existing job if duplicate request)
2. Validate user has sufficient credits via `CreditService`
3. Deduct credits and create ledger entry
4. Create job record with full audit trail
5. If job creation fails, automatically refund credits
6. Publish initial status to Ably

### Automatic Refunds

When a job fails, is cancelled, or times out, credits are automatically refunded:

1. `ProcessJobService.failJob()` / `cancelJob()` / `timeoutJob()` is called
2. Checks if credits were charged and not already refunded
3. Refunds credits via `CreditService.refundCredits()`
4. Updates job record with refund reference
5. Publishes status update via Ably with refund info

---

## API Reference

### ProcessJobService.createJob()

Creates a job with atomic credit deduction.

**Location:** `lib/services/ProcessJobService/index.ts`

```typescript
import { ProcessJobService } from "@/lib/services/ProcessJobService";

const result = await ProcessJobService.createJob({
  userId: "user_123",           // Required: Clerk user ID
  credits: 10,                  // Required: Credits for this operation
  category: "image",            // Required: "image" | "video" | "audio" | "avatar"
  toolId: "flux-pro",           // Required: Model/tool identifier
  toolName: "FLUX Pro",         // Optional: Human-readable name
  params: { prompt: "..." },    // Required: Request parameters
  idempotencyKey: "unique_key", // Optional: Prevent duplicate jobs
  expectedItems: 4,             // Optional: For progress tracking
});

if (result.success) {
  // Job created, credits deducted
  console.log(result.jobId);
  console.log(result.transactionRef); // Ledger transaction reference
} else {
  // Handle error
  console.log(result.errorCode); // "INSUFFICIENT_CREDITS" | "USER_NOT_FOUND" | "DUPLICATE_JOB" | "TRANSACTION_FAILED"
  console.log(result.error);     // Human-readable message
  console.log(result.availableCredits); // (for INSUFFICIENT_CREDITS)
}
```

**What it creates:**

| Collection | Document |
|------------|----------|
| `process_jobs` | Job record with `jobId`, `status: "pending"`, `credits.charged`, `statusHistory` |
| `credit_ledger` | Deduction entry with `balance_before`, `balance_after`, negative `amount` |
| `users` | Updates `credits` field |

---

### ProcessJobService Status Updates

**Location:** `lib/services/ProcessJobService/index.ts`

```typescript
import { ProcessJobService } from "@/lib/services/ProcessJobService";

// Mark as processing (when external API accepts the job)
await ProcessJobService.startProcessing(jobId, "external_job_id");

// On success
await ProcessJobService.completeJob(jobId, {
  generations: ["https://..."],
  metadata: { model: "flux-pro" },
}, "webhook");

// On failure (triggers automatic refund)
await ProcessJobService.failJob(
  jobId,
  "API timeout",
  "PROVIDER_TIMEOUT",
  "webhook"
);

// Cancel by user (triggers automatic refund)
await ProcessJobService.cancelJob(jobId, "User cancelled");

// Timeout (triggers automatic refund)
await ProcessJobService.timeoutJob(jobId);

// Update progress (for multi-step jobs)
await ProcessJobService.updateProgress(jobId, {
  completedItems: 2,
  itemData: [{ url: "..." }, { url: "..." }],
  currentStep: "Processing item 3 of 4",
});
```

**All status methods automatically:**
1. Update job status with full audit history
2. Refund credits if status is `failed`, `cancelled`, or `timeout`
3. Publish status update to Ably for real-time frontend updates

---

## Data Models

### ProcessJob

```typescript
// Collection: process_jobs
{
  jobId: string,            // UUID
  userId: string,           // Clerk user ID
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "timeout",
  category: "image" | "video" | "audio" | "avatar" | "text" | "other",
  toolId: string,           // e.g., "flux-pro", "kling-ai"
  toolName?: string,        // Human-readable name
  
  request: {
    params: { ... },        // Input parameters
    version?: string,       // API version
    timestamp: Date,
  },
  
  response?: {
    data?: { ... },         // Output data
    error?: string,
    errorCode?: string,
  },
  
  credits: {
    charged: number,        // Credits deducted
    refunded: number,       // Credits refunded (if failed)
    deductionRef?: string,  // Ledger reference
    refundRef?: string,     // Refund ledger reference
    refundPending: boolean,
  },
  
  progress?: {
    total: number,
    completed: number,
    failed: number,
    percentage: number,
    currentStep?: string,
  },
  
  webhook?: {
    received: boolean,
    receivedAt?: Date,
    externalJobId?: string,
    provider?: string,
    attemptCount: number,
    lastPayload?: object,
  },
  
  statusHistory: [{
    status: string,
    timestamp: Date,
    actor: "system" | "user" | "webhook" | "timeout",
    reason?: string,
    metadata?: object,
  }],
  
  idempotencyKey?: string,
  expiresAt?: Date,
  metadata?: Map,
  
  startedAt?: Date,
  completedAt?: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

### CreditLedger

Double-entry bookkeeping style ledger for credit transactions.

```typescript
// Collection: credit_ledger
{
  user_id: string,                    // Clerk user ID
  transaction_ref: string,            // Unique reference (txn_xxx)
  type: CreditTransactionType,        // See below
  amount: number,                     // Positive for credit, negative for debit
  balance_before: number,             // Balance before transaction
  balance_after: number,              // Balance after transaction
  status: "completed" | "pending" | "failed" | "reversed",
  source: "paddle_webhook" | "paddle_api" | "system" | "admin" | "api" | "sync",
  description: string,                // Human-readable description
  
  // Optional fields
  transaction_id?: string,            // Paddle transaction ID
  subscription_id?: string,           // Paddle subscription ID
  usage_details?: {                   // For deductions
    operation_type: string,           // "image_generation"
    model_id: string,                 // Model used
    generation_id: string,            // Process ID
  },
  related_transaction_ref?: string,   // For refunds - links to original
  idempotency_key?: string,           // Prevents duplicates
  
  createdAt: Date,
  updatedAt: Date,
}
```

**Transaction Types:**
- `subscription_credit` - Credits from subscription purchase
- `subscription_renewal` - Credits from subscription renewal
- `addon_purchase` - One-time credit purchase
- `usage_deduction` - Credits used for generation
- `refund` - Refunded credits
- `manual_adjustment` - Admin manual adjustment
- `bonus` - Promotional/referral bonus
- `sync_adjustment` - Paddle sync adjustment

### User (credit fields)

```typescript
// Collection: users
{
  _id: string,                    // Clerk user ID
  credits: number,                // Current credit balance
  balance_verified_at: Date,      // Last balance verification
  // ... other fields
}
```

---

## CreditService

Centralized service for all credit operations.

**Location:** `lib/services/CreditService.ts`

### Methods

| Method | Purpose |
|--------|---------|
| `addCredits(input)` | Add credits (subscription, purchase, bonus) |
| `deductCredits(input)` | Deduct credits for usage |
| `refundCredits(input)` | Refund credits (with idempotency) |
| `getBalance(userId)` | Get user's current balance |
| `validateBalance(userId, amount)` | Check if user has enough credits |
| `verifyBalance(userId)` | Reconcile balance against ledger |
| `getTransactionHistory(userId, options)` | Get paginated transactions |
| `getUsageSummary(userId, days)` | Get usage analytics |
| `syncFromPaddle(userId, email)` | Sync credits from Paddle |

### Usage

```typescript
import { 
  CreditService,
  addCredits,
  deductCredits,
  refundCredits,
  getBalance,
  validateBalance,
} from "@/lib/services";

// Add credits
const result = await addCredits({
  userId: "user_123",
  amount: 100,
  type: "subscription_credit",
  description: "Pro plan subscription",
  source: "paddle_webhook",
  transactionId: "txn_xxx",
  subscriptionId: "sub_xxx",
});

// Deduct credits
const result = await deductCredits({
  userId: "user_123",
  amount: 10,
  description: "Image generation with flux-pro",
  usageDetails: {
    operation_type: "image_generation",
    model_id: "flux-pro",
    generation_id: processId,
  },
  idempotencyKey: `process_${processId}`,
});

// Refund credits
const result = await refundCredits({
  userId: "user_123",
  amount: 10,
  description: "Refund for failed image generation",
  relatedTransactionRef: originalTransactionRef,
  source: "system",
});

// Check balance
const balance = await getBalance("user_123");
const { valid, balance, shortfall } = await validateBalance("user_123", 100);
```

---

## Frontend Integration

### Using useUser Hook (Recommended)

The `useUser` hook provides credits with TanStack Query caching and Zustand sync.

```tsx
import { useUser } from "@/hooks/use-user";
import { useProcessStatusQuery, useStartProcess } from "@/hooks/queries";

function ImageGenerator() {
  const [processId, setProcessId] = useState<string | null>(null);
  const { credits, invalidate, hasEnoughCredits } = useUser();
  
  const { status, data, error } = useProcessStatusQuery(processId, {
    onComplete: () => {
      invalidate(); // Refresh credits
    },
    onError: () => {
      invalidate(); // Credits were refunded
    },
  });

  const startProcess = useStartProcess();
  
  const handleGenerate = async () => {
    if (!hasEnoughCredits(10)) {
      showUpgradeModal();
      return;
    }
    
    const { processId } = await startProcess.mutateAsync({
      toolName: "my-tool",
      category: "image",
    });
    setProcessId(processId);
    invalidate(); // Credits deducted
  };

  return (
    <div>
      <p>Credits: {credits}</p>
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}
```

### Using Zustand Store Directly

For optimized re-renders, use selectors:

```tsx
import { useUserStore, selectCredits } from "@/store/useUserStore";

function CreditDisplay() {
  // Only re-renders when credits change
  const credits = useUserStore(selectCredits);
  
  return <span>{credits} credits</span>;
}
```

### Credit Hooks

```typescript
import { 
  useUserCredits,        // Fetch balance with caching
  useTransactionHistory, // Fetch transactions with pagination
  useCreditsCheck,       // Simple hasEnough() helper
  useInvalidateCredits,  // Invalidate cache after changes
} from "@/hooks/queries/use-credits";

// Example: Display balance
const { data, isLoading } = useUserCredits(userId);
// data?.credits

// Example: Check before action
const { hasEnough, balance } = useCreditsCheck(userId);
if (!hasEnough(requiredCredits)) {
  showUpgradeModal();
}
```

---

## Implementation Flow

### 1. API Route (Starting a Job)

```typescript
// app/api/generate-image/route.ts
import { ProcessJobService } from "@/lib/services/ProcessJobService";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { prompt, model } = await req.json();
  
  // Get credits required for this model
  const creditsRequired = getModelCredits(model);

  // Atomic: check balance + deduct + create job
  const result = await ProcessJobService.createJob({
    userId,
    credits: creditsRequired,
    category: "image",
    toolId: model,
    toolName: getModelDisplayName(model),
    params: { prompt },
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.errorCode, message: result.error },
      { status: result.errorCode === "INSUFFICIENT_CREDITS" ? 402 : 500 }
    );
  }

  // Call external API with webhook URL
  await externalApi.generate({
    prompt,
    webhook: `${BASE_URL}/api/webhook/image?jobId=${result.jobId}`,
  });

  return NextResponse.json({ jobId: result.jobId });
}
```

### 2. Webhook Handler

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

### 3. Webhook Handler (Alternative - Idempotent)

For external providers that send their own job IDs:

```typescript
// app/api/webhook/provider/route.ts
import { ProcessJobService } from "@/lib/services/ProcessJobService";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle webhook using external job ID (idempotent)
  const result = await ProcessJobService.handleWebhook({
    externalJobId: body.job_id,
    provider: "provider-name",
    status: body.status === "complete" ? "completed" : "failed",
    data: body.result,
    error: body.error_message,
    errorCode: body.error_code,
    payload: body, // Store raw payload for debugging
  });

  if (result.alreadyProcessed) {
    // Webhook was already processed (idempotent)
    return NextResponse.json({ ok: true, duplicate: true });
  }

  return NextResponse.json({ ok: true, jobId: result.jobId });
}
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/me` | GET | Get user data including credits |
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

**Process deductions and refunds are idempotent.** 

For deductions, an `idempotency_key` is set to `process_{processId}`:
```typescript
await CreditLedger.create({
  // ...
  idempotency_key: `process_${processId}`,
});
```

For refunds, the `related_transaction_ref` links back to the original deduction, preventing duplicates.

---

## File Structure

```
├── app/
│   ├── api/
│   │   ├── credits/
│   │   │   ├── balance/route.ts      # GET balance
│   │   │   └── transactions/route.ts # GET history
│   │   ├── process/
│   │   │   └── [processId]/route.ts  # GET job status
│   │   └── me/route.ts               # GET user data with credits
│   └── models/
│       ├── CreditLedger/
│       │   └── credit-ledger.model.ts
│       ├── ProcessJob/
│       │   └── process-job.model.ts  # Job tracking model
│       └── User/
│           └── user.model.ts
├── hooks/
│   ├── queries/
│   │   ├── use-credits.ts            # Credit hooks
│   │   └── use-process.ts            # Job status hooks
│   └── use-user.ts                   # Main user hook
├── lib/
│   ├── services/
│   │   ├── CreditService/
│   │   │   └── index.ts              # Credit operations
│   │   ├── ProcessJobService/
│   │   │   └── index.ts              # Job operations (SINGLE source of truth)
│   │   └── index.ts                  # Service exports
│   └── types/
│       └── process.ts                # Process types
└── store/
    └── useUserStore.ts               # Zustand user store
```

---

## Quick Reference

```typescript
// Start a process with credits
import { generateUniqueId } from "@/app/controllers/processRequest";

const result = await generateUniqueId({
  userId,
  creditsToDeduct: 10,
  category: "image",
  toolName: "flux-pro",
});

// Complete a process
import { updateProcessData } from "@/app/controllers/updateProcessData";

await updateProcessData(processId, { generations }, "completed");

// Fail a process (auto-refunds)
await updateProcessData(processId, { error }, "failed");

// Frontend: Use user hook
import { useUser } from "@/hooks/use-user";

const { credits, invalidate, hasEnoughCredits } = useUser();

// Frontend: Optimized credit display
import { useUserStore, selectCredits } from "@/store/useUserStore";

const credits = useUserStore(selectCredits);
```
