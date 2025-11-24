import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Plan } from "@/constants/plan";

interface PlanCardProps {
  plan: Plan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const Icon = plan.icon;

  return (
    <Card
      className={cn(
        "relative border-2 overflow-hidden flex flex-col",
        plan.borderColor,
        plan.id === "ultra" && "ring-2 ring-orange-500/30"
      )}
      style={{
        background: plan.bgGradient,
      }}
    >
      {plan.isNew && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded z-10">
          NEW
        </div>
      )}

      {/* Top Part */}
      <div className="relative p-6 pb-4 flex flex-col min-h-[280px]">
        {/* Icon */}
        <div className="flex justify-end mb-3">
          <div className={cn("p-2", plan.iconColor)}>
            <Icon className={cn("w-8 h-8", plan.iconColor)} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-normal text-white leading-7 h-7">
            {plan.name}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-normal text-white">
              $<i className="not-italic font-semibold">{plan.monthlyPrice}</i> / Month
            </span>
            <span className="text-base text-white/50 line-through">
              ${plan.originalMonthlyPrice}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 text-xs text-white/70">
          Next monthly renewal: <i className="not-italic text-white font-medium">${plan.nextRenewal}</i> (12% off)
        </div>

        {/* Tags */}
        <div className="mb-4">
          <div className="inline-block px-3 py-1 bg-white/10 rounded text-xs text-white border border-white/20">
            Up to {plan.discount} off
          </div>
        </div>

        {/* Buy Section */}
        <div className="mt-auto">
          <Button
            className="w-full bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] font-semibold h-10 text-sm"
          >
            Subscribe Special Offer
          </Button>
          <div className="mt-2 text-[10px] text-white/50 text-center leading-tight">
            <span>Discount only for the first subscription, cancel Anytime</span>
          </div>
        </div>
      </div>

      {/* Bottom Part */}
      <div className="px-6 pb-6 pt-4 border-t border-white/10">
        {/* Benefit Top */}
        <div className="mb-4">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("w-[18px] h-[18px]", plan.iconColor)} />
              <span className="text-sm text-white">
                <i className="not-italic font-semibold">{plan.credits.toLocaleString()}</i> Credits per month
              </span>
            </div>
            <div className="text-xs text-white/70 space-y-1 ml-7">
              <div>
                As low as <i className="not-italic text-white font-medium">${plan.creditsPer100}</i> per <i className="not-italic text-white font-medium">100</i> Credits
              </div>
              <div>
                <i className="not-italic text-white font-medium">{plan.images.toLocaleString()}</i> images / <i className="not-italic text-white font-medium">{plan.videos}</i> standard videos
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Icon className={cn("w-[18px] h-[18px]", plan.iconColor)} />
              <span className="text-sm text-white">Queue unlimited tasks</span>
            </div>
          </div>
        </div>

        {/* Benefit Bottom */}
        <div className="space-y-2 pl-2">
          {plan.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-[18px] h-[18px] text-[#74FF52] flex-shrink-0 mt-0.5" />
              <span className="text-xs text-white/80 leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}


