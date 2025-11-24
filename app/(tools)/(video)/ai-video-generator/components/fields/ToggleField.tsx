"use client";

/**
 * Toggle Field Component
 * For boolean fields: enhancePrompt, loop, cameraFixed, etc.
 */

import { memo, useCallback } from "react";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { useGenerationStore } from "../../store/useGenerationStore";
import { useFieldValue } from "../../store/selectors";

interface ToggleFieldProps {
  fieldName: string;
  label?: string;
  helpText?: string;
  disabled?: boolean;
}

/**
 * Memoized ToggleField component
 */
export const ToggleField = memo(function ToggleField({
  fieldName,
  label,
  helpText,
  disabled,
}: ToggleFieldProps) {
  const value = useFieldValue(fieldName, false);
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const updateField = useGenerationStore((s) => s.updateField);
  
  // Get label from model fieldOptions
  const modelFieldOption = selectedModel?.fieldOptions?.[fieldName];
  const displayLabel = label || 
    modelFieldOption?.label || 
    fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  
  const displayHelpText = helpText || modelFieldOption?.helpText;
  const isUserSelectable = modelFieldOption?.userSelectable !== false;
  const isDisabled = disabled || !isUserSelectable;
  
  // Handle toggle change
  const handleChange = useCallback(
    (checked: boolean) => {
      updateField(fieldName, checked);
    },
    [fieldName, updateField]
  );
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-(--color-border-container) bg-gray-50 dark:bg-(--color-bg-primary)">
      <div className="space-y-0.5 flex-1">
        <Label
          htmlFor={fieldName}
          className="text-sm font-medium text-gray-900 dark:text-(--color-text-1) cursor-pointer"
        >
          {displayLabel}
        </Label>
        {displayHelpText && (
          <p className="text-xs text-gray-500 dark:text-(--color-text-3)">
            {displayHelpText}
          </p>
        )}
      </div>
      <Switch
        id={fieldName}
        checked={Boolean(value)}
        onCheckedChange={handleChange}
        disabled={isDisabled}
        aria-label={displayLabel}
        aria-describedby={displayHelpText ? `${fieldName}-help` : undefined}
      />
    </div>
  );
});

