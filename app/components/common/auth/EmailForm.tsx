"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface EmailFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  isLoaded: boolean;
  error: string;
}

export function EmailForm({
  email,
  onEmailChange,
  onSubmit,
  onBack,
  isLoading,
  isLoaded,
  error,
}: EmailFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-white/60 text-sm mb-2">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter your email address"
          className="w-full h-12 bg-white text-black rounded-lg border-0 px-4 text-base placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
          required
          disabled={isLoading || !isLoaded}
          autoFocus
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-lg font-normal text-base"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !email || !isLoaded}
          className="flex-1 h-12 bg-[#74FF52] text-black hover:bg-[#66e648] rounded-lg border-0 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Continue"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}





