"use client";

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
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useUpgradePlan } from "@/app/providers/UpgradePlanProvider";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  matchPaths?: string[]; // Additional paths that should activate this item
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "explore",
    label: "Explore",
    icon: Sparkles,
    href: "/explore",
  },
  { id: "assets", label: "Assets", icon: FolderOpen, href: "/assets" },
  { id: "image", label: "Image", icon: ImageIcon, href: "/image-generator" },
  { id: "video", label: "Video", icon: Video, href: "/video-generator", badge: "NEW" }, 
  { id: "tools", label: "All Tools", icon: Wrench, href: "/tools" },
];

export default function Sidebar() { 
  const pathname = usePathname(); 
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { openModal } = useUpgradePlan(); 

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
      <div className="p-2 space-y-1.5">
        {isLoaded && (
          <>
            {isSignedIn && user ? (
              <>
                {/* User Profile */}
                <div className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70">
                  <div className="relative">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || user.emailAddresses[0]?.emailAddress || "User"}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-center leading-tight truncate w-full px-1" title={user.fullName || user.emailAddresses[0]?.emailAddress || "User"}>
                    {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || "User"}
                  </span>
                </div>

                {/* Sign Out */}
                <button
                  onClick={() => signOut({ redirectUrl: '/explore' })}
                  className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    Sign Out
                  </span>
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                title="Sign In"
              >
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  Sign In
                </span>
              </Link>
            )}
          </>
        )}

        <button
          onClick={openModal}
          className="flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] transition-colors font-semibold"
          title="SALE 50% off"
        >
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span className="text-[9px] text-center leading-tight">
            SALE 50% off
          </span>
        </button>
      </div>
      </aside>
    </>
  );
}
