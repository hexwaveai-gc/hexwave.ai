# Image Generator - Standardized Two-Column Layout

 
## Overview

This image generator implements a standardized two-column layout system with resizable panels and dynamic model-based configuration. It serves as the reference implementation for all future generation tools (image and video).

## Architecture

### Core Components

#### 1. **GeneratorLayout** (`/app/components/shared/GeneratorLayout.tsx`)
- Main two-column layout with resizable panels
- Responsive behavior (side-by-side on desktop, stacked on mobile)
- Configurable panel sizes and constraints

#### 2. **GeneratorTabs** (`/app/components/shared/GeneratorTabs.tsx`)
- Tab system for input panel
- Smooth transitions between tabs
- Icon support for each tab

#### 3. **ResultsPanel** (`/app/components/shared/ResultsPanel.tsx`)
- Right panel for displaying results
- Loading, empty, and populated states
- Skeleton loaders during generation

### Tab Content Components

#### Text to Image (`/app/image-generator/components/TextToImageInputs.tsx`)
- **Core Fields (Always Visible):**
  - Model selector
  - Prompt textarea
- **Dynamic Fields (Model-Based):**
  - Aspect ratio
  - Resolution
  - Seed
  - Other model-specific options

#### Image Reference (`/app/image-generator/components/ImageReferenceInputs.tsx`)
- **Core Fields (Always Visible):**
  - Model selector
  - Image upload (up to 3 images)
  - Prompt textarea
- **Dynamic Fields (Model-Based):**
  - Reference tags
  - Aspect ratio
  - Other model-specific options

#### Restyle (`/app/image-generator/components/RestyleInputs.tsx`)
- **Core Fields (Always Visible):**
  - Model selector
  - Original image upload
  - Style prompt textarea
- **Dynamic Fields (Model-Based):**
  - Aspect ratio
  - Num images
  - Guidance scale
  - Other model-specific options

## Dynamic Model System

### Model Settings Structure

Each model has its own settings file in `/app/image-generator/lib/models/{model-name}/settings.ts`:

```typescript
export interface ModelSettings {
  [key: string]: {
    description?: string;
    required?: boolean;
    options?: string[] | number[];
    default?: any;
    type?: string;
    max_files?: number;
    min?: number;
    max?: number;
  };
}
```

### Supported Field Types

1. **text** - Text input (used for prompts)
2. **select** - Dropdown with predefined options
3. **number** - Numeric input with min/max
4. **array** - Comma-separated values
5. **image_array** - File upload for multiple images

### Adding a New Model

1. Create settings file: `/app/image-generator/lib/models/{model-name}/settings.ts`
2. Define model settings following the `ModelSettings` interface
3. Register model in `/app/image-generator/lib/modelRegistry.ts`:

```typescript
export const MODEL_REGISTRY: Record<string, Model> = {
  // ... existing models
  newmodel: {
    id: "newmodel",
    name: "New Model Name",
    description: "Description of what this model does",
    settings: newModelSettings,
  },
};
```

## Components Reference

### ModelSelector
Dropdown for choosing the active model. When the model changes, the form dynamically updates to show the relevant fields.

### DynamicFieldRenderer
Automatically renders form fields based on the selected model's settings. It:
- Reads the model settings
- Excludes core fields (prompt, image upload)
- Renders appropriate input components
- Handles field value changes

## Styling Guidelines

All components follow the Hexwave design system:

- **Border Radius:** `rounded-[18px]` for all interactive elements
- **Dark Mode:** Full dark mode support with `dark:` variants
- **Spacing:** Consistent `gap-4` or `gap-6` between sections
- **Transitions:** `transition-all duration-200` for smooth interactions
- **Colors:**
  - Borders: `border-gray-200 dark:border-gray-700`
  - Backgrounds: `bg-white dark:bg-gray-900`
  - Text: `text-gray-900 dark:text-gray-100`

## Responsive Breakpoints

- **Mobile (<768px):** Stacked vertically, full-width sections
- **Tablet (768px-1023px):** Side-by-side with narrower left panel
- **Desktop (≥1024px):** Side-by-side with resizable divider

## Usage Example

```tsx
<GeneratorLayout
  inputPanel={
    <GeneratorTabs tabs={[
      { id: "text-to-image", label: "Text to Image", content: <TextToImageInputs /> },
      { id: "image-ref", label: "Image Reference", content: <ImageReferenceInputs /> },
      { id: "restyle", label: "Restyle", content: <RestyleInputs /> },
    ]} />
  }
  resultsPanel={
    <ResultsPanel isLoading={false} isEmpty={true}>
      {/* Your results display here */}
    </ResultsPanel>
  }
/>
```

## Future Extensions

### For Video Generation

The same layout system can be used for video generation with:
- Different tab configurations (Text to Video, Image to Video, Multi-Elements)
- Video-specific input components
- Video player in results panel
- Same model registry pattern for video models

### Shared Patterns

- Model selector component (reusable)
- Dynamic field renderer (reusable)
- Results panel (reusable)
- Two-column layout (reusable)

## File Structure

```
hexwave.ai/
├── app/
│   ├── components/
│   │   └── shared/
│   │       ├── GeneratorLayout.tsx      # Main layout
│   │       ├── GeneratorTabs.tsx        # Tab system
│   │       └── ResultsPanel.tsx         # Results display
│   └── image-generator/
│       ├── page.tsx                      # Main page
│       ├── components/
│       │   ├── TextToImageInputs.tsx    # Tab 1
│       │   ├── ImageReferenceInputs.tsx # Tab 2
│       │   ├── RestyleInputs.tsx        # Tab 3
│       │   ├── ModelSelector.tsx        # Model dropdown
│       │   └── DynamicFieldRenderer.tsx # Dynamic fields
│       └── lib/
│           ├── modelRegistry.ts         # Model definitions
│           └── models/
│               ├── runwaygen4/
│               │   └── settings.ts
│               └── flux/
│                   └── settings.ts
```

## Benefits

✅ **Reusability** - Same components for image and video generation
✅ **Consistency** - Unified UX across all tools
✅ **Maintainability** - Changes in one place affect all tools
✅ **Flexibility** - Easy to add new models and fields
✅ **Scalability** - Simple to extend with new generation types
✅ **Type Safety** - Full TypeScript support
✅ **Responsive** - Works on all screen sizes
✅ **Accessible** - Proper ARIA labels and keyboard navigation

