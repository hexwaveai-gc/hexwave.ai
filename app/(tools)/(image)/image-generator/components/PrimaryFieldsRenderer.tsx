"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useImageGenerationStore } from "../store/useImageGenerationStore";
import { useFieldValue } from "../store/selectors";

/**
 * Primary fields that should be shown in the footer
 * These fields are rendered dynamically based on model settings
 */
const PRIMARY_FIELD_NAMES = [
  "aspect_ratio",
  "resolution",
  "num_images",
  "quantity", // Alternative name for num_images (used by GPT Image 1)
  "quality",
  "output_quality", // Alternative name for quality (used by Stable Diffusion)
  "rendering_speed", // Used by Ideogram (has quality-related options)
] as const;

/**
 * Helper function to normalize options (handle both string and object formats)
 */
function normalizeOption(option: string | { value: string; label: string }) {
  if (typeof option === "string") {
    return { value: option, label: option };
  }
  return option;
}

/**
 * Check if a field setting supports rendering as a select dropdown
 */
function isSelectField(config: any): boolean {
  return config && (config.options || (Array.isArray(config) && config.length > 0));
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
          {options.map((option: string | { value: string; label: string }) => {
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
  const defaultValue = config?.default || 1;
  const min = config?.min || 1;
  const max = config?.max || 4;
  const displayValue = value?.toString() || defaultValue.toString();

  // Generate options array from min to max
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="w-24 shrink-0">
      <Select value={displayValue} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 rounded-lg border-[var(--color-border-container)] bg-[var(--color-bg-primary)] text-[var(--color-text-1)] px-3 dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)] dark:text-[var(--color-text-1)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {options.map((num) => (
            <SelectItem key={num} value={num.toString()} className="rounded-lg">
              {num} {num === 1 ? "Image" : "Images"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
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
    if (isIntegerField(config)) {
      return (
        <NumImagesField
          fieldName={fieldName}
          config={config}
          value={value}
          onValueChange={handleValueChange}
        />
      );
    }
    return null;
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

  if (!selectedModel || !selectedModel.settings) {
    return null;
  }

  const settings = selectedModel.settings;

  // Define field order for rendering
  const fieldOrder: string[] = [
    "aspect_ratio",
    "resolution",
    "num_images",
    "quantity", // Check quantity if num_images doesn't exist
    "quality",
    "output_quality", // Check output_quality if quality doesn't exist
    "rendering_speed", // Check rendering_speed if quality doesn't exist
  ];

  // Filter and order fields based on availability
  const fieldsToRender = fieldOrder.filter((fieldName) => {
    // Skip if already processed (e.g., skip quantity if num_images exists)
    if (fieldName === "quantity" && settings.num_images) {
      return false;
    }
    if (fieldName === "output_quality" && settings.quality) {
      return false;
    }
    if (fieldName === "rendering_speed" && (settings.quality || settings.output_quality)) {
      return false;
    }

    const config = settings[fieldName];
    if (!config) {
      return false;
    }

    // Check if field can be rendered
    return isSelectField(config) || isIntegerField(config);
  });

  if (fieldsToRender.length === 0) {
    return null;
  }

  return (
    <>
      {fieldsToRender.map((fieldName) => {
        const config = settings[fieldName];
        return (
          <FieldRenderer key={fieldName} fieldName={fieldName} config={config} />
        );
      })}
    </>
  );
}

/**
 * Get list of all primary field names (including aliases) for exclusion
 * Used by AdvancedSettingsDialog to exclude primary fields
 */
export function getPrimaryFieldNames(): string[] {
  return Array.from(PRIMARY_FIELD_NAMES);
}

