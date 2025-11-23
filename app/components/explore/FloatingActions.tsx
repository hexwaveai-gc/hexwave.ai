"use client";

import Link from "next/link";
import { Image as ImageIcon, Video, User, Sparkles } from "lucide-react";

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const actions: FloatingAction[] = [
  { id: "image", label: "Image", icon: ImageIcon, href: "/image" },
  { id: "video", label: "Video", icon: Video, href: "/video" },
  { id: "avatar", label: "Avatar", icon: User, href: "/avatar" },
  { id: "effects", label: "Effects", icon: Sparkles, href: "/effects" },
];

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-[#1a1a1a] border-t border-b border-[#74FF52]/50 shadow-lg">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-all"
              title={action.label}
            >
              <Icon className="w-5 h-5 text-white group-hover:text-[#74FF52] transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

