/**
 * Voices Hooks
 *
 * TanStack Query hooks for voice management.
 * Voices are cached for 24 hours since this data rarely changes.
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "@/lib/query/client";
import { fetchVoices } from "@/lib/api";
import type { Voice, VoicesApiResponse, VoiceCategory } from "@/types/audio";

// ============================================================================
// Cache Configuration
// ============================================================================

// Voice data rarely changes, so we use aggressive caching
const VOICES_STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours - data is fresh
const VOICES_GC_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days - keep in cache

// ============================================================================
// Hooks
// ============================================================================

interface UseVoicesOptions {
  enabled?: boolean;
}

/**
 * Hook for fetching all voices from ElevenLabs
 *
 * Implements aggressive caching:
 * - staleTime: 24 hours (won't refetch during this time)
 * - gcTime: 7 days (keeps data in cache for offline support)
 * - refetchOnMount: false (uses cached data on component mount)
 * - refetchOnWindowFocus: false (prevents unnecessary refetches)
 */
export function useVoices(options: UseVoicesOptions = {}) {
  const { enabled = true } = options;

  return useQuery<VoicesApiResponse>({
    queryKey: queryKeys.audio.voices(),
    queryFn: fetchVoices,
    enabled,
    staleTime: VOICES_STALE_TIME,
    gcTime: VOICES_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook for getting voices filtered by category
 */
export function useVoicesByCategory(category: VoiceCategory) {
  const { data, ...rest } = useVoices();

  const filteredVoices = useMemo(() => {
    if (!data?.voices) return [];

    switch (category) {
      case "all":
        return data.voices;
      case "masculine":
        return data.voices.filter(
          (v) => v.gender.toLowerCase() === "male"
        );
      case "feminine":
        return data.voices.filter(
          (v) => v.gender.toLowerCase() === "female"
        );
      case "premade":
      case "cloned":
      case "generated":
      case "professional":
        return data.voices.filter((v) => v.category === category);
      default:
        return data.voices;
    }
  }, [data?.voices, category]);

  return {
    ...rest,
    data: filteredVoices,
    total: filteredVoices.length,
  };
}

/**
 * Hook for searching voices
 */
export function useSearchVoices(query: string) {
  const { data, ...rest } = useVoices();

  const searchResults = useMemo(() => {
    if (!data?.voices || !query.trim()) return data?.voices || [];

    const lowerQuery = query.toLowerCase();
    return data.voices.filter(
      (voice) =>
        voice.name.toLowerCase().includes(lowerQuery) ||
        voice.description.toLowerCase().includes(lowerQuery) ||
        voice.accent.toLowerCase().includes(lowerQuery) ||
        voice.gender.toLowerCase().includes(lowerQuery) ||
        voice.useCase.toLowerCase().includes(lowerQuery)
    );
  }, [data?.voices, query]);

  return {
    ...rest,
    data: searchResults,
    total: searchResults.length,
  };
}

/**
 * Hook for getting a single voice by ID
 */
export function useVoice(voiceId: string | null) {
  const { data, ...rest } = useVoices();

  const voice = useMemo(() => {
    if (!data?.voices || !voiceId) return null;
    return data.voices.find((v) => v.id === voiceId) || null;
  }, [data?.voices, voiceId]);

  return {
    ...rest,
    data: voice,
  };
}

/**
 * Hook for prefetching voices
 * Call this early in the app lifecycle to warm the cache
 */
export function usePrefetchVoices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.audio.voices(),
      queryFn: fetchVoices,
      staleTime: VOICES_STALE_TIME,
    });
  };
}

/**
 * Hook to invalidate voices cache (force refresh)
 * Use this when voices might have changed (e.g., after cloning a new voice)
 */
export function useInvalidateVoices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.audio.voices() });
  };
}

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select voices grouped by category
 */
export function selectVoicesByCategory(voices: Voice[]) {
  return voices.reduce(
    (acc, voice) => {
      const category = voice.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(voice);
      return acc;
    },
    {} as Record<string, Voice[]>
  );
}

/**
 * Select voices grouped by gender
 */
export function selectVoicesByGender(voices: Voice[]) {
  return {
    male: voices.filter((v) => v.gender.toLowerCase() === "male"),
    female: voices.filter((v) => v.gender.toLowerCase() === "female"),
    other: voices.filter(
      (v) =>
        v.gender.toLowerCase() !== "male" &&
        v.gender.toLowerCase() !== "female"
    ),
  };
}

/**
 * Select unique accents from voices
 */
export function selectUniqueAccents(voices: Voice[]): string[] {
  const accents = new Set(
    voices.map((v) => v.accent).filter((a) => a && a !== "unknown")
  );
  return Array.from(accents).sort();
}


