import CreditCardsGrid from "./CreditCardsGrid";

export default function CreditsTab() {
  return (
    <>
      {/* Disclaimer */}
      <div className="mt-4 mb-6 px-4 py-3 bg-[#121214] border border-slate-800/30 rounded-lg">
        <p className="text-sm text-white/80">
          Note: Credits cannot be exchanged for memberships, nor refunded,
          transferred or withdrawn. 2 years validity upon redemption.{" "}
          <a href="#" className="text-[#74FF52] hover:underline">
            Credits Policy
          </a>
        </p>
      </div>

      <CreditCardsGrid />
    </>
  );
}


