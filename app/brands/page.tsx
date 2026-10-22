import type { Metadata } from "next";
import Link from "next/link";
import { BrandWall } from "@/components/brands/BrandWall";

export const metadata: Metadata = {
  title: "Brand story",
  description: "The houses on the Hanger 22 wall.",
};

export default function BrandsPage() {
  return (
    <main id="content" className="wall-room">
      <header className="wall-nav">
        <nav aria-label="Primary" className="flex gap-5">
          <Link href="/pieces" className="nav-link">
            Pieces
          </Link>
        </nav>
        <Link href="/" className="text-ink">
          <h1 className="text-center leading-[0.9]">
            <span className="sr-only">Brand story. </span>
            <span className="block font-script text-[26px]">Hanger</span>
            <span className="block font-script text-[18px]">22</span>
          </h1>
        </Link>
        <nav aria-label="Secondary" className="flex gap-5">
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
      </header>
      <BrandWall />
    </main>
  );
}
