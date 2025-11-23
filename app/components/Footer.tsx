import Image from "next/image";
import Link from "next/link";

const solutionsLinks = [
  { href: "/pricing", text: "Pricing" },
  { href: "/blog", text: "Blog" },
  { href: "https://documenter.getpostman.com/view/36975521/2sA3kPo4BR", text: "API" },
  { href: "/affiliates", text: "Become an Affiliate" },
];

const productsLinks = [
  { href: "/reviews", text: "Hexwave Reviews" },
  { href: "/tiktok-script-generator", text: "TikTok Script Generator" },
  { href: "/youtube-short-script-generator", text: "Youtube Shorts Script Generator" },
  { href: "/ai-script-generator", text: "AI Script Generator" },
  { href: "/video-script-generator", text: "Video Script Generator" },
  { href: "/tiktok-video-finder", text: "Search TikTok Videos" },
  { href: "/caption-generator/instagram-caption-generator", text: "Instagram Caption Generator" },
  { href: "/caption-generator/tiktok-caption-generator", text: "TikTok Caption Generator" },
  { href: "/caption-generator/youtube-description-generator", text: "Youtube Description Generator" },
  { href: "/caption-generator/youtube-title-generator", text: "Youtube Title Generator" },
  { href: "/make", text: "Image & Video Generators" },
  { href: "/viral-rankings", text: "Viral Video Rankings" },
  { href: "/viral-rankings/most-viewed-youtube-short", text: "Most Viewed YouTube Shorts" },
  { href: "/viral-rankings/most-liked-tiktok", text: "Most Liked TikToks" },
];

const freeToolsLinks1 = [
  { href: "/tools/ai-tiktok-video-generator", text: "AI TikTok Video Generator" },
  { href: "/tools/caption-generator", text: "Add Caption to Video" },
  { href: "/tools/pdf-to-brainrot", text: "PDF to Brainrot" },
  { href: "/tools/text-to-brainrot", text: "Text to Brainrot" },
  { href: "/tools/youtube-clip-maker", text: "YouTube Clip Maker" },
  { href: "/tools/talking-avatar", text: "AI Talking Avatar" },
  { href: "/tools/video-podcast-generator", text: "Video Podcast Generator" },
  { href: "/tools/ai-movie-maker", text: "AI Movie Maker" },
  { href: "/tools/ai-cinematic-video", text: "Cinematic Videos" },
  { href: "/tools/audio-to-video", text: "Audio to Video" },
  { href: "/tools/ai-music-video-generator", text: "AI Music Video Generator" },
  { href: "/tools/ai-lyrics-video-generator", text: "AI Lyrics Video Generator" },
  { href: "/tools/instrumental-music-to-video", text: "Instrumental Music Visualizer" },
  { href: "/tools/create-cartoon-video", text: "Create Cartoon Video" },
  { href: "/tools/create-video-quiz", text: "Create Video Quiz" },
  { href: "/tools/twitter-video-tool", text: "Tweet / 𝕏 to Video" },
  { href: "/tools/ai-ad-generator", text: "AI Ad Generator" },
  { href: "/tools/ugc-ad-generator", text: "UGC Ad Generator" },
];

const freeToolsLinks2 = [
  { href: "/tools/minecraft-parkour-video", text: "Create Minecraft Parkour Video" },
  { href: "/tools/ai-video-generator", text: "AI Video Generator" },
  { href: "/tools/ai-anime-video-generator", text: "Anime Video Generator" },
  { href: "/tools/pixar-ai", text: "Disney Pixar Video Generator" },
  { href: "/tools/ai-celebrity-video-generator", text: "AI Celebrity Video Generator" },
  { href: "/tools/ai-video-presentation-maker", text: "AI Video Presentation Maker" },
  { href: "/tools/pov-video-generator", text: "Create POV Videos" },
  { href: "/tools/veo3-video-generator", text: "Veo3 AI Video Generator" },
  { href: "/tools/sora2-video-generator", text: "Sora 2 AI Video Generator Online" },
  { href: "/tools/street-interview-video-generator", text: "Street Interview Video Generator" },
  { href: "/tools/asmr-video-generator", text: "ASMR Generator" },
  { href: "/tools/ai-superhero-generator", text: "AI Superhero Video Generator" },
  { href: "/tools/ai-news-video-generator", text: "AI News Video Generator" },
  { href: "/tools/ai-animal-video-generator", text: "AI Animal Video Generator" },
  { href: "/tools/snapchat-selfie-video-generator", text: "Snapchat Selfie Video Generator" },
  { href: "/tools/prompt-to-video", text: "Prompt to Video" },
  { href: "/tools/talking-baby-ai-generator", text: "Talking Baby AI Generator" },
  { href: "/tools/baby-vlog-video-generator", text: "Baby Vlog Video Generator" },
];

export default function Footer() {
  return (
    <footer className="content-visibility-auto font-inter bg-[#15171A] dark:bg-gray-950 border-t border-[#252629] dark:border-gray-800 w-full">
      <section className="mx-auto max-w-screen-2xl py-16 px-4 sm:px-6 md:px-16 text-sm space-y-8">
        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-0 lg:grid-cols-6 *:text-[#A8A9B0] dark:*:text-gray-400 mb-16">
          {/* Solutions & Products */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-col space-y-4">
              <h3 className="text-[#feffff] dark:text-gray-100 font-semibold mb-2 text-base">Solutions</h3>
              {solutionsLinks.map((link, index) => (
                <span
                  key={index}
                  className="hover:text-slate-200 dark:hover:text-gray-200 cursor-default"
                >
                  {link.text}
                </span>
              ))}
              <h3 className="text-[#feffff] dark:text-gray-100 font-semibold pt-4 pb-2 text-base">Products</h3>
              {productsLinks.map((link, index) => (
                <span key={index} className="hover:text-slate-200 dark:hover:text-gray-200 cursor-default">
                  {link.text}
                </span>
              ))}
            </div>
          </div>

          {/* Free AI Video Tools Column 1 */}
          <div className="lg:col-span-2 flex flex-col space-y-4 items-start">
            <h3 className="text-[#feffff] dark:text-gray-100 font-semibold mb-2 text-base">
              <span className="cursor-default">Free AI Video Tools</span>
            </h3>
            {freeToolsLinks1.map((link, index) => (
              <span key={index} className="hover:text-slate-200 dark:hover:text-gray-200 cursor-default">
                {link.text}
              </span>
            ))}
          </div>

          {/* Free AI Video Tools Column 2 */}
          <div className="lg:col-span-2 flex flex-col space-y-4 items-start">
            {freeToolsLinks2.map((link, index) => (
              <span key={index} className="hover:text-slate-200 dark:hover:text-gray-200 cursor-default">
                {link.text}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-tr from-white/0 from-25% via-white/25 dark:via-gray-500/25 to-white/0 to-75%"></div>

        {/* Bottom Section */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center">
          <div className="md:mt-0 mt-8 flex items-center gap-8">
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
            <p className="text-neutral-dark dark:text-gray-400">
              Made with 💚
              <span className="underline ml-1 cursor-default">Tibo</span>
            </p>
          </div>
          <div className="*:text-[#BEFFD6] dark:*:text-green-400 *:underline *:underline-offset-2 space-x-3">
            <span className="cursor-default">Terms of Service</span>
            <span className="cursor-default">Privacy Policy</span>
          </div>
        </div>
      </section>
    </footer>
  );
}

