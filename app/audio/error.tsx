"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AudioError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Audio page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-white/60 mb-6">
          We encountered an error while loading the audio generator. Please try again.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0a0a0a] rounded-xl font-medium hover:bg-white/90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            Go home
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-white/30">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
