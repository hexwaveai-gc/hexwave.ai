"use client";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ModelSettings } from "../lib/s/runwaygen4/settings";

interface DynamicFieldRendererProps {
  settings: ModelSettings;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  excludeFields?: string[];
}

/**
 * Dynamically renders form fields based on model settings
 */
export default function DynamicFieldRenderer({
  settings,
  values,
  onChange,
  excludeFields = ["prompt", "reference_images"],
}: DynamicFieldRendererProps) {
  const fieldEntries = Object.entries(settings).filter(
    ([key]) => !excludeFields.includes(key)
  );

  // Helper function to normalize options (handle both string and object formats)
  const normalizeOption = (option: string | { value: string; label: string }) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option;
  };

  if (fieldEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {fieldEntries.map(([key, config]) => {
        const value = values[key] ?? config.default;

        // Select field
        if (config.type === "select" && config.options) {
          return (
            <div key={key} className="space-y-3">
              <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
                {key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Label>
              <Select
                value={value?.toString()}
                onValueChange={(val) => onChange(key, val)}
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
            <div key={key} className="space-y-3">
              <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
                {key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Label>
              <Input
                type="number"
                value={value ?? ""}
                onChange={(e) =>
                  onChange(key, e.target.value ? Number(e.target.value) : undefined)
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
            <div key={key} className="space-y-3">
              <Label className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
                {key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Label>
              <Input
                type="text"
                value={Array.isArray(value) ? value.join(", ") : ""}
                onChange={(e) =>
                  onChange(
                    key,
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
      })}
    </div>
  );
}

