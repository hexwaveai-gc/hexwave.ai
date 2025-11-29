"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ImageIcon, 
  Video, 
  User, 
  Megaphone, 
  Music, 
  Wand2,
  ArrowRight,
  Zap,
  Check
} from "lucide-react";

interface Tool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  shortTitle: string;
  description: string;
  features: string[];
  iconColor: string;
  iconBg: string;
  href: string;
  preview?: string;
  videoUrl?: string;
  badge?: string;
}

const tools: Tool[] = [
  {
    id: "image",
    icon: ImageIcon,
    title: "AI Image Generator",
    shortTitle: "Image",
    description: "Create stunning images with FLUX, Midjourney, DALL-E, Ideogram, and 20+ leading AI models.",
    features: [
      "40+ AI Models including FLUX Pro, Midjourney, Ideogram V3",
      "Style reference & pose control",
      "4K upscaling & image editing",
      "Batch generation up to 4 images",
    ],
    iconColor: "text-[#74FF52]",
    iconBg: "bg-[#74FF52]/10 border border-[#74FF52]/20",
    href: "/image-generator",
    preview: "/tools/image-preview.webp",
    videoUrl: "https://cdn.revid.ai/renders/gjcIDd3JXNbmRF7DcHp7/BkFMpcz2oAQo9MW3JiRB-1744895354187.mp4",
  },
  {
    id: "video",
    icon: Video,
    title: "AI Video Generator",
    shortTitle: "Video",
    description: "Transform ideas into captivating videos with Sora, Kling, Runway, Veo 3, and more.",
    features: [
      "Text-to-video & Image-to-video",
      "Multiple aspect ratios (9:16, 16:9, 1:1)",
      "HD & 4K video generation",
      "Video extension & transitions",
    ],
    iconColor: "text-[#74FF52]",
    iconBg: "bg-[#74FF52]/10 border border-[#74FF52]/20",
    href: "/ai-video-generator",
    preview: "/tools/video-preview.webp",
    videoUrl: "https://cdn.higgsfield.ai/kling_motion/ecb6fc91-c4df-4133-95da-5e53108a7c6f.mp4",
    badge: "Popular",
  },
  {
    id: "avatar",
    icon: User,
    title: "Talking Photo",
    shortTitle: "Talking Photo",
    description: "Bring photos to life with realistic talking avatars powered by HeyGen, Hedra, and Sync Labs.",
    features: [
      "100+ premium avatar templates",
      "Custom voice cloning",
      "Lip-sync in 40+ languages",
      "Photo-to-video animation",
    ],
    iconColor: "text-[#74FF52]",
    iconBg: "bg-[#74FF52]/10 border border-[#74FF52]/20",
    href: "/video-agent",
    preview: "/tools/avatar-preview.webp",
    videoUrl: "https://files2.heygen.ai/avatar/v3/b8c8944769c847f08c7f85d1fb310bf1/full/2.2/preview_video_target.mp4",
  },
  {
    id: "ugc",
    icon: Megaphone,
    title: "UGC Ad Generator",
    shortTitle: "UGC Ad",
    description: "Create authentic user-generated content ads that convert with AI-powered scripts and avatars.",
    features: [
      "Script generation from URL or text",
      "Professional UGC templates",
      "A/B testing variations",
      "Direct social media export",
    ],
    iconColor: "text-[#74FF52]",
    iconBg: "bg-[#74FF52]/10 border border-[#74FF52]/20",
    href: "/tools",
    preview: "/tools/ugc-preview.webp",
    videoUrl: "https://cdn.revid.ai/renders/gjcIDd3JXNbmRF7DcHp7/5nD2OXg8d74hb3Avqjxq-1745743754440.mp4",
    badge: "New",
  },
  {
    id: "audio",
    icon: Music,
    title: "Voice & Audio",
    shortTitle: "Voice & Audio",
    description: "Generate natural voiceovers with ElevenLabs, create music with Suno and Udio.",
    features: [
      "50+ premium AI voices",
      "Voice cloning & customization",
      "AI music generation",
      "Sound effects library",
    ],
    iconColor: "text-[#74FF52]",
    iconBg: "bg-[#74FF52]/10 border border-[#74FF52]/20",
    href: "/audio",
    preview: "/tools/audio-preview.webp",
    videoUrl: "https://cdn.revid.ai/static/Campfire%20Memories%20and%20Laughs.mp4",
  },
  {
    id: "editing",
    icon: Wand2,
    title: "Editing Suite",
    shortTitle: "Editing Suite",
    description: "Powerful editing tools for upscaling, background removal, face swap, and more.",
    features: [
      "4x image upscaling",
      "Background removal",
      "Face swap & enhancement",
      "Inpainting & outpainting",
    ],
    iconColor: "text-[#74FF52]",
    iconBg: "bg-[#74FF52]/10 border border-[#74FF52]/20",
    href: "/tools",
    preview: "/tools/editing-preview.webp",
    videoUrl: "https://cdn.revid.ai/static/Guided%20by%20a%20Wolf_s%20Instincts.mp4",
  },
];

export function ToolsShowcase() {
  const [activeTool, setActiveTool] = useState<string>("image");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeToolData = tools.find(t => t.id === activeTool) || tools[0];

  const handleToolChange = (toolId: string) => {
    setVideoLoaded(false);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setActiveTool(toolId);
  };

  useEffect(() => {
    if (!videoRef.current || !activeToolData.videoUrl) {
      return;
    }
    
    const video = videoRef.current;
    video.load();
    
    const playVideo = async () => {
      try {
        if (video.readyState >= 1) {
          await video.play();
          setVideoLoaded(true);
        }
      } catch (error) {
        console.warn("Video autoplay failed:", error);
        setVideoLoaded(true);
      }
    };
    
    const handleLoadedData = async () => {
      setVideoLoaded(true);
      await playVideo();
    };
    
    const handleCanPlay = async () => {
      setVideoLoaded(true);
      await playVideo();
    };
    
    const handleError = () => {
      setVideoError(true);
      setVideoLoaded(false);
    };
    
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    if (video.readyState >= 1) {
      playVideo();
    }
    
    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [activeTool, activeToolData.videoUrl]);

  return (
    <section className="min-h-screen py-12 lg:py-16 px-4 relative overflow-hidden bg-[#0a0a0a] flex flex-col justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#74FF52]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#74FF52]/3 rounded-full blur-[120px]" />
        
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative w-full">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <Zap className="w-3.5 h-3.5 text-[#74FF52]" />
            <span className="text-xs text-white/80 font-medium">
              Powerful AI Tools
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          
          <p className="text-base text-white/60 max-w-xl mx-auto">
            Access the world&apos;s most powerful AI models in one unified platform. 
            From images to videos, avatars to audio — we&apos;ve got you covered.
          </p>
        </div>

        {/* Tool Cards Grid - Compact, minimal design */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-8 lg:mb-10">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`relative group flex flex-col items-center p-3 md:p-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 border-[#74FF52]/50 shadow-lg shadow-[#74FF52]/10"
                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                }`}
              >
                {/* Badge - positioned cleanly */}
                {tool.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-bold rounded-full whitespace-nowrap z-10 bg-[#74FF52] text-[#0a0a0a]">
                    {tool.badge}
                  </span>
                )}
                
                {/* Icon */}
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-lg ${tool.iconBg} flex items-center justify-center mb-2 transition-all duration-300 ${
                  isActive ? "scale-105 bg-[#74FF52]/20" : "group-hover:scale-105 group-hover:bg-[#74FF52]/15"
                }`}>
                  <Icon className={`w-5 h-5 md:w-5.5 md:h-5.5 ${tool.iconColor}`} />
                </div>
                
                {/* Title */}
                <span className={`text-[10px] md:text-xs font-medium text-center transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/70 group-hover:text-white"
                }`}>
                  {tool.shortTitle}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#74FF52] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tool Detail */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left: Info */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#74FF52]/10 border border-[#74FF52]/20 mb-4">
              <activeToolData.icon className="w-3.5 h-3.5 text-[#74FF52]" />
              <span className="text-xs font-medium text-[#74FF52]">
                {activeToolData.shortTitle}
              </span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {activeToolData.title}
            </h3>
            
            <p className="text-sm text-white/60 mb-5">
              {activeToolData.description}
            </p>

            {/* Features List */}
            <ul className="space-y-2.5 mb-5">
              {activeToolData.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#74FF52]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-[#74FF52]" />
                  </div>
                  <span className="text-sm text-white/70">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={activeToolData.href}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#74FF52] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9fff75] transition-all duration-300"
            >
              <span>Try {activeToolData.shortTitle}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: Preview */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
              {/* Video Preview */}
              {activeToolData.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={activeToolData.videoUrl}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      videoLoaded && !videoError ? "opacity-100" : "opacity-0"
                    }`}
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  
                  {/* Loading state */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-gradient-to-br from-white/5 to-white/[0.02] ${
                    videoLoaded && !videoError ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}>
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-xl bg-[#74FF52]/10 border border-[#74FF52]/20 flex items-center justify-center mb-3 ${
                        !videoError ? "animate-pulse" : ""
                      }`}>
                        <activeToolData.icon className="w-6 h-6 text-[#74FF52]" />
                      </div>
                      <p className="text-white/40 text-xs">
                        {videoError ? "Preview unavailable" : "Loading preview..."}
                      </p>
                    </div>
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${
                    videoLoaded && !videoError ? "opacity-100" : "opacity-0"
                  }`} />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#74FF52]/10 border border-[#74FF52]/20 flex items-center justify-center mb-3">
                      <activeToolData.icon className="w-6 h-6 text-[#74FF52]" />
                    </div>
                    <p className="text-white/40 text-xs">Preview coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-6 bg-[#74FF52]/10 blur-3xl -z-10 opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
}
