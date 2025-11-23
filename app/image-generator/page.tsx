"use client";

import { useState } from "react";
import { ImageIcon, RefreshCw, Palette } from "lucide-react";
import GeneratorLayout from "../components/shared/GeneratorLayout";
import GeneratorTabs from "../components/shared/GeneratorTabs";
import ResultsPanel from "../components/shared/ResultsPanel";
import TextToImageInputs from "./components/TextToImageInputs";
import ImageReferenceInputs from "./components/ImageReferenceInputs";
import RestyleInputs from "./components/RestyleInputs";

/**
 * Main Image Generator page using the standardized two-column layout
 */
export default function ImageGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

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
    <GeneratorLayout
      inputPanel={
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f9fbfc]">
              AI Image Generator
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#6c727a]">
              Create stunning images with AI-powered generation
            </p>
          </div>
          <GeneratorTabs tabs={tabs} defaultTab="text-to-image" />
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
                className="group relative overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-[#242629] dark:bg-[#111214]"
              >
                <img
                  src={imageUrl}
                  alt={`Generated ${index + 1}`}
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-[18px] bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-transform hover:scale-105 dark:bg-[#111214] dark:text-[#f9fbfc]">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ResultsPanel>
      }
    />
  );
}
