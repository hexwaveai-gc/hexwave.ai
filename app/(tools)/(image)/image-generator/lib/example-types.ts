/**
 * Standardized Example Types and Schemas
 * Defines all possible example formats for tools
 */

export interface BaseExample {
    id: string | number;
    title?: string;
    description?: string;
  }
  
  /**
   * Before/After Slider Example
   * Used for: Style transfer, colorization, upscaling, sketch-to-image
   */
  export interface BeforeAfterExample extends BaseExample {
    type: "before-after";
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    metadata?: {
      prompt?: string;
      controlStrength?: number;
      model?: string;
      settings?: Record<string, any>;
    };
    sliderOptions?: {
      width?: number;
      height?: number;
    };
  }
  
  /**
   * Multi-Image Comparison Example
   * Used for: Face swap, dual input tools, transformation tools
   */
  export interface MultiImageExample extends BaseExample {
    type: "multi-image";
    images: Array<{
      url: string;
      label: string;
      role: "input" | "target" | "result" | "reference";
    }>;
    layout?: "horizontal" | "grid";
    aspectRatio?: string;
  }
  
  /**
   * Character Variations Example
   * Used for: Consistent character generator, variations tools
   */
  export interface VariationsExample extends BaseExample {
    type: "variations";
    originalImage: string;
    originalLabel?: string;
    variations: Array<{
      url: string;
      label?: string;
    }>;
    gridColumns?: number;
  }
  
  /**
   * Simple Grid Example
   * Used for: Basic before/after comparisons
   */
  export interface GridExample extends BaseExample {
    type: "grid";
    items: Array<{
      beforeImage?: string;
      afterImage?: string;
      inputImage?: string;
      outputImage?: string;
      resultImage?: string;
      garmentImage?: string;
      label?: string;
      metadata?: Record<string, any>;
    }>;
    columns?: number;
    showLabels?: boolean;
  }
  
  /**
   * Video Tutorial Example
   * Used for: YouTube tutorials, demo videos
   */
  export interface VideoExample extends BaseExample {
    type: "video";
    videoId: string; // YouTube URL or video file URL
    thumbnail?: string;
    duration?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
  }
  
  /**
   * Promotional Video Example
   * Used for: Autoplay promotional content
   */
  export interface PromoVideoExample extends BaseExample {
    type: "promo-video";
    videoUrl: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
  }
  
  /**
   * Custom Example
   * Used for: Special cases that don't fit standard types
   */
  export interface CustomExample extends BaseExample {
    type: "custom";
    component: string; // Component name to render
    props?: Record<string, any>;
  }
  
  /**
   * Union type of all example types
   */
  export type ToolExample =
    | BeforeAfterExample
    | MultiImageExample
    | VariationsExample
    | GridExample
    | VideoExample
    | PromoVideoExample
    | CustomExample;
  
  /**
   * Examples configuration for tools
   */
  export interface ExamplesConfig {
    title?: string;
    description?: string;
    examples: ToolExample[];
    layout?: "single-column" | "two-column";
    spacing?: "compact" | "normal" | "spacious";
  }
  
  /**
   * Type guards for example types
   */
  export const isBeforeAfterExample = (
    example: ToolExample
  ): example is BeforeAfterExample => example.type === "before-after";
  
  export const isMultiImageExample = (
    example: ToolExample
  ): example is MultiImageExample => example.type === "multi-image";
  
  export const isVariationsExample = (
    example: ToolExample
  ): example is VariationsExample => example.type === "variations";
  
  export const isGridExample = (example: ToolExample): example is GridExample =>
    example.type === "grid";
  
  export const isVideoExample = (example: ToolExample): example is VideoExample =>
    example.type === "video";
  
  export const isPromoVideoExample = (
    example: ToolExample
  ): example is PromoVideoExample => example.type === "promo-video";
  
  export const isCustomExample = (
    example: ToolExample
  ): example is CustomExample => example.type === "custom";