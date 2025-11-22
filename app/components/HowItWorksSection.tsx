import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

const steps = [
  {
    number: "1",
    title: "Get inspired by viral content",
    description:
      "Looking for story ideas? Our AI finds trending content and helps you remake it into your very own videos - no more trial and error.",
    image: "/images/get-inspired-by-viral-content.webp",
    imageAlt: "Get inspired by viral content",
    bulletPoints: [
      "See what types of stories are working right now",
      "Get inspiration from successful creators",
      "Turn your ideas into stories people want to hear",
    ],
    imageOrder: "last",
  },
  {
    number: "2",
    title: "Storytelling to Hook your Audience",
    description:
      "Hexwave understands what makes videos go viral and uses the same proven methods to write scripts for you.",
    image: "/images/generate-your-script.webp",
    imageAlt: "Storytelling to Hook your Audience",
    bulletPoints: [
      "Write your script or tell our AI what you want to talk about",
      "The AI will find relevant content to get inspired by",
      "Drop any link and it will be automatically parsed and formatted for a video",
    ],
    imageOrder: "first",
  },
  {
    number: "3",
    title: "Videos You'd LOVE to Watch",
    description: "Create perfect videos, share instantly, and grow your business.",
    image: "/images/create-your-viral-video.webp",
    imageAlt: "Videos You'd LOVE to Watch",
    bulletPoints: [
      "Watch your words become a professional video",
      "Set up automatic video creation from your content",
    ],
    imageOrder: "last",
  },
  {
    number: "4",
    title: "Publish on TikTok, YouTube, Instagram and more...",
    description:
      "Reach a wider audience by sharing your video across your favorite social media platforms",
    image: "/images/publish-on-tiktok.webp",
    imageAlt: "Publish on TikTok, YouTube, Instagram and more...",
    bulletPoints: [],
    imageOrder: "first",
    video: {
      src: "https://cdn.revid.ai/static/The%20Goddess%20of%20Flowers_%20Dance.mp4",
      poster: "https://cdn.revid.ai/static/Flower%20Queen.webp",
    },
  },
];

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.99935 18.3334C14.5827 18.3334 18.3327 14.5834 18.3327 10C18.3327 5.41669 14.5827 1.66669 9.99935 1.66669C5.41602 1.66669 1.66602 5.41669 1.66602 10C1.66602 14.5834 5.41602 18.3334 9.99935 18.3334Z"
      stroke="#a0ffd7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.45898 10L8.81732 12.3583L13.5423 7.64166"
      stroke="#a0ffd7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="content-visibility-auto scroll-m-20 w-full mt-24 space-y-8"
    >
      <div className="space-y-4 mb-14">
        {/* Badge */}
        <div className="bg-[#1a1c1f] flex items-center space-x-1 py-1.5 px-3.5 mx-auto text-green-200 border border-[#252629] w-fit font-medium text-sm rounded-lg p-[1.5px]">
          <svg
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 10C9.60457 10 10.5 9.10457 10.5 8C10.5 6.89543 9.60457 6 8.5 6C7.39543 6 6.5 6.89543 6.5 8C6.5 9.10457 7.39543 10 8.5 10Z"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.83398 8.58679V7.41345C1.83398 6.72012 2.40065 6.14679 3.10065 6.14679C4.30732 6.14679 4.80065 5.29345 4.19398 4.24679C3.84732 3.64679 4.05398 2.86679 4.66065 2.52012L5.81398 1.86012C6.34065 1.54679 7.02065 1.73345 7.33398 2.26012L7.40732 2.38679C8.00732 3.43345 8.99398 3.43345 9.60065 2.38679L9.67398 2.26012C9.98732 1.73345 10.6673 1.54679 11.194 1.86012L12.3473 2.52012C12.954 2.86679 13.1607 3.64679 12.814 4.24679C12.2073 5.29345 12.7007 6.14679 13.9073 6.14679C14.6007 6.14679 15.174 6.71345 15.174 7.41345V8.58679C15.174 9.28012 14.6073 9.85345 13.9073 9.85345C12.7007 9.85345 12.2073 10.7068 12.814 11.7535C13.1607 12.3601 12.954 13.1335 12.3473 13.4801L11.194 14.1401C10.6673 14.4535 9.98732 14.2668 9.67398 13.7401L9.60065 13.6135C9.00065 12.5668 8.01398 12.5668 7.40732 13.6135L7.33398 13.7401C7.02065 14.2668 6.34065 14.4535 5.81398 14.1401L4.66065 13.4801C4.05398 13.1335 3.84732 12.3535 4.19398 11.7535C4.80065 10.7068 4.30732 9.85345 3.10065 9.85345C2.40065 9.85345 1.83398 9.28012 1.83398 8.58679Z"
              stroke="#BEFFD6"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">How it works</span>
        </div>

        {/* Title */}
        <h2 className="bg-gradient-to-b from-white to-[#999999] bg-clip-text text-transparent font-euclid text-3xl lg:text-4xl xl:text-5xl text-center w-11/12 max-w-3xl text-pretty mx-auto !leading-tight">
          Four Easy Steps To Create &amp; Share Your Story
        </h2>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="font-inter">
            <div className="grid lg:grid-cols-11 gap-4">
              {/* Content Card */}
              <div
                className={`flex flex-col justify-between lg:col-span-5 lg:h-full rounded-3xl bg-[#ffffff06] border border-[#252629] p-10 sm:p-6 lg:p-10 my-auto ${
                  step.imageOrder === "first" ? "lg:order-last" : ""
                }`}
              >
                {/* Number Badge */}
                <div className="flex items-center justify-center size-24 rounded-3xl border-2 border-white/5 bg-[#0f1114]">
                  <span className="bg-gradient-to-b from-white to-[#999999] bg-clip-text text-transparent font-euclid text-4xl lg:text-6xl xl:text-7xl text-center max-w-3xl mx-auto">
                    {step.number}
                  </span>
                </div>

                <div>
                  <h4 className="capitalize pt-10 bg-gradient-to-b from-white to-[#999999] bg-clip-text text-transparent font-euclid text-2xl lg:text-3xl">
                    {step.title}
                  </h4>
                  <p className="text-[#BEC0C7] py-4">{step.description}</p>

                  {/* Bullet Points */}
                  {step.bulletPoints.length > 0 && (
                    <ul className="*:flex *:items-start *:space-x-3 space-y-5 mt-2 lg:space-y-3 *:text-[#eafff2] *:text-md">
                      {step.bulletPoints.map((point, pointIndex) => (
                        <li key={pointIndex}>
                          <div className="min-w-5 min-h-5">
                            <CheckIcon />
                          </div>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Image Card */}
              <div className="overflow-hidden lg:col-span-6 rounded-3xl bg-[#ffffff06] border border-[#252629] p-1.5">
                <div className="overflow-hidden relative h-80 sm:h-96 lg:h-full w-full">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    width={703}
                    height={490}
                    className="h-full w-full object-cover rounded-2xl"
                    loading="lazy"
                    fetchPriority="low"
                  />
                  {/* Video overlay for step 4 */}
                  {step.video && (
                    <>
                      <div className="z-10 rounded-xl w-1/3 absolute -bottom-32 mx-auto right-0 left-0 bg-gradient-to-b from-transparent to-gray-950">
                        <div className="opacity-0">
                          <video
                            className="bg-white shadow-2xl rounded-[10px] object-cover w-full h-full"
                            poster={step.video.poster}
                            preload="none"
                            muted
                            loop
                            playsInline
                          >
                            <source src={step.video.src} type="video/mp4" />
                          </video>
                        </div>
                      </div>
                      <div className="z-0 rounded-xl w-1/3 absolute -bottom-32 mx-auto right-0 left-0">
                        <video
                          className="bg-white shadow-2xl rounded-[10px] object-cover w-full h-full"
                          poster={step.video.poster}
                          preload="none"
                          muted
                          loop
                          playsInline
                        >
                          <source src={step.video.src} type="video/mp4" />
                        </video>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mx-auto flex flex-col items-center space-y-4 py-8">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/hexwave.png"
            alt="Hexwave logo"
            width={30}
            height={30}
            className="w-auto h-auto"
            loading="lazy"
          />
          <span className="text-white font-medium text-xl">Hexwave</span>
        </div>
        <p className="text-neutral-dark font-inter">
          Your shortcut to effortless video storytelling.
        </p>
        <div className="flex flex-col gap-2 items-start justify-start">
          <div className="text-[rgb(16,18,21)] w-fit lg:mx-0">
            <Button variant="tf-primary">
              Coming Soon
            </Button>
          </div>
          <div className="text-white/60 text-xs italic hidden">No credit card required</div>
        </div>
      </div>
    </section>
  );
}

