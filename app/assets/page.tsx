import type { Metadata } from "next";
import { AssetsContent } from "./_components";

export const metadata: Metadata = {
  title: "My Assets",
  description: "View and manage all your AI-generated images, videos, and audio. Share your creations with the community library.",
  keywords: ["AI assets", "generated images", "AI videos", "AI audio", "creative library", "my generations"],
  openGraph: {
    title: "My Assets | Hexwave.ai",
    description: "View and manage all your AI-generated images, videos, and audio. Share your creations with the community library.",
    url: "/assets",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/images/og/assets.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai Assets",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Assets | Hexwave.ai",
    description: "View and manage all your AI-generated images, videos, and audio.",
    images: ["/images/og/assets.png"],
  },
  alternates: {
    canonical: "/assets",
  },
};

export default function AssetsPage() {
  return <AssetsContent />;
}


