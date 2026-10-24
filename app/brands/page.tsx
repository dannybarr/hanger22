import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandWall } from "@/components/brands/BrandWall";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { HOUSES, housesFor } from "@/lib/brands";
import { getPublicItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Brands",
  description: "The houses on the Hanger 22 rail, and the ones we hunt for.",
};

export default function BrandsPage() {
  const items = getPublicItems();
  const stocked = HOUSES.filter((house) => items.some((item) => housesFor(item.brand).includes(house)));

  return (
    <>
      <SiteHeader />
      <main id="content">
        <h1 className="sr-only">Brands</h1>
        <section aria-label="The brand wall" className="wall-room" style={{ height: "calc(100dvh - 97px)", minHeight: 480 }}>
          <BrandWall />
          <p className="pointer-events-none absolute bottom-[3vh] left-1/2 z-[5] w-max -translate-x-1/2 bg-[rgba(23,19,15,0.72)] px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-[#f6f1e8] uppercase">
            Choose a house
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-labelledby="stocked">
          <p className="eyebrow">On the rail now</p>
          <h2 id="stocked" className="display mt-3 text-[40px] text-ink sm:text-[48px]">
            Shop by brand
          </h2>
          <ul className="mt-10 grid grid-cols-2 border-t border-l border-line sm:grid-cols-4">
            {stocked.map((house) => {
              const count = items.filter((item) => housesFor(item.brand).includes(house)).length;
              return (
                <li key={house.slug} className="border-r border-b border-line">
                  <Link href={`/brands/${house.slug}`} className="group flex h-40 flex-col items-center justify-center gap-4 px-8">
                    <Image src={`/brands/${house.file}`} alt="" width={160} height={56} unoptimized className="h-10 w-auto max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100" />
                    <span className="text-[13px] text-muted">
                      {house.name}, {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-10 max-w-2xl text-[15px] leading-relaxed text-muted">
            The wall shows the houses we look for. If you want something from one we do not have on the rail,{" "}
            <Link href="/contact" className="text-ink underline underline-offset-4">
              ask us for it
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
