import React from "react";
import { ToolExample, ExamplesConfig } from "./example-types";

export interface ImageParameter {
  type: "image";
  label: string;
  description?: string;
  defaultValue: any[];
  maxImages: number;
  instanceId: string;
  required?: boolean;
}

export interface TextareaParameter {
  type: "textarea";
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue: string;
  required?: boolean;
  className?: string;
  textLimit?: number;
}

export interface SliderParameter {
  type: "slider";
  label: string;
  description?: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}

export interface SelectParameter {
  type: "select";
  label: string;
  description?: string;
  required?: boolean;
  defaultValue: number | string;
  options: { value: string | number; label: string }[];
}

export interface CheckboxParameter {
  type: "checkbox";
  label: string;
  description?: string;
  defaultValue: boolean;
}

export interface InputParameter {
  type: "input";
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue: string;
  required?: boolean;
  className?: string;
  inputType?: string;
}

export interface SwitchParameter {
  type: "switch";
  label: string;
  description?: string;
  defaultValue: boolean;
}

export interface RadioGroupParameter {
  type: "radioGroup";
  label: string;
  description?: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}

export interface NumberParameter {
  type: "number";
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
}

export interface AiModelParameter {
  type: "ai-model";
  label: string;
  description?: string;
  defaultValue: string;
  modelOptions?: Array<{ id: string; name: string }>;
  required?: boolean;
}

export interface ModelSelectorParameter {
  type: "model-selector";
  label: string;
  description?: string;
  defaultValue: string;
  modelOptions?: Array<{ id: string; name: string }>;
  required?: boolean;
}

export interface ActionButtonParameter {
  type: "actionButton";
  label: string;
  description?: string;
  buttonLabel: string;
  defaultValue: boolean;
  onClickAction: (currentParams: Record<string, any>) => void;
}

export interface DualImageParameter {
  type: "dual-image";
  label: string;
  description?: string;
  defaultValue: any;
}

export interface PresetButtonsParameter {
  type: "preset-buttons";
  label: string;
  description?: string;
  presets: Array<{ name: string; prompt: string }>;
  targetField: string;
  gridCols?: number;
  buttonSize?: "sm" | "md" | "lg";
  defaultValue?: string;
}

export interface CustomComponentParameter {
  type: "custom-component";
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  defaultValue?: any;
}

// Base interface for model-dependent parameters
interface ModelDependentParameter {
  models?: string[]; // Show parameter only for these models
  excludeModels?: string[]; // Hide parameter for these models
  isAdvanced?: boolean; // Mark parameter as advanced setting
}

// Extend all parameter types with model dependency
export type ToolParameter = (
  | ImageParameter
  | TextareaParameter
  | SliderParameter
  | SelectParameter
  | CheckboxParameter
  | InputParameter
  | NumberParameter
  | AiModelParameter
  | DualImageParameter
  | SwitchParameter
  | RadioGroupParameter
  | ActionButtonParameter
  | PresetButtonsParameter
  | CustomComponentParameter
  | ModelSelectorParameter
) &
  ModelDependentParameter;

export interface WriteExample {
  title: string;
  description: string;
  paramsValuesToChange: Record<string, any> | null;
}

export interface WhyChooseProps {
  title: string;
  description: string;
  features: string[];
}

export interface HowToolWorksStep {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export interface HowToolWorksProps {
  title: string;
  description?: string;
  steps: HowToolWorksStep[];
}

export interface KeyFeaturesFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface KeyFeaturesProps {
  title: string;
  features: KeyFeaturesFeature[];
}

export interface WhoCanBenefitBeneficiary {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface WhoCanBenefitProps {
  title: string;
  description?: string;
  beneficiaries: WhoCanBenefitBeneficiary[];
}

export interface TipItem {
  icon?: React.ReactNode;
  tip: string;
  description: string;
}

export interface TipsProps {
  title: string;
  tips: TipItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQsProps {
  title: string;
  faqs: FAQItem[];
}

export interface SupportingContent {
  whyChoose?: WhyChooseProps;
  howToolWorks?: HowToolWorksProps;
  keyFeatures?: KeyFeaturesProps;
  whoCanBenefit?: WhoCanBenefitProps;
  tips?: TipsProps;
  faqs?: FAQsProps;
}

// Metadata for single image generator tools
export interface SingleImageMetadata {
  imageTitle: string;
  processingMessage?: string;
  successMessage?: string;
  successDescription?: string;
  inputDataTransform?: string;
  defaultModel?: string;
  showModelSelection?: boolean;
  defaultAdvancedSettingsOpen?: boolean;
  toolName?: string; // For API calls
}

// Metadata for dual image generator tools
export interface DualImageMetadata {
  firstImageTitle: string;
  secondImageTitle: string;
  processingMessage?: string;
  successMessage?: string;
  successDescription?: string;
  inputDataTransform?: string;
  toolName?: string; // For API calls
  examplesTitle?: string;
  examplesFirstImageLabel?: string;
  examplesSecondImageLabel?: string;
  examplesResultImageLabel?: string;
  examples?: Array<{
    originalImage: string;
    originalImage2: string;
    resultImage: string;
  }>;
  prompt?: string; // Prompt template for API generation
  // Model selection is now centralized - these can be overridden per tool if needed
  showModelSelection?: boolean; // Whether to show model selection UI (defaults to true)
  availableModels?: Array<{
    id: string;
    name: string;
    description: string;
    logo: string;
    cost: number; // Cost in credits
  }>; // Available models for this tool (defaults to all available models)
  defaultModel?: string; // Default model ID (defaults to gemini-25-flash-image)
}

// Metadata for image-to-text analyzer tools (image-tool-template)
export interface AnalyzerMetadata {
  icon?: string;
  analyzerType: string; // Used to identify analyzer in /api/analyze
  contextPlaceholder?: string;
  generateButtonText?: string;
  uploadLabel?: string;
  emptyResultsMessage?: string;
  // Prompt configuration
  systemPrompt?: string; // AI system prompt for analysis
  userPromptTemplate?: (context?: string) => string; // Function to generate user prompt based on context
  // Credit configuration (overrides defaults)
  creditAmount?: number; // Specific credit amount for this analyzer
  creditType?: string; // Type label for credit tracking (e.g., "face_rating")
  creditDescription?: string; // Human-readable description (e.g., "face rating")
  useFetchUsageData?: boolean; // Whether to use fetchUsageData for credit calculation
}

// Metadata for identifier tools (identifier-template)
export interface IdentifierMetadata {
  icon?: string;
  identifierType: string; // Used to identify tool in /api/identify (e.g., "animal", "plant")
  textareaPlaceholder?: string;
  emptyMessage?: string;
  // Prompt configuration
  systemPrompt?: string; // AI system prompt for identification
  userPromptTemplate?: (context?: string) => string; // Function to generate user prompt based on context
  // Credit configuration (overrides defaults)
  creditAmount?: number; // Specific credit amount for this identifier
  creditType?: string; // Type label for credit tracking (e.g., "animal_identification")
  creditDescription?: string; // Human-readable description (e.g., "animal identification")
}

export interface ToolConfig {
  toolId: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  sampleImages?: string[];
  examples?: ToolExample[] | ExamplesConfig;
  toolTypeForHistoryModal: string;
  generateButtonText?: string; // Default: "Generate"
  apiEndpoint: string;
  parameters: Record<string, ToolParameter>;
  modelParameters?: Record<string, Record<string, ToolParameter>>; // Model-to-parameters mapping for advanced settings
  requiredCredits?: number; // Default: DEFAULT_TOOL_CREDIT_COST (0.04M = 40,000 credits) from @/constants/costs
  writeExample?: WriteExample;
  fetchHistory?: () => Promise<any[]>;
  supportingContent?: SupportingContent;
  generationLogic?: (
    params: Record<string, any>,
    user: any,
    setUser: (user: any) => void,
    showCreditsToast: (creditsUsed: number, title?: string) => void
  ) => Promise<{ images: string[] }>;
  metadata?:
    | SingleImageMetadata
    | DualImageMetadata
    | AnalyzerMetadata
    | IdentifierMetadata
    | Record<string, any>;
}