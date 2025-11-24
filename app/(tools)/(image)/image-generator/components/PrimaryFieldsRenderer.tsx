"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useImageGenerationStore } from "../store/useImageGenerationStore";
import { useFieldValue } from "../store/selectors";
import { getFieldMetadata, humanizeFieldName, PRIMARY_FIELD_KEYS } from "../lib/fieldMetadata";

type OptionInput =
  | string
  | number
  | {
      value: string | number;
      label?: string;
      helperText?: string;
    };

/**
 * Helper function to normalize options (handle string, number, and object formats)
 */
function normalizeOption(option: OptionInput) {
  if (typeof option === "string" || typeof option === "number") {
    const value = option.toString();
    return { value, label: option.toString() };
  }

  return {
    value: option.value.toString(),
    label: option.label ?? option.value.toString(),
    helperText: option.helperText,
  };
}

/**
 * Check if a field setting supports rendering as a select dropdown
 */
function isSelectField(config: any): boolean {
  return config && Array.isArray(config.options) && config.options.length > 0;
}

/**
 * Check if a field setting supports rendering as an integer/number field
 */
function isIntegerField(config: any): boolean {
  return (
    config &&
    (config.type === "integer" ||
      (typeof config.min === "number" && typeof config.max === "number"))
  );
}

/**
 * Render a select field
 */
function SelectField({
  fieldName,
  config,
  value,
  onValueChange,
}: {
  fieldName: string;
  config: any;
  value: any;
  onValueChange: (value: string) => void;
}) {
  const options = config.options || [];
  const displayValue = value?.toString() || config.default?.toString() || "";

  return (
    <div className="w-28 shrink-0">
      <Select value={displayValue} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 rounded-lg border-[var(--color-border-container)] bg-[var(--color-bg-primary)] text-[var(--color-text-1)] px-3 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {options.map((option: OptionInput, index: number) => {
            const normalized = normalizeOption(option);
            return (
              <SelectItem
                key={`${normalized.value}-${index}`}
                value={normalized.value}
                className="rounded-lg"
              >
                {normalized.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Render a number of images field (special handling for num_images/quantity)
 */
function NumImagesField({
  fieldName,
  config,
  value,
  onValueChange,
}: {
  fieldName: string;
  config: any;
  value: any;
  onValueChange: (value: string) => void;
}) {
  const displayValue = value?.toString() || config.default?.toString() || "";
  const options =
    config.options ||
    Array.from(
      { length: (config.max || 4) - (config.min || 1) + 1 },
      (_, i) => (config.min || 1) + i
    ).map((num) => ({ value: num.toString(), label: `${num} ${num === 1 ? "Image" : "Images"}` }));

  return (
    <div className="w-24 shrink-0">
      <Select value={displayValue} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 rounded-lg border-[var(--color-border-container)] bg-[var(--color-bg-primary)] text-[var(--color-text-1)] px-3 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {options.map((option: OptionInput, index: number) => {
            const normalized = normalizeOption(option);
            return (
              <SelectItem
                key={`${normalized.value ?? index}`}
                value={normalized.value}
                className="rounded-lg"
              >
                {normalized.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function buildFieldConfig(fieldName: string, settings: Record<string, any>) {
  const metadata = getFieldMetadata(fieldName);
  const overrides = settings[fieldName] || {};
  const base = metadata ? { ...metadata } : {};

  const options = overrides.options || metadata?.options;

  return {
    ...base,
    ...overrides,
    label: overrides.label || metadata?.label || humanizeFieldName(fieldName),
    description: overrides.description || metadata?.description,
    default: overrides.default ?? metadata?.defaultValue,
    options,
  };
}

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
  // Use the actual field name from the model (not normalized)
  // This ensures we store values using the model's expected field name
  const value = useFieldValue(fieldName, config?.default);
  const updateField = useImageGenerationStore((s) => s.updateField);

  const handleValueChange = (newValue: string) => {
    // For num_images/quantity, convert to number
    if (fieldName === "num_images" || fieldName === "quantity") {
      updateField(fieldName, Number(newValue));
    } else {
      updateField(fieldName, newValue);
    }
  };

  // Special handling for num_images/quantity
  if (fieldName === "num_images" || fieldName === "quantity") {
    return (
      <NumImagesField
        fieldName={fieldName}
        config={config}
        value={value}
        onValueChange={handleValueChange}
      />
    );
  }

  // Handle select fields
  if (isSelectField(config)) {
    return (
      <SelectField
        fieldName={fieldName}
        config={config}
        value={value}
        onValueChange={handleValueChange}
      />
    );
  }

  return null;
}

/**
 * PrimaryFieldsRenderer Component
 * Dynamically renders primary fields (aspect_ratio, num_images, resolution, quality)
 * based on what's available in the selected model's settings
 * 
 * Fields are rendered in this order:
 * 1. aspect_ratio
 * 2. resolution
 * 3. num_images/quantity
 * 4. quality/output_quality/rendering_speed
 */
export default function PrimaryFieldsRenderer() {
  const selectedModel = useImageGenerationStore((s) => s.selectedModel);
  const settings = selectedModel?.settings;

  // Define field order for rendering
  const fieldOrder: string[] = Array.from(PRIMARY_FIELD_KEYS);

  // Compute renderable fields
  const fieldsToRender = useMemo(() => {
    if (!settings) {
      return [];
    }

    return fieldOrder.filter((fieldName) => {
      if (fieldName === "quantity" && !settings.quantity) {
        return false;
      }
      if (fieldName === "quantity" && settings.num_images) {
        return false;
      }
      if (fieldName === "num_images" && !settings.num_images && settings.quantity) {
        return false;
      }
      if (fieldName === "output_quality" && settings.quality) {
        return false;
      }
      if (fieldName === "rendering_speed" && (settings.quality || settings.output_quality)) {
        return false;
      }

      const config = buildFieldConfig(fieldName, settings);

      if (!config) {
        return false;
      }

      if (!isSelectField(config) && !isIntegerField(config)) {
        return false;
      }

      if (isSelectField(config) && (!config.options || config.options.length === 0)) {
        return false;
      }

      return true;
    });
  }, [settings]);

  if (fieldsToRender.length === 0) {
    return null;
  }

  if (!selectedModel || !settings) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {fieldsToRender.map((fieldName) => {
        const combinedConfig = buildFieldConfig(fieldName, settings);
        return <FieldRenderer key={fieldName} fieldName={fieldName} config={combinedConfig} />;
      })}
    </div>
  );
}

/**
 * Get list of all primary field names (including aliases) for exclusion
 * Used by AdvancedSettingsDialog to exclude primary fields
 */
export function getPrimaryFieldNames(): string[] {
  return Array.from(PRIMARY_FIELD_KEYS);
}

