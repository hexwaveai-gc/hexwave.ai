import { Gift } from "lucide-react";

export default function BlackFridayBanner() {
  return (
    <div className="mb-6 px-6 py-5 bg-gradient-to-br from-[#0d2818] via-[#1a1c1f] to-[#0a0a0a] border border-[#74FF52]/20 rounded-xl relative overflow-hidden">
      {/* Diagonal stripe pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(116, 255, 82, 0.1) 10px,
            rgba(116, 255, 82, 0.1) 20px
          )`
        }} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-white">
            BLACK FRIDAY SALE
          </span>
          <span className="px-2.5 py-1 bg-[#74FF52] text-[#0a0a0a] text-xs font-bold rounded">
            Nov. 17 - Nov. 28 (UTC-8)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm mb-2">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#74FF52] flex-shrink-0" />
            <span className="text-white font-semibold">
              50% OFF 1st-Year Subscription
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#74FF52] font-semibold">
              40% Extra Up to Credits
            </span>
          </div>
        </div>
        <div className="text-xs text-white/80">
          Unlimited Mode Available for Ultra & Premier
        </div>
      </div>
    </div>
  );
}

