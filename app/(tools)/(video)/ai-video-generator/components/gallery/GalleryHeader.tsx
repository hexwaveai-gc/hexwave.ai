'use client';

import { Button } from '@/app/components/ui/button';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function GalleryHeader({ activeFilter, onFilterChange }: GalleryHeaderProps) {
  const filters = ['All', 'Images', 'Videos', 'Audio'];

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center p-1 bg-muted rounded-lg">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeFilter === filter
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-4 h-4 border border-muted-foreground rounded-sm" />
          Favorites
        </button>
      </div>
      <Button variant="surface" size="sm" className="gap-2">
        <FolderOpen className="w-4 h-4" />
        Assets
      </Button>
    </div>
  );
}

