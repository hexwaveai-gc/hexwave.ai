"use client";

import { useState } from "react";
import { ImageIcon, RefreshCw, Palette, Maximize2, Download, X } from "lucide-react";
import Sidebar from "@/app/components/common/Sidebar";
import GeneratorLayout from "../components/shared/GeneratorLayout";
import GeneratorTabs from "../components/shared/GeneratorTabs";
import ResultsPanel from "../components/shared/ResultsPanel";
import TextToImageInputs from "./components/TextToImageInputs";
import ImageReferenceInputs from "./components/ImageReferenceInputs";
import RestyleInputs from "./components/RestyleInputs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

/**
 * Main Image Generator page with sidebar layout similar to explore page
 * Features resizable two-column layout for inputs and results
 */
export default function ImageGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [maximizedImage, setMaximizedImage] = useState<string | null>(null);

  const handleGenerate = async (params: any) => {
    console.log("Generate with params:", params);
    setIsGenerating(true);

    // Simulate generation
    setTimeout(() => {
      setGeneratedImages([
        "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800",
        "https://images.unsplash.com/photo-1707344088547-3cf7cea5ca49?w=800",
      ]);
      setIsGenerating(false);
    }, 3000);
  };

  const tabs = [
    {
      id: "text-to-image",
      label: "Text to Image",
      icon: <ImageIcon className="h-4 w-4" />,
      content: <TextToImageInputs onGenerate={handleGenerate} />,
    },
    {
      id: "image-reference",
      label: "Image Reference",
      icon: <RefreshCw className="h-4 w-4" />,
      content: <ImageReferenceInputs onGenerate={handleGenerate} />,
    },
    {
      id: "restyle",
      label: "Restyle",
      icon: <Palette className="h-4 w-4" />,
      content: <RestyleInputs onGenerate={handleGenerate} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar - Same as explore page */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-20 h-screen overflow-hidden bg-[#0a0a0a]">
        <GeneratorLayout
          inputPanel={
            <div className="flex h-full flex-col">
              <div className="border-b border-[var(--color-border-container)] px-[var(--spacing-page-padding)] pt-[var(--spacing-page-padding)] pb-[var(--spacing-header-bottom)]">
                <h1 className="text-2xl font-bold text-[var(--color-text-1)]">
                  AI Image Generator
                </h1>
              </div>
              <div className="flex-1 overflow-hidden">
                <GeneratorTabs tabs={tabs} defaultTab="text-to-image" />
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* Maximize Icon - Center */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMaximizedImage(imageUrl);
                        }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-bg-primary)] p-3 text-[var(--color-text-1)] transition-transform hover:scale-110 shadow-lg"
                        aria-label="Maximize image"
                      >
                        <Maximize2 className="h-5 w-5" />
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
                        className="absolute bottom-3 right-3 rounded-lg bg-[var(--color-bg-primary)] p-3 text-[var(--color-text-1)] transition-transform hover:scale-110 shadow-lg"
                        aria-label="Download image"
                      >
                        <Download className="h-5 w-5" />
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
