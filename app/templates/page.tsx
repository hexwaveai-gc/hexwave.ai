import type { Metadata } from "next";
import Sidebar from "@/app/components/common/Sidebar";
import { TemplatesContent } from "./_components/templates-content";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse our collection of AI-powered templates. Create viral videos and stunning images with just one click. Transform photos into fun, engaging content.",
  keywords: [
    "AI templates",
    "video templates",
    "photo templates",
    "viral content",
    "AI video generator",
    "face swap",
    "fun templates",
    "social media templates",
  ],
  openGraph: {
    title: "AI Templates | Hexwave.ai",
    description:
      "Browse our collection of AI-powered templates. Create viral videos and stunning images with just one click.",
    url: "/templates",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/images/og/templates.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai AI Templates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Templates | Hexwave.ai",
    description:
      "Browse AI-powered templates for viral videos and stunning images.",
    images: ["/images/og/templates.png"],
  },
  alternates: {
    canonical: "/templates",
  },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <TemplatesContent />
      </main>
    </div>
  );
}



