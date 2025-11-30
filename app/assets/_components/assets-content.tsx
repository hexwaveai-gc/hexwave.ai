"use client";

import { useState, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Sidebar from "@/app/components/common/sidebar";
import { AssetCard } from "./asset-card";
import { AssetsGrid } from "./assets-grid";
import { AssetsTabs } from "./assets-tabs";
import { AssetsHeader } from "./assets-header";
import { EmptyAssets } from "./empty-assets";
import { AssetsSkeleton } from "./assets-skeleton";
import { ShareDialog } from "./share-dialog";
import { AssetDetailModal } from "./asset-detail-modal";
import { LibraryContent } from "./library-content";
import { Button } from "@/app/components/ui/button";
import { 
  useInfiniteAssets, 
  useShareAsset, 
  useUnshareAsset 
} from "@/hooks/use-assets";
import { 
  tabIdToAssetType, 
  sortOptions, 
  type AssetsTabId, 
  type SortOptionId 
} from "@/constants/assets";
import type { Asset } from "@/types/assets";

export function AssetsContent() {
  const { isSignedIn, isLoaded } = useUser();
  
  // State
  const [activeTab, setActiveTab] = useState<AssetsTabId>("all");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOptionId>("newest");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [assetToShare, setAssetToShare] = useState<Asset | null>(null);

  // Get sort config
  const currentSort = sortOptions.find((opt) => opt.id === sortOption) || sortOptions[0];

  // Get asset type from active tab
  const assetType = useMemo(() => {
    if (activeTab === "library") return undefined;
    return tabIdToAssetType(activeTab);
  }, [activeTab]);

  // Fetch user's assets
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteAssets({
    type: assetType,
    search: search || undefined,
    sortBy: currentSort.sortBy,
    sortOrder: currentSort.sortOrder,
    limit: 20,
    enabled: isSignedIn && activeTab !== "library",
  });

  // Share mutations
  const shareAsset = useShareAsset();
  const unshareAsset = useUnshareAsset();

  // Flatten paginated data
  const allAssets = useMemo(() => {
    return data?.pages.flatMap((page) => page.assets) ?? [];
  }, [data]);

  // Stats from first page
  const stats = data?.pages[0]?.stats;

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: stats ? stats.totalImages + stats.totalVideos + stats.totalAudio : undefined,
    images: stats?.totalImages,
    videos: stats?.totalVideos,
    audio: stats?.totalAudio,
  }), [stats]);

  // Handlers
  const handleViewAsset = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setDetailModalOpen(true);
  }, []);

  const handleOpenShareDialog = useCallback((asset: Asset) => {
    setAssetToShare(asset);
    setShareDialogOpen(true);
  }, []);

  const handleShare = useCallback(async (data: { title?: string; description?: string }) => {
    if (!assetToShare) return;
    
    try {
      await shareAsset.mutateAsync({
        jobId: assetToShare.jobId,
        title: data.title,
        description: data.description,
      });
      toast.success("Shared to library!");
      setShareDialogOpen(false);
      setAssetToShare(null);
    } catch {
      toast.error("Failed to share asset");
    }
  }, [assetToShare, shareAsset]);

  const handleUnshare = useCallback(async (asset: Asset) => {
    try {
      await unshareAsset.mutateAsync(asset.jobId);
      toast.success("Removed from library");
      setDetailModalOpen(false);
    } catch {
      toast.error("Failed to unshare asset");
    }
  }, [unshareAsset]);

  const handleDownload = useCallback(async (asset: Asset) => {
    if (asset.url) {
      const link = document.createElement("a");
      link.href = asset.url;
      link.download = asset.title || `asset-${asset.id}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  }, []);

  const handleDelete = useCallback((asset: Asset) => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  }, []);

  // Auth loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex">
        <Sidebar />
        <main className="flex-1 ml-20 p-6">
          <AssetsSkeleton />
        </main>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex">
        <Sidebar />
        <main className="flex-1 ml-20 p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-semibold text-white mb-2">Sign in to view your assets</h2>
            <p className="text-white/50 mb-6">Your generations will appear here once you sign in.</p>
            <Button asChild className="bg-[#74FF52] text-black hover:bg-[#66e648]">
              <a href="/sign-in">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-20 p-6 pb-24">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <AssetsHeader
            stats={stats}
            searchValue={search}
            onSearchChange={setSearch}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />

          {/* Tabs */}
          <AssetsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={tabCounts}
          />

          {/* Content */}
          {activeTab === "library" ? (
            <LibraryContent 
              search={search} 
              assetType={assetType}
            />
          ) : (
            <>
              {error ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-red-400 mb-4">Failed to load assets</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : isLoading ? (
                <AssetsSkeleton />
              ) : allAssets.length === 0 ? (
                <EmptyAssets activeTab={activeTab} />
              ) : (
                <>
                  <AssetsGrid columns={4}>
                    {allAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        onView={handleViewAsset}
                        onShare={handleOpenShareDialog}
                        onUnshare={handleUnshare}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        isOwner={true}
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
            </>
          )}
        </div>
      </main>

      {/* Share Dialog */}
      <ShareDialog
        asset={assetToShare}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onShare={handleShare}
        isLoading={shareAsset.isPending}
      />

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onShare={handleOpenShareDialog}
        onUnshare={handleUnshare}
        onDownload={handleDownload}
        isOwner={true}
      />
    </div>
  );
}

