"use client";

import { ReactNode, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabConfig {
  /** Unique identifier for the tab */
  id: string;

  /** Display label for the tab */
  label: string;

  /** Optional icon to display before label */
  icon?: ReactNode;

  /** Content to render when tab is active */
  content: ReactNode;
}

interface GeneratorTabsProps {
  /** Array of tab configurations */
  tabs: TabConfig[];

  /** ID of the default active tab */
  defaultTab?: string;

  /** Controlled active tab value */
  value?: string;

  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Tab system for generator input panels
 * Provides smooth transitions and consistent styling
 * Mobile: Horizontal scroll for tabs, touch-friendly sizing
 */
export default function GeneratorTabs({
  tabs,
  defaultTab,
  value,
  onTabChange,
  className,
}: GeneratorTabsProps) {
  const defaultValue = defaultTab || tabs[0]?.id;

  const handleTabChange = useCallback((tabId: string) => {
    onTabChange?.(tabId);
  }, [onTabChange]);

  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={handleTabChange}
      className={cn("flex h-full w-full flex-col", className)}
    >
      {/* Tab List - Scrollable on mobile */}
      <div className="shrink-0 px-3 md:px-(--spacing-page-padding) pt-0 overflow-x-auto scrollbar-none">
        <TabsList className="flex h-auto w-max md:w-full justify-start gap-2 md:gap-4 bg-transparent p-0 dark:bg-transparent mt-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                // Base styles - touch-friendly sizing on mobile
                "relative h-10 rounded-none border-b-2 border-transparent bg-transparent",
                "px-1 md:px-0 pb-3 pt-2 text-xs font-medium shadow-none transition-colors",
                "whitespace-nowrap min-w-fit",
                // Inactive state - muted gray text and icons, no background
                "text-gray-500 dark:text-(--color-text-3) dark:bg-transparent",
                "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-gray-500 [&_svg]:dark:text-(--color-text-3) [&_svg]:transition-colors",
                // Active state - bright white text with green underline, darker background
                "data-[state=active]:border-(--color-theme-2) data-[state=active]:text-white data-[state=active]:dark:text-(--color-text-1) data-[state=active]:dark:bg-(--color-bg-primary) data-[state=active]:shadow-none",
                "data-[state=active]:[&_svg]:text-white data-[state=active]:[&_svg]:dark:text-(--color-text-1)"
              )}
            >
              <div className="flex items-center gap-1.5 md:gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                {/* Hide label on very small screens, show icon only */}
                <span className="hidden xs:inline md:inline">{tab.label}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab Content - Uses Radix default behavior */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="h-full w-full overflow-y-auto [scrollbar-gutter:stable] data-[state=inactive]:hidden"
          >
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
