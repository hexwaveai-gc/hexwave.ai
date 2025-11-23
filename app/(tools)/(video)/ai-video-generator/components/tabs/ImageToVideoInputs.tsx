"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ImageUploadArea } from "../image-to-video/ImageUploadArea";
import { StartEndFrameInputs } from "../image-to-video/StartEndFrameInputs";
import { MotionControl } from "../image-to-video/MotionControl";
import PromptInput from "@/app/components/shared/PromptInput";

interface ImageToVideoInputsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  supportsMotionControl?: boolean;
}

/**
 * Image to Video tab content
 * Refactored from ImageToVideoContent to use shared PromptInput
 * 
 * Reasoning: Uses shared components while maintaining video-specific features
 * Supports frames/elements sub-tabs and motion control
 */
export function ImageToVideoInputs({
  prompt,
  onPromptChange,
  supportsMotionControl = true,
}: ImageToVideoInputsProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-page-padding)] py-[var(--spacing-element-gap)]">
        <div className="space-y-6">
          {/* Sub-tabs for Frames / Elements */}
          <Tabs defaultValue="frames" className="w-full">
            <TabsList className="h-auto justify-start gap-4 border-b border-transparent bg-transparent p-0 mb-4">
              <TabsTrigger
                value="frames"
                className="rounded-none border-b-2 border-transparent bg-transparent p-0 pb-1 text-xs font-medium text-gray-500 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-[var(--color-text-3)] dark:data-[state=active]:border-[var(--color-text-1)] dark:data-[state=active]:text-[var(--color-text-1)]"
              >
                Frames
              </TabsTrigger>
              <TabsTrigger
                value="elements"
                className="rounded-none border-b-2 border-transparent bg-transparent p-0 pb-1 text-xs font-medium text-gray-500 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-[var(--color-text-3)] dark:data-[state=active]:border-[var(--color-text-1)] dark:data-[state=active]:text-[var(--color-text-1)]"
              >
                Elements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="frames" className="mt-0 space-y-4">
              <div className="space-y-4">
                <ImageUploadArea />
                <StartEndFrameInputs />
              </div>
            </TabsContent>

            <TabsContent value="elements" className="mt-0">
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center dark:border-[var(--color-border-container)]">
                <p className="text-sm text-gray-500 dark:text-[var(--color-text-3)]">
                  Elements functionality coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Prompt Input */}
          <PromptInput
            value={prompt}
            onChange={onPromptChange}
            placeholder="Describe the motion or changes you want in the video..."
            required={false}
            minHeight="120px"
          />

          {/* Motion Control */}
          {supportsMotionControl && <MotionControl />}
        </div>
      </div>
    </div>
  );
}

