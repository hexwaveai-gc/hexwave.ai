"use client";

import { TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";

export default function PlanModalHeader() {
  return (
    <div className="sticky top-0 bg-[#1e1f21ff] z-10 border-b border-slate-800/30 px-6 pt-4">
      <div className="flex items-center justify-between gap-4">
        <TabsList className="bg-transparent border-none p-0 h-auto gap-0">
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[#74FF52] rounded-none px-5 py-3 text-base font-semibold text-white/70 hover:text-white transition-colors border-b-2 border-transparent relative data-[state=active]:border-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#74FF52] after:to-yellow-400 after:opacity-0 data-[state=active]:after:opacity-100 after:transition-opacity"
          >
            Plans
          </TabsTrigger>
          <TabsTrigger
            value="credits"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[#74FF52] rounded-none px-5 py-3 text-base font-semibold text-white/70 hover:text-white transition-colors border-b-2 border-transparent relative data-[state=active]:border-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#74FF52] after:to-yellow-400 after:opacity-0 data-[state=active]:after:opacity-100 after:transition-opacity"
          >
            Credits
          </TabsTrigger> 
        </TabsList>
      </div>
      
      {/* Referral Code Promotion - Mobile */}
      <div className="lg:hidden mt-4 pb-4 flex flex-col gap-3">
        <div className="text-sm text-white">
          Use Referral Code for{" "}
          <span className="text-[#74FF52] font-semibold">50%</span>{" "}
          Bonus Credits First Month
        </div>
        <div className="text-xs text-white/70">
          (First-Time Subscriber Only, up to 5000 Bonus Credits)
        </div>
        <Button
          className="bg-[#74FF52] text-[#0a0a0a] hover:bg-[#66e648] font-semibold px-4 py-2 w-full"
        >
          Enter Code Now
        </Button>
      </div>
    </div>
  );
}

