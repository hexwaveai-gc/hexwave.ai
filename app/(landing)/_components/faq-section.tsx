"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is Hexwave.ai?",
    answer: "Hexwave.ai is an all-in-one AI creative studio that provides access to 40+ leading AI models for image generation, video creation, talking avatars, voice synthesis, and more. We bring together tools like FLUX, Midjourney, Sora, Kling, HeyGen, and ElevenLabs in one unified platform.",
  },
  {
    question: "How does the AI image generator work?",
    answer: "Our AI image generator uses state-of-the-art models like FLUX Pro, Midjourney, DALL-E 3, Ideogram V3, and Stable Diffusion. Simply describe your image in natural language, optionally upload a reference image for style guidance, and our AI generates high-quality images in seconds. You can generate up to 4 images at once and upscale to 4K resolution.",
  },
  {
    question: "What AI video generators are available?",
    answer: "We offer access to the best AI video models including Google's Veo 3, OpenAI's Sora 2, Kling V2, Runway Gen-3, Hailuo, Luma Ray, and Pika V2. You can create videos from text prompts, transform images into videos, or extend existing videos. All outputs are available in HD and 4K quality.",
  },
  {
    question: "How do talking avatars work?",
    answer: "Our talking avatar feature uses AI models from HeyGen, Hedra, and Sync Labs to animate photos and create realistic lip-synced videos. Simply upload a photo or choose from our 100+ premium avatars, add your script or audio, and generate professional talking videos in over 40 languages.",
  },
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes daily credits to try all our tools, access to basic AI models, standard resolution outputs, and unlimited project storage. You can generate images, short videos, and test talking avatars without any payment required.",
  },
  {
    question: "How does the credit system work?",
    answer: "Credits are our universal currency for AI generations. Different tools and models cost different amounts based on complexity and compute requirements. 1 credit = roughly $0.005. Premium models like Midjourney or Sora cost more credits than standard models. You can see the exact credit cost before each generation.",
  },
  {
    question: "Can I use the generated content commercially?",
    answer: "Yes! All content you generate on Hexwave.ai is yours to use commercially. This includes images, videos, avatars, and audio. We recommend reviewing individual AI model terms for specific use cases, but generally, all outputs are suitable for commercial use including marketing, social media, and advertising.",
  },
  {
    question: "What file formats are supported?",
    answer: "For images, we support PNG, JPG, and WebP exports up to 4K resolution. For videos, we offer MP4 and WebM formats in HD (1080p) and 4K (2160p). Audio can be exported as MP3 or WAV. We also support various aspect ratios including 1:1, 16:9, 9:16, 4:3, and custom dimensions.",
  },
  {
    question: "How fast is content generation?",
    answer: "Generation times vary by tool and model. Images typically generate in 5-30 seconds. Short videos (5-10 seconds) take 1-3 minutes. Talking avatar videos process in 2-5 minutes depending on length. We use optimized infrastructure to deliver the fastest possible results.",
  },
  {
    question: "Is there an API available?",
    answer: "Yes, we offer a comprehensive REST API for developers and businesses who want to integrate AI generation into their own applications. The API supports all our tools including image generation, video creation, and avatar synthesis. Contact us for API access and documentation.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <HelpCircle className="w-4 h-4 text-[#74FF52]" />
            <span className="text-sm text-white/80 font-medium">
              Got Questions?
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#74FF52] to-[#9fff75] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to know about Hexwave.ai. Can't find what you're looking for? 
            Contact our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "bg-white/5 border-white/20"
                    : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/15"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className={`font-semibold transition-colors ${isOpen ? "text-white" : "text-white/80"}`}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/50 transition-transform duration-300 flex-shrink-0 ml-4 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5">
                    <p className="text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/50 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@hexwave.ai"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}

