import Image from "next/image";
import Link from "next/link";
import { formatRange } from "@/lib/money";
import type { PublicItem } from "@/lib/schema";

function Cutout({ item, priority = false }: { item: PublicItem; priority?: boolean }) {
  const width = item.images.pixelWidth ?? 1024;
  const height = item.images.pixelHeight ?? 1024;
  return (
    <Image
      src={item.images.front}
      alt=""
      width={width}
      height={height}
      quality={92}
      priority={priority}
      sizes="(max-width: 768px) 80vw, 420px"
      className="piece-shadow h-auto w-full"
    />
  );
}

export function Storefront({ items }: { items: PublicItem[] }) {
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-8 pb-24">
      <p className="text-[11px] tracking-[0.16em] text-ink uppercase">The edit</p>
      <h2 className="display mt-3 text-4xl text-ink sm:text-6xl">Pieces</h2>
      <Link href={`/p/${lead.slug}`} className="group mt-16 grid items-end gap-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16">
        <div className="mx-auto w-full max-w-[420px] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
          <Cutout item={lead} priority />
        </div>
        <div className="max-w-xl pb-2">
          <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{lead.brand}</p>
          <h3 className="display mt-3 text-4xl text-ink sm:text-5xl">{lead.shortTitle}</h3>
          <p className="mt-5 text-[16px] leading-relaxed text-ink">{formatRange(lead.guidePriceGBP.min, lead.guidePriceGBP.max)}</p>
          <p className="mt-6 line-clamp-4 text-[15px] leading-relaxed text-muted">{lead.story}</p>
          <span className="mt-8 inline-block text-[11px] tracking-[0.16em] text-ink uppercase">View the piece</span>
        </div>
      </Link>
      <ul className="mt-24 grid gap-x-12 gap-y-20 sm:grid-cols-2">
        {rest.map((item) => (
          <li key={item.id}>
            <Link href={`/p/${item.slug}`} className="group block">
              <div className="mx-auto w-full max-w-[420px] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                <Cutout item={item} />
              </div>
              <p className="mt-6 text-[11px] tracking-[0.16em] text-muted uppercase">{item.brand}</p>
              <h3 className="display mt-2 text-[32px] text-ink">{item.shortTitle}</h3>
              <p className="mt-2 text-[15px] text-ink">{formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
