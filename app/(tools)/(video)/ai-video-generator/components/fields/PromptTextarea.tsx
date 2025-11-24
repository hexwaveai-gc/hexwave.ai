"use client";

/**
 * Prompt Textarea Component
 * Handles both prompt and negativePrompt fields
 * Features: Character counter, auto-resize, validation
 */

import { memo, useCallback, useEffect, useRef } from "react";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { useGenerationStore } from "../../store/useGenerationStore";
import { useFieldError, useFieldValue } from "../../store/selectors";

interface PromptTextareaProps {
  fieldName: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
}

/**
 * Memoized PromptTextarea component
 * Only re-renders when its specific field value changes
 */
export const PromptTextarea = memo(function PromptTextarea({
  fieldName,
  label,
  placeholder,
  helpText,
}: PromptTextareaProps) {
  const value = useFieldValue(fieldName, "");
  const error = useFieldError(fieldName);
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const updateField = useGenerationStore((s) => s.updateField);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get character limit from model capabilities
  const maxLength = fieldName === "prompt"
    ? selectedModel?.capabilities?.promptCharacterLimit || 1500
    : selectedModel?.capabilities?.negativePromptCharacterLimit || 1500;
  
  const currentLength = (value as string).length;
  const isNearLimit = currentLength > maxLength * 0.8;
  const isOverLimit = currentLength > maxLength;
  
  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateField(fieldName, e.target.value);
    },
    [fieldName, updateField]
  );
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={fieldName}
          className="text-sm font-medium text-gray-900 dark:text-(--color-text-1)"
        >
          {label || (fieldName === "prompt" ? "Prompt" : "Negative Prompt")}
          {fieldName === "prompt" && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <span
          className={`text-xs ${
            isOverLimit
              ? "text-red-500 font-medium"
              : isNearLimit
              ? "text-yellow-600 dark:text-yellow-500"
              : "text-gray-500 dark:text-(--color-text-3)"
          }`}
        >
          {currentLength} / {maxLength}
        </span>
      </div>
      
      <Textarea
        ref={textareaRef}
        id={fieldName}
        value={value as string}
        onChange={handleChange}
        placeholder={placeholder || `Describe ${fieldName === "prompt" ? "the video you want to generate" : "what you don't want"}...`}
        className={`min-h-[120px] w-full resize-none rounded-lg p-4 text-base focus:ring-0 ${
          error || isOverLimit
            ? "border-red-500 focus:border-red-500"
            : "border-gray-200 focus:border-blue-500 dark:border-(--color-border-container)"
        } bg-gray-50 dark:bg-(--color-bg-primary) dark:text-(--color-text-1) dark:placeholder:text-(--color-text-3)`}
        aria-label={label || fieldName}
        aria-describedby={helpText ? `${fieldName}-help` : undefined}
        aria-invalid={!!error || isOverLimit}
        aria-errormessage={error ? `${fieldName}-error` : undefined}
      />
      
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
      
      {isOverLimit && (
        <p className="text-xs text-red-500" role="alert">
          Character limit exceeded by {currentLength - maxLength} characters
        </p>
      )}
    </div>
  );
});

