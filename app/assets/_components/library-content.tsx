"use client";

import { useState, useCallback } from "react";
import { useInfiniteLibrary } from "@/hooks/use-assets";
import { AssetCard } from "./asset-card";
import { AssetsGrid } from "./assets-grid";
import { AssetsSkeleton } from "./assets-skeleton";
import { EmptyAssets } from "./empty-assets";
import { AssetDetailModal } from "./asset-detail-modal";
import { Button } from "@/app/components/ui/button";
import { TrendingUp, Clock, Heart, Loader2 } from "lucide-react";
import type { Asset, AssetType } from "@/types/assets";
import { cn } from "@/lib/utils";

interface LibraryContentProps {
  search?: string;
  assetType?: AssetType;
}

type LibraryFilter = "recent" | "trending" | "most-liked";

export function LibraryContent({ search, assetType }: LibraryContentProps) {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("recent");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteLibrary({
    type: assetType,
    search,
    sortBy: activeFilter === "most-liked" ? "likes" : activeFilter === "trending" ? "views" : "createdAt",
    sortOrder: "desc",
    trending: activeFilter === "trending",
    limit: 20,
  });

  const allAssets = data?.pages.flatMap((page) => page.assets) ?? [];

  const handleViewAsset = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setDetailModalOpen(true);
  }, []);

  const handleDownload = useCallback(async (asset: Asset) => {
    if (asset.url) {
      const link = document.createElement("a");
      link.href = asset.url;
      link.download = asset.title || `asset-${asset.id}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const filters: { id: LibraryFilter; label: string; icon: React.ElementType }[] = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "most-liked", label: "Most Liked", icon: Heart },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">Failed to load library</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Library Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Community Library</h2>
          <p className="text-sm text-white/50 mt-1">
            Explore creations shared by the community
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#74FF52]/20 text-[#74FF52] border border-[#74FF52]/30"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <AssetsSkeleton count={12} />
      ) : allAssets.length === 0 ? (
        <EmptyAssets activeTab="library" />
      ) : (
        <>
          <AssetsGrid columns={4}>
            {allAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onView={handleViewAsset}
                onDownload={handleDownload}
                showAuthor={true}
                isOwner={false}
              />
            ))}
          </AssetsGrid>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onDownload={handleDownload}
        isOwner={false}
      />
    </div>
  );
}

