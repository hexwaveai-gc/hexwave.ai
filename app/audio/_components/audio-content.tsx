"use client";

import { useState, useCallback, useEffect } from "react";
import { VoiceSelector } from "./voice-selector";
import { VoiceSettings } from "./voice-settings";
import { TextInput } from "./text-input";
import { HistoryPanel } from "./history-panel";
import { useVoices, usePrefetchVoices } from "@/hooks";
import type { Voice } from "@/types/audio";

export interface AudioGeneration {
  id: string;
  text: string;
  voice: Voice;
  audioUrl?: string;
  duration: number;
  createdAt: Date;
  status: "pending" | "generating" | "completed" | "failed";
}

export interface VoiceSettingsState {
  stability: number;
  similarityBoost: number;
  styleExaggeration: number;
  speakerBoost: boolean;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettingsState = {
  stability: 0.5,
  similarityBoost: 0.75,
  styleExaggeration: 0,
  speakerBoost: true,
};

export function AudioContent() {
  // Prefetch voices on mount for better UX
  const prefetchVoices = usePrefetchVoices();
  useEffect(() => {
    prefetchVoices();
  }, [prefetchVoices]);

  // Get voices data to set initial selected voice
  const { data: voicesData } = useVoices();

  // State
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsState>(DEFAULT_VOICE_SETTINGS);
  const [generations, setGenerations] = useState<AudioGeneration[]>([]);

  // Set default voice when voices are loaded
  useEffect(() => {
    if (voicesData?.voices?.length && !selectedVoice) {
      setSelectedVoice(voicesData.voices[0]);
    }
  }, [voicesData?.voices, selectedVoice]);

  // Calculate estimated duration based on text length (roughly 150 words per minute)
  const estimatedDuration = useCallback(() => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(0, words / 150);
    const seconds = Math.round(minutes * 60);
    return {
      minutes: Math.floor(seconds / 60),
      seconds: seconds % 60,
      formatted: `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
    };
  }, [text]);

  // Generate audio
  const handleGenerate = useCallback(async () => {
    if (!text.trim() || isGenerating || !selectedVoice) return;

    setIsGenerating(true);

    const newGeneration: AudioGeneration = {
      id: `gen-${Date.now()}`,
      text: text.trim(),
      voice: selectedVoice,
      duration: 0,
      createdAt: new Date(),
      status: "generating",
    };

    setGenerations((prev) => [newGeneration, ...prev]);

    try {
      // TODO: Implement actual audio generation API call
      // const response = await generateAudio({
      //   text: text.trim(),
      //   voiceId: selectedVoice.id,
      //   voiceSettings: {
      //     stability: voiceSettings.stability,
      //     similarityBoost: voiceSettings.similarityBoost,
      //     style: voiceSettings.styleExaggeration,
      //     useSpeakerBoost: voiceSettings.speakerBoost,
      //   },
      // });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      setGenerations((prev) =>
        prev.map((g) =>
          g.id === newGeneration.id
            ? {
                ...g,
                status: "completed",
                duration: estimatedDuration().seconds,
                audioUrl: "/audio/sample.mp3", // Placeholder
              }
            : g
        )
      );
    } catch (error) {
      console.error("Audio generation failed:", error);
      setGenerations((prev) =>
        prev.map((g) =>
          g.id === newGeneration.id ? { ...g, status: "failed" } : g
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedVoice, isGenerating, estimatedDuration]);

  return (
    <div className="flex h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-white mb-6">Audio</h1>

        {/* Voice Controls */}
        <div className="flex items-center gap-2 mb-4">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
          />
          <VoiceSettings
            settings={voiceSettings}
            onSettingsChange={setVoiceSettings}
            isOpen={showSettings}
            onOpenChange={setShowSettings}
          />
        </div>

        {/* Text Input Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <TextInput
            value={text}
            onChange={setText}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            estimatedDuration={estimatedDuration().formatted}
            disabled={!selectedVoice}
          />
        </div>
      </div>

      {/* Right Sidebar - History */}
      <HistoryPanel generations={generations} />
    </div>
  );
}
