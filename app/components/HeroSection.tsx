"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { WaitlistForm } from "@/app/components/WaitlistForm";

const videos = [
  {
    src: "https://cdn.revid.ai/static/music-to-video.mp4",
    poster: "https://cdn.revid.ai/static/cinematic-music-to-video.webp",
    baseClassName: "bg-white/10 border-white/90 border w-[120px] sm:w-[240px] aspect-[9/16] sm:-rotate-12 sm:absolute z-20 sm:block sm:-left-1/4 sm:right-1/4 mx-auto rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 group cursor-pointer",
  },
  {
    src: "https://cdn.revid.ai/static/Lily_s%20Dutch%20Adventure.mp4",
    poster: "https://cdn.revid.ai/static/netherland-girl.webp",
    baseClassName: "bg-white/10 border-white/90 border w-11/12 sm:w-[250px] aspect-[9/16] relative z-30 mx-auto rounded-xl overflow-hidden top-[-10px] transition-all duration-300 hover:scale-110 group cursor-pointer",
    style: { filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.65)) drop-shadow(0 8px 8px rgba(0, 0, 0, 0.10))" },
  },
  {
    src: "https://cdn.revid.ai/static/Eldenvale_%20A%20Tapestry%20of%20Life.mp4",
    poster: "https://cdn.revid.ai/static/eldenvale.webp",
    baseClassName: "bg-white/10 border-white/90 border w-[120px] sm:w-[240px] aspect-[9/16] sm:rotate-12 sm:absolute sm:block sm:-right-1/4 sm:left-1/4 z-20 mx-auto rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 group cursor-pointer",
  },
];

const avatars = [
  "/avatars/hustle_faceless.jpeg",
  "/avatars/tibo.jpg",
  "/avatars/angrytom.jpeg",
  "/avatars/jared.jpeg",
  "/avatars/arian.jpeg",
  "/avatars/marc.jpeg",
];

export default function HeroSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(1); // Middle video is active by default
  const [hoveredVideoIndex, setHoveredVideoIndex] = useState<number | null>(null);

  const handleVideoClick = (index: number) => {
    setActiveVideoIndex(index);
  };

  const getVideoZIndex = (index: number) => {
    if (hoveredVideoIndex !== null && index === hoveredVideoIndex) {
      return 60;
    }
    if (index === activeVideoIndex) {
      return 50; // Highest z-index for active video
    }
    // Return original z-index values
    if (index === 0) return 20;
    if (index === 1) return 30;
    if (index === 2) return 20;
    return 20;
  };
  return (
    <article className="rounded-3xl px-4 sm:px-6 md:px-8 border border-[#252629] dark:border-gray-800 bg-[#15171A] dark:bg-gray-900">
      <div className="w-full relative border-x border-[#ffffff10] dark:border-gray-800 md:px-8 py-[7.5%] grid lg:grid-cols-2 gap-12 lg:gap-4 xl:gap-8 items-start">
        {/* Decorative dots */}
        <section className="z-0 absolute w-full h-full col-span-2 grid grid-cols-2 place-content-between pointer-events-none">
          <div className="bg-white/50 rounded-full w-1 h-1 my-8 outline outline-8 outline-[#171b1c]/60 lg:outline-[#171B1C] -mx-[2.5px]"></div>
          <div className="bg-white/50 rounded-full w-1 h-1 my-8 outline outline-8 outline-[#171b1c]/60 lg:outline-[#171B1C] -mx-[2px] place-self-end"></div>
          <div className="bg-white/50 rounded-full w-1 h-1 my-8 outline outline-8 outline-[#171b1c]/60 lg:outline-[#171B1C] -mx-[2.5px]"></div>
          <div className="bg-white/50 rounded-full w-1 h-1 my-8 outline outline-8 outline-[#171b1c]/60 lg:outline-[#171B1C] -mx-[2px] place-self-end"></div>
        </section>

        {/* Content section */}
        <section className="space-y-8 mt-12 lg:mt-0 flex-2 flex flex-col gap-0">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-[48px] lg:text-[42px] xl:text-5xl 2xl:text-6xl text-left leading-[50px] font-euclid text-white dark:text-gray-100 font-medium text-balance">
              Create viral videos in{" "}
              <span className="font-medium from-[#45EC82] from-[0.16%] via-[#7079F3] via-[47.81%] to-[#75CEFC] to-100% bg-gradient-to-r bg-clip-text text-transparent">
                Minutes
              </span>
            </h1>
            <p className="text-md text-neutral-dark dark:text-gray-400 2xl:text-base text-left leading-normal font-inter">
              Turn your creative ideas into attention-grabbing TikTok, Instagram, and YouTube stories with just a few clicks. All you need is a story to tell - Hexwave handles the rest.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-start">
            <div className="flex flex-col gap-2 items-start justify-start">
              <div className="text-[rgb(16,18,21)] w-fit">
                <Button variant="tf-primary">
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>

          {/* User Avatars Section */}
          {/* <div className="flex justify-start">
            <article className="flex items-center flex-col mt-2 space-y-2">
              <div className="mt-0 flex flex-col justify-center items-center">
                <div className="flex gap-3 flex-col items-center lg:items-start">
                  <div className="flex space-x-2 [&>img]:h-10 [&>img]:w-10 [&>img]:rounded-sm first:[&>img]:rounded-l-2xl [&>img]:object-cover [&>img]:ring-2 [&>img]:ring-white">
                    {avatars.map((avatar, index) => (
                      <Image
                        key={index}
                        alt="user testimonial"
                        src={avatar}
                        width={40}
                        height={40}
                        className={index === 0 ? "rounded-l-lg" : index === avatars.length - 1 ? "rounded-r-lg" : ""}
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <div className="text-white/50 text-xs hover:underline">
                    <Link href="/reviews">And loved by 14,258+ users</Link>
                  </div>
                </div>
              </div>
            </article>
          </div> */}

          {/* Waitlist Form */}
          <div className="flex justify-start">
            <WaitlistForm />
          </div>
        </section>

        {/* Video showcase */}
        <div className="h-[440px] max-w-[280px] sm:max-w-unset mx-auto flex items-center justify-center relative">
          {videos.map((video, index) => {
            const zIndex = getVideoZIndex(index);
            const isActive = index === activeVideoIndex;

            return (
              <div
                key={index}
                className={video.baseClassName}
                style={{
                  ...video.style,
                  zIndex: zIndex,
                }}
                onClick={() => handleVideoClick(index)}
                onMouseEnter={() => setHoveredVideoIndex(index)}
                onMouseLeave={() => setHoveredVideoIndex(null)}
              >
                <div className="w-full h-full">
                  <video
                    className="bg-white shadow-2xl rounded-[10px] object-cover h-full w-full lazy-loaded"
                    poster={video.poster}
                    preload="none"
                    muted
                    loop
                    playsInline
                    width="100%"
                    height="100%"
                  >
                    <source src={video.src} type="video/mp4" />
                  </video>
                </div>
              </div>
            );
          })}
          <div className="absolute bg-gradient-to-b from-[#BEFFD6] to-[#92DAFF] blur-[55px] w-[40%] h-[85%] mb-6 z-0"></div>
        </div>
      </div>
    </article>
  );
}

