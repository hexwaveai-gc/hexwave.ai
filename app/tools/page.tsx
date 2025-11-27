import type { Metadata } from "next";
import Sidebar from "@/app/components/common/Sidebar";
import { ToolsContent } from "./_components/tools-content";

export const metadata: Metadata = {
  title: "All Tools",
  description:
    "Explore our complete suite of AI-powered creative tools. Generate stunning images, create dynamic videos, and produce professional audio content with cutting-edge AI technology.",
  keywords: [
    "AI tools",
    "image generation",
    "video generation",
    "AI audio",
    "creative studio",
    "text to image",
    "text to video",
    "AI art",
  ],
  openGraph: {
    title: "All AI Creative Tools | Hexwave.ai",
    description:
      "Explore our complete suite of AI-powered creative tools. Generate images, videos, and audio with cutting-edge AI.",
    url: "/tools",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/images/og/tools.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai AI Creative Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All AI Creative Tools | Hexwave.ai",
    description:
      "Explore AI-powered tools for image, video, and audio generation.",
    images: ["/images/og/tools.png"],
  },
  alternates: {
    canonical: "/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <ToolsContent />
      </main>
    </div>
  );
}

