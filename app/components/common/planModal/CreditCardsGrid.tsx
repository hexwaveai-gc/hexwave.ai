import { creditPackages } from "@/constants/plan";
import CreditCard from "./CreditCard";

export default function CreditCardsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {creditPackages.map((pkg) => (
        <CreditCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}


