"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import PlanModalHeader from "./PlanModalHeader";
import PlansTab from "./PlansTab";
import CreditsTab from "./CreditsTab";
import PlanModalFooter from "./PlanModalFooter";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradePlanModal({
  open,
  onOpenChange,
}: UpgradePlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1e1f21ff] border-slate-800/30 text-white p-0 flex flex-col [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:top-4 [&>button]:right-4">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade Plan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 relative">
          <Tabs defaultValue="plans" className="w-full flex flex-col flex-1 min-h-0">
            <PlanModalHeader />

            <TabsContent value="plans" className="mt-0 px-6 pb-20 flex-1 overflow-y-auto min-h-0">
              <PlansTab />
            </TabsContent>

            <TabsContent value="credits" className="mt-0 px-6 pb-20 flex-1 overflow-y-auto min-h-0">
              <CreditsTab />
            </TabsContent>
          </Tabs>

          <PlanModalFooter />
        </div>
      </DialogContent>
    </Dialog>
  );
}
