/**
 * Field Validators
 * Validation logic for all field types
 */

import { ModelType } from "../types/index.types";
import { ValidationRules } from "../types/field.types";

/**
 * Validate a field value based on validation rules
 */
export function validateField(
  fieldName: string,
  value: any,
  model: ModelType | null,
  rules?: ValidationRules
): string | null {
  if (!model) {
    return null;
  }
  
  // Get model-specific field options
  const fieldOption = model.fieldOptions?.[fieldName];
  
  // Check required
  if (rules?.required || fieldName === "prompt") {
    if (value === null || value === undefined || value === "") {
      return `${formatFieldName(fieldName)} is required`;
    }
  }
  
  // String validation
  if (typeof value === "string") {
    // Min length
    if (rules?.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }
    
    // Max length
    const maxLength = typeof rules?.maxLength === "function"
      ? rules.maxLength(model)
      : rules?.maxLength;
    
    if (maxLength && value.length > maxLength) {
      return `Must be ${maxLength} characters or less`;
    }
    
    // Pattern
    if (rules?.pattern && !rules.pattern.test(value)) {
      return `Invalid format`;
    }
  }
  
  // Number validation
  if (typeof value === "number") {
    // Min value
    if (rules?.min !== undefined && value < rules.min) {
      return `Must be at least ${rules.min}`;
    }
    
    // Max value
    if (rules?.max !== undefined && value > rules.max) {
      return `Must be at most ${rules.max}`;
    }
  }
  
  // Array validation
  if (Array.isArray(value)) {
    if (rules?.minLength && value.length < rules.minLength) {
      return `Must have at least ${rules.minLength} items`;
    }
    
    if (rules?.maxLength && value.length > (rules.maxLength as number)) {
      return `Must have at most ${rules.maxLength} items`;
    }
  }
  
  // Custom validation
  if (rules?.custom) {
    return rules.custom(value, model);
  }
  
  return null;
}

/**
 * Format field name to human-readable text
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

/**
 * Validate prompt field
 */
export function validatePrompt(
  value: string,
  model: ModelType
): string | null {
  const maxLength = model.capabilities?.promptCharacterLimit || 1500;
  
  if (!value || !value.trim()) {
    return "Prompt is required";
  }
  
  if (value.length < 3) {
    return "Prompt must be at least 3 characters";
  }
  
  if (value.length > maxLength) {
    return `Prompt must be ${maxLength} characters or less`;
  }
  
  return null;
}

/**
 * Validate negative prompt field
 */
export function validateNegativePrompt(
  value: string,
  model: ModelType
): string | null {
  if (!value) {
    return null; // Negative prompt is optional
  }
  
  const maxLength = model.capabilities?.negativePromptCharacterLimit || 1500;
  
  if (value.length > maxLength) {
    return `Negative prompt must be ${maxLength} characters or less`;
  }
  
  return null;
}

/**
 * Validate aspect ratio
 */
export function validateAspectRatio(
  value: string,
  model: ModelType
): string | null {
  const options = model.fieldOptions?.aspectRatio?.options;
  
  if (!options || options.length === 0) {
    return null;
  }
  
  // Convert options to values array
  const validValues = options.map((opt) => {
    if (typeof opt === "string") return opt;
    if (typeof opt === "number") return String(opt);
    return (opt as { value: string }).value;
  });
  
  if (!validValues.includes(value)) {
    return "Invalid aspect ratio";
  }
  
  return null;
}

/**
 * Validate duration
 */
export function validateDuration(
  value: string | number,
  model: ModelType
): string | null {
  const options = model.fieldOptions?.duration?.options;
  
  if (!options || options.length === 0) {
    return null;
  }
  
  // Convert to string for comparison
  const valueStr = String(value);
  const validValues = options.map((opt) => String(opt));
  
  if (!validValues.includes(valueStr)) {
    return "Invalid duration";
  }
  
  return null;
}

/**
 * Validate resolution
 */
export function validateResolution(
  value: string,
  model: ModelType
): string | null {
  const options = model.fieldOptions?.resolution?.options;
  
  if (!options || options.length === 0) {
    return null;
  }
  
  const validValues = options.map((opt) => {
    if (typeof opt === "string") return opt;
    if (typeof opt === "number") return String(opt);
    return (opt as { value: string }).value;
  });
  
  if (!validValues.includes(value)) {
    return "Invalid resolution";
  }
  
  return null;
}

/**
 * Validate number range
 */
export function validateNumber(
  value: number,
  min?: number,
  max?: number
): string | null {
  if (min !== undefined && value < min) {
    return `Must be at least ${min}`;
  }
  
  if (max !== undefined && value > max) {
    return `Must be at most ${max}`;
  }
  
  return null;
}

