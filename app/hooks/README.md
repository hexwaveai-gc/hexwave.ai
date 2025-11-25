# Credit Check Hook Usage Examples

## Basic Usage

```tsx
'use client'

import { useCheckCredits } from '@/app/hooks/useCheckCredits'

export default function GenerateButton() {
  const { checkCredits, userCredits } = useCheckCredits()

  const handleGenerate = () => {
    // Check if user has enough credits (10 credits required)
    if (checkCredits({ 
      requiredCredits: 10,
      showModal: true // Automatically shows upgrade modal if insufficient
    })) {
      // User has enough credits - proceed with generation
      console.log('Generating...')
    }
    // If insufficient, modal is automatically shown
  }

  return (
    <button onClick={handleGenerate}>
      Generate ({userCredits} credits available)
    </button>
  )
}
```

## With Callbacks

```tsx
'use client'

import { useCheckCredits } from '@/app/hooks/useCheckCredits'

export default function AdvancedButton() {
  const { checkCredits } = useCheckCredits()

  const handleAction = () => {
    checkCredits({
      requiredCredits: 5,
      showModal: true,
      onSufficient: () => {
        // User has enough credits
        console.log('Proceeding with action...')
        // Your action logic here
      },
      onInsufficient: () => {
        // User doesn't have enough credits
        console.log('Insufficient credits')
        // Modal is automatically shown
      }
    })
  }

  return <button onClick={handleAction}>Execute Action</button>
}
```

## Without Modal (Custom Handling)

```tsx
'use client'

import { useCheckCredits } from '@/app/hooks/useCheckCredits'
import { useRouter } from 'next/navigation'

export default function CustomButton() {
  const { checkCredits } = useCheckCredits()
  const router = useRouter()

  const handleAction = () => {
    const hasCredits = checkCredits({
      requiredCredits: 10,
      showModal: false, // Don't show modal automatically
      onInsufficient: () => {
        // Custom handling - redirect to credits page
        router.push('/credits')
      }
    })

    if (hasCredits) {
      // Proceed with action
    }
  }

  return <button onClick={handleAction}>Custom Action</button>
}
```

## Check Credits Without Triggering Modal

```tsx
'use client'

import { useCheckCredits } from '@/app/hooks/useCheckCredits'

export default function StatusDisplay() {
  const { hasEnoughCredits, userCredits } = useCheckCredits()

  const canGenerate = hasEnoughCredits(10)

  return (
    <div>
      <p>Credits: {userCredits}</p>
      <p>Can generate: {canGenerate ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

## Direct Modal Control

```tsx
'use client'

import { useUpgradePlan } from '@/app/providers/UpgradePlanProvider'

export default function CustomButton() {
  const { openModal, closeModal, isOpen } = useUpgradePlan()

  return (
    <>
      <button onClick={openModal}>Open Upgrade Modal</button>
      <button onClick={closeModal}>Close Modal</button>
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
    </>
  )
}
```

