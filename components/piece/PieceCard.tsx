import Image from "next/image";
import Link from "next/link";
import { formatRange } from "@/lib/money";
import type { PublicItem } from "@/lib/schema";

export function PieceCard({ item }: { item: PublicItem }) {
  const width = item.images.pixelWidth ?? 1024;
  const height = item.images.pixelHeight ?? 1024;
  return (
    <article className="group">
      <Link href={`/p/${item.slug}`} className="block">
        <div className="mx-auto w-full max-w-[280px] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
          <Image
            src={item.images.front}
            alt=""
            width={width}
            height={height}
            quality={92}
            sizes="(max-width: 768px) 46vw, 280px"
            className="piece-shadow h-auto w-full"
          />
        </div>
        <p className="mt-5 text-[11px] tracking-[0.14em] text-muted uppercase">{item.brand}</p>
        <h2 className="display mt-1 text-[22px] text-ink">{item.shortTitle}</h2>
        <p className="mt-2 text-[13px] text-ink">{formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)}</p>
      </Link>
    </article>
  );
}
