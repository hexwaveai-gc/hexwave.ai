"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Loader2,
  CheckCircle,
  Sparkles,
  Video,
  Image as ImageIcon,
  User,
  Megaphone,
  ArrowRight,
  Zap,
  X,
} from "lucide-react";
import Image from "next/image";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || result.error || "Something went wrong");
      }

      setIsSuccess(true);
      setEmail("");
      setName("");
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Waitlist signup error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to join waitlist"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || result.error || "Something went wrong");
      }

      setIsSuccess(true);
      setEmail("");
      setName("");
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Waitlist signup error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to join waitlist"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: ImageIcon,
      title: "AI Image Generator",
      description:
        "Create stunning images with Nanobanana, Midjourney, and all major AI models",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-[#74FF52]",
    },
    {
      icon: Video,
      title: "Video Generator",
      description:
        "Transform ideas into captivating videos with advanced AI video generation",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-[#74FF52]",
    },
    {
      icon: User,
      title: "Talking Photo Generator",
      description:
        "Bring photos to life with realistic talking avatars and voice synthesis",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-[#74FF52]",
    },
    {
      icon: Megaphone,
      title: "UGC Ad Generator",
      description: "Create authentic user-generated content ads that convert",
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-[#74FF52]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `
      }} />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo/hexwave.png"
                alt="Hexwave.ai logo"
                width={32}
                height={32}
                className="w-11 h-11"
                style={{
                  filter: "brightness(0) saturate(100%) invert(1)",
                  opacity: 1,
                }}
                priority
              />
              <span className="text-[#F9FBFC] font-semibold text-xl">
                Hexwave.ai
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-transparent border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-sm"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#74FF52]/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-24">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h1 className="text-center mb-6">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F9FBFC] mb-2">
              All-in-One
            </div>
            <div className="text-4xl sm:text-5xl lg:text-7xl font-serif italic text-[#F9FBFC] mb-3">
              Creative Studio
            </div>
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-8 font-normal">
            Streamlined workflow for storytelling from start to finish
          </p>

          
          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            {isSuccess ? (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#74FF52]/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#74FF52]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      You're on the list! 🎉
                    </h3>
                    <p className="text-white/60">
                      Thanks for joining our waitlist. We'll notify you when we
                      launch!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={isSubmitting}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border ${
                        error
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-white/30"
                      } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all backdrop-blur-sm`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#66e648] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Waitlist
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}
                <p className="text-xs text-white/40 text-center">
                  We'll only send you updates about the launch. No spam, ever.
                </p>
              </form>
            )}
          </div>

          {/* Promotional Banner */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-gradient-to-r from-[#74FF52]/20 to-[#74FF52]/10 border border-[#74FF52]/30 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-[#74FF52] flex-shrink-0" />
              <div className="text-left">
                <span className="text-[#74FF52] font-bold text-base">
                  Get up to 50% off
                </span>
                <span className="text-white/80 text-xs ml-2">
                  when you join the waitlist
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16 sm:mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm overflow-hidden"
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Model Showcase */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F9FBFC] mb-3">
              Powered by Leading AI Models
            </h2>
            <p className="text-white/60">
              Access all major AI models in one unified platform
            </p>
          </div>

          {/* Auto-scrolling Models */}
          <div className="relative overflow-hidden w-full">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            <div 
              className="flex gap-6"
              style={{
                animation: 'scroll 60s linear infinite',
                width: 'fit-content',
                willChange: 'transform',
              }}
            >
              {[
                { name: "Nanobanana", image: "/models/nano-banana.png" },
                { name: "Sora 2", image: "/models/sora-2.webp" },
                { name: "Kling", image: "/models/kling.webp" },
                { name: "Hailuo", image: "/models/hailuo.webp" },
                { name: "Flux", image: "/models/flux.svg" },
                { name: "Runway", image: "/models/runway.webp" },
                { name: "OpenAI", image: "/models/openai.png" },
                { name: "Claude", image: "/models/claude.webp" },
                { name: "Gemini", image: "/models/gemini.png" }, 
                { name: "DeepMind Veo 3", image: "/models/deepmind-veo3.svg" },
                { name: "xAI", image: "/models/xai.webp" },
                { name: "Ideogram", image: "/models/ideogram.svg" },
                { name: "Luma", image: "/models/luma.svg" },
                { name: "Gamma", image: "/models/gamma.svg" },
                { name: "ElevenLabs", image: "/models/elevenlabs.svg" },
                { name: "Gryphe", image: "/models/gryphe.webp" },
                { name: "HeyGen", image: "/models/heygen.webp" }, 
                { name: "ByteDance", image: "/models/bytedance.webp" }, 
              ].map((model, index) => (
                <div
                  key={index}
                  className="group relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                  title={model.name}
                >
                  <Image
                    src={model.image}
                    alt={model.name}
                    width={80}
                    height={80}
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    unoptimized
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                { name: "Nanobanana", image: "/models/nano-banana.png" },
                { name: "Sora 2", image: "/models/sora-2.webp" },
                { name: "Kling", image: "/models/kling.webp" },
                { name: "Hailuo", image: "/models/hailuo.webp" },
                { name: "Flux", image: "/models/flux.svg" },
                { name: "Runway", image: "/models/runway.webp" },
                { name: "OpenAI", image: "/models/openai.png" },
                { name: "Claude", image: "/models/claude.webp" },
                { name: "Gemini", image: "/models/gemini.png" },
                { name: "Google", image: "/models/google.png" },
                { name: "Meta", image: "/models/meta.png" },
                { name: "Microsoft", image: "/models/microsoft.webp" },
                { name: "Mistral", image: "/models/mistral.png" },
                { name: "Anthropic", image: "/models/anthropic.png" },
                { name: "DeepSeek", image: "/models/deepseek.webp" },
                { name: "DeepMind Veo 3", image: "/models/deepmind-veo3.svg" },
                { name: "xAI", image: "/models/xai.webp" },
                { name: "Ideogram", image: "/models/ideogram.svg" },
                { name: "Luma", image: "/models/luma.svg" },
                { name: "Gamma", image: "/models/gamma.svg" },
                { name: "ElevenLabs", image: "/models/elevenlabs.svg" },
                { name: "Gryphe", image: "/models/gryphe.webp" },
                { name: "HeyGen", image: "/models/heygen.webp" },
                { name: "Perplexity", image: "/models/perplexity.webp" },
                { name: "ByteDance", image: "/models/bytedance.webp" },
                { name: "V1", image: "/models/v1.png" },
              ].map((model, index) => (
                <div
                  key={`duplicate-${index}`}
                  className="group relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                  title={model.name}
                >
                  <Image
                    src={model.image}
                    alt={model.name}
                    width={80}
                    height={80}
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 sm:p-12 lg:p-16 text-center backdrop-blur-sm overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74FF52]/20 border border-[#74FF52]/30 mb-6">
              <Zap className="w-4 h-4 text-[#74FF52]" />
              <span className="text-sm text-[#74FF52] font-medium">
                Early Access
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F9FBFC] mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-lg text-white/70 mb-4 max-w-2xl mx-auto">
              Join thousands of creators waiting to revolutionize their content
              creation workflow
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#74FF52]/20 border border-[#74FF52]/30 mb-8">
              <span className="text-[#74FF52] font-bold text-sm">
                🎉 Get up to 50% off
              </span>
              <span className="text-white/80 text-xs">
                when you join the waitlist
              </span>
            </div>

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={isSubmitting}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border ${
                        error
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/20 focus:border-white/40"
                      } text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#66e648] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-400 text-center mt-2">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/40 text-sm">
          <p>© 2025 Hexwave.ai. All rights reserved.</p>
        </div>
      </div>

      {/* Join Waitlist Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#15171A] border border-white/10 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-[#74FF52]/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#74FF52]" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    You're on the list! 🎉
                  </h3>
                  <p className="text-white/60">
                    Thanks for joining our waitlist. We'll notify you when we
                    launch!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#F9FBFC] mb-2">
                    Join the Waitlist
                  </h2>
                  <p className="text-white/60 text-sm">
                    Be among the first to experience Hexwave.ai
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="modal-name"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#74FF52]/50 focus:border-[#74FF52]/50 transition-all backdrop-blur-sm disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-email"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
                      <input
                        id="modal-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        disabled={isSubmitting}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${
                          error
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 focus:border-white/30"
                        } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#74FF52]/50 transition-all backdrop-blur-sm disabled:opacity-50`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#66e648] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-white/40 text-center">
                  We'll only send you updates about the launch. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
