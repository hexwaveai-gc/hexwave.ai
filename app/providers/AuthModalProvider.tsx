"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import AuthModal from "@/app/components/common/AuthModal";
import { AuthMode } from "@/app/components/common/auth";

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  openSignUp: () => void;
  openSignIn: () => void;
  closeModal: () => void;
  setMode: (mode: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-up");

  const openSignUp = useCallback(() => {
    setMode("sign-up");
    setIsOpen(true);
  }, []);

  const openSignIn = useCallback(() => {
    setMode("sign-in");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleModeChange = useCallback((newMode: AuthMode) => {
    setMode(newMode);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openSignUp,
        openSignIn,
        closeModal,
        setMode,
      }}
    >
      {children}
      <AuthModal
        open={isOpen}
        onOpenChange={setIsOpen}
        initialMode={mode}
        onModeChange={handleModeChange}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}

// Backwards compatibility - alias for useAuthModal
export function useSignUpModal() {
  const { openSignUp, closeModal, isOpen, mode } = useAuthModal();
  return {
    isOpen: isOpen && mode === "sign-up",
    openModal: openSignUp,
    closeModal,
  };
}

export function useSignInModal() {
  const { openSignIn, closeModal, isOpen, mode } = useAuthModal();
  return {
    isOpen: isOpen && mode === "sign-in",
    openModal: openSignIn,
    closeModal,
  };
}



