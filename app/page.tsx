import type { Metadata } from "next";
import {
  HeroSection,
  ToolsShowcase,
  ModelsShowcase,
  HowItWorks,
  FAQSection,
  FinalCTA,
  LandingNavbar,
  LandingFooter,
} from "./(landing)/_components";

// =============================================================================
// SEO METADATA
// =============================================================================

export const metadata: Metadata = {
  title: "Hexwave.ai - All-in-One AI Creative Studio | Image & Video Generator",
  description:
    "Transform your ideas into stunning images, videos, and talking avatars with Hexwave.ai. Access 40+ leading AI models including FLUX, Midjourney, Sora, Kling, HeyGen & more in one platform. Start free today.",
  keywords: [
    "AI image generator",
    "AI video generator",
    "text to image",
    "text to video",
    "AI art generator",
    "talking avatar",
    "AI video maker",
    "FLUX AI",
    "Midjourney alternative",
    "Sora AI",
    "Kling AI",
    "HeyGen alternative",
    "AI creative tools",
    "AI content creation",
    "free AI generator",
    "AI studio",
    "Hexwave",
  ],
  authors: [{ name: "Hexwave.ai" }],
  creator: "Hexwave.ai",
  publisher: "Hexwave.ai",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Hexwave.ai",
    title: "Hexwave.ai - All-in-One AI Creative Studio",
    description:
      "Transform your ideas into stunning images, videos, and talking avatars. Access 40+ leading AI models in one platform.",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai - AI Creative Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hexwave.ai - All-in-One AI Creative Studio",
    description:
      "Transform your ideas into stunning images, videos, and talking avatars with 40+ AI models.",
    images: ["/og/home.png"],
    creator: "@hexwaveai",
  },
  alternates: {
    canonical: "/",
  },
};

// =============================================================================
// JSON-LD STRUCTURED DATA FOR SEO
// =============================================================================

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Hexwave.ai",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description:
    "All-in-One AI Creative Studio for image generation, video creation, talking avatars, and more.",
  url: "https://hexwave.ai",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available with credits",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "14000",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "AI Image Generation",
    "AI Video Generation",
    "Talking Avatar Creation",
    "Voice Synthesis",
    "40+ AI Models",
    "4K Export",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Hexwave.ai?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hexwave.ai is an all-in-one AI creative studio that provides access to 40+ leading AI models for image generation, video creation, talking avatars, voice synthesis, and more.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI image generator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our AI image generator uses state-of-the-art models like FLUX Pro, Midjourney, DALL-E 3, and Ideogram V3. Simply describe your image in natural language and our AI generates high-quality images in seconds.",
      },
    },
    {
      "@type": "Question",
      name: "What AI video generators are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer access to the best AI video models including Google's Veo 3, OpenAI's Sora 2, Kling V2, Runway Gen-3, Hailuo, Luma Ray, and Pika V2.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! The free plan includes daily credits to try all our tools, access to basic AI models, standard resolution outputs, and unlimited project storage.",
      },
    },
  ],
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Page Content */}
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <LandingNavbar />

        <main>
          {/* Hero Section - Animated headline with rotating words */}
          <HeroSection />

          {/* Tools Showcase - Interactive tool cards */}
          <ToolsShowcase />

          {/* Models Showcase - Auto-scrolling AI models marquee */}
          <ModelsShowcase />

          {/* How It Works - 3-step process */}
          <HowItWorks />

          {/* FAQ Section - SEO-optimized accordion */}
          <FAQSection />

          {/* Final CTA - Conversion focused */}
          <FinalCTA />
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
