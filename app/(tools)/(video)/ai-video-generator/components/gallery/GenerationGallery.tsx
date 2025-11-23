'use client';

import { useState } from 'react';
import { GalleryHeader } from './GalleryHeader';
import { EmptyState } from './EmptyState';
import { NotificationBanner } from './NotificationBanner';

export function GenerationGallery() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <NotificationBanner />
      <GalleryHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EmptyState />
      </div>
    </div>
  );
}

