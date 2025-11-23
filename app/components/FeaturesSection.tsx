import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

const showcaseVideos = [
  {
    src: "https://cdn.revid.ai/static/alliance-in-the-canopy.mp4",
    poster: "https://cdn.revid.ai/static/space-exploration.webp",
    className: "bg-white outline w-1/2 md:max-w-[500px] absolute hidden sm:block sm:-left-1/4 md:right-1/4 mx-auto outline-[6px] outline-[#636363]/25 rounded-xl object-cover",
  },
  {
    src: "https://cdn.revid.ai/static/Flicker%20in%20the%20Shadows.mp4",
    poster: "https://cdn.revid.ai/static/boy-and-dog.webp",
    className: "bg-white outline w-11/12 md:w-3/4 md:max-w-[380px] relative z-10 mx-auto outline-[6px] outline-[#636363]/25 rounded-xl object-cover",
  },
  {
    src: "https://cdn.revid.ai/static/Rivalry%20in%20the%20City.mp4",
    poster: "https://cdn.revid.ai/static/men-scuffle.webp",
    className: "bg-white outline w-1/2 md:max-w-[500px] absolute hidden sm:block sm:-right-1/4 md:left-1/4 -z-0 mx-auto outline-[6px] outline-[#636363]/25 rounded-xl object-cover",
  },
];

const features = [
  {
    image: "/images/ai-script-generator.webp",
    alt: "easy to use",
    title: "AI Script Generator",
    description: "Write or get video script automatically. You don't have to be perfect to get amazing results.",
    colSpan: "",
  },
  {
    image: "/images/unique-voices.webp",
    alt: "unique voices",
    title: "50+ Unique Voices",
    description: "Pick one of the male and female voices that resonate with your audience.",
    colSpan: "",
  },
  {
    image: "/images/video-styles.webp",
    alt: "video styles and templates",
    title: "Video Styles & Templates",
    description: "Whether you need a TikTok, YouTube Clip, or an AI-generated talking avatar, all you have to do is select an option.",
    colSpan: "col-span-2",
  },
  {
    image: "/images/super-simple-editor.webp",
    alt: "super simple editor",
    title: "Super-Simple Editor",
    description: "Get the look you want with an intuitive editor designed for simplicity. No complex tools-just quick, easy edits that let your creativity shine through.",
    colSpan: "col-span-2",
  },
  {
    image: "/images/high-quality.webp",
    alt: "high quality",
    title: "High-Quality - Forever Yours",
    description: "Your exports are crisp, clear, and entirely yours. Keep your videos forever, even if you part ways with us.",
    colSpan: "",
  },
];

export default function FeaturesSection() {
  return (
    <div className="content-visibility-auto text-[#bec0c7] dark:text-gray-400 rounded-3xl px-4 sm:px-6 md:px-8 border border-[#252629] dark:border-gray-800 bg-[#15171A] dark:bg-gray-900 w-full mt-4">
      <div className="relative !-z-30 rounded-b-3xl py-12 space-y-8 border border-t-0 border-white/10 dark:border-gray-800">
        {/* Badge */}
        <div className="bg-[#1a1c1f] dark:bg-gray-800 flex items-center space-x-1 py-1.5 px-3.5 mx-auto text-green-200 dark:text-green-300 border border-[#252629] dark:border-gray-700 w-fit font-medium text-sm rounded-lg p-[1.5px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.33398 13H14.0007"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.33398 8.33337H14.0007"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.33398 3.66663H14.0007"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 3.66671L2.66667 4.33337L4.66667 2.33337"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 8.33333L2.66667 9L4.66667 7"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 13L2.66667 13.6666L4.66667 11.6666"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-inter">What to Expect</span>
        </div>

        {/* Title */}
        <h2 className="bg-gradient-to-b from-white dark:from-gray-100 to-[#999999] dark:to-gray-500 bg-clip-text text-transparent font-euclid text-3xl lg:text-4xl xl:text-5xl text-center w-11/12 max-w-3xl text-balance mx-auto !leading-tight">
          Everything You Need to Create Amazing Videos
        </h2>

        {/* Description */}
        <p className="text-center w-[90%] max-w-xl mx-auto dark:text-gray-400">
          We've cracked the code to viral content and we'll hand you all the tools to make it happen in minutes.
        </p>
      </div>

      {/* Video Showcase */}
      <div>
        <div className="space-y-12 py-12 lg:py-12">
          <div className="flex justify-center items-center relative w-5/6 mx-auto">
            {showcaseVideos.map((video, index) => (
              <div key={index} className={video.className}>
                <video
                  className="bg-white shadow-2xl rounded-[10px] object-cover w-full h-full"
                  poster={video.poster}
                  preload="none"
                  loop
                  playsInline
                  muted={index === 1}
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              </div>
            ))}
            <div className="absolute bg-gradient-to-b from-[#BEFFD6] to-[#92DAFF] blur-[125px] w-[35%] h-[45%] mb-6 -z-10"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="my-12 mb-28 gap-4 grid md:grid-cols-2 lg:grid-cols-4 font-inter">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-4 bg-[#FFFFFF05] dark:bg-gray-800/50 border border-[#252629] dark:border-gray-700 rounded-2xl ${feature.colSpan}`}
            >
              <div className="relative w-full">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  width={500}
                  height={300}
                  className="mx-auto aspect-auto rounded-t-xl object-cover object-center w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="space-y-3 pt-5">
                <h5 className="text-white dark:text-gray-100 font-medium">{feature.title}</h5>
                <p className="text-sm dark:text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}

          {/* "And more" card */}
          <div className="relative flex items-center justify-center w-full h-full m-auto text-white dark:text-gray-100 p-4 bg-[#FFFFFF05] dark:bg-gray-800/50 border border-[#252629] dark:border-gray-700 rounded-2xl">
            <span className="text-center">...and more!</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-x rounded-t-3xl border-white/10 dark:border-gray-800 mx-auto flex flex-col items-center space-y-5 py-12 lg:py-28">
          <div className="flex items-center gap-2">
            <Image
              src="/logo/hexwave.png"
              alt="Hexwave logo"
              width={30}
              height={30}
              className="w-auto h-auto"
              loading="lazy"
            />
            <span className="text-white dark:text-gray-100 font-medium text-xl">Hexwave</span>
          </div>
          <p className="text-neutral-dark dark:text-gray-400 max-w-lg w-[95%] mx-auto text-center text-pretty font-inter">
            Your shortcut to effortless video storytelling
          </p>
          <div className="flex flex-col gap-2 items-start justify-start">
            <div className="text-[rgb(16,18,21)] w-fit lg:mx-0">
              <Button variant="tf-primary">
                Coming Soon
              </Button>
            </div>
            {/* <div className="text-white/60 text-xs italic hidden">No credit card required</div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

