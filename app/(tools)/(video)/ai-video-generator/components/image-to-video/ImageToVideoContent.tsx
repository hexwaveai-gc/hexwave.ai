'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ImageUploadArea } from './ImageUploadArea';
import { StartEndFrameInputs } from './StartEndFrameInputs';
import { MotionControl } from './MotionControl';
import { PromptInput } from '../PromptInput';

interface ImageToVideoContentProps {
  prompt: string;
  onPromptChange: (value: string) => void;
}

export function ImageToVideoContent({ prompt, onPromptChange }: ImageToVideoContentProps) {
  return (
    <div className="space-y-6 mt-4">
      {/* Sub-tabs for Frames / Elements */}
      <Tabs defaultValue="frames" className="w-full">
        <TabsList className="bg-transparent p-0 h-auto justify-start gap-4 border-b border-transparent mb-4">
          <TabsTrigger 
            value="frames" 
            className="bg-transparent p-0 pb-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none text-xs font-medium"
          >
            Frames
          </TabsTrigger>
          <TabsTrigger 
            value="elements" 
            className="bg-transparent p-0 pb-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none text-xs font-medium"
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
           <div className="p-8 border border-dashed border-border rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Elements functionality coming soon</p>
           </div>
        </TabsContent>
      </Tabs>

      {/* Prompt Input */}
      <PromptInput value={prompt} onChange={onPromptChange} />

      {/* Motion Control */}
      <MotionControl />
    </div>
  );
}

