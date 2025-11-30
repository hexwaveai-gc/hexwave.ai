import Image from "next/image";
import Link from "next/link";

export function SidebarLogo() {
  return (
    <div className="pt-6 flex justify-center">
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <Image
          src="/logo/hexwave.png"
          alt="Hexwave.ai logo"
          width={32}
          height={32}
          className="w-15 h-15"
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
