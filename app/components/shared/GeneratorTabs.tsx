"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

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
  onTabChange,
  className,
}: GeneratorTabsProps) {
  const defaultValue = defaultTab || tabs[0]?.id;

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      {/* Tab List */}
      <TabsList
        className={cn(
          "mb-6 grid w-full rounded-[18px] bg-gray-100 p-1 dark:bg-gray-800",
          tabs.length === 3 && "grid-cols-3"
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-[18px] px-3 py-2 text-sm font-medium transition-all",
              "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
              "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",
              "dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-50"
            )}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className={cn(
            "mt-0 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
            "dark:focus-visible:ring-gray-300"
          )}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

