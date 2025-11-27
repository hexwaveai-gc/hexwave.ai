"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

const aiModels = [
  { name: "FLUX Pro", image: "/models/flux.svg", category: "Image" },
  { name: "Midjourney", image: "/models/midjourney.png", category: "Image" },
  { name: "DALL-E 3", image: "/models/openai.png", category: "Image" },
  { name: "Ideogram V3", image: "/models/ideogram.svg", category: "Image" },
  { name: "Stable Diffusion", image: "/models/stability.svg", category: "Image" },
  { name: "Veo 3", image: "/models/deepmind-veo3.svg", category: "Video" },
  { name: "Sora 2", image: "/models/sora-2.webp", category: "Video" },
  { name: "Kling V2", image: "/models/kling.webp", category: "Video" },
  { name: "Runway Gen-3", image: "/models/runway.webp", category: "Video" },
  { name: "Hailuo", image: "/models/hailuo.webp", category: "Video" },
  { name: "Luma Ray", image: "/models/luma.svg", category: "Video" },
  { name: "Pika V2", image: "/models/pika.webp", category: "Video" },
  { name: "HeyGen", image: "/models/heygen.webp", category: "Avatar" },
  { name: "Hedra", image: "/models/hedra.svg", category: "Avatar" },
  { name: "ElevenLabs", image: "/models/elevenlabs.svg", category: "Audio" },
  { name: "Suno", image: "/models/suno.svg", category: "Audio" },
  { name: "Claude", image: "/models/claude.webp", category: "AI" },
  { name: "Gemini", image: "/models/gemini.png", category: "AI" },
];

const stats = [
  { value: "40+", label: "AI Models" },
  { value: "14K+", label: "Creators" },
  { value: "1M+", label: "Generations" },
  { value: "4.9", label: "Rating" },
];

export function ModelsShowcase() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-transparent via-[#74FF52]/[0.02] to-transparent">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#74FF52]/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#74FF52]" />
            <span className="text-sm text-white/80 font-medium">
              Powered by the Best
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Access{" "}
            <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
              40+ Leading
            </span>{" "}
            AI Models
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            One platform, unlimited possibilities. Get access to the world's most advanced 
            AI models from OpenAI, Google, Anthropic, and more.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Models Marquee */}
        <div className="relative">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

          {/* First Row - Left to Right */}
          <div className="overflow-hidden mb-4">
            <div
              className="flex gap-4"
              style={{
                animation: "scroll 40s linear infinite",
                width: "fit-content",
              }}
            >
              {[...aiModels, ...aiModels].map((model, index) => (
                <div
                  key={`row1-${index}`}
                  className="group flex-shrink-0 w-[140px] h-[100px] rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                >
                  <div className="relative w-10 h-10 mb-2">
                    <Image
                      src={model.image}
                      alt={model.name}
                      fill
                      className="object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors text-center line-clamp-1">
                    {model.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Right to Left */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4"
              style={{
                animation: "scroll 40s linear infinite reverse",
                width: "fit-content",
              }}
            >
              {[...aiModels.slice().reverse(), ...aiModels.slice().reverse()].map((model, index) => (
                <div
                  key={`row2-${index}`}
                  className="group flex-shrink-0 w-[140px] h-[100px] rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                >
                  <div className="relative w-10 h-10 mb-2">
                    <Image
                      src={model.image}
                      alt={model.name}
                      fill
                      className="object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors text-center line-clamp-1">
                    {model.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Categories */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {["Image", "Video", "Avatar", "Audio", "AI"].map((category) => (
            <span
              key={category}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              {category} Models
            </span>
          ))}
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

