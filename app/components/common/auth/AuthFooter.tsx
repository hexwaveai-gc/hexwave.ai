"use client";

import { AuthMode } from "./constants";

interface AuthFooterProps {
  mode: AuthMode;
  onSwitchMode: () => void;
}

export function AuthFooter({ mode, onSwitchMode }: AuthFooterProps) {
  return (
    <div className="space-y-4">
      {/* Terms and Privacy */}
      <p className="text-xs text-white/60 text-center leading-relaxed">
        By signing {mode === "sign-up" ? "up" : "in"}, you agree to our{" "}
        <a href="/terms" className="text-[#74FF52] hover:text-[#66e648] underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-[#74FF52] hover:text-[#66e648] underline">
          Privacy Policy
        </a>
        .
      </p>

      {/* Switch Mode Link */}
      <p className="text-sm text-white/60 text-center">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={onSwitchMode}
              className="text-[#74FF52] hover:text-[#66e648] underline"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={onSwitchMode}
              className="text-[#74FF52] hover:text-[#66e648] underline"
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  );
}





