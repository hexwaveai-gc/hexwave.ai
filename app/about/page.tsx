import type { Metadata } from "next";
import { LandingNavbar } from "@/app/(landing)/_components/landing-navbar";
import { MinimalFooter } from "@/app/components/common/minimal-footer";
import { AboutContent } from "./_components/about-content";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet Hexwave.ai - The all-in-one GenAI creative platform designed for filmmakers, content creators, and storytellers. Discover how we're revolutionizing video creation with true cinematic control.",
  keywords: [
    "Hexwave AI",
    "about Hexwave",
    "AI video platform",
    "creative AI tools",
    "GenAI video",
    "AI filmmaking",
    "content creation platform",
    "AI creative studio",
  ],
  openGraph: {
    title: "About Us | Hexwave.ai",
    description: "Meet Hexwave.ai - The all-in-one GenAI creative platform designed for filmmakers, content creators, and storytellers.",
    url: "/about",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/logo/hexwave.png",
        width: 1200,
        height: 630,
        alt: "About Hexwave.ai - AI Creative Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Hexwave.ai",
    description: "Meet Hexwave.ai - The all-in-one GenAI creative platform for filmmakers and content creators.",
    images: ["/logo/hexwave.png"],
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <LandingNavbar />
      <div className="flex-1">
        <AboutContent />
      </div>
      <MinimalFooter />
    </main>
  );
}

