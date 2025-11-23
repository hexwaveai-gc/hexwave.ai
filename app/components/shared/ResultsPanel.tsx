"use client";

import { ReactNode } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

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
  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Results
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Your generated content will appear here
        </p>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {loadingMessage}
            </p>
            {/* Skeleton loaders */}
            <div className="w-full max-w-md space-y-3">
              <Skeleton className="h-48 w-full rounded-[18px]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && (
          <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-[18px] border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-600 dark:bg-gray-800/50">
            <div className="rounded-full bg-gray-200 p-4 dark:bg-gray-700">
              <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No results yet
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {emptyMessage}
              </p>
            </div>
          </div>
        )}

        {/* Results Content */}
        {!isLoading && !isEmpty && (
          <div className="h-full w-full">{children}</div>
        )}
      </div>
    </div>
  );
}

