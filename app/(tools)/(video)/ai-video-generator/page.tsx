'use client';

import { useState } from 'react';
import { TabsContent } from '@/app/components/ui/tabs';
import { VideoGeneratorHeader } from './components/VideoGeneratorHeader';
import { GenerationModeTabs } from './components/GenerationModeTabs';
import { PromptInput } from './components/PromptInput';
import { SoundEffectsToggle } from './components/SoundEffectsToggle';
import { ImageToVideoContent } from './components/image-to-video/ImageToVideoContent';
import { VideoSettings } from './components/VideoSettings';
import { GenerateButton } from './components/GenerateButton';
import { GenerationGallery } from './components/gallery/GenerationGallery';

/**
 * AI Video Generator Page
 * Main page component that orchestrates all video generation UI elements
 * Uses a two-column layout: Sidebar for controls, Main area for gallery
 */
export default function AiVideoGeneratorPage() {
  // Model selection state
  const [selectedModel, setSelectedModel] = useState('video-2.1-master');

  // Tab state
  const [activeTab, setActiveTab] = useState('text-to-video');

  // Form state
  const [prompt, setPrompt] = useState('');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [duration, setDuration] = useState('5s');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [outputCount, setOutputCount] = useState('1');

  /**
   * Handle video generation
   */
  const handleGenerate = () => {
    console.log('Generating video with:', {
      model: selectedModel,
      mode: activeTab,
      prompt,
      soundEffects: soundEffectsEnabled,
      duration,
      aspectRatio,
      outputCount,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Generation Controls */}
      <div className="w-full lg:w-[480px] shrink-0 border-r border-border bg-sidebar flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Header with model selector */}
          <VideoGeneratorHeader
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Generation mode tabs */}
          <GenerationModeTabs activeTab={activeTab} onTabChange={setActiveTab}>
            {/* Text to Video Tab */}
            <TabsContent value="text-to-video" className="space-y-6 mt-4">
              <PromptInput value={prompt} onChange={setPrompt} />

              <SoundEffectsToggle
                enabled={soundEffectsEnabled}
                onToggle={setSoundEffectsEnabled}
              />

              {soundEffectsEnabled && (
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground flex items-center justify-between">
                    <span>Integrated sound with video generation</span>
                    <button className="text-foreground text-xs font-medium hover:underline flex items-center gap-1">
                      Advanced
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Image to Video Tab */}
            <TabsContent value="image-to-video" className="space-y-6 mt-4">
              <ImageToVideoContent prompt={prompt} onPromptChange={setPrompt} />
            </TabsContent>

            {/* Multi-Elements Tab */}
            <TabsContent value="multi-elements" className="space-y-6 mt-4">
              <div className="p-12 border-2 border-dashed border-border/50 rounded-lg text-center bg-muted/10">
                <p className="text-muted-foreground">
                  Multi-Elements functionality coming soon
                </p>
              </div>
            </TabsContent>
          </GenerationModeTabs>
        </div>

        {/* Sticky Footer for Settings & Generate Button */}
        <div className="p-6 border-t border-border bg-sidebar">
          <VideoSettings
            duration={duration}
            aspectRatio={aspectRatio}
            outputCount={outputCount}
            onDurationChange={setDuration}
            onAspectRatioChange={setAspectRatio}
            onOutputCountChange={setOutputCount}
          />

          <GenerateButton
            onClick={handleGenerate}
            disabled={!prompt.trim()}
          />
        </div>
      </div>

      {/* Right Main Content - Generations Gallery */}
      <div className="flex-1 h-full overflow-hidden bg-black">
        <GenerationGallery />
      </div>
    </div>
  );
}
