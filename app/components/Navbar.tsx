"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="max-w-screen-2xl box-border bg-opacity-0 z-[99] absolute px-4 md:px-16 lg:px-20 top-0 w-full flex justify-center">
      <div className="relative w-full px-4 flex items-center justify-between" style={{ height: "96px" }}>
        <div className="flex items-center gap-2 cursor-default">
          <Image
            alt="Hexwave logo"
            src="/logo/hexwave.png"
            width={30}
            height={30}
            className="w-auto h-auto"
            priority
          />
          <span className="text-white font-medium text-xl">Hexwave</span>
        </div>

        <div id="navbar" className="flex items-center justify-end gap-3">
          {/* Navigation Links */}
          <div
            id="navlinks"
            className={`text-[#BEC0C7] text-base font-medium ${
              isMenuOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible -translate-y-4 opacity-0"
            } absolute top-full left-0 z-20 w-full origin-top-right bg-[#101215] flex-col flex-wrap justify-end gap-6 p-6 shadow-2xl shadow-gray-600/10 transition-all duration-300 lg:visible lg:relative lg:flex lg:w-auto lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none`}
          >
            <div className="lg:pr-4 lg:ml-8">
              <ul className="divide-y lg:divide-y-0 divide-white/5 gap-8 *:py-4 lg:hover:*:bg-transparent lg:hover:*:pl-0 tracking-wide lg:flex lg:space-y-0 lg:text-sm lg:items-center">
                <li className="hover:bg-white/[0.06] hover:pl-2 hover:underline hover:underline-offset-4 decoration-gray-500 relative cursor-default">
                  <span>Community Creations</span>
                </li>
                <li className="hover:bg-white/[0.06] hover:pl-2 hover:underline hover:underline-offset-4 decoration-gray-500 relative cursor-default">
                  <span>Free AI Video Tools</span>
                </li>
                <li className="hover:bg-white/[0.06] hover:pl-2 hover:underline hover:underline-offset-4 decoration-gray-500 relative cursor-default">
                  <span>Blog</span>
                </li>
                <li>
                  <Button variant="tf-secondary" className="lg:flex">
                    Sign in
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            aria-label="hamburger"
            id="hamburger"
            className="relative -mr-6 p-6 lg:hidden"
            onClick={toggleMenu}
          >
            <div
              aria-hidden="true"
              className={`m-auto h-0.5 w-5 rounded transition duration-300 bg-gray-100 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></div>
            <div
              aria-hidden="true"
              className={`m-auto mt-1.5 h-0.5 w-5 rounded transition duration-300 bg-gray-100 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
}

