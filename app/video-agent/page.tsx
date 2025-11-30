import type { Metadata } from "next";
import Sidebar from "@/app/components/common/sidebar";
import { VideoAgentContent } from "./_components/video-agent-content";

export const metadata: Metadata = {
  title: "Video Agent",
  description:
    "Transform any idea into a compelling video. Simply describe what you're imagining, and we'll transform it into a multi-scene talking video in just a few minutes.",
  keywords: [
    "AI video agent",
    "video generator",
    "talking video",
    "AI avatar",
    "video creation",
    "multi-scene video",
    "AI presenter",
  ],
  openGraph: {
    title: "Video Agent | Hexwave.ai",
    description:
      "Transform any idea into a compelling video with AI-powered avatars and multi-scene generation.",
    url: "/video-agent",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/images/og/video-agent.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai Video Agent",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Agent | Hexwave.ai",
    description:
      "Transform any idea into a compelling AI-powered video.",
    images: ["/images/og/video-agent.png"],
  },
  alternates: {
    canonical: "/video-agent",
  },
};

export default function VideoAgentPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <VideoAgentContent />
      </main>
    </div>
  );
}



