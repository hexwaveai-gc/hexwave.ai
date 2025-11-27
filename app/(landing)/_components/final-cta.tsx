"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export function FinalCTA() {
  const { isSignedIn } = useAuth();
  
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#74FF52]/10 rounded-full blur-[200px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* CTA Card */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#74FF52]/10 via-transparent to-purple-500/10 opacity-50" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative p-8 sm:p-12 lg:p-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74FF52]/10 border border-[#74FF52]/30 mb-8">
              <Zap className="w-4 h-4 text-[#74FF52]" />
              <span className="text-sm text-[#74FF52] font-medium">
                Start Free Today
              </span>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Image
                src="/logo/hexwave.png"
                alt="Hexwave.ai"
                width={48}
                height={48}
                className="w-12 h-12"
                style={{
                  filter: "brightness(0) saturate(100%) invert(1)",
                }}
              />
              <span className="text-3xl font-bold text-white">Hexwave.ai</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
                Transform
              </span>{" "}
              <br className="hidden sm:block" />
              Your Creative Workflow?
            </h2>

            {/* Description */}
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Join thousands of creators using AI to produce stunning images, videos, 
              and avatars. No credit card required to start.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href={isSignedIn ? "/tools" : "/sign-up"}
                className="group px-8 py-4 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold text-lg hover:bg-[#9fff75] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#74FF52]/20 hover:shadow-[#74FF52]/40"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#74FF52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#74FF52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Free credits included</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#74FF52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

