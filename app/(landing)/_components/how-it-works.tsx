"use client";

import Image from "next/image";
import { Lightbulb, Wand2, Download, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Describe Your Vision",
    description: "Enter your creative prompt, upload a reference image, or choose from our curated templates. Our AI understands context, style, and artistic intent.",
    features: [
      "Natural language prompts",
      "Style references",
      "Template library",
    ],
    gradient: "from-purple-500 to-pink-500",
    image: "/images/step-1.webp",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Creates Magic",
    description: "Our advanced AI models work in seconds to transform your ideas into stunning visuals. Choose from 40+ models optimized for different styles and outputs.",
    features: [
      "Real-time generation",
      "Multiple variations",
      "Quality optimization",
    ],
    gradient: "from-blue-500 to-cyan-500",
    image: "/images/step-2.webp",
  },
  {
    number: "03",
    icon: Download,
    title: "Refine & Export",
    description: "Fine-tune your creations with our editing tools, upscale to 4K, and export in multiple formats. Your content is ready to share anywhere.",
    features: [
      "Built-in editor",
      "4K upscaling",
      "Multiple formats",
    ],
    gradient: "from-green-500 to-emerald-500",
    image: "/images/step-3.webp",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#74FF52]" />
            <span className="text-sm text-white/80 font-medium">
              Simple Process
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Create in{" "}
            <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
              Three Steps
            </span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From idea to finished product in minutes. Our streamlined workflow 
            makes professional content creation accessible to everyone.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <div
                  key={index}
                  className="relative group"
                >
                  {/* Step Card */}
                  <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 h-full">
                    {/* Step Number */}
                    <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} bg-opacity-20 flex items-center justify-center mb-6 mt-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-white/60 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {step.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/50">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.gradient}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Hover Glow */}
                    <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`} />
                  </div>

                  {/* Connection Dot */}
                  <div className={`hidden lg:flex absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} items-center justify-center`}>
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/40 mb-4">Ready to start creating?</p>
          <div className="inline-flex items-center gap-4 flex-wrap justify-center">
            <a
              href="/sign-up"
              className="px-8 py-3 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#9fff75] transition-all duration-300"
            >
              Get Started Free
            </a>
            <a
              href="/explore"
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300"
            >
              View Examples
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

