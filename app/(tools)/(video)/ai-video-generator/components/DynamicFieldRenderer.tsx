"use client";

/**
 * Dynamic Field Renderer
 * Core component that renders fields based on model configuration
 * Single source of truth for field rendering across all 76 models
 */

import { memo } from "react";
import { useGenerationStore } from "../store/useGenerationStore";
import { useVisibleFields } from "../store/selectors";
import { getFieldMetadata } from "../configs/fieldRegistry";
import { FIELD_COMPONENTS } from "./fields";
import { FieldErrorBoundary } from "./FieldErrorBoundary";

/**
 * Group fields into logical sections for better UX
 */
interface FieldSection {
  title: string;
  fields: string[];
  collapsible?: boolean;
}

/**
 * Determine which section a field belongs to
 */
function getFieldSection(fieldName: string): string {
  // Core text inputs
  if (fieldName === "prompt" || fieldName === "negativePrompt") {
    return "prompts";
  }
  
  // Media inputs
  if (
    fieldName.includes("image") ||
    fieldName.includes("video") ||
    fieldName.includes("Image") ||
    fieldName.includes("Video") ||
    fieldName.includes("scenes") ||
    fieldName.includes("reference")
  ) {
    return "media";
  }
  
  // Settings
  if (
    fieldName === "duration" ||
    fieldName === "aspectRatio" ||
    fieldName === "resolution"
  ) {
    return "settings";
  }
  
  // Advanced options (everything else)
  return "advanced";
}

/**
 * Group fields into sections
 */
function groupFieldsIntoSections(fields: string[]): FieldSection[] {
  const sections: Record<string, string[]> = {
    prompts: [],
    media: [],
    settings: [],
    advanced: [],
  };
  
  // Group fields
  fields.forEach((fieldName) => {
    const section = getFieldSection(fieldName);
    sections[section].push(fieldName);
  });
  
  // Create section objects
  const result: FieldSection[] = [];
  
  if (sections.prompts.length > 0) {
    result.push({
      title: "Prompt",
      fields: sections.prompts,
    });
  }
  
  if (sections.media.length > 0) {
    result.push({
      title: "Media",
      fields: sections.media,
    });
  }
  
  if (sections.settings.length > 0) {
    result.push({
      title: "Settings",
      fields: sections.settings,
    });
  }
  
  if (sections.advanced.length > 0) {
    result.push({
      title: "Advanced Options",
      fields: sections.advanced,
      collapsible: true,
    });
  }
  
  return result;
}

/**
 * Render a single field wrapped in error boundary
 */
const FieldRenderer = memo(function FieldRenderer({
  fieldName,
}: {
  fieldName: string;
}) {
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  
  if (!selectedModel) {
    return null;
  }
  
  // Get field metadata
  const metadata = getFieldMetadata(fieldName, selectedModel);
  
  // Get the component to render
  const Component = FIELD_COMPONENTS[metadata.component as keyof typeof FIELD_COMPONENTS];
  
  if (!Component) {
    console.warn(`No component found for: ${metadata.component}`);
    return null;
  }
  
  // Render the component wrapped in error boundary
  return (
    <FieldErrorBoundary fieldName={fieldName}>
      <Component
        fieldName={fieldName}
        label={metadata.label}
        helpText={metadata.helpText}
      />
    </FieldErrorBoundary>
  );
});

/**
 * Dynamic Field Renderer Component
 * Automatically renders all fields for the selected model
 */
export const DynamicFieldRenderer = memo(function DynamicFieldRenderer() {
  const selectedModel = useGenerationStore((s) => s.selectedModel);
  const visibleFields = useVisibleFields();
  
  // No model selected
  if (!selectedModel) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-(--color-text-3)">
            Select a model to configure settings
          </p>
        </div>
      </div>
    );
  }
  
  // No visible fields
  if (visibleFields.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-(--color-text-3)">
            This model has no configurable options
          </p>
        </div>
      </div>
    );
  }
  
  // Group fields into sections
  const sections = groupFieldsIntoSections(visibleFields);
  
  return (
    <div className="space-y-8 px-(--spacing-page-padding) py-(--spacing-element-gap)">
      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          {/* Section Header */}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-(--color-text-2) uppercase tracking-wide">
            {section.title}
          </h3>
          
          {/* Section Fields */}
          <div className="space-y-6">
            {section.fields.map((fieldName) => (
              <FieldRenderer key={fieldName} fieldName={fieldName} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

