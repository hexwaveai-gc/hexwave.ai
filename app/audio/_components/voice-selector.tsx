"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Play, Pause, Plus, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/lib/utils";
import { useVoices } from "@/hooks";
import type { Voice, VoiceCategory } from "@/types/audio";

// Category tabs for filtering
const VOICE_CATEGORIES: { id: VoiceCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "premade", label: "Premade" },
  { id: "professional", label: "Professional" },
  { id: "cloned", label: "Cloned" },
  { id: "masculine", label: "Masculine" },
  { id: "feminine", label: "Feminine" },
];

interface VoiceSelectorProps {
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
}

export function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<VoiceCategory>("all");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Fetch voices with TanStack Query - cached for 24 hours
  const { data: voicesData, isLoading, error } = useVoices();

  // Filter voices based on category and search
  const filteredVoices = useMemo(() => {
    if (!voicesData?.voices) return [];

    let voices = voicesData.voices;

    // Filter by category
    switch (activeCategory) {
      case "masculine":
        voices = voices.filter((v) => v.gender.toLowerCase() === "male");
        break;
      case "feminine":
        voices = voices.filter((v) => v.gender.toLowerCase() === "female");
        break;
      case "premade":
      case "cloned":
      case "generated":
      case "professional":
        voices = voices.filter((v) => v.category === activeCategory);
        break;
      default:
        // "all" - no filtering
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      voices = voices.filter(
        (v) =>
          v.name.toLowerCase().includes(lowerQuery) ||
          v.description.toLowerCase().includes(lowerQuery) ||
          v.accent.toLowerCase().includes(lowerQuery)
      );
    }

    return voices;
  }, [voicesData?.voices, activeCategory, searchQuery]);

  const handlePlayPreview = (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();

    if (playingVoiceId === voice.id) {
      // Stop playing
      audioElement?.pause();
      setPlayingVoiceId(null);
      setAudioElement(null);
    } else {
      // Stop any currently playing audio
      audioElement?.pause();

      // Play new audio
      if (voice.previewUrl) {
        const audio = new Audio(voice.previewUrl);
        audio.onended = () => {
          setPlayingVoiceId(null);
          setAudioElement(null);
        };
        audio.onerror = () => {
          setPlayingVoiceId(null);
          setAudioElement(null);
        };
        audio.play().catch(console.error);
        setAudioElement(audio);
        setPlayingVoiceId(voice.id);
      }
    }
  };

  const handleSelectVoice = (voice: Voice) => {
    onSelectVoice(voice);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Get country flag from accent
  const getCountryFlag = (accent: string): string => {
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
      japanese: "🇯🇵",
      korean: "🇰🇷",
      chinese: "🇨🇳",
    };
    const lowerAccent = accent.toLowerCase();
    return accentFlags[lowerAccent] || "🌍";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full",
            "bg-[#1a1a1a] border border-white/10",
            "hover:bg-[#222] hover:border-white/20",
            "transition-all duration-200",
            "text-sm font-medium text-white"
          )}
        >
          {selectedVoice ? (
            <>
              <span className="text-base">{getCountryFlag(selectedVoice.accent)}</span>
              <span>{selectedVoice.name}</span>
            </>
          ) : (
            <span className="text-white/50">Select voice</span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/50 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] p-0 bg-[#1a1a1a] border-white/10 rounded-xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        {/* Search and Create Voice */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices"
              className="pl-10 bg-[#0f0f0f] border-white/10 text-white placeholder:text-white/40 rounded-lg"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            <span>Create voice</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-white/10 overflow-x-auto scrollbar-none">
          {VOICE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === category.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Voice List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin mb-2" />
              <p className="text-sm text-white/50">Loading voices...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-400">
              <p className="text-sm">Failed to load voices</p>
              <p className="text-xs text-white/40 mt-1">Please try again later</p>
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
              <p className="text-sm">No voices found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredVoices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleSelectVoice(voice)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 text-left",
                    "hover:bg-white/5 transition-colors",
                    selectedVoice?.id === voice.id && "bg-white/5"
                  )}
                >
                  {/* Flag */}
                  <span className="text-lg flex-shrink-0">
                    {getCountryFlag(voice.accent)}
                  </span>

                  {/* Voice Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {voice.name}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {voice.age !== "unknown" && `${voice.age}, `}
                      {voice.description || `${voice.gender}, ${voice.accent}`}
                    </p>
                  </div>

                  {/* Play Button */}
                  {voice.previewUrl && (
                    <button
                      onClick={(e) => handlePlayPreview(e, voice)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full",
                        "hover:bg-white/10 transition-colors",
                        playingVoiceId === voice.id
                          ? "text-[#74FF52]"
                          : "text-white/50 hover:text-white"
                      )}
                    >
                      {playingVoiceId === voice.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with cache info */}
        {voicesData?.cached && (
          <div className="px-4 py-2 border-t border-white/5 bg-white/2">
            <p className="text-[10px] text-white/30 text-center">
              Voices cached for faster loading
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
