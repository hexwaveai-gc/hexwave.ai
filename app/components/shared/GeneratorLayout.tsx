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
  defaultLeftSize = 48,
  defaultRightSize = 52,
  minLeftSize = 30,
  minRightSize = 40,
  className,
}: GeneratorLayoutProps) {
  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden bg-background",
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
            <div className="flex h-full flex-col bg-[var(--color-bg-primary)]">
              {inputPanel}
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle
            withHandle
            className="group w-px"
          />

          {/* Right Panel - Results */}
          <ResizablePanel
            defaultSize={defaultRightSize}
            minSize={minRightSize}
            className="flex flex-col"
          >
            <div className="h-full overflow-y-auto bg-[var(--color-bg-page)]">
              {resultsPanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Stacked vertically */}
      <div className="flex h-full flex-col md:hidden">
        {/* Input Section */}
        <div className="flex-1 border-b border-[var(--color-border-container)] bg-[var(--color-bg-primary)]">
          {inputPanel}
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-bg-page)] p-4">
          {resultsPanel}
        </div>
      </div>
    </div>
  );
}

