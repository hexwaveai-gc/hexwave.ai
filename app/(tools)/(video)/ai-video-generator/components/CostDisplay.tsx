"use client";

/**
 * Cost Display Component
 * Shows real-time cost estimation with breakdown
 */

import { memo } from "react";
import { useGenerationStore } from "../store/useGenerationStore";
import { selectCostDisplay, selectCostBreakdown } from "../store/selectors";

export const CostDisplay = memo(function CostDisplay() {
  const estimatedCost = useGenerationStore((s) => s.estimatedCost);
  const costDisplay = useGenerationStore(selectCostDisplay);
  const breakdown = useGenerationStore(selectCostBreakdown);
  
  if (!estimatedCost) {
    return null;
  }
  
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 dark:border-(--color-border-container) dark:bg-(--color-bg-primary)">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-(--color-text-2)">
          Estimated Cost
        </span>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {costDisplay}
        </span>
      </div>
      
      {breakdown.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-gray-600 dark:text-(--color-text-3) hover:text-gray-900 dark:hover:text-(--color-text-1)">
            View breakdown
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-(--color-text-3)">
            {breakdown.map((line, i) => (
              <li key={i} className="flex items-center">
                <span className="mr-2">•</span>
                {line}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
});

