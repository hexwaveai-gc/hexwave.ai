"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const heroVideos = [
  {
    src: "https://cdn.revid.ai/static/music-to-video.mp4",
    poster: "/showcase/video-1.webp",
    label: "AI Video",
  },
  {
    src: "https://cdn.revid.ai/static/Lily_s%20Dutch%20Adventure.mp4",
    poster: "/showcase/video-2.webp",
    label: "Story Video",
  },
  {
    src: "https://cdn.revid.ai/static/Eldenvale_%20A%20Tapestry%20of%20Life.mp4",
    poster: "/showcase/video-3.webp",
    label: "AI Film",
  },
];

const rotatingWords = [
  "Images",
  "Videos",
  "Avatars",
  "Stories",
  "Content",
];

export function HeroSection() {
  const { isSignedIn } = useAuth();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#74FF52]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] animate-pulse delay-2000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#74FF52]" />
          <span className="text-sm text-white/80 font-medium">
            All-in-One AI Creative Suite
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6">
          <span className="text-white">Create Stunning</span>
          <br />
          <span className="relative inline-block">
            <span 
              className={`inline-block bg-gradient-to-r from-[#74FF52] via-[#9fff75] to-[#74FF52] bg-clip-text text-transparent transition-all duration-300 ${
                isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {rotatingWords[currentWordIndex]}
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform your ideas into captivating visuals with AI-powered image generation, 
          video creation, talking avatars, and more — all in one platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href={isSignedIn ? "/tools" : "/sign-up"}
            className="group relative px-8 py-4 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold text-lg hover:bg-[#9fff75] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#74FF52]/20 hover:shadow-[#74FF52]/40"
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/explore"
            className="group px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
          >
            <Play className="w-5 h-5" />
            See Examples
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium text-white/60"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span>14,000+ creators</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="w-4 h-4 text-[#74FF52]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1">4.9/5 rating</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <span>No credit card required</span>
        </div>
      </div>

      {/* Floating Video Previews */}
      <div className="relative z-10 mt-16 w-full max-w-5xl mx-auto">
        <div className="relative h-[300px] sm:h-[400px] flex items-center justify-center">
          {/* Left Video */}
          <div className="absolute left-0 sm:left-[10%] top-8 w-[140px] sm:w-[180px] -rotate-6 opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500 cursor-pointer group">
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
              <video
                className="w-full h-full object-cover"
                poster={heroVideos[0].poster}
                muted
                loop
                playsInline
                preload="none"
              >
                <source src={heroVideos[0].src} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                {heroVideos[0].label}
              </span>
            </div>
          </div>

          {/* Center Video (Main) */}
          <div className="relative w-[200px] sm:w-[260px] z-10 hover:scale-105 transition-all duration-500 cursor-pointer group">
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5 border border-white/20 shadow-2xl shadow-[#74FF52]/10">
              <video
                className="w-full h-full object-cover"
                poster={heroVideos[1].poster}
                muted
                loop
                playsInline
                preload="none"
              >
                <source src={heroVideos[1].src} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                {heroVideos[1].label}
              </span>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#74FF52]/20 via-purple-500/10 to-blue-500/20 rounded-3xl blur-2xl -z-10 opacity-60" />
          </div>

          {/* Right Video */}
          <div className="absolute right-0 sm:right-[10%] top-8 w-[140px] sm:w-[180px] rotate-6 opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500 cursor-pointer group">
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
              <video
                className="w-full h-full object-cover"
                poster={heroVideos[2].poster}
                muted
                loop
                playsInline
                preload="none"
              >
                <source src={heroVideos[2].src} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                {heroVideos[2].label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

