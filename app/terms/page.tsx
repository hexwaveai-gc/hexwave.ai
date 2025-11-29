import type { Metadata } from "next";
import { LandingNavbar } from "@/app/(landing)/_components/landing-navbar";
import { MinimalFooter } from "@/app/components/common/minimal-footer";
import { TermsContent } from "./_components/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read Hexwave.ai's Terms of Service. Understand the rules and guidelines for using our AI creative platform.",
  keywords: [
    "Hexwave terms of service",
    "terms and conditions",
    "user agreement",
    "AI platform terms",
    "service agreement",
  ],
  openGraph: {
    title: "Terms of Service | Hexwave.ai",
    description: "Read Hexwave.ai's Terms of Service. Understand the rules and guidelines for using our platform.",
    url: "/terms",
    siteName: "Hexwave.ai",
    images: [
      {
        url: "/logo/hexwave.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai Terms of Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Hexwave.ai",
    description: "Read Hexwave.ai's Terms of Service.",
    images: ["/logo/hexwave.png"],
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <LandingNavbar />
      <div className="flex-1">
        <TermsContent />
      </div>
      <MinimalFooter />
    </main>
  );
}

