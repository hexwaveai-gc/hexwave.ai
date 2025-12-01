/**
 * Audio API Functions
 *
 * API functions for audio generation and voice management.
 */

import api from "./client";
import type { VoicesApiResponse, AudioGenerationRequest, AudioGenerationResponse } from "@/types/audio";

// ============================================================================
// Voice API Functions
// ============================================================================

/**
 * Fetch all available voices from ElevenLabs
 * 
 * This data is cached for 1 hour on the server and 24 hours on the client
 * since voice data rarely changes.
 */
export async function fetchVoices(): Promise<VoicesApiResponse> {
  return api.get<VoicesApiResponse>("/api/audio/voices");
}

// ============================================================================
// Audio Generation API Functions
// ============================================================================

/**
 * Generate audio from text using selected voice
 */
export async function generateAudio(
  request: AudioGenerationRequest
): Promise<AudioGenerationResponse> {
  return api.post<AudioGenerationResponse>("/api/audio/generate", request);
}

// ============================================================================
// Audio History API Functions
// ============================================================================

/**
 * Fetch audio generation history
 */
export async function fetchAudioHistory(params?: {
  limit?: number;
  offset?: number;
}) {
  return api.get("/api/audio/history", params);
}

/**
 * Delete audio history item
 */
export async function deleteAudioHistoryItem(id: string) {
  return api.delete(`/api/audio/history/${id}`);
}





