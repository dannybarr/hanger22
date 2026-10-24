import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { getHouse, HOUSES, housesFor } from "@/lib/brands";
import { getPublicItems } from "@/lib/data";

type Params = { slug: string };

export function generateStaticParams() {
  return HOUSES.map((house) => ({ slug: house.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const house = getHouse(slug);
  if (!house) return { title: "Brand" };
  const stocked = getPublicItems().some((item) => housesFor(item.brand).some((entry) => entry.slug === house.slug));
  return {
    robots: stocked ? undefined : { index: false, follow: true },
    title: house.name,
    description: `${house.name} at Hanger 22. Rare pieces and collaborations.`,
  };
}

export default async function HousePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const house = getHouse(slug);
  if (!house) notFound();
  const pieces = getPublicItems().filter((item) => housesFor(item.brand).some((entry) => entry.slug === house.slug));

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
          <Link href="/brands" className="hover:text-ink">
            Brands
          </Link>
          <span aria-hidden> / </span>
          <span className="text-ink">{house.name}</span>
        </nav>
        <header className="mt-8 flex flex-col items-start gap-6 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Image src={`/brands/${house.file}`} alt="" width={220} height={60} unoptimized className="h-12 w-auto max-w-[220px] object-contain object-left" />
            <h1 className="display mt-8 text-[48px] text-ink sm:text-[64px]">{house.name}</h1>
          </div>
          <p className="text-[13px] text-muted">
            {pieces.length > 0 ? `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"} on the rail` : "Nothing on the rail right now"}
          </p>
        </header>

        {pieces.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
            {pieces.map((item) => (
              <li key={item.id}>
                <PieceCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 max-w-lg">
            <p className="display text-[28px] text-ink">Looking for {house.name}?</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Pieces come and go quickly. Tell us what you are after and we will search for it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="pill-btn">
                Ask for a piece
              </Link>
              <Link href="/pieces" className="pill-btn">
                Shop all
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
