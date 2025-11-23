import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Flame } from "lucide-react";
import { CreditPackage } from "@/constants/plan";

interface CreditCardProps {
  pkg: CreditPackage;
}

export default function CreditCard({ pkg }: CreditCardProps) {
  return (
    <Card className="bg-[#121214] border-slate-800/30 p-5 flex flex-col relative overflow-hidden min-h-[220px]">
      {/* Bonus Banner */}
      <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-[#0a0a0a] text-[10px] font-bold py-1.5 text-center">
        Limited-Time {pkg.bonusPercent}% Bonus
      </div>

      <div className="mt-8 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-[#74FF52] flex-shrink-0" />
          <span className="text-3xl font-bold text-[#74FF52]">
            {pkg.credits.toLocaleString()}
          </span>
        </div>
        {pkg.id > 1 && (
          <p className="text-xs text-white/60 leading-relaxed">
            Total: {pkg.baseCredits.toLocaleString()} +{" "}
            {pkg.bonusCredits.toLocaleString()}Bonus
          </p>
        )}
      </div>

      <div className="mt-auto space-y-3">
        <div className="text-center">
          <span className="text-2xl font-bold text-white">
            ${pkg.price}
          </span>
        </div>
        <Button
          className="w-full bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] font-semibold py-2.5"
        >
          Purchase
        </Button>
      </div>
    </Card>
  );
}

