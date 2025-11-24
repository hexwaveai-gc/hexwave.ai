import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { IconSprite } from "./components/ui/icon-sprite"; 
import { UpgradePlanProvider } from "./providers/UpgradePlanProvider"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hexwave.ai"),
  title: {
    default: "Hexwave.ai - All-in-One Creative Studio",
    template: "%s | Hexwave.ai",
  },
  description: "Streamlined workflow for storytelling from start to finish. AI Image Generator, Video Generator, Talking Photo Generator, and UGC Ad Generator powered by leading AI models.",
  keywords: ["AI", "creative studio", "image generator", "video generator", "AI tools", "content creation", "storytelling", "Nanobanana", "Midjourney", "Sora", "Kling", "AI video", "talking photo", "UGC ads"],
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
  icons: {
    icon: [
      { url: "/logo/hexwave.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/hexwave.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo/hexwave.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo/hexwave.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://hexwave.ai",
    siteName: "Hexwave.ai",
    title: "Hexwave.ai - All-in-One Creative Studio",
    description: "Streamlined workflow for storytelling from start to finish. AI Image Generator, Video Generator, Talking Photo Generator, and UGC Ad Generator powered by leading AI models.",
    images: [
      {
        url: "/logo/hexwave.png",
        width: 1200,
        height: 630,
        alt: "Hexwave.ai - All-in-One Creative Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hexwave.ai - All-in-One Creative Studio",
    description: "Streamlined workflow for storytelling from start to finish",
    images: ["/logo/hexwave.png"],
    creator: "@hexwaveai",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorBackground: "hsl(var(--background))",
          colorText: "hsl(var(--foreground))",
        },
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        > 
          <UpgradePlanProvider>
            <IconSprite />
            {children}
          </UpgradePlanProvider> 
        </body>
      </html>
    </ClerkProvider>
  );
}
