import type { Metadata } from "next";
import Link from "next/link";
import { BrandWall } from "@/components/brands/BrandWall";
import { Wordmark } from "@/components/layout/Wordmark";

export const metadata: Metadata = {
  title: "Brands",
  description: "The houses whose pieces we hunt for.",
};

export default function BrandsPage() {
  return (
    <main id="content" className="wall-room">
      <header className="wall-nav">
        <nav aria-label="Primary" className="flex gap-6">
          <Link href="/pieces" className="nav-link">
            Shop all
          </Link>
        </nav>
        <Link href="/" aria-label="Hanger 22, home">
          <h1>
            <span className="sr-only">The brands at Hanger 22. </span>
            <Wordmark className="text-[#f6f1e8]" />
          </h1>
        </Link>
        <nav aria-label="Secondary" className="flex gap-6">
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
      </header>
      <p className="pointer-events-none absolute bottom-[3vh] left-1/2 z-[5] w-max -translate-x-1/2 text-[11px] font-medium tracking-[0.14em] text-[#f6f1e8] uppercase [text-shadow:0_1px_2px_rgba(30,16,6,0.65)]">
        Choose a house to see its pieces
      </p>
      <BrandWall />
    </main>
  );
}
