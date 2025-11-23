"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex items-center justify-center">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#74FF52]/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo/hexwave.png"
              alt="Hexwave.ai logo"
              width={40}
              height={40}
              className="w-10 h-10"
              style={{
                filter: "brightness(0) saturate(100%) invert(1)",
                opacity: 1,
              }}
              priority
            />
            <span className="text-[#F9FBFC] font-semibold text-2xl">
              Hexwave.ai
            </span>
          </Link>

          {/* 404 Content */}
          <div className="mb-8">
            <h1 className="text-8xl sm:text-9xl font-bold text-[#F9FBFC] mb-4">
              404
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74FF52]/20 border border-[#74FF52]/30 mb-6">
              <Zap className="w-4 h-4 text-[#74FF52]" />
              <span className="text-sm text-[#74FF52] font-medium">
                Page Not Found
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F9FBFC] mb-4">
              Oops! This page doesn't exist
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              The page you're looking for might have been moved, deleted, or
              doesn't exist. Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group px-8 py-4 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#66e648] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group px-8 py-4 rounded-xl bg-transparent border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#74FF52]/30 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
