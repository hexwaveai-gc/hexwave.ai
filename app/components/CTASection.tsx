import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

const leftMarquees = [
  {
    image: "/images/purple-right-neon-line.svg",
    duration: "10s",
    delay: "5s",
    className: "rotate-180",
  },
  {
    image: "/images/green-left-neon-line.svg",
    duration: "12s",
    delay: "0s",
    className: "",
  },
  {
    image: "/images/blue-left-neon-line.svg",
    duration: "9s",
    delay: "2s",
    className: "w-1/2 object-right",
  },
];

const rightMarquees = [
  {
    image: "/images/blue-right-neon-line.svg",
    duration: "9s",
    delay: "2s",
    className: "w-1/2 object-right",
  },
  {
    image: "/images/green-right-neon-line.svg",
    duration: "12s",
    delay: "0s",
    className: "",
  },
  {
    image: "/images/purple-right-neon-line.svg",
    duration: "10s",
    delay: "5s",
    className: "",
  },
];

const MarqueeItem = ({
  image,
  duration,
  delay,
  direction,
  className,
}: {
  image: string;
  duration: string;
  delay: string;
  direction: "normal" | "reverse";
  className?: string;
}) => {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div
        className="inline-flex"
        style={{
          animation: `marquee-${direction} ${duration} linear infinite`,
          animationDelay: delay,
        }}
      >
        <div className="flex">
          <Image
            src={image}
            alt="decorative line"
            width={500}
            height={300}
            className={`mx-auto aspect-auto rounded-t-xl object-cover object-center ${className}`}
            loading="lazy"
          />
          <Image
            src={image}
            alt="decorative line"
            width={500}
            height={300}
            className={`mx-auto aspect-auto rounded-t-xl object-cover object-center ${className}`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default function CTASection() {
  return (
    <section className="content-visibility-auto overflow-visible font-inter text-neutral-dark mt-24 relative -left-[10%] lg:-left-16 flex w-[120%] lg:w-[110%] justify-center items-center mx-auto">
      {/* Left Marquee */}
      <div className="relative w-[10%] lg:w-[50%] mr-auto space-y-2">
        {leftMarquees.map((marquee, index) => (
          <div key={index} className="overflow-hidden">
            <MarqueeItem
              image={marquee.image}
              duration={marquee.duration}
              delay={marquee.delay}
              direction="reverse"
              className={marquee.className}
            />
          </div>
        ))}
      </div>

      {/* Center Content */}
      <div className="space-y-5 py-4 flex flex-col items-center w-[80%] lg:w-full border-x border-[#1a1b1e]">
        <h2 className="bg-gradient-to-b from-white to-[#999999] bg-clip-text text-transparent font-euclid text-3xl lg:text-4xl xl:text-5xl text-center w-11/12 max-w-3xl text-pretty mx-auto">
          Your Stories Deserve More Views
        </h2>
        <p className="text-center w-[95%] mx-auto text-balance text-[#BEC0C7]">
          Over 240,900 creators are already turning their ideas into videos that actually get noticed - and they're doing it in minutes, not hours.
        </p>
        <p className="text-center w-[95%] mx-auto text-balance text-[#BEC0C7]">
          Join them today!
        </p>
        <div className="flex flex-col gap-2 items-center">
          <div className="text-[rgb(16,18,21)] w-fit lg:mx-0">
            <Button variant="tf-primary">
              Coming Soon
            </Button>
          </div>
          <div className="text-white/60 text-xs italic">No credit card required</div>
        </div>
      </div>

      {/* Right Marquee */}
      <div className="relative w-[10%] lg:w-[50%] ml-auto space-y-2">
        {rightMarquees.map((marquee, index) => (
          <div key={index} className="overflow-hidden">
            <MarqueeItem
              image={marquee.image}
              duration={marquee.duration}
              delay={marquee.delay}
              direction="normal"
              className={marquee.className}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

