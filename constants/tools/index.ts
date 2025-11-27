/**
 * Tools Page Constants
 * 
 * Data and configuration for the AI tools catalog page.
 */

export type ToolCategory = "all" | "video" | "image" | "audio";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  image: string;
  badge?: {
    text: string;
    variant: "new" | "popular" | "beta" | "coming-soon";
  };
  isComingSoon?: boolean;
  gradient?: string;
}

export interface ToolFilterTab {
  id: ToolCategory;
  label: string;
  icon?: string;
}

// Filter tabs configuration
export const TOOL_FILTER_TABS: ToolFilterTab[] = [
  { id: "all", label: "All" },
  { id: "video", label: "AI Videos" },
  { id: "image", label: "AI Images" },
  { id: "audio", label: "AI Audio" },
];

// Tools catalog data with Kling AI style preview images
export const TOOLS_DATA: Tool[] = [
  // Image Generation Tools
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Stunning Images from Text or Image Inputs",
    category: "image",
    href: "/image-generator",
    image: "https://p2-kling.klingai.com/kcdn/cdn-kcdn112452/kling-website/all-tools/ai-images-thumb.jpg",
    badge: { text: "Popular", variant: "popular" },
    gradient: "from-purple-500/40 to-pink-500/40",
  },
  {
    id: "flux-pro",
    name: "Flux Pro",
    description: "Ultra-realistic image generation with Flux AI",
    category: "image",
    href: "/image-generator?model=flux-pro",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop",
    badge: { text: "New", variant: "new" },
    gradient: "from-blue-500/40 to-cyan-500/40",
  },
  {
    id: "ideogram",
    name: "Ideogram V3",
    description: "Beautiful typography and creative text in images",
    category: "image",
    href: "/image-generator?model=ideogram-v3",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
    gradient: "from-orange-500/40 to-red-500/40",
  },
  {
    id: "midjourney",
    name: "Midjourney Style",
    description: "Artistic and stylized image generation",
    category: "image",
    href: "/image-generator?model=midjourney",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop",
    gradient: "from-indigo-500/40 to-purple-500/40",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion 3.5",
    description: "Open-source image generation powerhouse",
    category: "image",
    href: "/image-generator?model=stable-diffusion-3-5",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
    gradient: "from-green-500/40 to-emerald-500/40",
  },
  {
    id: "dall-e",
    name: "DALL-E 3",
    description: "OpenAI's advanced image generation model",
    category: "image",
    href: "/image-generator?model=dall-e-3",
    image: "https://images.unsplash.com/photo-1686191128892-3b37add4683d?w=800&h=600&fit=crop",
    gradient: "from-teal-500/40 to-cyan-500/40",
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    description: "Professional-grade AI image generation",
    category: "image",
    href: "/image-generator?model=leonardo-phoenix",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop",
    gradient: "from-amber-500/40 to-orange-500/40",
  },
  {
    id: "recraft",
    name: "Recraft V3",
    description: "Vector and design-focused image generation",
    category: "image",
    href: "/image-generator?model=recraft-v3",
    image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=600&fit=crop",
    gradient: "from-rose-500/40 to-pink-500/40",
  },
  // Video Generation Tools
  {
    id: "video-generation",
    name: "Video Generation",
    description: "Dynamic Videos from Text or Image Inputs",
    category: "video",
    href: "/ai-video-generator",
    image: "https://p2-kling.klingai.com/kcdn/cdn-kcdn112452/kling-website/all-tools/ai-videos-thumb.jpg",
    badge: { text: "New", variant: "new" },
    gradient: "from-rose-500/40 to-orange-500/40",
  },
  {
    id: "image-to-video",
    name: "Image to Video",
    description: "Transform still images into dynamic videos",
    category: "video",
    href: "/ai-video-generator?mode=image-to-video",
    image: "https://p2-kling.klingai.com/kcdn/cdn-kcdn112452/kling-website/all-tools/ai-image-video-thumb.jpg",
    badge: { text: "Popular", variant: "popular" },
    gradient: "from-violet-500/40 to-fuchsia-500/40",
  },
  {
    id: "text-to-video",
    name: "Text to Video",
    description: "Generate videos from text descriptions",
    category: "video",
    href: "/ai-video-generator?mode=text-to-video",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop",
    gradient: "from-amber-500/40 to-yellow-500/40",
  },
  {
    id: "luma-dream-machine",
    name: "Luma Dream Machine",
    description: "Create stunning videos with Luma AI",
    category: "video",
    href: "/ai-video-generator?model=luma",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
    gradient: "from-cyan-500/40 to-blue-500/40",
  },
  // Audio Tools
  {
    id: "voice-generation",
    name: "Voice Generation",
    description: "Generate realistic voices from text",
    category: "audio",
    href: "/voice-generator",
    image: "https://p2-kling.klingai.com/kcdn/cdn-kcdn112452/kling-website/all-tools/ai-sound-thumb.png",
    badge: { text: "Coming Soon", variant: "coming-soon" },
    isComingSoon: true,
    gradient: "from-sky-500/40 to-blue-500/40",
  },
  {
    id: "sound-effects",
    name: "Sound Effects",
    description: "AI-generated sound effects for any project",
    category: "audio",
    href: "/sound-effects",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop",
    badge: { text: "Coming Soon", variant: "coming-soon" },
    isComingSoon: true,
    gradient: "from-lime-500/40 to-green-500/40",
  },
  {
    id: "music-generation",
    name: "Music Generation",
    description: "Create original music with AI",
    category: "audio",
    href: "/music-generator",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
    badge: { text: "Coming Soon", variant: "coming-soon" },
    isComingSoon: true,
    gradient: "from-pink-500/40 to-rose-500/40",
  },
];

// Get tools by category
export function getToolsByCategory(category: ToolCategory): Tool[] {
  if (category === "all") {
    return TOOLS_DATA;
  }
  return TOOLS_DATA.filter((tool) => tool.category === category);
}

// Tool card badge styles by variant
export const BADGE_STYLES = {
  new: "bg-[#74FF52]/20 text-[#74FF52] border border-[#74FF52]/30",
  popular: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  beta: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "coming-soon": "bg-white/10 text-white/60 border border-white/20",
} as const;
