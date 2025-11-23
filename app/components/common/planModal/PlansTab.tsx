"use client";

import { useState } from "react";
import PromotionalBanner from "./PromotionalBanner";
import BlackFridayBanner from "./BlackFridayBanner";
import SubscriptionToggle from "./SubscriptionToggle";
import PlanCardsGrid from "./PlanCardsGrid";

export default function PlansTab() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <PromotionalBanner />
      <BlackFridayBanner />
      <SubscriptionToggle isYearly={isYearly} onToggle={setIsYearly} />
      <PlanCardsGrid />
    </>
  );
}

