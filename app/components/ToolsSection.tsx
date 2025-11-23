import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function ToolsSection() {
  return (
    <article className="mt-4 content-visibility-auto relative text-[#BEC0C7] dark:text-gray-400 rounded-3xl px-4 sm:px-6 md:px-8 border border-[#252629] dark:border-gray-800 w-full bg-[#15171a] dark:bg-gray-900 mb-4">
      <div className="w-full relative border-x border-white/10 dark:border-gray-800">
        {/* Decorative dots */}
        <div className="absolute z-0 w-full h-full grid lg:grid-cols-2 gap-8 items-center">
          <section className="z-0 absolute w-full h-full col-span-2 grid grid-cols-2 place-content-between">
            <div className="bg-[#ffffff50] dark:bg-gray-500 rounded-full w-1 h-1 my-4 sm:my-6 md:my-8 outline outline-8 outline-[#15171A] dark:outline-gray-900 -mx-[2.5px]"></div>
            <div className="bg-[#ffffff50] dark:bg-gray-500 rounded-full w-1 h-1 my-4 sm:my-6 md:my-8 outline outline-8 outline-[#15171A] dark:outline-gray-900 -mx-[2px] place-self-end"></div>
            <div className="bg-[#ffffff50] dark:bg-gray-500 rounded-full w-1 h-1 my-4 sm:my-6 md:my-8 outline outline-8 outline-[#15171A] dark:outline-gray-900 -mx-[2.5px]"></div>
            <div className="bg-[#ffffff50] dark:bg-gray-500 rounded-full w-1 h-1 my-4 sm:my-6 md:my-8 outline outline-8 outline-[#15171A] dark:outline-gray-900 -mx-[2px] place-self-end"></div>
          </section>
        </div>

        <div className="relative z-20 mx-auto py-12 lg:py-24">
          <div className="space-y-4">
            {/* Badge */}
            <div className="mx-auto text-green-200 dark:text-green-300 border border-[#252629] dark:border-gray-700 w-fit font-medium text-sm rounded-lg p-[1.5px]">
              <div className="bg-[#15171a]/50 dark:bg-gray-800/50 flex items-center space-x-1 py-1 px-2 rounded-full">
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.85398 13.6134H4.64065C2.53398 13.6134 1.83398 12.2134 1.83398 10.8067V5.19339C1.83398 3.08672 2.53398 2.38672 4.64065 2.38672H8.85398C10.9607 2.38672 11.6607 3.08672 11.6607 5.19339V10.8067C11.6607 12.9134 10.954 13.6134 8.85398 13.6134Z"
                    stroke="#BEFFD6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.5135 11.4001L11.6602 10.1001V5.89342L13.5135 4.59342C14.4202 3.96009 15.1668 4.34675 15.1668 5.46009V10.5401C15.1668 11.6534 14.4202 12.0401 13.5135 11.4001Z"
                    stroke="#BEFFD6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.16602 7.3335C8.7183 7.3335 9.16602 6.88578 9.16602 6.3335C9.16602 5.78121 8.7183 5.3335 8.16602 5.3335C7.61373 5.3335 7.16602 5.78121 7.16602 6.3335C7.16602 6.88578 7.61373 7.3335 8.16602 7.3335Z"
                    stroke="#BEFFD6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">Tools</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-white dark:text-gray-100 font-euclid text-3xl lg:text-4xl xl:text-5xl text-center w-11/12 max-w-3xl text-pretty mx-auto">
              <span className="cursor-default">Free AI Video Tools</span>
            </h2>

            {/* Description */}
            <p className="text-center w-[90%] max-w-lg mx-auto text-pretty dark:text-gray-400">
              Pick the right tool, provide your input, and you'll create a video in no time - customize it however you want.
            </p>
          </div>

          {/* Tools Grid Placeholder */}
          <div className="diagonal-pattern w-full border-y border-[#ffffff10] dark:border-gray-800 my-12">
            <div className="*:p-2 *:bg-transparent *:h-full border-x border-[#ffffff10] dark:border-gray-800 bg-[#15171a] dark:bg-gray-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-[90%] md:w-[85%] lg:w-[75%] sm:divide-x divide-y divide-[#ffffff10] dark:divide-gray-800 mx-auto">
              {/* Tools grid content would go here */}
            </div>
          </div>

          {/* CTA Button */}
          <Button variant="tf-secondary" className="font-normal flex items-center mx-auto w-fit text-sm">
            See all tools
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2"
            >
              <path
                d="M9.61914 4.45312L13.6658 8.49979L9.61914 12.5465"
                stroke="white"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.33398 8.5H13.554"
                stroke="white"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>
    </article>
  );
}

