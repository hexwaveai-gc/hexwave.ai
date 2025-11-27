"use client";

import { useState } from "react";
import { Clock, Play, Pause, Download, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioGeneration } from "./audio-content";

// Helper to get flag from accent
function getAccentFlag(accent: string): string {
  const accentFlags: Record<string, string> = {
    american: "🇺🇸",
    british: "🇬🇧",
    australian: "🇦🇺",
    irish: "🇮🇪",
    indian: "🇮🇳",
    scottish: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    swedish: "🇸🇪",
    german: "🇩🇪",
    french: "🇫🇷",
    spanish: "🇪🇸",
    italian: "🇮🇹",
  };
  return accentFlags[accent.toLowerCase()] || "🌍";
}

interface HistoryPanelProps {
  generations: AudioGeneration[];
}

export function HistoryPanel({ generations }: HistoryPanelProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlayPause = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      // TODO: Pause audio
    } else {
      setPlayingId(id);
      // TODO: Play audio
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <aside className="w-80 xl:w-96 border-l border-white/10 bg-[#0f0f0f] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
        <Clock className="w-4 h-4 text-white/50" />
        <h2 className="text-sm font-semibold text-white">History</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {generations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="py-2">
            {generations.map((gen) => (
              <HistoryItem
                key={gen.id}
                generation={gen}
                isPlaying={playingId === gen.id}
                onPlayPause={() => handlePlayPause(gen.id)}
                formatDuration={formatDuration}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Waveform Icon */}
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <WaveformIcon className="w-8 h-8 text-white/20" />
      </div>

      <p className="text-white/40 text-sm text-center">
        Audio will appear here...
      </p>

      {/* Decorative Waveform */}
      <div className="mt-6 flex items-center justify-center gap-0.5">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-white/10 rounded-full"
            style={{
              height: `${Math.random() * 24 + 4}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface HistoryItemProps {
  generation: AudioGeneration;
  isPlaying: boolean;
  onPlayPause: () => void;
  formatDuration: (seconds: number) => string;
  formatTime: (date: Date) => string;
}

function HistoryItem({
  generation,
  isPlaying,
  onPlayPause,
  formatDuration,
  formatTime,
}: HistoryItemProps) {
  const isLoading = generation.status === "generating";
  const isFailed = generation.status === "failed";

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer",
        isPlaying && "bg-white/5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Play/Status Button */}
        <button
          onClick={onPlayPause}
          disabled={isLoading || isFailed}
          className={cn(
            "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl",
            "bg-white/5 border border-white/10",
            "hover:bg-white/10 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isPlaying && "bg-[#74FF52]/10 border-[#74FF52]/20"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-[#74FF52]" />
          ) : (
            <Play className="w-4 h-4 text-white/50" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Voice Info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{getAccentFlag(generation.voice.accent)}</span>
            <span className="text-sm font-medium text-white truncate">
              {generation.voice.name}
            </span>
          </div>

          {/* Text Preview */}
          <p className="text-xs text-white/50 line-clamp-2 mb-2">
            {generation.text}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span>{formatTime(generation.createdAt)}</span>
            {generation.status === "completed" && (
              <>
                <span>•</span>
                <span>{formatDuration(generation.duration)}</span>
              </>
            )}
            {isFailed && (
              <>
                <span>•</span>
                <span className="text-red-400">Failed</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        {generation.status === "completed" && (
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-white/40 hover:text-white" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Waveform SVG Icon
function WaveformIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 3v18M8 7v10M4 10v4M16 7v10M20 10v4" />
    </svg>
  );
}

