import type { Metadata } from "next";
import { LandingNavbar } from "@/app/(landing)/_components/landing-navbar";
import { MinimalFooter } from "@/app/components/common/minimal-footer";
import { PrivacyContent } from "./_components/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Hexwave.ai's Privacy Policy. Learn how we collect, use, and protect your personal information when you use our AI creative platform.",
  keywords: [
    "Hexwave privacy policy",
    "AI platform privacy",
    "data protection",
    "user privacy",
    "personal information",
  ],
  openGraph: {
    title: "Privacy Policy | Hexwave.ai",
    description: "Read Hexwave.ai's Privacy Policy. Learn how we collect, use, and protect your personal information.",
    url: "/privacy",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/logo/hexwave.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai Privacy Policy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Hexwave.ai",
    description: "Read Hexwave.ai's Privacy Policy.",
    images: ["/logo/hexwave.png"],
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <LandingNavbar />
      <div className="flex-1">
        <PrivacyContent />
      </div>
      <MinimalFooter />
    </main>
  );
}

