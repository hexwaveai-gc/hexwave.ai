/**
 * Audio Types
 *
 * Type definitions for audio generation and voice management.
 */

// ============================================================================
// ElevenLabs Voice Types
// ============================================================================

/**
 * Voice labels from ElevenLabs API
 */
export interface ElevenLabsVoiceLabels {
  accent?: string;
  description?: string;
  age?: string;
  gender?: string;
  use_case?: string;
}

/**
 * Voice fine-tuning information
 */
export interface ElevenLabsFineTuning {
  is_allowed_to_fine_tune: boolean;
  state: Record<string, string>;
  verification_failures: string[];
  verification_attempts_count: number;
  manual_verification_requested: boolean;
  language?: string;
  progress?: Record<string, number>;
  message?: Record<string, string>;
  dataset_duration_seconds?: number;
  verification_attempts?: unknown[];
  slice_ids?: string[];
  manual_verification?: unknown;
  finetuning_state?: Record<string, string>;
}

/**
 * Voice settings configuration
 */
export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

/**
 * Voice safety control information
 */
export interface ElevenLabsSafetyControl {
  is_banned: boolean;
  ban_reason?: string;
  is_mature?: boolean;
}

/**
 * Single voice from ElevenLabs API
 */
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples: unknown[] | null;
  category: "premade" | "cloned" | "generated" | "professional";
  fine_tuning: ElevenLabsFineTuning;
  labels: ElevenLabsVoiceLabels;
  description: string | null;
  preview_url: string;
  available_for_tiers: string[];
  settings: ElevenLabsVoiceSettings | null;
  sharing: unknown | null;
  high_quality_base_model_ids: string[];
  safety_control: ElevenLabsSafetyControl | null;
}

/**
 * ElevenLabs voices API response
 */
export interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
}

// ============================================================================
// Normalized Voice Types (Internal Use)
// ============================================================================

/**
 * Voice provider types
 */
export type VoiceProvider = "elevenlabs" | "minimax";

/**
 * Voice model types
 */
export type VoiceModel = "eleven_multilingual_v2" | "eleven_turbo_v2" | "eleven_monolingual_v1" | "minimax_v1";

/**
 * Voice category for filtering
 */
export type VoiceCategory = "all" | "premade" | "cloned" | "generated" | "professional" | "masculine" | "feminine";

/**
 * Normalized voice for UI consumption
 */
export interface Voice {
  id: string;
  name: string;
  provider: VoiceProvider;
  category: string;
  gender: string;
  age: string;
  accent: string;
  description: string;
  previewUrl: string;
  useCase: string;
  labels: Record<string, string>;
}

/**
 * Voice API response from our backend
 */
export interface VoicesApiResponse {
  voices: Voice[];
  total: number;
  cached: boolean;
}

// ============================================================================
// Audio Generation Types
// ============================================================================

/**
 * Audio generation request
 */
export interface AudioGenerationRequest {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

/**
 * Audio generation response
 */
export interface AudioGenerationResponse {
  id: string;
  audioUrl: string;
  duration: number;
  characterCount: number;
  creditsUsed: number;
}

/**
 * Audio history item
 */
export interface AudioHistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  audioUrl: string;
  duration: number;
  characterCount: number;
  creditsUsed: number;
  createdAt: string;
  status: "completed" | "failed" | "generating";
}


