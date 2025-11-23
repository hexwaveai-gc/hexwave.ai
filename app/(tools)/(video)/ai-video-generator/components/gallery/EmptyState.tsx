'use client';

import { ImageIcon } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[400px]">
      <div className="relative mb-6">
        {/* Abstract visual representation of media */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-muted to-muted/50 flex items-center justify-center shadow-xl border border-border">
          <ImageIcon className="w-10 h-10 text-muted-foreground" />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-muted rounded-full border border-border animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-muted rounded-full border border-border" />
      </div>
      
      <p className="text-muted-foreground text-sm max-w-md">
        Release your creative potential. Experience the magic of Kling AI.
      </p>
    </div>
  );
}

