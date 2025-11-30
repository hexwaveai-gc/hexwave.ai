"use client";

import { ImageIcon, RefreshCw, Palette, Maximize2, Download, X } from "lucide-react";
import Sidebar from "@/app/components/common/sidebar";
import GeneratorLayout from "@/app/components/shared/GeneratorLayout";
import GeneratorTabs from "@/app/components/shared/GeneratorTabs";
import ResultsPanel from "@/app/components/shared/ResultsPanel";
import TextToImageInputs from "./components/TextToImageInputs";
import ImageReferenceInputs from "./components/ImageReferenceInputs";
import RestyleInputs from "./components/RestyleInputs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { useImageGenerationStore } from "./store/useImageGenerationStore";

/**
 * Main Image Generator page with sidebar layout similar to explore page
 * Features resizable two-column layout for inputs and results
 * 
 * Refactored to use Zustand store for state management - eliminates prop drilling
 */
export default function ImageGeneratorPage() {
  // Get state from Zustand store
  const isGenerating = useImageGenerationStore((s) => s.isGenerating);
  const generatedImages = useImageGenerationStore((s) => s.generatedImages);
  const maximizedImage = useImageGenerationStore((s) => s.maximizedImage);
  const setMaximizedImage = useImageGenerationStore((s) => s.setMaximizedImage);
  const activeTab = useImageGenerationStore((s) => s.activeTab);
  const setActiveTab = useImageGenerationStore((s) => s.setActiveTab);

  const tabs = [
    {
      id: "text-to-image",
      label: "Text to Image",
      icon: <ImageIcon className="h-4 w-4" />,
      content: <TextToImageInputs />,
    },
    {
      id: "image-reference",
      label: "Image Reference",
      icon: <RefreshCw className="h-4 w-4" />,
      content: <ImageReferenceInputs />,
    },
    {
      id: "restyle",
      label: "Restyle",
      icon: <Palette className="h-4 w-4" />,
      content: <RestyleInputs />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar - Same as explore page */}
      <Sidebar />

      {/* Main Content Area - ml-0 on mobile, ml-20 on desktop */}
      <main className="flex-1 ml-0 md:ml-20 h-screen overflow-hidden bg-[#0a0a0a] pb-16 md:pb-0">
        <GeneratorLayout
          inputPanel={
            <div className="flex h-full flex-col">
              {/* Header - compact on mobile */}
              <div className="border-b border-[var(--color-border-container)] px-3 md:px-[var(--spacing-page-padding)] pt-3 md:pt-[var(--spacing-page-padding)] pb-2 md:pb-[var(--spacing-header-bottom)]">
                <h1 className="text-lg md:text-2xl font-bold text-[var(--color-text-1)]">
                  AI Image Generator
                </h1>
              </div>
              <div className="flex-1 overflow-hidden">
                <GeneratorTabs
                  tabs={tabs}
                  defaultTab="text-to-image"
                  value={activeTab}
                  onTabChange={(tabId) => {
                    if (
                      tabId === "text-to-image" ||
                      tabId === "image-reference" ||
                      tabId === "restyle"
                    ) {
                      setActiveTab(tabId);
                    }
                  }}
                />
              </div>
            </div>
          }
          resultsPanel={
            <ResultsPanel
              isLoading={isGenerating}
              isEmpty={generatedImages.length === 0}
              loadingMessage="Creating your masterpiece..."
              emptyMessage="Configure your settings and generate to see results here"
            >
              {/* Responsive grid: 1 col on mobile, 2 cols on tablet+ */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg border border-[var(--color-border-container)] bg-[var(--color-bg-primary)] shadow-sm transition-all hover:shadow-lg cursor-pointer"
                  >
                    <img
                      src={imageUrl}
                      alt={`Generated ${index + 1}`}
                      className="h-auto w-full object-cover"
                    />
                    {/* Overlay - always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
                      {/* Maximize Icon - Center */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMaximizedImage(imageUrl);
                        }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-bg-primary)] p-2.5 md:p-3 text-[var(--color-text-1)] transition-transform hover:scale-110 active:scale-95 shadow-lg"
                        aria-label="Maximize image"
                      >
                        <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                      
                      {/* Download Icon - Bottom Right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download functionality
                          const link = document.createElement("a");
                          link.href = imageUrl;
                          link.download = `generated-image-${index + 1}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="absolute bottom-2 right-2 md:bottom-3 md:right-3 rounded-lg bg-[var(--color-bg-primary)] p-2.5 md:p-3 text-[var(--color-text-1)] transition-transform hover:scale-110 active:scale-95 shadow-lg"
                        aria-label="Download image"
                      >
                        <Download className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Maximized Image Dialog */}
              <Dialog open={!!maximizedImage} onOpenChange={(open) => !open && setMaximizedImage(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-[var(--color-bg-page)] border-[var(--color-border-container)] [&>button]:hidden">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Maximized Image</DialogTitle>
                  </DialogHeader>
                  {maximizedImage && (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <button
                        onClick={() => setMaximizedImage(null)}
                        className="absolute top-4 right-4 z-10 rounded-full bg-[var(--color-bg-primary)] p-2 text-[var(--color-text-1)] hover:bg-[var(--color-bg-secondary)] transition-colors shadow-lg"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <img
                        src={maximizedImage}
                        alt="Maximized"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                      />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </ResultsPanel>
          }
        />
      </main>
    </div>
  );
}
