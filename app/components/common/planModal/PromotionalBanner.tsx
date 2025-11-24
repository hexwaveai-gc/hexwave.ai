import { Crown } from "lucide-react";

export default function PromotionalBanner() {
  return (
    <div className="mt-4 mb-3 flex items-center px-4 py-2.5 bg-[#262626] border border-slate-800/30 rounded-lg">
      <Crown 
        className="w-4 h-4 text-amber-400 flex-shrink-0" 
        style={{ width: '16px', height: '16px', marginRight: '8px', marginTop: '1px' }}
      />
      <div className="text-sm text-amber-100 leading-relaxed">
        Exclusive for Ultra & Premier subscribers:{" "}
        <span className="font-semibold text-amber-300">Unlimited Mode</span> now
        available, only from Nov 17 to Dec 5 (UTC-8). Don't miss out!
      </div>
    </div>
  );
}


