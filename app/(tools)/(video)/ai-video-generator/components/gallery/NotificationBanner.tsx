'use client';

import { Volume2, X } from 'lucide-react';
import { useState } from 'react';

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3 text-xs">
        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-foreground/80">Turn on notifications for generation update.</span>
        <button className="text-green-500 dark:text-green-400 hover:underline font-medium">
          Allow
        </button>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

