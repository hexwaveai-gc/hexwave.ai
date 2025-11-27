"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Wrench,
  LogIn,
  Zap,
  User,
  LogOut,
  CreditCard,
  Coins,
  Settings,
  Receipt,
  UserCircle,
  HelpCircle,
  ChevronRight,
  X,
  BarChart3,
  LayoutTemplate,
  Bot,
  Mic,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useUserStore, selectCredits, selectHasActiveSubscription, selectPlanName, selectSubscription } from "@/store";
import { useAuthModal } from "@/app/providers/AuthModalProvider";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  matchPaths?: string[]; // Additional paths that should activate this item
  badge?: string;
  requiresAuth?: boolean; // Whether this route requires authentication
}

const sidebarItems: SidebarItem[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Sparkles,
    href: "/explore",
    requiresAuth: false,
  },
  { id: "assets", label: "Assets", icon: FolderOpen, href: "/assets", requiresAuth: true },
  { id: "video-agent", label: "Video Agent", icon: Bot, href: "/video-agent", badge: "BETA", requiresAuth: true },
  { id: "templates", label: "Templates", icon: LayoutTemplate, href: "/templates", requiresAuth: true },
  { id: "image", label: "Image", icon: ImageIcon, href: "/image-generator", requiresAuth: true },
  { id: "video", label: "Video", icon: Video, href: "/ai-video-generator", badge: "NEW", requiresAuth: true },
  { id: "audio", label: "Audio", icon: Mic, href: "/audio", requiresAuth: true },
  { id: "tools", label: "All Tools", icon: Wrench, href: "/tools", requiresAuth: false },
  { id: "pricing", label: "Pricing", icon: CreditCard, href: "/pricing", requiresAuth: false },
];

export default function Sidebar() { 
  const pathname = usePathname(); 
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { openSignIn } = useAuthModal();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  // User store for credits and subscription
  const credits = useUserStore(selectCredits);
  const hasActiveSubscription = useUserStore(selectHasActiveSubscription);
  const planName = useUserStore(selectPlanName);
  const subscription = useUserStore(selectSubscription);

  // Handle navigation item click
  const handleNavClick = (e: React.MouseEvent, item: SidebarItem) => {
    // If item requires auth and user is not signed in, show auth modal
    if (item.requiresAuth && !isSignedIn) {
      e.preventDefault();
      openSignIn();
    }
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen]);

  // Format credits for display
  const formatCredits = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  // Format date for display
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-19 bg-[#0a0a0a] flex flex-col z-50">
      {/* Logo */}
      <div className="pt-6 flex justify-center">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo/hexwave.png"
            alt="Hexwave.ai logo"
            width={32}
            height={32}
            className="w-15 h-15"
            style={{
              filter: "brightness(0) saturate(100%) invert(1)",
              opacity: 1,
            }}
            priority
          />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`group flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors relative ${isActive
                  ? "bg-white/10 text-[#74FF52]"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#74FF52]" : ""
                    }`}
                />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 px-1 py-0.5 text-[8px] bg-[#74FF52] text-[#0a0a0a] rounded font-semibold leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-2 space-y-1.5 relative" ref={settingsRef}>
        {isLoaded && (
          <>
            {isSignedIn && user ? (
              <>
                {/* Credits Display - Only show for subscribers */}
                {hasActiveSubscription && (
                  <Link
                    href="/pricing"
                    className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    title={`${credits.toLocaleString()} credits available`}
                  >
                    <Coins className="w-5 h-5 flex-shrink-0 text-[#74FF52]" />
                    <span className="text-[10px] font-semibold text-center leading-tight text-[#74FF52]">
                      {formatCredits(credits)}
                    </span>
                    <span className="text-[8px] text-white/50 leading-tight">
                      {planName}
                    </span>
                  </Link>
                )}

                {/* User Avatar / Settings Button */}
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors w-full ${
                    isSettingsOpen 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                  title="Settings"
                >
                  <div className="relative">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || user.emailAddresses[0]?.emailAddress || "User"}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full ring-2 ring-white/20"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/20">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {hasActiveSubscription && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#74FF52] rounded-full border border-[#0a0a0a]" />
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-center leading-tight truncate w-full px-1">
                    {user.firstName || "Settings"}
                  </span>
                </button>

                {/* Settings Dropdown Menu */}
                {isSettingsOpen && (
                  <div className="absolute left-full bottom-0 ml-2 w-64 bg-[#151515] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt={user.fullName || "User"}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.fullName || user.firstName || "User"}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {user.emailAddresses[0]?.emailAddress}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsSettingsOpen(false)}
                          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-white/50" />
                        </button>
                </div>

                      {/* Subscription Badge */}
                      {hasActiveSubscription && subscription && (
                        <div className="mt-3 p-2 rounded-lg bg-[#74FF52]/10 border border-[#74FF52]/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-[#74FF52]">
                                {planName} Plan
                              </p>
                              <p className="text-[10px] text-white/50">
                                {subscription.billing_cycle === "annual" ? "Annual" : "Monthly"} billing
                              </p>
                            </div>
                            <Zap className="w-4 h-4 text-[#74FF52]" />
                          </div>
                          {subscription.current_period_ends && (
                            <p className="text-[10px] text-white/40 mt-1">
                              {subscription.cancel_at_period_end 
                                ? `Ends ${formatDate(subscription.current_period_ends)}`
                                : `Renews ${formatDate(subscription.current_period_ends)}`
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile - Always visible */}
                      <Link
                        href="/profile"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                      >
                        <UserCircle className="w-4 h-4 text-white/50 group-hover:text-white" />
                        <span className="text-sm text-white/70 group-hover:text-white">Profile</span>
                        <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                      </Link>

                      {/* Billing & Credits - Only for subscribers */}
                      {hasActiveSubscription && (
                        <>
                          <Link
                            href="/billing"
                            onClick={() => setIsSettingsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                          >
                            <Receipt className="w-4 h-4 text-white/50 group-hover:text-white" />
                            <span className="text-sm text-white/70 group-hover:text-white">Billing & Plans</span>
                            <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                          </Link>

                          <Link
                            href="/billing"
                            onClick={() => setIsSettingsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                          >
                            <Coins className="w-4 h-4 text-white/50 group-hover:text-white" />
                            <div className="flex-1">
                              <span className="text-sm text-white/70 group-hover:text-white">Credits</span>
                              <span className="text-xs text-[#74FF52] ml-2 font-semibold">
                                {credits.toLocaleString()}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/30" />
                          </Link>

                          <Link
                            href="/usage"
                            onClick={() => setIsSettingsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                          >
                            <BarChart3 className="w-4 h-4 text-white/50 group-hover:text-white" />
                            <span className="text-sm text-white/70 group-hover:text-white">Usage History</span>
                            <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                          </Link>
                        </>
                      )}

                      <div className="h-px bg-white/10 my-2" />

                      {/* Help - Always visible */}
                      <Link
                        href="/help"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                      >
                        <HelpCircle className="w-4 h-4 text-white/50 group-hover:text-white" />
                        <span className="text-sm text-white/70 group-hover:text-white">Help & Support</span>
                        <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                      </Link>

                      <div className="h-px bg-white/10 my-2" />

                      {/* Sign Out - Always visible */}
                <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          signOut({ redirectUrl: '/explore' });
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors group w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-400/70 group-hover:text-red-400" />
                        <span className="text-sm text-red-400/70 group-hover:text-red-400">Sign Out</span>
                </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={openSignIn}
                className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full"
                title="Sign In"
              >
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  Sign In
                </span>
              </button>
            )}
          </>
        )}

        {/* Upgrade Button - Only show if no active subscription */}
        {(!isSignedIn || !hasActiveSubscription) && (
          isSignedIn ? (
            <Link
              href="/pricing"
              className="flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] transition-colors font-semibold"
              title="Upgrade Plan"
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="text-[9px] text-center leading-tight">
                Upgrade
              </span>
            </Link>
          ) : (
            <button
              onClick={openSignIn}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] transition-colors font-semibold w-full"
              title="Get Started"
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="text-[9px] text-center leading-tight">
                Get Started
              </span>
            </button>
          )
        )}
      </div>
      </aside>
    </>
  );
}
