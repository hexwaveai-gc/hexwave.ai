"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How can Hexwave transform my content creation game?",
    answer:
      "Hexwave is your secret weapon for creating irresistible vertical videos in a snap. Our AI-powered platform analyzes millions of viral videos to craft scripts and generate stunning visuals that are optimized for maximum impact. Whether you're creating product demos, explainer videos, or social media ads, Hexwave helps you produce content that consistently captivates your audience and drives measurable results.",
    isOpen: true,
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time. You can do so by going to your account settings. And if you need help with anything, our (human) support team is here to assist you.",
    isOpen: false,
  },
  {
    question: "Do I own the content created?",
    answer:
      "Yes, 100%! You own all the content you create with Hexwave, forever. Every video, script, and asset generated through our platform belongs entirely to you. There are no hidden clauses or shared ownership - your creative work is yours to use, modify, and monetize as you see fit.",
    isOpen: false,
  },
  {
    question: "I'm not a video editing pro. Can I still use Hexwave?",
    answer:
      "Absolutely! Hexwave is designed with creators like you in mind. Our intuitive interface and AI-driven tools make it a breeze to produce professional-grade videos, even if you've never edited before. Simply input your text or link, and let our AI work its magic. It's like having a video editing genius at your fingertips! Most users master the basics in less than 5 minutes.",
    isOpen: false,
  },
  {
    question: "What kind of content can I create with Hexwave?",
    answer:
      "The possibilities are endless! Whether you want to repurpose a blog post, turn a podcast into a video, create a viral TikTok from scratch, or produce engaging product demos and explainer videos, Hexwave has you covered. Our AI can generate scripts from any text or URL, find the perfect viral hooks, and even create videos automatically from your favorite content sources. If you can dream it, Hexwave can help you create it.",
    isOpen: false,
  },
  {
    question: "How much control do I have over the AI-generated content?",
    answer:
      "While our AI is incredibly powerful, you always remain in the driver's seat. Hexwave provides a foundation of high-quality, engaging content that you can then customize to your heart's content. From adding a professional sounding voice-over and branding elements to fine-tuning the visuals and pacing, our platform empowers you to create videos that are authentically yours.",
    isOpen: false,
  },
  {
    question: "How can Hexwave help me grow my audience and business?",
    answer:
      "Hexwave is your partner in audience growth and business success. Our AI is trained on millions of viral videos, so it knows exactly what makes content irresistible. From attention-grabbing hooks to mesmerizing visuals, Hexwave helps you create videos that demand to be watched and shared. Our users have reported an average of 600% increase in video engagement, 200% monthly growth in their businesses, and a staggering 10,000+ videos created in just 8 minutes each. Rest assured, your content creation success is our #1 incentive.",
    isOpen: false,
  },
  {
    question: "What pricing plans do you offer, and what's included?",
    answer:
      "We offer several flexible subscription plans designed to fit businesses of all sizes. Our most popular plan starts at just $39/month and includes 2,000 credits, access to all premium features, and priority support. To know more about how credits are used, visit our blog post about this topic. All plans come with our AI video generation technology, ready to use tools, and commercial usage rights.",
    isOpen: false,
  },
  {
    question: "How does Hexwave compare to other video creation tools?",
    answer:
      "Unlike traditional video editors that require technical skills and hours of work, Hexwave uses advanced AI to do the heavy lifting for you. While other AI tools might generate basic videos, Hexwave creates content specifically optimized for engagement and conversions based on analyzing millions of high-performing videos. Our users typically save 10+ hours per week compared to traditional methods, and produce videos that outperform competitor tools by 3-5x in engagement metrics.",
    isOpen: false,
  },
  {
    question: "Is my data safe with Hexwave?",
    answer:
      "Absolutely. We take data privacy and security very seriously. Hexwave employs industry-standard encryption and security measures to protect your content and personal information. We never share your data with third parties without your explicit consent. With Hexwave, you can focus on creating amazing videos while we take care of keeping your data safe and sound.",
    isOpen: false,
  },
  {
    question: "How much time and effort can Hexwave save me?",
    answer:
      "Hexwave is like having a full video production team at your beck and call, 24/7. Our AI handles the heavy lifting, from researching viral trends to generating scripts and visuals. What used to take hours or even days can now be accomplished in minutes. And with our Automations feature, you can even set Hexwave to create videos for you on autopilot. It's the ultimate time-saver for busy creators who don't want to compromise on quality!",
    isOpen: false,
  },
  {
    question: "How does Hexwave stay ahead of the curve in video creation?",
    answer:
      "Our team of video experts and AI engineers are constantly pushing the boundaries of what's possible. We stay on top of the latest trends, platform updates, and best practices to ensure that Hexwave remains the cutting-edge tool for creating irresistible videos. As the digital landscape evolves, so does Hexwave, giving you a competitive edge in your content creation game.",
    isOpen: false,
  },
  {
    question: "What if I need help or have questions?",
    answer:
      "We're here for you every step of the way! Our friendly support team, made up of video experts and creators like you, is always ready to answer your questions, provide guidance, and help you get the most out of Hexwave. We offer live chat support during business hours.",
    isOpen: false,
  },
  {
    question: "What technical requirements do I need to use Hexwave?",
    answer:
      "Hexwave is a cloud-based platform that works in any modern web browser (Chrome, Firefox, Safari, Edge) without requiring any downloads or installations. All you need is a stable internet connection and a computer or tablet. For the best experience, we recommend a connection speed of at least 5 Mbps. Since all the processing happens on our powerful servers, you don't need a high-end device to create stunning videos.",
    isOpen: false,
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <article className="!pointer-events-none font-inter content-visibility-auto rounded-3xl px-4 sm:px-6 md:px-8 border border-[#252629] w-full bg-[#15171a]">
      <div className="w-full relative border-x border-[#ffffff10]">
        {/* Decorative dots */}
        <div className="absolute z-0 w-full h-full grid lg:grid-cols-2 gap-8 items-center">
          <section className="-z-0 absolute w-full h-full col-span-2 grid grid-cols-2 place-content-between">
            <div className="bg-[#ffffff50] rounded-full w-1 h-1 my-8 outline outline-8 outline-[#15171A] -mx-[2.5px]"></div>
            <div className="bg-[#ffffff50] rounded-full w-1 h-1 my-8 outline outline-8 outline-[#15171A] -mx-[2px] place-self-end"></div>
            <div className="bg-[#ffffff50] rounded-full w-1 h-1 my-8 outline outline-8 outline-[#15171A] -mx-[2.5px]"></div>
            <div className="bg-[#ffffff50] rounded-full w-1 h-1 my-8 outline outline-8 outline-[#15171A] -mx-[2px] place-self-end"></div>
          </section>
        </div>

        <div className="relative z-10 w-[95%] lg:w-2/3 mx-auto py-12 lg:py-24">
          <div className="space-y-4 mb-14">
            {/* Badge */}
            <div>
              <div className="bg-[#1a1c1f] flex items-center space-x-1 py-1.5 px-3.5 mx-auto text-green-200 border border-[#252629] w-fit font-medium text-sm rounded-lg p-[1.5px]">
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.834 12.2868H9.16732L6.20064 14.2601C5.76064 14.5535 5.16732 14.2402 5.16732 13.7068V12.2868C3.16732 12.2868 1.83398 10.9535 1.83398 8.95349V4.95345C1.83398 2.95345 3.16732 1.62012 5.16732 1.62012H11.834C13.834 1.62012 15.1673 2.95345 15.1673 4.95345V8.95349C15.1673 10.9535 13.834 12.2868 11.834 12.2868Z"
                    stroke="#BEFFD6"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.49923 7.57324V7.43327C8.49923 6.97993 8.77924 6.73992 9.05924 6.54659C9.33258 6.35992 9.60588 6.11993 9.60588 5.67993C9.60588 5.0666 9.11256 4.57324 8.49923 4.57324C7.88589 4.57324 7.39258 5.0666 7.39258 5.67993"
                    stroke="#BEFFD6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.49635 9.16634H8.50235"
                    stroke="#BEFFD6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-inter">FAQs</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-white font-euclid text-3xl lg:text-4xl xl:text-5xl text-center w-11/12 max-w-3xl text-pretty mx-auto">
              Frequently Asked Questions
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-[#1c1e21] rounded-2xl flex flex-col justify-center px-6 md:pt-10 space-y-2 transition-all py-4 lg:py-3 pointer-events-auto"
                >
                  <div
                    className="flex items-start justify-between lg:pt-2 cursor-pointer"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h5 className="faq-question font-inter text-white font-medium hover:cursor-pointer my-auto">
                      {faq.question}
                    </h5>
                    <div className="relative flex items-center justify-center h-fit">
                      <span
                        className={`cursor-pointer text-xl text-green-400 transition-all ${
                          isOpen ? "rotate-45" : "rotate-0"
                        }`}
                      >
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 256 256"
                          height="18"
                          width="18"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"></path>
                        </svg>
                      </span>
                      <span className="absolute blur-md bg-green-300/50 font-bold text-xs top-1/2 pointer-event-none h-2 w-2"></span>
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-neutral-dark font-inter text-sm transition-all duration-200 whitespace-pre-line overflow-hidden ${
                        isOpen ? "max-h-[20rem]" : "max-h-0"
                      }`}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center pointer-events-auto">
            <span
              className="inline-flex items-center space-x-2 bg-green-400/5 hover:bg-green-400/20 border border-green-400/30 hover:border-green-400/50 text-green-400 hover:text-green-300 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 group cursor-default"
            >
              <span>View Complete Help Center</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-neutral-dark text-xs mt-4">
              Find detailed answers to 100+ questions about features, tools, and workflows
            </p>
            <p className="text-neutral-dark text-xs mt-2">
              or check our{" "}
              <span className="text-green-400 hover:text-green-300 underline cursor-default">
                markdown version optimized for LLMs
              </span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

