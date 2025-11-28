"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BetaDialog({ open, onOpenChange }: BetaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#151515] border-white/10">
        <DialogHeader className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#74FF52]/20 to-cyan-500/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#74FF52] to-cyan-400 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#0a0a0a]" />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-white text-center">
            Exclusive Beta Access
          </DialogTitle>
          
          <DialogDescription className="text-white/60 text-center pt-2">
            The Video Agent is currently in private beta and available exclusively
            to select users. Join our waitlist to get early access to this
            powerful AI video generation feature.
          </DialogDescription>
        </DialogHeader>

        {/* Features Preview */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <Sparkles className="w-5 h-5 text-[#74FF52] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">AI-Powered Video Creation</p>
              <p className="text-xs text-white/50">
                Transform text prompts into professional multi-scene videos
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Realistic AI Avatars</p>
              <p className="text-xs text-white/50">
                Choose from hundreds of professional presenters
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-[#74FF52] to-cyan-400 text-[#0a0a0a] font-semibold hover:opacity-90 transition-opacity"
          >
            <Link href="/pricing">
              Join Waitlist
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-white/60 hover:text-white hover:bg-white/5"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


