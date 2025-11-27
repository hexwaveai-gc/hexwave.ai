"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Flame, Sparkles, Check, Loader2 } from "lucide-react";
import { CreditPackage } from "@/constants/plan";
import { cn } from "@/lib/utils";

interface CreditCardProps {
  pkg: CreditPackage;
  onPurchase?: (pkg: CreditPackage) => void;
  isLoading?: boolean;
  paddleLoaded?: boolean;
}

export default function CreditCard({
  pkg,
  onPurchase,
  isLoading,
  paddleLoaded = true,
}: CreditCardProps) {
  const hasBonus = pkg.bonusPercent > 0;

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 group overflow-hidden",
        pkg.bestValue
          ? "border-[#74FF52]/50 shadow-lg shadow-[#74FF52]/10"
          : pkg.popular
          ? "border-purple-500/50 shadow-lg shadow-purple-500/10"
          : "border-white/10 hover:border-white/20"
      )}
      style={{
        background: pkg.bestValue
          ? "linear-gradient(180deg, #1a3d1a 0%, #0d1f0d 40%, #0a0a0a 100%)"
          : pkg.popular
          ? "linear-gradient(180deg, #3b1d5e 0%, #1a0a2e 40%, #0a0a0a 100%)"
          : "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
      }}
    >
      {/* Badge */}
      {pkg.bestValue && (
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg bg-[#74FF52] text-black text-xs font-bold">
          BEST VALUE
        </div>
      )}
      {pkg.popular && !pkg.bestValue && (
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg bg-purple-500 text-white text-xs font-bold">
          POPULAR
        </div>
      )}

      {/* Bonus Banner */}
      {hasBonus && (
        <div
          className={cn(
            "absolute top-8 left-0 right-0 text-[10px] font-bold py-1.5 text-center",
            pkg.bestValue
              ? "bg-[#74FF52]/20 text-[#74FF52]"
              : "bg-amber-500/20 text-amber-400"
          )}
        >
          +{pkg.bonusPercent}% BONUS CREDITS
        </div>
      )}

      <div className={cn("p-6", hasBonus ? "mt-6" : "mt-4")}>
        {/* Credits Display */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame
              className={cn(
                "w-6 h-6 flex-shrink-0",
                pkg.bestValue
                  ? "text-[#74FF52]"
                  : pkg.popular
                  ? "text-purple-400"
                  : "text-amber-400"
              )}
            />
            <span
              className={cn(
                "text-3xl font-bold",
                pkg.bestValue
                  ? "text-[#74FF52]"
                  : pkg.popular
                  ? "text-purple-400"
                  : "text-white"
              )}
            >
              {pkg.credits.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-white/50">credits</p>
          {hasBonus && (
            <p className="text-xs text-white/60 mt-1">
              {pkg.baseCredits.toLocaleString()} + {pkg.bonusCredits.toLocaleString()} bonus
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">${pkg.price}</span>
            <span className="text-sm text-white/40">one-time</span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            ${(pkg.price / pkg.credits * 100).toFixed(2)} per 100 credits
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-xs text-white/60">
            <Check className="w-3.5 h-3.5 text-[#74FF52]" />
            Never expires
          </li>
          <li className="flex items-center gap-2 text-xs text-white/60">
            <Check className="w-3.5 h-3.5 text-[#74FF52]" />
            Use anytime
          </li>
          {hasBonus && (
            <li className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400">{pkg.bonusPercent}% bonus included</span>
            </li>
          )}
        </ul>

        {/* CTA Button */}
        <Button
          onClick={() => onPurchase?.(pkg)}
          disabled={isLoading || !paddleLoaded}
          className={cn(
            "w-full font-semibold py-2.5 transition-all duration-200",
            pkg.bestValue
              ? "bg-[#74FF52] text-black hover:bg-[#66e648]"
              : pkg.popular
              ? "bg-purple-500 text-white hover:bg-purple-400"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            `Purchase $${pkg.price}`
          )}
        </Button>
      </div>
    </div>
  );
}
