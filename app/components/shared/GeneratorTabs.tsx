"use client";

import { ReactNode } from "react";
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
 */
export default function GeneratorTabs({
  tabs,
  defaultTab,
  value,
  onTabChange,
  className,
}: GeneratorTabsProps) {
  const defaultValue = defaultTab || tabs[0]?.id;

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={handleTabChange}
      className={cn("flex h-full w-full flex-col", className)}
    >
      {/* Tab List */}
      <div className="px-[var(--spacing-page-padding)] pt-0">
        <TabsList className="flex h-auto w-full justify-start gap-8 bg-transparent p-0 dark:bg-transparent mt-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 text-sm font-medium shadow-none transition-colors",
                // Inactive state - muted gray text and icons, no background
                "text-gray-500 dark:text-[var(--color-text-3)] dark:bg-transparent",
                "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-gray-500 [&_svg]:dark:text-[var(--color-text-3)] [&_svg]:transition-colors",
                // Active state - bright white text with green underline, darker background
                "data-[state=active]:border-[var(--color-theme-2)] data-[state=active]:text-white data-[state=active]:dark:text-[var(--color-text-1)] data-[state=active]:dark:bg-[var(--color-bg-primary)] data-[state=active]:shadow-none",
                "data-[state=active]:[&_svg]:text-white data-[state=active]:[&_svg]:dark:text-[var(--color-text-1)]"
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="flex-1 overflow-hidden data-[state=inactive]:hidden"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
