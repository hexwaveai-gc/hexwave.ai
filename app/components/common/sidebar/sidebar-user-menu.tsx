"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  LogOut,
  Coins,
  Receipt,
  UserCircle,
  HelpCircle,
  ChevronRight,
  X,
  BarChart3,
  Zap,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  useUserStore,
  selectCredits,
  selectHasActiveSubscription,
  selectPlanName,
  selectSubscription,
} from "@/store";

// Format date for display
function formatDate(timestamp: number | undefined): string | null {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SidebarUserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const credits = useUserStore(selectCredits);
  const hasActiveSubscription = useUserStore(selectHasActiveSubscription);
  const planName = useUserStore(selectPlanName);
  const subscription = useUserStore(selectSubscription);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors w-full ${
          isOpen
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

      {/* Dropdown Menu */}
      {isOpen && (
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
                onClick={() => setIsOpen(false)}
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
                      {subscription.billing_cycle === "annual"
                        ? "Annual"
                        : "Monthly"}{" "}
                      billing
                    </p>
                  </div>
                  <Zap className="w-4 h-4 text-[#74FF52]" />
                </div>
                {subscription.current_period_ends && (
                  <p className="text-[10px] text-white/40 mt-1">
                    {subscription.cancel_at_period_end
                      ? `Ends ${formatDate(subscription.current_period_ends)}`
                      : `Renews ${formatDate(subscription.current_period_ends)}`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
            >
              <UserCircle className="w-4 h-4 text-white/50 group-hover:text-white" />
              <span className="text-sm text-white/70 group-hover:text-white">
                Profile
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
            </Link>

            {hasActiveSubscription && (
              <>
                <Link
                  href="/billing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <Receipt className="w-4 h-4 text-white/50 group-hover:text-white" />
                  <span className="text-sm text-white/70 group-hover:text-white">
                    Billing & Plans
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </Link>

                <Link
                  href="/billing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <Coins className="w-4 h-4 text-white/50 group-hover:text-white" />
                  <div className="flex-1">
                    <span className="text-sm text-white/70 group-hover:text-white">
                      Credits
                    </span>
                    <span className="text-xs text-[#74FF52] ml-2 font-semibold">
                      {credits.toLocaleString()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>

                <Link
                  href="/usage"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <BarChart3 className="w-4 h-4 text-white/50 group-hover:text-white" />
                  <span className="text-sm text-white/70 group-hover:text-white">
                    Usage History
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </Link>
              </>
            )}

            <div className="h-px bg-white/10 my-2" />

            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
            >
              <HelpCircle className="w-4 h-4 text-white/50 group-hover:text-white" />
              <span className="text-sm text-white/70 group-hover:text-white">
                Help & Support
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
            </Link>

            <div className="h-px bg-white/10 my-2" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ redirectUrl: "/explore" });
              }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors group w-full text-left"
            >
              <LogOut className="w-4 h-4 text-red-400/70 group-hover:text-red-400" />
              <span className="text-sm text-red-400/70 group-hover:text-red-400">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
