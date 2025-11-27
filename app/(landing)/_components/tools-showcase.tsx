"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ImageIcon, 
  Video, 
  User, 
  Megaphone, 
  Music, 
  Wand2,
  ArrowRight,
  Play,
  Sparkles,
  Zap
} from "lucide-react";

interface Tool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  href: string;
  preview?: string;
  badge?: string;
}

const tools: Tool[] = [
  {
    id: "image",
    icon: ImageIcon,
    title: "AI Image Generator",
    description: "Create stunning images with FLUX, Midjourney, DALL-E, Ideogram, and 20+ leading AI models.",
    features: [
      "40+ AI Models including FLUX Pro, Midjourney, Ideogram V3",
      "Style reference & pose control",
      "4K upscaling & image editing",
      "Batch generation up to 4 images",
    ],
    gradient: "from-purple-500 to-pink-500",
    href: "/image-generator",
    preview: "/tools/image-preview.webp",
    badge: "Most Popular",
  },
  {
    id: "video",
    icon: Video,
    title: "AI Video Generator",
    description: "Transform ideas into captivating videos with Sora, Kling, Runway, Veo 3, and more.",
    features: [
      "Text-to-video & Image-to-video",
      "Multiple aspect ratios (9:16, 16:9, 1:1)",
      "HD & 4K video generation",
      "Video extension & transitions",
    ],
    gradient: "from-blue-500 to-cyan-500",
    href: "/ai-video-generator",
    preview: "/tools/video-preview.webp",
    badge: "New",
  },
  {
    id: "avatar",
    icon: User,
    title: "Talking Photo Generator",
    description: "Bring photos to life with realistic talking avatars powered by HeyGen, Hedra, and Sync Labs.",
    features: [
      "100+ premium avatar templates",
      "Custom voice cloning",
      "Lip-sync in 40+ languages",
      "Photo-to-video animation",
    ],
    gradient: "from-green-500 to-emerald-500",
    href: "/video-agent",
    preview: "/tools/avatar-preview.webp",
  },
  {
    id: "ugc",
    icon: Megaphone,
    title: "UGC Ad Generator",
    description: "Create authentic user-generated content ads that convert with AI-powered scripts and avatars.",
    features: [
      "Script generation from URL or text",
      "Professional UGC templates",
      "A/B testing variations",
      "Direct social media export",
    ],
    gradient: "from-orange-500 to-red-500",
    href: "/tools",
    preview: "/tools/ugc-preview.webp",
  },
  {
    id: "audio",
    icon: Music,
    title: "AI Voice & Audio",
    description: "Generate natural voiceovers with ElevenLabs, create music with Suno and Udio.",
    features: [
      "50+ premium AI voices",
      "Voice cloning & customization",
      "AI music generation",
      "Sound effects library",
    ],
    gradient: "from-violet-500 to-purple-500",
    href: "/audio",
    preview: "/tools/audio-preview.webp",
  },
  {
    id: "editing",
    icon: Wand2,
    title: "AI Editing Suite",
    description: "Powerful editing tools for upscaling, background removal, face swap, and more.",
    features: [
      "4x image upscaling",
      "Background removal",
      "Face swap & enhancement",
      "Inpainting & outpainting",
    ],
    gradient: "from-teal-500 to-cyan-500",
    href: "/tools",
    preview: "/tools/editing-preview.webp",
  },
];

export function ToolsShowcase() {
  const [activeTool, setActiveTool] = useState<string>("image");
  const activeToolData = tools.find(t => t.id === activeTool) || tools[0];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-[#74FF52]" />
            <span className="text-sm text-white/80 font-medium">
              Powerful AI Tools
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Access the world's most powerful AI models in one unified platform. 
            From images to videos, avatars to audio — we've got you covered.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`relative group p-4 rounded-2xl border transition-all duration-300 text-left ${
                  isActive
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/15"
                }`}
              >
                {tool.badge && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#74FF52] text-[#0a0a0a]">
                    {tool.badge}
                  </span>
                )}
                
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} bg-opacity-20 flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                  {tool.title.replace("Generator", "").replace("AI ", "").trim()}
                </h3>
                
                <div className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${tool.gradient} transition-all duration-300 rounded-full ${isActive ? "w-full" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Active Tool Detail */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Info */}
          <div className="order-2 lg:order-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${activeToolData.gradient} bg-opacity-10 border border-white/10 mb-4`}>
              <activeToolData.icon className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                {activeToolData.title}
              </span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {activeToolData.title}
            </h3>
            
            <p className="text-lg text-white/60 mb-6">
              {activeToolData.description}
            </p>

            {/* Features List */}
            <ul className="space-y-3 mb-8">
              {activeToolData.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${activeToolData.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/70">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={activeToolData.href}
              className={`group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${activeToolData.gradient} text-white font-semibold hover:shadow-lg hover:shadow-white/10 transition-all duration-300`}
            >
              Try {activeToolData.title.split(" ")[0]}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: Preview */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              {/* Placeholder Preview */}
              <div className={`absolute inset-0 bg-gradient-to-br ${activeToolData.gradient} opacity-10`} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${activeToolData.gradient} bg-opacity-20 flex items-center justify-center mb-4`}>
                    <activeToolData.icon className="w-10 h-10 text-white/80" />
                  </div>
                  <p className="text-white/40 text-sm">Preview Coming Soon</p>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${activeToolData.gradient} flex items-center justify-center shadow-lg`}>
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className={`absolute -inset-4 bg-gradient-to-r ${activeToolData.gradient} opacity-20 blur-3xl -z-10`} />
          </div>
        </div>
      </div>
    </section>
  );
}

