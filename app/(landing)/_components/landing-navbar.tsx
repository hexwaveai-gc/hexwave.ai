"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

const navLinks = [
  {
    label: "Tools",
    href: "/tools",
    submenu: [
      { label: "Image Generator", href: "/image-generator" },
      { label: "Video Generator", href: "/ai-video-generator" },
      { label: "Talking Avatar", href: "/video-agent" },
      { label: "Audio Generator", href: "/audio" },
    ],
  },
  { label: "Explore", href: "/explore" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
];

export function LandingNavbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/logo/hexwave.png"
              alt="Hexwave.ai"
              width={36}
              height={36}
              className="w-9 h-9"
              style={{
                filter: "brightness(0) saturate(100%) invert(1)",
              }}
              priority
            />
            <span className="text-white font-semibold text-xl">
              Hexwave.ai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.submenu ? (
                  <>
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-white/70 hover:text-white transition-colors font-medium"
                      onMouseEnter={() => setOpenSubmenu(link.label)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Submenu */}
                    <div
                      className={`absolute top-full left-0 pt-2 transition-all duration-200 ${
                        openSubmenu === link.label
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                      onMouseEnter={() => setOpenSubmenu(link.label)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      <div className="bg-[#15171a] border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.label}
                            href={sublink.href}
                            className="block px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {sublink.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="px-4 py-2 text-white/70 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/tools"
                  className="px-5 py-2.5 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#9fff75] transition-all duration-300"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-5 py-2.5 text-white/80 hover:text-white font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <Link
                  href="/sign-up"
                  className="px-5 py-2.5 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#9fff75] transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[500px] pb-6" : "max-h-0"
          }`}
        >
          <div className="space-y-1 pt-4 border-t border-white/10">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.submenu ? (
                  <div>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openSubmenu === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        openSubmenu === link.label ? "max-h-[300px]" : "max-h-0"
                      }`}
                    >
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.label}
                          href={sublink.href}
                          className="block pl-8 pr-4 py-2.5 text-white/60 hover:text-white transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-4 py-3 text-white/70 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Auth */}
            <div className="pt-4 space-y-2">
              {isLoaded && isSignedIn ? (
                <Link
                  href="/tools"
                  className="block w-full px-4 py-3 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold text-center hover:bg-[#9fff75] transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="block w-full px-4 py-3 text-white/80 hover:text-white font-medium border border-white/10 rounded-xl transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <Link
                    href="/sign-up"
                    className="block w-full px-4 py-3 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold text-center hover:bg-[#9fff75] transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

