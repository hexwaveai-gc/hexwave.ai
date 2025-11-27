"use client";

import { Skeleton } from "@/app/components/ui/skeleton";

interface AssetsSkeletonProps {
  count?: number;
}

export function AssetsSkeleton({ count = 8 }: AssetsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-2xl overflow-hidden bg-[#141414] border border-white/5"
        >
          {/* Thumbnail skeleton */}
          <Skeleton className="aspect-square bg-white/5" />
          
          {/* Info skeleton */}
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-white/5" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-1/3 bg-white/5" />
              <Skeleton className="h-3 w-1/4 bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

