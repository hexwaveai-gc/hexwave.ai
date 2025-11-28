"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/app/components/ui/carousel";
import { carouselItems, sideBanner, actionItems } from "@/constants/explore/promoBanners";

interface BannerData {
  href: string;
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  frontImage: string;
}

interface ActionData {
  id: number;
  title: string;
  desc: string;
  href: string;
  bgColor: string;
  accentColor: string;
  frontImage: string;
}

const BannerItem = ({ data, className }: { data: BannerData; className?: string }) => {
  return (
    <Link
      href={data.href}
      className={`relative block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] group ${className}`}
      style={{ background: data.bgColor }}
    >
      {/* Front Image - Full background with fade */}
      {data.frontImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={data.frontImage}
            alt=""
            fill
            className="object-cover object-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            unoptimized
          />
          {/* Strong gradient overlay from left for text readability */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.4) 60%, transparent 100%)` 
            }}
          />
        </div>
      )}
      
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]"
        style={{ 
          background: `radial-gradient(circle at 20% 50%, ${data.accentColor}10 0%, transparent 50%)` 
        }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center z-10">
        <h2 className="text-white text-xl md:text-2xl font-bold mb-2 max-w-[60%] drop-shadow-lg">{data.title}</h2>
        <p className="text-white/80 text-sm md:text-base max-w-[55%] drop-shadow-md">{data.subtitle}</p>
        
        {/* CTA */}
        <div className="flex items-center gap-2 mt-4">
          <span 
            className="text-sm font-medium drop-shadow-md"
            style={{ color: data.accentColor }}
          >
            Explore now
          </span>
          <ArrowRight 
            className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
            style={{ color: data.accentColor }}
          />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 z-20"
        style={{ background: data.accentColor }}
      />
    </Link>
  );
};

const ActionItem = ({ data }: { data: ActionData }) => {
  return (
    <Link
      href={data.href}
      className="relative block rounded-xl overflow-hidden h-[120px] transition-all duration-300 hover:scale-[1.02] group"
      style={{ background: data.bgColor }}
    >
      {/* Background Image */}
      {data.frontImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={data.frontImage}
            alt=""
            fill
            className="object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            unoptimized
          />
          {/* Gradient overlay for text readability */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(90deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.3) 70%, transparent 100%)` 
            }}
          />
        </div>
      )}
      
      {/* Hover glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1]"
        style={{ 
          background: `radial-gradient(circle at 100% 50%, ${data.accentColor}15 0%, transparent 50%)` 
        }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 p-4 z-10 flex flex-col justify-between h-full">
        <div className="max-w-[75%]">
          <h3 className="text-white font-bold text-sm mb-1 drop-shadow-lg">{data.title}</h3>
          <p className="text-white/80 text-xs line-clamp-2 drop-shadow-md">{data.desc}</p>
        </div>
        
        <div className="flex items-center">
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm"
            style={{ background: `${data.accentColor}40` }}
          >
            <ArrowRight className="w-3.5 h-3.5" style={{ color: data.accentColor }} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function PromoBanners() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Top Section: Carousel + Side Banner */}
      <div className="flex flex-col lg:flex-row gap-4 h-[200px] lg:h-[240px]">
        {/* Carousel */}
        <div className="flex-1 relative rounded-xl overflow-hidden w-full lg:w-[65%]">
          <Carousel
            setApi={setApi}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full -ml-0">
              {carouselItems.map((item) => (
                <CarouselItem key={item.id} className="h-full pl-0">
                  <BannerItem 
                    data={item} 
                    className="w-full h-[200px] lg:h-[240px]" 
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    current === index + 1 
                      ? "w-8 bg-[#74ff52]" 
                      : "w-4 bg-white/30 hover:bg-white/50"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* Side Banner */}
        <div className="hidden lg:block w-[35%]">
          <BannerItem data={sideBanner} className="h-full w-full" />
        </div>
      </div>

      {/* Bottom Section: Action Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actionItems.map((item) => (
          <ActionItem key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}
