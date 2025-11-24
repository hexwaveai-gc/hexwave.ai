/**
 * Field Components Index
 * Centralized exports for all field components
 */

import { PromptTextarea } from "./PromptTextarea";
import { SelectField } from "./SelectField";
import { ToggleField } from "./ToggleField";
import { ImageUploadField } from "./ImageUploadField";

// Re-export components
export { PromptTextarea } from "./PromptTextarea";
export { SelectField } from "./SelectField";
export { ToggleField } from "./ToggleField";
export { ImageUploadField } from "./ImageUploadField";

/**
 * Field component registry
 * Maps component names to their implementations
 */
export const FIELD_COMPONENTS = {
  PromptTextarea,
  SelectField,
  ToggleField,
  ImageUploadField,
  // Aliases for common use cases
  TextInput: PromptTextarea,
  NumberField: SelectField, // Simple number inputs can use select for now
  SliderField: SelectField, // Sliders can use select for now
  MovementAmplitudeSlider: SelectField,
  VideoUploadField: ImageUploadField, // Same component, different accept type
  TailImageUrlField: ImageUploadField,
  MultiImageUploadField: ImageUploadField,
  SceneImagesUploadField: ImageUploadField,
  ViduTemplateSelector: SelectField, // Template selector uses select
};

