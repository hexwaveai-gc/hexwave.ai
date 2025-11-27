"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AVATARS } from "@/constants/video-agent";

// Get first 3 avatars for the phone mockups preview
const FALLBACK_GRADIENTS = [
  "from-blue-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-cyan-500 to-teal-500",
];

interface PhoneMockupProps {
  src: string;
  alt: string;
  fallbackGradient: string;
  className?: string;
  size?: "sm" | "md";
}

function PhoneMockup({ 
  src,
  alt,
  fallbackGradient,
  className = "",
  size = "md"
}: PhoneMockupProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = size === "md" 
    ? "w-32 h-44 sm:w-40 sm:h-56" 
    : "w-28 h-40 sm:w-32 sm:h-48";

  return (
    <div className={`relative ${sizeClasses} ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-1 rounded-xl overflow-hidden bg-black">
          {!imageError ? (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes={size === "md" ? "160px" : "128px"}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
              <span className="text-4xl">👤</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  // Get first 3 avatars for hero preview, using memoization
  const heroAvatars = useMemo(() => {
    return AVATARS.slice(0, 3).map((avatar, index) => ({
      src: avatar.previewUrl,
      alt: avatar.name,
      fallbackGradient: FALLBACK_GRADIENTS[index] || FALLBACK_GRADIENTS[0],
    }));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      {/* Phone Mockups */}
      <div className="relative flex items-end justify-center gap-2 mb-8">
        {/* Left Phone - Tilted */}
        {heroAvatars[0] && (
          <PhoneMockup 
            src={heroAvatars[0].src}
            alt={heroAvatars[0].alt}
            fallbackGradient={heroAvatars[0].fallbackGradient}
            size="sm" 
            className="-rotate-6 transform-gpu"
          />
        )}

        {/* Center Phone - Main */}
        {heroAvatars[1] && (
          <PhoneMockup 
            src={heroAvatars[1].src}
            alt={heroAvatars[1].alt}
            fallbackGradient={heroAvatars[1].fallbackGradient}
            size="md" 
            className="z-10"
          />
        )}

        {/* Right Phone - Tilted */}
        {heroAvatars[2] && (
          <PhoneMockup 
            src={heroAvatars[2].src}
            alt={heroAvatars[2].alt}
            fallbackGradient={heroAvatars[2].fallbackGradient}
            size="sm" 
            className="rotate-6 transform-gpu"
          />
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl leading-tight">
        Transform any idea into a compelling video
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-sm sm:text-base text-white/60 max-w-xl leading-relaxed">
        Simply describe what you&apos;re imagining, we&apos;ll transform it into a multi-scene
        talking video in just a few minutes.
      </p>
    </div>
  );
}

