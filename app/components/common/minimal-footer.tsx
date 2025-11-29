import Link from "next/link";

export function MinimalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0a0a]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <p className="text-white/50 text-sm">
            <span className="whitespace-nowrap">© {currentYear} Hexwave AI™.</span>
            <span className="md:inline"> All rights reserved.</span>
          </p>

          {/* Links */}
          <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <li>
              <Link
                href="/about"
                className="text-white/50 text-sm font-medium hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-white/50 text-sm font-medium hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-white/50 text-sm font-medium hover:text-white transition-colors"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </footer>
  );
}

