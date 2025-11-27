"use client";

import { useState, useMemo } from "react";
import { type ToolCategory, getToolsByCategory } from "@/constants/tools";
import { ToolsHeader } from "./tools-header";
import { ToolsFilterTabs } from "./tools-filter-tabs";
import { ToolsGrid } from "./tools-grid";

export function ToolsContent() {
  const [activeTab, setActiveTab] = useState<ToolCategory>("all");

  const filteredTools = useMemo(
    () => getToolsByCategory(activeTab),
    [activeTab]
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <ToolsHeader
        title="All Tools"
        description="Discover our powerful suite of AI-powered creative tools to bring your ideas to life."
      />
      <ToolsFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ToolsGrid tools={filteredTools} />
    </div>
  );
}
