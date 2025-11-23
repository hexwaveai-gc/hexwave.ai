'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/app/store/useThemeStore';

/**
 * ThemeProvider component that applies the theme class to the document
 * Should be placed in the root layout
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

