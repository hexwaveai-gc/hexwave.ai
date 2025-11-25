"use client";

/**
 * Select Field Component
 * Universal select dropdown for all select-type fields
 * Handles: duration, aspectRatio, resolution, styles, etc.
 */

import { memo, useCallback } from "react";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useGenerationStore } from "../../store/useGenerationStore";
import { useFieldError, useFieldValue } from "../../store/selectors";
import { normalizeOptions, isFieldOption } from "../../types/field.types";

interface SelectFieldProps {
  fieldName: string;
  label?: string;
  helpText?: string;
  disabled?: boolean;
}

/**
 * Memoized SelectField component
 */
export const SelectField = memo(function SelectField({
  fieldName,
  label,
  helpText,
  disabled,
}: SelectFieldProps) {
  const value = useFieldValue(fieldName);
  const error = useFieldError(fieldName);
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const updateField = useGenerationStore((s) => s.updateField);
  
  // Get options from model fieldOptions or use empty array
  const modelFieldOption = selectedModel?.fieldOptions?.[fieldName];
  const rawOptions = modelFieldOption?.options || [];
  const options = normalizeOptions(rawOptions as any);
  
  // Check if field is user selectable
  const isUserSelectable = modelFieldOption?.userSelectable !== false;
  const isDisabled = disabled || !isUserSelectable;
  
  // Handle selection change
  const handleChange = useCallback(
    (newValue: string) => {
      updateField(fieldName, newValue);
    },
    [fieldName, updateField]
  );
  
  // Format field name for label
  const displayLabel = label || 
    modelFieldOption?.label || 
    fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  
  if (options.length === 0) {
    return null; // Don't render if no options
  }
  
  // If only one option and not user selectable, don't show UI
  if (options.length === 1 && !isUserSelectable) {
    return null;
  }
  
  return (
    <div className="space-y-2 md:space-y-3">
      <Label 
        htmlFor={fieldName}
        className="text-xs md:text-sm font-medium text-gray-900 dark:text-(--color-text-1)"
      >
        {displayLabel}
      </Label>
      
      <Select 
        value={String(value || options[0]?.value || "")} 
        onValueChange={handleChange}
        disabled={isDisabled}
      >
        <SelectTrigger 
          id={fieldName}
          className={`h-10 md:h-10 rounded-lg px-3 text-sm ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 dark:border-(--color-border-container)"
          } bg-gray-50 dark:bg-(--color-bg-primary) dark:text-(--color-text-1)`}
          aria-label={displayLabel}
          aria-describedby={helpText ? `${fieldName}-help` : undefined}
          aria-invalid={!!error}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg max-h-[40vh]">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-lg text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {helpText && !error && (
        <p id={`${fieldName}-help`} className="text-xs text-gray-500 dark:text-(--color-text-3)">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={`${fieldName}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      
      {modelFieldOption?.helpText && !helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-(--color-text-3)">
          {modelFieldOption.helpText}
        </p>
      )}
    </div>
  );
});

