export default function PlanModalFooter() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#1e1f21ff] border-t border-slate-800/30 px-6 py-3 text-center text-sm text-white/60 z-10">
      Don't see what you need?{" "}
      <a
        href="#"
        className="text-[#74FF52] hover:underline"
      >
        View Terms of Paid Service
      </a>{" "}
      or{" "}
      <a
        href="#"
        className="text-[#74FF52] hover:underline"
      >
        Contact us
      </a>
      .
    </div>
  );
}


