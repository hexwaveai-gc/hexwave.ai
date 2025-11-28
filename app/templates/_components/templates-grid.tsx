"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PublicAvatar } from "@/constants/templates";
import { TemplateCard } from "./template-card";

const ITEMS_PER_PAGE = 20;

interface TemplatesGridProps {
  avatars: PublicAvatar[];
  selectedAvatar: PublicAvatar | null;
  onSelectAvatar: (avatar: PublicAvatar) => void;
}

export function TemplatesGrid({
  avatars,
  selectedAvatar,
  onSelectAvatar,
}: TemplatesGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset visible count when avatars change (e.g., filter applied)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [avatars]);

  // Get the currently visible avatars
  const visibleAvatars = avatars.slice(0, visibleCount);
  const hasMore = visibleCount < avatars.length;

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Small delay for smooth loading experience
    requestAnimationFrame(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, avatars.length));
      setIsLoading(false);
    });
  }, [isLoading, hasMore, avatars.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px", // Start loading before reaching the end
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  if (avatars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-white/80 text-lg font-medium mb-2">
          No avatars found
        </h3>
        <p className="text-white/50 text-sm">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid - 3 columns portrait layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {visibleAvatars.map((avatar) => (
          <TemplateCard
            key={avatar.id}
            avatar={avatar}
            isSelected={selectedAvatar?.id === avatar.id}
            onClick={() => onSelectAvatar(avatar)}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          <LoadingSpinner />
        </div>
      )}

      {/* End of List */}
      {!hasMore && avatars.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center py-6">
          <p className="text-white/40 text-sm">
            Showing all {avatars.length} templates
          </p>
        </div>
      )}
    </div>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#74FF52] animate-spin" />
      </div>
      <span className="text-white/50 text-sm">Loading more templates...</span>
    </div>
  );
}
