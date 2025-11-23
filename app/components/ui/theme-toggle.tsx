'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/app/store/useThemeStore';
import { Button } from './button';

/**
 * ThemeToggle component for switching between light and dark modes
 * Uses Zustand store for global theme state management
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}

