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
  videoUrl?: string;
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
    videoUrl: "https://cdn.revid.ai/renders/gjcIDd3JXNbmRF7DcHp7/BkFMpcz2oAQo9MW3JiRB-1744895354187.mp4",
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
    videoUrl: "https://cdn.higgsfield.ai/kling_motion/ecb6fc91-c4df-4133-95da-5e53108a7c6f.mp4",
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
    videoUrl: "https://files2.heygen.ai/avatar/v3/b8c8944769c847f08c7f85d1fb310bf1/full/2.2/preview_video_target.mp4",
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
    videoUrl: "https://cdn.revid.ai/renders/gjcIDd3JXNbmRF7DcHp7/5nD2OXg8d74hb3Avqjxq-1745743754440.mp4",
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
    videoUrl: "https://cdn.revid.ai/static/Campfire%20Memories%20and%20Laughs.mp4",
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
    videoUrl: "https://cdn.revid.ai/static/Guided%20by%20a%20Wolf_s%20Instincts.mp4",
  },
];

export function ToolsShowcase() {
  const [activeTool, setActiveTool] = useState<string>("image");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeToolData = tools.find(t => t.id === activeTool) || tools[0];

  // Handle tool change - reset video state
  const handleToolChange = (toolId: string) => {
    setVideoLoaded(false);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setActiveTool(toolId);
  };

  // Handle video loading and auto-play
  useEffect(() => {
    if (!videoRef.current || !activeToolData.videoUrl) {
      return;
    }
    
    const video = videoRef.current;
    
    // Load the video
    video.load();
    
    // Auto-play function
    const playVideo = async () => {
      try {
        if (video.readyState >= 1) {
          await video.play();
          setVideoLoaded(true);
        }
      } catch (error) {
        console.warn("Video autoplay failed (may require user interaction):", error);
        // Don't set error state for autoplay restrictions
        setVideoLoaded(true);
      }
    };
    
    // Handle video loaded - auto-play when ready
    const handleLoadedData = async () => {
      setVideoLoaded(true);
      await playVideo();
    };
    
    const handleCanPlay = async () => {
      setVideoLoaded(true);
      await playVideo();
    };
    
    const handleLoadedMetadata = async () => {
      setVideoLoaded(true);
      await playVideo();
    };
    
    // Handle video error
    const handleError = () => {
      const error = video.error;
      console.error("Video error:", {
        code: error?.code,
        message: error?.message,
        url: activeToolData.videoUrl,
        readyState: video.readyState
      });
      setVideoError(true);
      setVideoLoaded(false);
    };
    
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    // Try to play immediately if video is already ready
    if (video.readyState >= 1) {
      playVideo();
    }
    
    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [activeTool, activeToolData.videoUrl]);


  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[140px] animate-pulse delay-2000" />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Border gradients */}
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
            Access the world&apos;s most powerful AI models in one unified platform. 
            From images to videos, avatars to audio — we&apos;ve got you covered.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`relative group p-5 rounded-2xl border backdrop-blur-sm transition-all duration-500 text-left overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-br from-white/15 to-white/5 border-white/30 shadow-2xl shadow-[#74FF52]/20 scale-105"
                    : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl hover:shadow-white/10 hover:scale-[1.02]"
                }`}
              >
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} transition-opacity duration-500 ${
                  isActive ? "opacity-15" : "opacity-0 group-hover:opacity-5"
                }`} />
                
                {/* Animated border glow */}
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${tool.gradient} rounded-2xl blur-md transition-opacity duration-500 ${
                  isActive ? "opacity-40" : "opacity-0 group-hover:opacity-20"
                }`} />
                
                {/* Badge */}
                {tool.badge && (
                  <span className={`absolute -top-2 -right-2 px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#74FF52] text-[#0a0a0a] z-10 shadow-lg shadow-[#74FF52]/40 transition-all duration-300 ${
                    isActive ? "scale-110 animate-pulse" : "scale-100"
                  }`}>
                    {tool.badge}
                  </span>
                )}
                
                {/* Icon Container */}
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 transition-all duration-500 ${
                  isActive 
                    ? "scale-110 shadow-xl shadow-white/20 ring-2 ring-white/20" 
                    : "scale-100 group-hover:scale-105 group-hover:shadow-lg"
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-30 rounded-xl blur-sm`} />
                  <Icon className={`relative w-6 h-6 text-white transition-all duration-300 ${
                    isActive ? "drop-shadow-lg scale-110" : "drop-shadow-md"
                  }`} />
                </div>
                
                {/* Title */}
                <h3 className={`text-sm font-bold mb-2 line-clamp-2 transition-all duration-300 ${
                  isActive 
                    ? "text-white" 
                    : "text-white/70 group-hover:text-white"
                }`}>
                  {tool.title.replace("Generator", "").replace("AI ", "").trim()}
                </h3>
                
                {/* Progress indicator */}
                <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} transition-all duration-500 rounded-full ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </div>
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
              className={`group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${activeToolData.gradient} text-white font-semibold hover:shadow-lg hover:shadow-[#74FF52]/20 transition-all duration-300 overflow-hidden`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">Try {activeToolData.title.split(" ")[0]}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
            </Link>
          </div>

          {/* Right: Preview */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/20 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:border-white/30 hover:shadow-[#74FF52]/20">
              {/* Video Preview - Auto-plays by default */}
              {activeToolData.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={activeToolData.videoUrl}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      videoLoaded && !videoError ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  
                  {/* Fallback gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeToolData.gradient} transition-opacity duration-300 ${
                    videoLoaded && !videoError ? "opacity-0" : "opacity-20"
                  }`} />
                  
                  {/* Loading/Icon overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    videoLoaded && !videoError ? "opacity-0 z-0" : "opacity-100 z-20"
                  }`}>
                    <div className="text-center">
                      {videoError ? (
                        <>
                          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${activeToolData.gradient} bg-opacity-30 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20 shadow-xl`}>
                            <activeToolData.icon className="w-10 h-10 text-white/90" />
                          </div>
                          <p className="text-white/50 text-sm font-medium">Video unavailable</p>
                        </>
                      ) : !videoLoaded ? (
                        <>
                          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${activeToolData.gradient} bg-opacity-30 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20 shadow-xl animate-pulse`}>
                            <activeToolData.icon className="w-10 h-10 text-white/90" />
                          </div>
                          <p className="text-white/50 text-sm font-medium">Loading...</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Subtle gradient overlay for better text readability when video is playing */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                    videoLoaded && !videoError ? "opacity-100" : "opacity-0"
                  }`} />
                  
                  {/* Subtle border glow */}
                  <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${activeToolData.gradient} opacity-20 rounded-2xl blur-sm -z-10 transition-opacity duration-300 ${
                    videoLoaded && !videoError ? "opacity-40" : "opacity-20"
                  }`} />
                </>
              ) : (
                <>
                  {/* Fallback gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeToolData.gradient} opacity-20`} />
                  
                  {/* Icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${activeToolData.gradient} bg-opacity-30 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20 shadow-xl`}>
                        <activeToolData.icon className="w-10 h-10 text-white/90" />
                      </div>
                      <p className="text-white/50 text-sm font-medium">Preview Coming Soon</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Decorative glow */}
            <div className={`absolute -inset-4 bg-gradient-to-r ${activeToolData.gradient} opacity-30 blur-3xl -z-10 transition-all duration-500`} />
          </div>
        </div>
      </div>
    </section>
  );
}

