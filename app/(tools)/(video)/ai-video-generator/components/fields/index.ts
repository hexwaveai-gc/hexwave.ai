/**
 * Field Components Index
 * Centralized exports for all field components
 */

import { PromptTextarea } from "./PromptTextarea";
import { SelectField } from "./SelectField";
import { ToggleField } from "./ToggleField";
import { 
  FileUploadField, 
  ImageUploadField, 
  VideoUploadField, 
  PdfUploadField,
  MultiImageUploadField,
  MultiVideoUploadField,
  MultiPdfUploadField,
} from "./FileUploadField";

// Re-export components
export { PromptTextarea } from "./PromptTextarea";
export { SelectField } from "./SelectField";
export { ToggleField } from "./ToggleField";

// File upload components - single and multi
export { 
  FileUploadField, 
  ImageUploadField, 
  VideoUploadField, 
  PdfUploadField,
  MultiImageUploadField,
  MultiVideoUploadField,
  MultiPdfUploadField,
} from "./FileUploadField";

/**
 * Field component registry
 * Maps component names to their implementations
 */
export const FIELD_COMPONENTS = {
  PromptTextarea,
  SelectField,
  ToggleField,
  // Single file upload components
  FileUploadField,
  ImageUploadField,
  VideoUploadField,
  PdfUploadField,
  // Multi-file upload components
  MultiImageUploadField,
  MultiVideoUploadField,
  MultiPdfUploadField,
  // Aliases for common use cases
  TextInput: PromptTextarea,
  NumberField: SelectField,
  SliderField: SelectField,
  MovementAmplitudeSlider: SelectField,
  TailImageUrlField: ImageUploadField,
  SceneImagesUploadField: MultiImageUploadField,
  ViduTemplateSelector: SelectField,
};
