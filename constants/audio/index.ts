/**
 * Audio Constants
 *
 * Configuration constants for audio generation.
 * Voice data is now fetched dynamically via API and cached with TanStack Query.
 */

// ============================================================================
// Audio Generation Constants
// ============================================================================

/**
 * Credits cost per minute of generated audio
 */
export const AUDIO_CREDITS_PER_MINUTE = 10;

/**
 * Maximum character limit for text-to-speech
 */
export const AUDIO_MAX_CHARACTER_LIMIT = 5000;

/**
 * Default voice settings for generation
 */
export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarityBoost: 0.75,
  styleExaggeration: 0,
  speakerBoost: true,
} as const;

// ============================================================================
// API Configuration
// ============================================================================

/**
 * ElevenLabs API configuration
 */
export const ELEVENLABS_CONFIG = {
  baseUrl: "https://api.elevenlabs.io/v1",
  defaultModel: "eleven_multilingual_v2",
  models: [
    { id: "eleven_multilingual_v2", name: "Multilingual V2", description: "Best quality, supports 29 languages" },
    { id: "eleven_turbo_v2", name: "Turbo V2", description: "Fastest generation, English only" },
    { id: "eleven_monolingual_v1", name: "Monolingual V1", description: "Legacy model, English only" },
  ],
} as const;

// ============================================================================
// Voice Category Constants
// ============================================================================

/**
 * Voice categories for filtering in UI
 */
export const VOICE_CATEGORIES = [
  { id: "all", label: "All Voices" },
  { id: "premade", label: "Premade" },
  { id: "professional", label: "Professional" },
  { id: "cloned", label: "Cloned" },
  { id: "generated", label: "Generated" },
  { id: "masculine", label: "Masculine" },
  { id: "feminine", label: "Feminine" },
] as const;

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * Cache durations for TanStack Query
 */
export const AUDIO_CACHE_CONFIG = {
  // Voices are static, cache for 24 hours
  voicesStaleTime: 24 * 60 * 60 * 1000,
  // Keep voices in cache for 7 days
  voicesGcTime: 7 * 24 * 60 * 60 * 1000,
  // Audio history can change frequently
  historyStaleTime: 5 * 60 * 1000,
  historyGcTime: 30 * 60 * 1000,
} as const;

// ============================================================================
// Helper Types Re-exports
// ============================================================================

export type {
  Voice,
  VoiceProvider,
  VoiceModel,
  VoiceCategory,
  VoicesApiResponse,
  AudioGenerationRequest,
  AudioGenerationResponse,
  AudioHistoryItem,
} from "@/types/audio";
