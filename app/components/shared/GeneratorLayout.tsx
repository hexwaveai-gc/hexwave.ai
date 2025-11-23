"use client";

import { ReactNode } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../ui/resizable";
import { cn } from "@/lib/utils";

interface GeneratorLayoutProps {
  /** Left panel content (tabs component) */
  inputPanel: ReactNode;

  /** Right panel content (results) */
  resultsPanel: ReactNode;

  /** Custom default size for left panel */
  defaultLeftSize?: number;

  /** Custom default size for right panel */
  defaultRightSize?: number;

  /** Minimum size for left panel */
  minLeftSize?: number;

  /** Minimum size for right panel */
  minRightSize?: number;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Standardized two-column layout for generation tools
 * Features resizable panels with responsive behavior
 */
export default function GeneratorLayout({
  inputPanel,
  resultsPanel,
  defaultLeftSize = 35,
  defaultRightSize = 65,
  minLeftSize = 25,
  minRightSize = 50,
  className,
}: GeneratorLayoutProps) {
  return (
    <div
      className={cn(
        "h-screen w-full overflow-hidden bg-background",
        className
      )}
    >
      {/* Desktop and Tablet: Side-by-side with resizable divider */}
      <div className="hidden h-full md:block">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Inputs */}
          <ResizablePanel
            defaultSize={defaultLeftSize}
            minSize={minLeftSize}
            className="flex flex-col"
          >
            <div className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-[#242629] dark:bg-[#0a0a0a]">
              {inputPanel}
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle
            withHandle
            className="w-1 bg-gray-200 hover:bg-blue-500 dark:bg-[#242629] dark:hover:bg-[#74ff52]"
          />

          {/* Right Panel - Results */}
          <ResizablePanel
            defaultSize={defaultRightSize}
            minSize={minRightSize}
            className="flex flex-col"
          >
            <div className="h-full overflow-y-auto bg-gray-50 p-6 dark:bg-[#0a0a0a]">
              {resultsPanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Stacked vertically */}
      <div className="flex h-full flex-col md:hidden">
        {/* Input Section */}
        <div className="flex-1 border-b border-gray-200 bg-white dark:border-[#242629] dark:bg-[#0a0a0a]">
          {inputPanel}
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-[#0a0a0a]">
          {resultsPanel}
        </div>
      </div>
    </div>
  );
}

