import type { Metadata } from "next";
import Sidebar from "@/app/components/common/Sidebar";
import { AudioContent } from "./_components/audio-content";

export const metadata: Metadata = {
  title: "AI Audio Generator",
  description:
    "Generate natural-sounding speech with AI. Choose from dozens of voices, customize settings, and create professional audio content in seconds.",
  keywords: [
    "AI audio generator",
    "text to speech",
    "AI voice",
    "speech synthesis",
    "voice generator",
    "ElevenLabs",
    "audio content",
    "voiceover",
  ],
  openGraph: {
    title: "AI Audio Generator | Hexwave.ai",
    description:
      "Generate natural-sounding speech with AI. Choose from dozens of voices and create professional audio content.",
    url: "/audio",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/images/og/audio.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai AI Audio Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Audio Generator | Hexwave.ai",
    description:
      "Generate natural-sounding speech with AI voices.",
    images: ["/images/og/audio.png"],
  },
  alternates: {
    canonical: "/audio",
  },
};

export default function AudioPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <AudioContent />
      </main>
    </div>
  );
}

