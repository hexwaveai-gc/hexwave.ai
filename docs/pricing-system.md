# Centralized Pricing System

## Overview

This document describes the centralized pricing system for the Hexwave.ai platform. The system handles all credit calculations for 30+ image models, 70+ video models, audio generation, avatars, and other tools.

## Architecture

```
lib/pricing/
├── config.ts      # Model costs & platform config (SINGLE SOURCE OF TRUTH)
├── calculator.ts  # Cost calculation functions
├── hooks.ts       # React hooks for frontend
└── index.ts       # Public API exports
```

## Quick Start

### Backend Usage

```typescript
import { calculateCredits, getModelCredits, hasEnoughCredits } from "@/lib/pricing";

// Calculate credits for an operation
const result = calculateCredits({
  modelId: "flux-pro",
  units: 2, // 2 images
});

console.log(result.credits);        // 24 (credits to charge)
console.log(result.thirdPartyCost); // $0.08
console.log(result.platformFee);    // $0.032
console.log(result.display);        // "24 credits (2 images)"

// Quick credit lookup
const credits = getModelCredits("veo3", "1080p"); // For video per second

// Check if user can afford
const check = hasEnoughCredits(userCredits, "flux-pro", 2);
if (!check.hasEnough) {
  return { error: `Need ${check.shortfall} more credits` };
}
```

### Frontend Usage

```tsx
import { usePricing, useCostPreview } from "@/lib/pricing/hooks";

function GenerateButton({ modelId, userCredits }) {
  const { credits, formatted, canAfford } = usePricing({
    modelId: "flux-pro",
    units: 1,
  });
  
  return (
    <button disabled={!canAfford(userCredits)}>
      Generate ({formatted})
    </button>
  );
}

// Real-time cost preview
function VideoGenerator() {
  const [duration, setDuration] = useState(5);
  
  const preview = useCostPreview("veo3", {
    units: duration,
  });
  
  return (
    <div>
      <Slider value={duration} onChange={setDuration} />
      <p>Estimated: {preview.formatted}</p>
    </div>
  );
}
```

## Platform Configuration

All pricing is controlled by these values in `config.ts`:

```typescript
export const PLATFORM_CONFIG = {
  CREDIT_RATIO: 200,     // 1$ = 200 credits
  PLATFORM_MARGIN: 0.40, // 40% markup on 3rd party costs
  MIN_CREDITS: 1,        // Minimum credits for any operation
  ROUNDING: "ceil",      // Round up to avoid losses
};
```

## Pricing Formula

```
User Credits = ceil((3rd Party Cost × (1 + PLATFORM_MARGIN)) × CREDIT_RATIO)

Example with $0.04 API cost (FLUX Pro):
- With 40% margin: $0.04 × 1.40 = $0.056
- Convert to credits: $0.056 × 200 = 11.2
- Rounded up: 12 credits
```

## Supported Pricing Types

### 1. Per Image (`per_image`)
```typescript
{
  type: "per_image",
  thirdPartyCost: 0.04, // $0.04 per image
  provider: "fal.ai",
}
```

### 2. Per Second (`per_second`)
```typescript
{
  type: "per_second",
  thirdPartyCost: 0.35, // $0.35 per second of video
  provider: "fal.ai (Google)",
}
```

### 3. Per Minute (`per_minute`)
```typescript
{
  type: "per_minute",
  thirdPartyCost: 0.10, // $0.10 per minute of audio
  provider: "HeyGen",
}
```

### 4. Per Character (`per_character`)
```typescript
{
  type: "per_character",
  thirdPartyCost: 0.00003, // $0.03 per 1000 characters
  provider: "ElevenLabs",
}
```

### 5. Fixed (`fixed`)
```typescript
{
  type: "fixed",
  thirdPartyCost: 0.25, // $0.25 per generation
  includedDuration: 6,   // For display: "6 seconds included"
  provider: "fal.ai (Minimax)",
}
```

### 6. Tiered (`tiered`)
Resolution or quality-based pricing:
```typescript
{
  type: "tiered",
  thirdPartyCost: 0.06, // Default (balanced)
  tiers: [
    { id: "TURBO", label: "Turbo", thirdPartyCost: 0.03 },
    { id: "BALANCED", label: "Balanced", thirdPartyCost: 0.06 },
    { id: "QUALITY", label: "Quality", thirdPartyCost: 0.09 },
  ],
  provider: "fal.ai",
}
```

### 7. Tiered Template (`tiered_template`)
Template-based pricing (e.g., Vidu):
```typescript
{
  type: "tiered_template",
  thirdPartyCost: 0.20,
  standardCost: 0.20,
  premiumCost: 0.30,
  advancedCost: 0.50,
  provider: "fal.ai (Vidu)",
}
```

## Adding a New Model

1. Open `lib/pricing/config.ts`
2. Add to the appropriate section:

```typescript
// In IMAGE_MODEL_COSTS, VIDEO_MODEL_COSTS, etc.
"new-model-id": {
  id: "new-model-id",
  name: "New Model Name",
  category: "image", // or "video", "audio", "avatar", "other"
  cost: {
    type: "per_image",
    thirdPartyCost: 0.05, // What you pay the 3rd party
    provider: "Provider Name",
    description: "Optional description",
  },
  // Optional: cost modifiers
  modifiers: [
    {
      field: "resolution",
      value: "4k",
      multiplier: 2,
      description: "4K doubles the cost",
    },
  ],
},
```

3. That's it! The system automatically:
   - Adds 40% platform margin
   - Converts to credits (1$ = 200 credits)
   - Makes it available in frontend hooks
   - Handles all calculation logic

## Changing Pricing Strategy

### Change Credit Ratio
```typescript
// 1$ = 100 credits instead of 200
CREDIT_RATIO: 100,
```

### Change Platform Margin
```typescript
// 50% margin instead of 40%
PLATFORM_MARGIN: 0.50,
```

### Change Rounding
```typescript
// Round to nearest instead of ceiling
ROUNDING: "round",
```

## Cost Modifiers

Handle special cases like 4K resolution costing more:

```typescript
"nano-banana-pro": {
  id: "nano-banana-pro",
  name: "Nano Banana Pro",
  category: "image",
  cost: {
    type: "per_image",
    thirdPartyCost: 0.15,
    provider: "fal.ai",
  },
  modifiers: [
    {
      field: "resolution",
      value: "4k",
      multiplier: 2,
      description: "4K resolution doubles the cost",
    },
  ],
},
```

Usage:
```typescript
const result = calculateCredits({
  modelId: "nano-banana-pro",
  units: 1,
  modifiers: { resolution: "4k" },
});
// Cost is doubled due to 4K modifier
```

## Integration with Existing Systems

### Update CreditService Usage

```typescript
// In your API routes
import { calculateCredits } from "@/lib/pricing";
import { CreditService } from "@/lib/services/CreditService";

async function generateImage(userId: string, modelId: string, numImages: number) {
  // Calculate cost using centralized pricing
  const pricing = calculateCredits({
    modelId,
    units: numImages,
  });
  
  // Deduct credits
  const result = await CreditService.deductCredits({
    userId,
    amount: pricing.credits,
    description: `${modelId} image generation`,
    usageDetails: {
      operation_type: "image_generation",
      model_id: modelId,
      quantity: numImages,
    },
  });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  // Proceed with generation...
}
```

### Update Frontend Components

```tsx
// Replace hardcoded costs with hook
import { usePricing } from "@/lib/pricing/hooks";

function ModelCard({ modelId }) {
  const { credits, formatted, modelInfo } = usePricing({
    modelId,
    units: 1,
  });
  
  return (
    <Card>
      <h3>{modelInfo?.name}</h3>
      <p>{formatted} per {modelInfo?.unitLabel}</p>
    </Card>
  );
}
```

## Debugging & Admin

```typescript
import { 
  getPlatformConfig, 
  getThirdPartyCostFromCredits,
  getModelCostInfo 
} from "@/lib/pricing";

// Get current config
const config = getPlatformConfig();
console.log(config); 
// { CREDIT_RATIO: 200, PLATFORM_MARGIN: 0.40, ... }

// Reverse calculate: What's the 3rd party cost for 100 credits?
const cost = getThirdPartyCostFromCredits(100);
console.log(cost); // ~$0.357 (reverse of the formula)

// Get detailed model info
const info = getModelCostInfo("flux-pro");
console.log(info);
// { modelId, name, category, creditsPerUnit, unitLabel, pricingType, provider }
```

## Migration Guide

### From Hardcoded Costs

Before:
```typescript
// Old way - scattered across codebase
const CREDIT_COSTS = {
  IMAGE_GENERATION: { STANDARD: 10, HD: 20 },
  VIDEO_GENERATION: { SHORT: 50 },
};
```

After:
```typescript
// New way - centralized
import { calculateCredits } from "@/lib/pricing";

const result = calculateCredits({
  modelId: "flux-pro",
  units: 1,
});
// Credits are calculated from actual 3rd party costs
```

### From model-configs.js

Before:
```javascript
// Old image model config
export const MODEL_CONFIGS = {
  "flux-pro": {
    cost: 0.04,
    // ... other config
  },
};
```

After:
```typescript
// Use centralized pricing, keep model-specific settings separate
import { getModelCredits } from "@/lib/pricing";

// Model settings remain in model-configs.js
// Pricing comes from lib/pricing/config.ts
const credits = getModelCredits("flux-pro");
```

## Best Practices

1. **Always use the centralized system** - Don't calculate costs manually
2. **Use hooks in React** - They handle memoization and updates
3. **Add new models to config.ts** - Single source of truth
4. **Test pricing changes** - Use `calculateCredits` to verify
5. **Document 3rd party costs** - Keep provider pricing updated

---

# Business Analysis: Credit Ratio & Margins

## Current Configuration Analysis

### 1$ = 200 Credits

**Pros:**
- ✅ Psychologically appealing - users feel they have "more"
- ✅ Allows granular pricing without decimals
- ✅ Easy math: $10 = 2,000 credits, $50 = 10,000 credits
- ✅ Room for small operations (1-5 credits)

**Cons:**
- ⚠️ Large numbers can seem overwhelming
- ⚠️ Need to ensure minimum operations cost at least 1 credit

**Alternative Ratios:**

| Ratio | $1 Value | $0.04 API Cost (credits) | Perception |
|-------|----------|--------------------------|------------|
| 1:100 | 100 credits | 6 credits | Simpler math |
| 1:200 | 200 credits | 12 credits | Current |
| 1:500 | 500 credits | 28 credits | More "generous" feel |
| 1:1000 | 1,000 credits | 56 credits | Gamified feel |

**Recommendation:** **Keep 1:200** - It's a good balance between simplicity and granularity.

---

### 40% Platform Margin

**Analysis:**

Your pricing formula: `User Cost = 3rd Party Cost × 1.40`

For a $0.04 API call:
- 3rd party cost: $0.04
- Platform fee: $0.016
- Total: $0.056
- User pays: 12 credits ($0.06 at 200 credits/$)

**Margin Comparison:**

| Margin | $0.04 API → User Pays | Your Profit | Gross Margin |
|--------|----------------------|-------------|--------------|
| 30% | $0.052 (10 credits) | $0.012 | 23% |
| 40% | $0.056 (12 credits) | $0.016 | 29% |
| 50% | $0.060 (12 credits) | $0.020 | 33% |
| 60% | $0.064 (13 credits) | $0.024 | 38% |
| 100% | $0.080 (16 credits) | $0.040 | 50% |

**Industry Benchmarks:**
- Zapier: 50-70% margin on API costs
- Vercel: 40-60% margin
- Twilio: 30-50% margin
- Most SaaS platforms: 50-80% gross margin target

**Considerations:**

1. **40% is on the lower end** for SaaS platforms
2. **Operational costs not included:**
   - Server infrastructure
   - Rate limiting
   - Queue management
   - Storage (Cloudinary, S3)
   - Support
   - Development
   
3. **Total Cost per Operation:**
   ```
   3rd Party API: $0.04
   Server costs: ~$0.005
   Storage: ~$0.002
   Bandwidth: ~$0.001
   Support allocation: ~$0.002
   ---
   True cost: ~$0.05
   
   At 40% margin on $0.04:
   You charge: $0.056
   You actually lose: -$0.006 per operation!
   ```

**Recommendation: Increase to 50-60%**

```typescript
// Recommended config
export const PLATFORM_CONFIG = {
  CREDIT_RATIO: 200,
  PLATFORM_MARGIN: 0.55, // 55% margin
  MIN_CREDITS: 1,
  ROUNDING: "ceil",
};
```

With 55% margin:
- $0.04 API → $0.062 → 13 credits
- Better covers operational costs
- Still competitive pricing
- Room for discounts/promotions

---

## Pricing Strategy Recommendations

### 1. Tiered Margins by Category

Different categories have different operational costs:

```typescript
// Alternative: Category-specific margins
const CATEGORY_MARGINS = {
  image: 0.50,   // Lower operational overhead
  video: 0.60,   // Higher processing/storage costs
  audio: 0.45,   // Medium overhead
  avatar: 0.55,  // Custom processing
};
```

### 2. Volume Discounts

Consider reducing margin for high-volume users:

```typescript
const VOLUME_TIERS = {
  standard: 0.55,  // 0-10,000 credits/month
  pro: 0.45,       // 10,000-50,000 credits/month
  enterprise: 0.35, // 50,000+ credits/month
};
```

### 3. Subscription Bonus Credits

Your current plans:
- Pro: $29/month → 4,000 credits ($0.00725/credit)
- Ultimate: $39/month → 8,000 credits ($0.004875/credit)
- Creator: $99/month → 20,000 credits ($0.00495/credit)

**Analysis:** Subscribers get 27-38x better value than pay-as-you-go. This is great for retention!

### 4. Credit Package Optimization

Current packages could be optimized:

```typescript
// Recommended packages with strategic bonuses
const creditPackages = [
  { price: 10, credits: 2000, bonus: 0 },      // $0.005/credit
  { price: 25, credits: 5250, bonus: 5 },      // $0.00476/credit
  { price: 50, credits: 11000, bonus: 10 },    // $0.00454/credit
  { price: 100, credits: 24000, bonus: 20 },   // $0.00417/credit
];
```

---

## Final Recommendations

### Immediate Actions

1. **Keep 1:200 credit ratio** - Good balance
2. **Increase margin to 50-55%** - Covers real costs
3. **Use ceiling rounding** - Prevents micro-losses

### Short-term Improvements

1. Add category-specific margins
2. Implement volume discount tiers
3. A/B test credit package bonuses

### Long-term Strategy

1. Monitor per-category profitability
2. Adjust margins quarterly based on:
   - 3rd party price changes
   - Operational cost analysis
   - Competitor pricing
3. Consider premium tiers for latest models (beta access)

---

## Implementation Checklist

- [ ] Update `PLATFORM_MARGIN` to 0.55
- [ ] Audit all model costs for accuracy
- [ ] Update frontend to use new hooks
- [ ] Update backend to use centralized calculator
- [ ] Add monitoring for cost/revenue per model
- [ ] Set up alerts for 3rd party price changes
- [ ] Document margin rationale for team


