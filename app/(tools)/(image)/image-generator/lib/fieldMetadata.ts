/**
 * Shared metadata for common fields across all models.
 * Drives UI labels, default values, and backend parameter mapping.
 */

export type FieldTab = "text-to-image" | "image-reference" | "restyle";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "file-single"
  | "file-array"
  | "slider";

export interface FieldOption {
  value: string;
  label?: string;
  helperText?: string;
}

export interface FieldMetadata {
  key: string;
  label: string;
  description?: string;
  kind: FieldKind;
  backendKey?: string;
  defaultValue?: any;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  maxFiles?: number;
  includeWhenEmpty?: boolean;
  supportedTabs?: FieldTab[];
}

const numberOfImagesOptions: FieldOption[] = [
  { value: "1", label: "1 Image" },
  { value: "2", label: "2 Images" },
  { value: "3", label: "3 Images" },
  { value: "4", label: "4 Images" },
];

export const PRIMARY_FIELD_KEYS = [
  "aspect_ratio",
  "resolution",
  "num_images",
  "quantity",
  "quality",
  "output_quality",
  "rendering_speed",
] as const;

const DEFAULT_FIELD_METADATA: Record<string, FieldMetadata> = {
  prompt: {
    key: "prompt",
    label: "Prompt",
    description: "Describe the image you want to generate",
    kind: "textarea",
    supportedTabs: ["text-to-image", "image-reference"],
  },
  style_prompt: {
    key: "style_prompt",
    label: "Style Prompt",
    description: "Describe the style to apply to the uploaded image",
    kind: "textarea",
    supportedTabs: ["restyle"],
  },
  reference_images: {
    key: "reference_images",
    label: "Reference Images",
    description: "Upload up to 3 reference images",
    kind: "file-array",
    backendKey: "reference_image_urls",
    maxFiles: 3,
    supportedTabs: ["image-reference"],
  },
  original_image: {
    key: "original_image",
    label: "Original Image",
    description: "Upload the image you want to restyle",
    kind: "file-single",
    backendKey: "original_image_url",
    supportedTabs: ["restyle"],
  },
  num_images: {
    key: "num_images",
    label: "Number of Images",
    description: "How many variations to generate",
    kind: "select",
    backendKey: "num_images",
    defaultValue: 1,
    options: numberOfImagesOptions,
  },
  quantity: {
    key: "quantity",
    label: "Number of Images",
    description: "How many variations to generate",
    kind: "select",
    backendKey: "num_images",
    defaultValue: 1,
    options: numberOfImagesOptions,
  },
  aspect_ratio: {
    key: "aspect_ratio",
    label: "Aspect Ratio",
    description: "Choose the aspect ratio of the generated image",
    kind: "select",
  },
  resolution: {
    key: "resolution",
    label: "Resolution",
    description: "Select the output resolution",
    kind: "select",
  },
  quality: {
    key: "quality",
    label: "Quality",
    description: "Choose rendering quality",
    kind: "select",
  },
  output_quality: {
    key: "output_quality",
    label: "Output Quality",
    description: "Choose rendering quality",
    kind: "select",
    backendKey: "quality",
  },
  rendering_speed: {
    key: "rendering_speed",
    label: "Rendering Speed",
    description: "Balance between speed and fidelity",
    kind: "select",
  },
  guidance: {
    key: "guidance",
    label: "Guidance",
    description: "Control prompt adherence vs. creativity",
    kind: "slider",
    min: 0,
    max: 20,
    step: 0.5,
  },
  steps: {
    key: "steps",
    label: "Steps",
    description: "Number of diffusion steps",
    kind: "number",
    min: 1,
    max: 100,
  },
  seed: {
    key: "seed",
    label: "Seed",
    description: "Set for reproducible generation",
    kind: "number",
  },
};

export function getFieldMetadata(fieldName: string): FieldMetadata | undefined {
  return DEFAULT_FIELD_METADATA[fieldName];
}

export function humanizeFieldName(fieldName: string): string {
  return fieldName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

