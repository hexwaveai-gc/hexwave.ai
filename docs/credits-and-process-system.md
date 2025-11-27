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
│               │  - CreditLedger │        Webhook                           │
│               │  - User.credits │                                          │
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

1. Check user has sufficient credits (`user.credits`)
2. Deduct credits from user balance
3. Create process record with `creditsUsed`
4. Create credit ledger entry with `balance_before`/`balance_after`

If any step fails, everything rolls back.

### Automatic Refunds

When a process fails (via webhook or trigger.dev), credits are automatically refunded:

1. `updateProcessData()` receives `status: "failed"`
2. Looks up `creditsUsed` from process record
3. Refunds credits to user via `CreditService.refundCredits()`
4. Creates refund ledger entry

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
  category: "image",            // Required: "image" | "video" | "demo"
  toolName: "flux-pro",         // Required: Model/tool identifier
  data: { prompt: "..." },      // Optional: Additional metadata
});

if (result.success) {
  // Process created, credits deducted
  console.log(result.processId);
  console.log(result.transactionRef); // Ledger transaction reference
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
| `credit_ledger` | Deduction entry with `balance_before`, `balance_after`, negative `amount` |
| `users` | Updates `credits` field and `balance_verified_at` |

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
2. Refunds `creditsUsed` to user via `CreditService`
3. Creates refund ledger entry
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
  category: "image" | "video" | "demo",
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
│   │   └── me/route.ts               # GET user data with credits
│   ├── controllers/
│   │   ├── processRequest.ts         # generateUniqueId()
│   │   └── updateProcessData.ts      # updateProcessData() + refund
│   └── models/
│       ├── CreditLedger/
│       │   └── credit-ledger.model.ts
│       ├── processRequest/
│       │   └── processRequestmodel.ts
│       └── User/
│           └── user.model.ts
├── hooks/
│   ├── queries/
│   │   └── use-credits.ts            # TanStack Query hooks
│   └── use-user.ts                   # Main user hook
├── lib/
│   ├── services/
│   │   ├── CreditService.ts          # Credit operations
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
