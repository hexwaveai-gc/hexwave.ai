"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Download, Check } from "lucide-react";

const models = [
  { name: "FLUX Pro", logo: "/models/flux.svg", active: true },
  { name: "Midjourney", logo: "/image-logos/midjourney.webp", active: false },
  { name: "Sora", logo: "/models/sora-2.webp", active: false },
  { name: "Kling 2.0", logo: "/models/kling.svg", active: false },
  { name: "DALL-E 3", logo: "/image-logos/dalle.webp", active: false },
  { name: "Runway", logo: "/models/runway.webp", active: false },
];

// Actual generated image variations
const imageVariations = [
  { id: 1, src: "/variation/v1.png", label: "V1" },
  { id: 2, src: "/variation/v2.png", label: "V2" },
  { id: 3, src: "/variation/v3.png", label: "V3" },
  { id: 4, src: "/variation/v4.png", label: "V4" },
];

// Multiple prompts to cycle through
const prompts = [
  {
    text: "A cinematic shot of a futuristic city at sunset",
    highlight: ["futuristic", "city"],
  },
  {
    text: "Create a viral UGC ad for my skincare brand",
    highlight: ["viral", "UGC"],
  },
  {
    text: "A dreamy portrait with soft bokeh lighting",
    highlight: ["dreamy", "portrait"],
  },
  {
    text: "Generate a product video with smooth transitions",
    highlight: ["product", "video"],
  },
];

// Looping typewriter component
function LoopingTypewriter() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentPrompt = prompts[currentPromptIndex];
  const typingSpeed = 40; // ms per character
  const pauseDuration = 2000; // pause after typing complete
  const deletingSpeed = 20; // faster delete

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentPrompt.text.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPrompt.text.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Typing complete, pause then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Deleting complete, move to next prompt
        setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentPrompt.text]);

  // Render text with highlights
  const renderText = () => {
    const words = displayText.split(" ");
    return words.map((word, index) => {
      const isHighlighted = currentPrompt.highlight.some(
        (h) => word.toLowerCase().includes(h.toLowerCase())
      );
      return (
        <span key={index}>
          <span className={isHighlighted ? "text-[#74FF52]" : "text-white/90"}>
            {word}
          </span>
          {index < words.length - 1 && " "}
        </span>
      );
    });
  };

  return (
    <div className="text-sm font-mono text-white/90 min-h-[24px]">
      {renderText()}
      <span className="inline-block w-0.5 h-4 bg-[#74FF52] ml-0.5 animate-pulse" />
    </div>
  );
}

export function HowItWorks() {
  const [selectedVariation, setSelectedVariation] = useState(1);

  return (
    <section className="py-16 lg:py-20 px-4 relative overflow-hidden bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-14">
          <p className="text-sm text-white/50 font-medium mb-3">
            Never been easier
          </p>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Create{" "}
            <span className="text-[#74FF52]">stunning content</span>
            {" "}in minutes
          </h2>
          
          <p className="text-base text-white/50 max-w-lg mx-auto">
            From idea to finished product in minutes — ready to use instantly.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          
          {/* Step 1 - Text */}
          <div className="p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#74FF52]" />
              <span className="text-xs text-white/40 font-medium">Step 1</span>
            </div>
            
            <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
              Write or generate your prompt
            </h3>
            
            <p className="text-sm lg:text-base text-white/50 leading-relaxed">
              Enter a creative prompt or let AI generate one for you. Describe your vision, style, and desired output in natural language.
            </p>
          </div>

          {/* Step 1 - Visual: Prompt Input Mockup */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden p-6 lg:p-8">
            {/* Fake Input Field */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/30">Your prompt</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#74FF52]/10 border border-[#74FF52]/20">
                  <Sparkles className="w-3 h-3 text-[#74FF52]" />
                  <span className="text-[10px] text-[#74FF52] font-medium">AI Assist</span>
                </div>
              </div>
              <div className="min-h-[40px] flex items-center">
                <LoopingTypewriter />
              </div>
            </div>
            
            {/* Style Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["Cinematic", "4K", "Detailed", "Atmospheric"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Step 2 - Visual: Model Grid */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden p-6 lg:p-8 md:order-2">
            {/* Model Cards Grid */}
            <div className="grid grid-cols-3 gap-2">
              {models.map((model) => (
                <div 
                  key={model.name}
                  className={`relative p-3 rounded-xl text-center transition-all ${
                    model.active 
                      ? "bg-[#74FF52]/10 border-2 border-[#74FF52]/50" 
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {model.active && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#74FF52] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#0a0a0a]" />
                    </div>
                  )}
                  <div className="w-8 h-8 mx-auto rounded-lg mb-2 relative overflow-hidden bg-white/10 flex items-center justify-center">
                    <Image
                      src={model.logo}
                      alt={model.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${
                    model.active ? "text-[#74FF52]" : "text-white/50"
                  }`}>
                    {model.name}
                  </span>
                </div>
              ))}
                    </div>

            {/* Selection indicator */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-white/40">40+ models available</span>
              <span className="text-[#74FF52]">FLUX Pro selected</span>
            </div>
          </div>

          {/* Step 2 - Text */}
          <div className="p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.02] md:order-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#74FF52]" />
              <span className="text-xs text-white/40 font-medium">Step 2</span>
                    </div>

            <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
              Choose from 40+ AI models
                    </h3>
                    
            <p className="text-sm lg:text-base text-white/50 leading-relaxed">
              Select the perfect AI model for your project — from FLUX Pro and Midjourney for images to Sora and Kling for videos.
            </p>
          </div>

          {/* Step 3 - Text */}
          <div className="p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#74FF52]" />
              <span className="text-xs text-white/40 font-medium">Step 3</span>
            </div>
            
            <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
              Generate & export
            </h3>
            
            <p className="text-sm lg:text-base text-white/50 leading-relaxed">
              Create high-quality content in seconds. Edit, upscale to 4K, and export in any format — ready to use instantly.
            </p>
          </div>

          {/* Step 3 - Visual: Generation Complete */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden p-6 lg:p-8">
            {/* Success State */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#74FF52]/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#74FF52]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Generation complete</p>
                <p className="text-xs text-white/40">4 variations • 12 seconds</p>
              </div>
                  </div>

            {/* Result Preview Grid - Image Variations */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {imageVariations.map((variation) => (
                <div 
                  key={variation.id}
                  onClick={() => setSelectedVariation(variation.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all cursor-pointer group ${
                    selectedVariation === variation.id 
                      ? "ring-2 ring-[#74FF52] ring-offset-2 ring-offset-[#0a0a0a] scale-[1.02]" 
                      : "hover:ring-1 hover:ring-white/30 hover:scale-[1.01]"
                  }`}
                >
                  {/* Actual generated image */}
                  <Image
                    src={variation.src}
                    alt={`Generated variation ${variation.label}`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Variation label */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                    <span className="text-[8px] font-medium text-white/80">{variation.label}</span>
                  </div>
                  
                  {/* Selected checkmark */}
                  {selectedVariation === variation.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#74FF52] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#0a0a0a]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Export Options */}
            <div className="flex items-center gap-2">
              <button className="flex-1 py-2 rounded-lg bg-[#74FF52] text-[#0a0a0a] text-xs font-semibold flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Export 4K
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                Edit
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
