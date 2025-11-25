"use client";

import { ReactNode, useState } from "react";
import { Loader2, ImageIcon, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs2";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

interface ResultsPanelProps {
  /** Whether content is currently loading */
  isLoading?: boolean;

  /** Whether there are no results to display */
  isEmpty?: boolean;

  /** Array of result items (optional, for internal use) */
  results?: any[];

  /** Custom message for empty state */
  emptyMessage?: string;

  /** Custom message for loading state */
  loadingMessage?: string;

  /** Content to display when results are available */
  children?: ReactNode;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Results panel for displaying generated content
 * Handles loading, empty, and populated states
 */
export default function ResultsPanel({
  isLoading = false,
  isEmpty = true,
  results,
  emptyMessage = "No results yet. Generate something to see it here!",
  loadingMessage = "Generating...",
  children,
  className,
}: ResultsPanelProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {/* Filter Section - aligned with left header separator */}
      <div className="border-b border-[var(--color-border-container)] px-[var(--spacing-page-padding)] pt-[var(--spacing-page-padding)] pb-[var(--spacing-header-bottom)]">
        <div className="flex items-center gap-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
            <TabsList className="h-9">
              <TabsTrigger value="all" className="px-4">All</TabsTrigger>
              <TabsTrigger value="images" className="px-4">Images</TabsTrigger>
              <TabsTrigger value="videos" className="px-4">Videos</TabsTrigger>
              <TabsTrigger value="audio" className="px-4">Audio</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Favorites Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="favorites"
              checked={showFavorites}
              onCheckedChange={(checked) => setShowFavorites(checked === true)}
            />
            <label
              htmlFor="favorites"
              className="text-sm font-medium text-[var(--color-text-2)] cursor-pointer select-none"
            >
              Favorites
            </label>
          </div>
          
          {/* Assets Button */}
          <Button
            variant="outline"
            className="h-9 rounded-lg border-[var(--color-border-container)] bg-[var(--color-bg-primary)] text-[var(--color-text-1)] hover:bg-[var(--color-bg-secondary)]"
          >
            <Folder className="h-4 w-4 mr-2" />
            Assets
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          {/* Loading State */}
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center space-y-4 px-[var(--spacing-page-padding)]">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--color-theme-2)]" />
              <p className="text-center text-sm font-medium text-[var(--color-text-2)]">
                {loadingMessage}
              </p>
              {/* Skeleton loaders */}
              <div className="w-full max-w-md space-y-3">
                <Skeleton className="h-48 w-full rounded-lg bg-[var(--color-bg-primary)]" />
                <Skeleton className="h-4 w-3/4 bg-[var(--color-bg-primary)]" />
                <Skeleton className="h-4 w-1/2 bg-[var(--color-bg-primary)]" />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && isEmpty && (
            <TabsContent value={selectedTab} className="h-full mt-0">
              <div className="flex h-full flex-col items-center justify-center space-y-6">
                {/* SVG Icon - Using sprite pattern */}
                <svg
                  className="svg-icon text-[var(--color-text-3)]"
                  aria-hidden="true"
                  style={{ width: "100px", height: "100px" }}
                >
                  <use href="#icon-empty" className="svg-icon" />
                </svg>
                {/* Text */}
                <div className="empty-history-text text-center text-sm leading-relaxed text-[var(--color-text-3)]">
                  Release your creative potential. Experience the magic of Kling AI.
                </div>
              </div>
            </TabsContent>
          )}

          {/* Results Content */}
          {!isLoading && !isEmpty && (
            <>
              <TabsContent value="all" className="h-full mt-0">
                <div className="h-full w-full px-[var(--spacing-page-padding)] pt-[var(--spacing-page-padding)] pb-[var(--spacing-page-padding)]">{children}</div>
              </TabsContent>
              <TabsContent value="images" className="h-full mt-0">
                <div className="h-full w-full px-[var(--spacing-page-padding)] pt-[var(--spacing-page-padding)] pb-[var(--spacing-page-padding)]">{children}</div>
              </TabsContent>
              <TabsContent value="videos" className="h-full mt-0">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <svg
                      className="svg-icon text-[var(--color-text-3)]"
                      aria-hidden="true"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <use href="#icon-empty" className="svg-icon" />
                    </svg>
                    <div className="empty-history-text text-center text-sm leading-relaxed text-[var(--color-text-3)]">
                      Release your creative potential. Experience the magic of Kling AI.
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="audio" className="h-full mt-0">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <svg
                      className="svg-icon text-[var(--color-text-3)]"
                      aria-hidden="true"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <use href="#icon-empty" className="svg-icon" />
                    </svg>
                    <div className="empty-history-text text-center text-sm leading-relaxed text-[var(--color-text-3)]">
                      Release your creative potential. Experience the magic of Kling AI.
                    </div>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}

