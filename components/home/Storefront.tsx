import Image from "next/image";
import Link from "next/link";
import { PieceCard } from "@/components/piece/PieceCard";
import { HOUSES, housesFor } from "@/lib/brands";
import type { PublicItem } from "@/lib/schema";

const STEPS = [
  {
    title: "Reserve",
    body: "Choose a piece and tell us your size. It takes a minute and nothing is charged.",
  },
  {
    title: "We confirm",
    body: "We secure the piece, check it against its labels and send you photographs of the details and any wear.",
  },
  {
    title: "Pay, then wear",
    body: "Happy with what you see? Pay by secure link and we send it on. You still have 14 days to change your mind.",
  },
];

export function Storefront({ items }: { items: PublicItem[] }) {
  if (items.length === 0) return null;
  const carried = HOUSES.filter((house) => items.some((item) => housesFor(item.brand).includes(house)));

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8" aria-labelledby="edit-title">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">On the rail now</p>
            <h2 id="edit-title" className="display mt-3 text-[40px] text-ink sm:text-[56px]">
              The edit
            </h2>
          </div>
          <Link href="/pieces" className="nav-link mb-2 shrink-0">
            Shop all {items.length}
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id}>
              <PieceCard item={item} priority={index < 3} />
            </li>
          ))}
        </ul>
      </section>

      <section className="tile" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-20">
            <div>
              <p className="eyebrow">How buying works</p>
              <h2 id="how-title" className="display mt-3 text-[40px] text-ink sm:text-[48px]">
                See it before you pay
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
                Rare pieces deserve a careful handover. You pay nothing until you have seen the piece up close and said yes.
              </p>
              <Link href="/reserving" className="nav-link mt-8 inline-block">
                How reserving works
              </Link>
            </div>
            <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
              {STEPS.map((step, index) => (
                <li key={step.title} className="border-t border-ink pt-5">
                  <p className="mono text-[12px] text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="display mt-4 text-[26px] text-ink">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {carried.length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-labelledby="houses-title">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">The houses</p>
              <h2 id="houses-title" className="display mt-3 text-[40px] text-ink sm:text-[48px]">
                Brands on the rail
              </h2>
            </div>
            <Link href="/brands" className="nav-link mb-2 shrink-0">
              All brands
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 border-t border-l border-line sm:grid-cols-4">
            {carried.map((house) => (
              <li key={house.slug} className="border-r border-b border-line">
                <Link href={`/brands/${house.slug}`} className="group flex h-32 items-center justify-center px-8 sm:h-40" aria-label={house.name}>
                  <Image
                    src={`/brands/${house.file}`}
                    alt=""
                    width={160}
                    height={56}
                    unoptimized
                    className="h-10 w-auto max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 sm:h-12"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border-t border-line" aria-labelledby="hunt-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Looking for something else</p>
            <h2 id="hunt-title" className="display mt-3 text-[40px] text-ink sm:text-[48px]">
              Tell us the grail. We will hunt it down
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              The rail is small on purpose. Behind it, we search with trusted sellers and collectors across the UK, Europe and Japan.
            </p>
          </div>
          <Link href="/contact" className="pill-btn">
            Ask for a piece
          </Link>
        </div>
      </section>
    </>
  );
}
