# Hooks

Application-level React hooks.

## Available Hooks

### `useCheckCredits`

Hook to check user credits and show upgrade modal if insufficient.

```tsx
import { useCheckCredits } from "@/app/hooks/useCheckCredits";

function MyComponent() {
  const { checkCredits, credits, hasEnoughCredits, isLoading, refetch } = useCheckCredits();

  const handleGenerate = () => {
    if (checkCredits({ requiredCredits: 10, showModal: true })) {
      // Proceed with generation
    }
  };

  return (
    <div>
      <p>Credits: {credits}</p>
      <button onClick={handleGenerate} disabled={isLoading}>
        Generate
      </button>
    </div>
  );
}
```

**Returns:**
- `credits` - Current user credit balance
- `checkCredits(options)` - Check if user has enough credits, optionally show modal
- `hasEnoughCredits(required)` - Simple boolean check
- `isLoading` - Loading state
- `refetch()` - Manually refetch credits from API

### `useUser` (from UserProvider)

Hook to access user data from the global store.

```tsx
import { useUser } from "@/app/providers/UserProvider";

function MyComponent() {
  const { 
    credits, 
    subscription, 
    hasActiveSubscription, 
    planName,
    refetch 
  } = useUser();

  return (
    <div>
      <p>Plan: {planName}</p>
      <p>Credits: {credits}</p>
      {hasActiveSubscription && <span>Premium User</span>}
    </div>
  );
}
```

**Returns:**
- `credits` - Current credit balance
- `subscription` - Full subscription object
- `usageSummary` - Usage analytics data
- `isLoading` - Loading state
- `isInitialized` - Whether initial fetch completed
- `hasActiveSubscription` - Boolean for active/trialing status
- `planName` - Current plan name (e.g., "Pro", "Ultimate")
- `planTier` - Current plan tier (e.g., "pro", "enterprise")
- `daysLeftInPeriod` - Days until subscription renewal
- `refetch()` - Force refetch user data
- `refetchWithSummary()` - Refetch with usage summary

## Using the User Store Directly

For fine-grained control, use the store directly with selectors:

```tsx
import { useUserStore, selectCredits, selectHasActiveSubscription } from "@/store";

function MyComponent() {
  // Use selectors for optimized re-renders
  const credits = useUserStore(selectCredits);
  const hasSubscription = useUserStore(selectHasActiveSubscription);
  
  // Access actions
  const deductCredits = useUserStore((state) => state.deductCredits);
  
  const handleAction = () => {
    deductCredits(10); // Optimistic update
  };
}
```

## Location Convention

- **Global hooks** go in `app/hooks/`
- **Feature-specific hooks** go in `app/(tools)/<feature>/hooks/`
- **Global stores** go in `store/`
