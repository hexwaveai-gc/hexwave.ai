"use client";

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";  
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
  import { useImageGenerationStore } from "../store/useImageGenerationStore";
import { useFieldValue } from "../store/selectors";

interface DynamicFieldRendererProps {
  excludeFields?: string[];
}

/**
 * Dynamically renders form fields based on model settings
 * Refactored to use Zustand store - eliminates prop drilling
 */
/**
 * Individual field component to avoid hook usage in map
 */
function FieldRenderer({
  fieldName,
  config,
}: {
  fieldName: string;
  config: any;
}) {
  const value = useFieldValue(fieldName, config?.default);
  const updateField = useImageGenerationStore((s) => s.updateField);

  // Helper function to normalize options (handle both string and object formats)
  const normalizeOption = (option: string | { value: string; label: string }) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option;
  };

  // Select field
  if (config.type === "select" && config.options) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
          {fieldName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Label>
        <Select
          value={value?.toString()}
          onValueChange={(val) => updateField(fieldName, val)}
        >
          <SelectTrigger className="rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {config.options.map((option: any) => {
              const normalized = normalizeOption(option);
              return (
                <SelectItem
                  key={normalized.value}
                  value={normalized.value}
                  className="rounded-lg"
                >
                  {normalized.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {config.description && (
          <p className="text-xs text-gray-500 dark:text-[var(--color-text-3)]">
            {config.description}
          </p>
        )}
      </div>
    );
  }

  // Number field
  if (config.type === "number") {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
          {fieldName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Label>
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            updateField(fieldName, e.target.value ? Number(e.target.value) : undefined)
          }
          min={config.min}
          max={config.max}
          placeholder={config.description}
          className="rounded-lg"
        />
        {config.description && (
          <p className="text-xs text-gray-500 dark:text-[var(--color-text-3)]">
            {config.description}
          </p>
        )}
      </div>
    );
  }

  // Array field (tags)
  if (config.type === "array") {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
          {fieldName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Label>
        <Input
          type="text"
          value={Array.isArray(value) ? value.join(", ") : ""}
          onChange={(e) =>
            updateField(
              fieldName,
              e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          }
          placeholder="tag1, tag2, tag3"
          className="rounded-[18px]"
        />
        {config.description && (
          <p className="text-xs text-gray-500 dark:text-[var(--color-text-3)]">
            {config.description}
          </p>
        )}
      </div>
    );
  }

  return null;
}

export default function DynamicFieldRenderer({
  excludeFields = ["prompt", "reference_images", "style_prompt", "original_image"],
}: DynamicFieldRendererProps) {
  const selectedModel = useImageGenerationStore((s) => s.selectedModel);
  
  if (!selectedModel || !selectedModel.settings) {
    return null;
  }
  
  const settings = selectedModel.settings;
  const fieldEntries = Object.entries(settings).filter(
    ([key]) => !excludeFields.includes(key)
  );

  if (fieldEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {fieldEntries.map(([key, config]) => (
        <FieldRenderer key={key} fieldName={key} config={config} />
      ))}
    </div>
  );
}

