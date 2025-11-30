"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "@/app/components/common/sidebar";
import { Button } from "@/app/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AssetsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("[Assets Error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 ml-20 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          {/* Error icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          {/* Error message */}
          <h1 className="text-2xl font-semibold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-white/50 mb-6">
            We couldn&apos;t load your assets. This might be a temporary issue.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={reset}
              className="bg-[#74FF52] text-black hover:bg-[#66e648]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              Go Home
            </Button>
          </div>

          {/* Error digest for debugging */}
          {error.digest && (
            <p className="text-xs text-white/30 mt-6">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}


