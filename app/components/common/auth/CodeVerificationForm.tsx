"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface CodeVerificationFormProps {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResend: () => void;
  isLoading: boolean;
  isLoaded: boolean;
  error: string;
  isNewAccount?: boolean;
}

export function CodeVerificationForm({
  email,
  code,
  onCodeChange,
  onSubmit,
  onBack,
  onResend,
  isLoading,
  isLoaded,
  error,
  isNewAccount = false,
}: CodeVerificationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-white/60 text-sm mb-2">Verification code</label>
        <p className="text-white/40 text-xs mb-3">
          {isNewAccount
            ? `Account created! We sent a verification code to ${email}`
            : `We sent a verification code to ${email}`}
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="w-full h-12 bg-white text-black rounded-lg border-0 px-4 text-base placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-2xl tracking-widest"
          required
          disabled={isLoading || !isLoaded}
          autoFocus
          maxLength={6}
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
          disabled={isLoading || !code || code.length !== 6 || !isLoaded}
          className="flex-1 h-12 bg-[#74FF52] text-black hover:bg-[#66e648] rounded-lg border-0 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
      <button
        type="button"
        onClick={onResend}
        className="text-[#74FF52] hover:text-[#66e648] text-sm underline w-full text-center"
      >
        Resend code
      </button>
    </form>
  );
}


