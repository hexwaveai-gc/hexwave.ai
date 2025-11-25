"use client";

import { ReactNode, useState } from "react";
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
  
  /** Unique ID for persisting panel sizes (for autoSaveId) */
  layoutId?: string;
}

/**
 * Standardized two-column layout for generation tools
 * Features resizable panels with responsive behavior
 * Panel sizes are persisted to localStorage when layoutId is provided
 */
export default function GeneratorLayout({
  inputPanel,
  resultsPanel,
  defaultLeftSize = 48,
  defaultRightSize = 52,
  minLeftSize = 30,
  minRightSize = 40,
  className,
  layoutId = "generator-layout",
}: GeneratorLayoutProps) {
  const [mobileTab, setMobileTab] = useState<'input' | 'results'>('input');

  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden bg-background",
        className
      )}
    >
      {/* Desktop and Tablet: Side-by-side with resizable divider */}
      <div className="hidden h-full md:block">
        <ResizablePanelGroup 
          direction="horizontal"
        >
          {/* Left Panel - Inputs */}
          <ResizablePanel
            id="input-panel"
            order={1}
            defaultSize={defaultLeftSize}
            minSize={minLeftSize}
            className="flex flex-col overflow-hidden"
          >
            <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--color-bg-primary)]">
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
            id="results-panel"
            order={2}
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

      {/* Mobile: Tabs for Input/Results */}
      <div className="flex h-full flex-col md:hidden">
         {/* Mobile Tab Header - Larger touch targets */}
         <div className="grid grid-cols-2 border-b border-[var(--color-border-container)] bg-[var(--color-bg-primary)] shrink-0">
            <button
              onClick={() => setMobileTab('input')}
              className={cn(
                "py-3.5 text-sm font-medium transition-colors active:opacity-80",
                mobileTab === 'input' 
                  ? "border-b-2 border-[var(--color-theme-2)] text-[var(--color-theme-2)]" 
                  : "text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
              )}
            >
              Create
            </button>
            <button
              onClick={() => setMobileTab('results')}
               className={cn(
                "py-3.5 text-sm font-medium transition-colors active:opacity-80",
                mobileTab === 'results' 
                  ? "border-b-2 border-[var(--color-theme-2)] text-[var(--color-theme-2)]" 
                  : "text-[var(--color-text-2)] hover:text-[var(--color-text-1)]"
              )}
            >
              Results
            </button>
         </div>
         
         {/* Content Area - Accounts for mobile bottom nav */}
         <div className="flex-1 overflow-hidden relative">
            <div className={cn(
              "absolute inset-0 flex flex-col transition-opacity duration-200 bg-[var(--color-bg-primary)]",
              mobileTab === 'input' ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
            )}>
              {inputPanel}
            </div>
            
            <div className={cn(
              "absolute inset-0 flex flex-col transition-opacity duration-200 bg-[var(--color-bg-page)]",
              mobileTab === 'results' ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
            )}>
               <div className="h-full overflow-y-auto pb-20">
                 {resultsPanel}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

