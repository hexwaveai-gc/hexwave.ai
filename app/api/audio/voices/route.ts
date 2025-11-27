/**
 * /api/audio/voices - ElevenLabs Voices API
 *
 * Fetches available voices from ElevenLabs API and returns normalized voice data.
 * Implements server-side caching to reduce API calls since voice data rarely changes.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type {
  ElevenLabsVoicesResponse,
  ElevenLabsVoice,
  Voice,
  VoicesApiResponse,
} from "@/types/audio";
import { ApiResponse } from "@/utils/api-response/response";
import { logError, logWarn } from "@/lib/logger";

export const runtime = "nodejs";

// Cache configuration
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
let cachedVoices: Voice[] | null = null;
let cacheTimestamp: number = 0;

/**
 * GET /api/audio/voices
 * Fetch all available voices from ElevenLabs
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized();
    }

    // Check cache validity
    const now = Date.now();
    const isCacheValid = cachedVoices && (now - cacheTimestamp) < CACHE_DURATION_MS;

    if (isCacheValid && cachedVoices) {
      return NextResponse.json<VoicesApiResponse>({
        voices: cachedVoices,
        total: cachedVoices.length,
        cached: true,
      }, {
        headers: {
          // Tell browsers to cache for 1 hour
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // Fetch from ElevenLabs API
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      logWarn("ELEVENLABS_API_KEY not configured");
      return ApiResponse.error(
        "SERVICE_UNAVAILABLE",
        "Voice service not configured",
        503
      );
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        Accept: "application/json",
      },
      // Server-side fetch caching
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      const error = await response.text();
      logError("ElevenLabs API error", new Error(error), { status: response.status });
      return ApiResponse.error(
        "PROVIDER_ERROR",
        "Failed to fetch voices from provider",
        response.status
      );
    }

    const data: ElevenLabsVoicesResponse = await response.json();

    // Normalize voices for frontend consumption
    const normalizedVoices = normalizeVoices(data.voices);

    // Update cache
    cachedVoices = normalizedVoices;
    cacheTimestamp = now;

    return NextResponse.json<VoicesApiResponse>({
      voices: normalizedVoices,
      total: normalizedVoices.length,
      cached: false,
    }, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    logError("Audio voices error", error);
    return ApiResponse.serverError();
  }
}

/**
 * Normalize ElevenLabs voices to our internal Voice type
 */
function normalizeVoices(elevenLabsVoices: ElevenLabsVoice[]): Voice[] {
  return elevenLabsVoices.map((voice) => ({
    id: voice.voice_id,
    name: voice.name,
    provider: "elevenlabs" as const,
    category: voice.category || "premade",
    gender: voice.labels?.gender || "unknown",
    age: voice.labels?.age || "unknown",
    accent: voice.labels?.accent || "unknown",
    description: voice.description || voice.labels?.description || "",
    previewUrl: voice.preview_url || "",
    useCase: voice.labels?.use_case || "general",
    labels: voice.labels || {},
  }));
}

