# AI Video Generator

A modern, accessible AI video generation interface built with Next.js, Radix UI, and Zustand.

## Features

- **Dark/Light Mode**: Global theme switching with Zustand state management
- **Component Composition**: Small, reusable components following best practices
- **Type Safety**: Full TypeScript support with proper interfaces
- **Accessibility**: Built on Radix UI primitives for WCAG compliance
- **Modern UI**: Shadcn-style components with Tailwind CSS

## Architecture

### State Management

- **Theme Store** (`app/store/useThemeStore.ts`): Global theme state using Zustand with localStorage persistence
- **Component State**: Local state management in the page component for form inputs

### Components

#### UI Components (`app/components/ui/`)
- `tabs.tsx`: Tab navigation component
- `switch.tsx`: Toggle switch component
- `select.tsx`: Dropdown select component
- `textarea.tsx`: Multi-line text input
- `button.tsx`: Button component with variants
- `label.tsx`: Form label component
- `theme-toggle.tsx`: Theme switcher component

#### Feature Components (`components/`)
- `VideoGeneratorHeader.tsx`: Page header with model selector
- `GenerationModeTabs.tsx`: Tab wrapper for generation modes
- `PromptInput.tsx`: Prompt textarea with helper links
- `SoundEffectsToggle.tsx`: Sound effects enable/disable control
- `VideoSettings.tsx`: Duration, aspect ratio, and output count settings
- `GenerateButton.tsx`: Primary action button

### Page Structure

The main page (`page.tsx`) orchestrates all components using composition:
- Avoids prop drilling by keeping state at the page level
- Each component has a single responsibility
- Easy to test and maintain

## Usage

### Changing Theme

```typescript
import { useThemeStore } from '@/app/store/useThemeStore';

const { theme, toggleTheme, setTheme } = useThemeStore();

// Toggle between light and dark
toggleTheme();

// Set specific theme
setTheme('dark');
```

### Adding New Components

1. Create component in `components/` directory
2. Define TypeScript interface for props
3. Add JSDoc comments explaining purpose
4. Export and import in `page.tsx`

## Design Decisions

### Why Radix UI?

Shadcn UI is a collection of pre-styled components **built on top of** Radix UI primitives. Radix provides:
- Unstyled, accessible components
- ARIA attributes out of the box
- Keyboard navigation
- Focus management

### Why Zustand?

- Minimal boilerplate compared to Redux
- Built-in TypeScript support
- Middleware support (persistence)
- No context provider needed
- Small bundle size (~1KB)

### Component Composition

Following React best practices:
- Small, focused components (single responsibility)
- Props for data flow
- Composition over inheritance
- Easy to test and maintain

## Future Enhancements

- [ ] Image upload for Image to Video mode
- [ ] Multi-element composition UI
- [ ] Real-time generation progress
- [ ] Video preview and editing
- [ ] Advanced sound effects settings
- [ ] Model comparison view

