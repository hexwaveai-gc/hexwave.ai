import Image from "next/image";
import Link from "next/link";

/**
 * SidebarLogo component - Server component
 * Renders the application logo in the sidebar
 * 
 * @reasoning Using a server component since this is static content
 * that doesn't require client-side interactivity
 */
export function SidebarLogo() {
  return (
    <div className="pt-6 flex justify-center">
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity"
        aria-label="Hexwave.ai Home"
      >
        <Image
          src="/logo/hexwave.png"
          alt="Hexwave.ai logo"
          width={32}
          height={32}
          className="w-10 h-10"
          style={{
            filter: "brightness(0) saturate(100%) invert(1)",
            opacity: 1,
          }}
          priority
        />
      </Link>
    </div>
  );
}

