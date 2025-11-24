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
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/app/components/ui/carousel";
import { carouselItems, sideBanner, actionItems } from "@/constants/explore/promoBanners";

const BannerItem = ({ data, className }: { data: any, className?: string }) => (
  <Link
    href={data.href}
    target="_blank"
    className={`relative block rounded-xl overflow-hidden transition-transform hover:scale-[1.01] ${className}`}
    style={{ background: data.bgColor }}
  >
    {data.bgImage && (
      <Image
        src={data.bgImage}
        alt="Background"
        fill
        className="object-cover"
        unoptimized
      />
    )}
    {data.frontImage && (
      <div className="absolute inset-0 z-10">
        <Image
          src={data.frontImage}
          alt="Front content"
          fill
          className="object-contain object-left"
          unoptimized
        />
      </div>
    )}
  </Link>
);

const ActionItem = ({ data }: { data: any }) => (
  <Link
    href={data.href}
    target="_blank"
    className="relative block rounded-xl overflow-hidden h-[120px] transition-transform hover:scale-[1.02]"
    style={{ background: data.bgColor }}
  >
    <div className="absolute inset-0 p-4 z-20 flex flex-col justify-between h-full bg-gradient-to-r from-black/60 to-transparent/10">
      <div>
        <h3 className="text-white font-bold text-sm mb-1">{data.title}</h3>
        <p className="text-white/90 text-xs line-clamp-2 font-medium">{data.desc}</p>
      </div>
      <div className="self-start">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
    {data.image && (
      <div className="absolute right-0 top-0 bottom-0 w-3/5">
        <Image
          src={data.image}
          alt={data.title}
          fill
          className="object-cover object-right"
          unoptimized
        />
      </div>
    )}
  </Link>
);

export default function PromoBanners() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Top Section: Carousel + Side Banner */}
      <div className="flex flex-col lg:flex-row gap-4 h-[180px] lg:h-[240px]">
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
                  className={`h-1 rounded-full transition-all duration-300 ${
                    current === index + 1 ? "w-8 bg-white" : "w-4 bg-white/40"
                  }`}
                  onClick={() => api?.scrollTo(index)}
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

