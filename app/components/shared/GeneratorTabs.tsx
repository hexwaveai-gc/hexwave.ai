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
      className={cn("flex h-full w-full flex-col", className)}
    >
      {/* Tab List */}
      <div className="px-6 pt-6">
        <TabsList className="flex h-auto w-full justify-start gap-6 border-b border-gray-200 bg-transparent p-0 dark:border-[#242629]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-gray-500 shadow-none transition-none data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-[#6c727a] dark:data-[state=active]:border-[#74ff52] dark:data-[state=active]:text-[#f9fbfc]"
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
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
