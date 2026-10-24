import Image from "next/image";
import Link from "next/link";
import { formatGBP, priceOf } from "@/lib/money";
import type { PublicItem } from "@/lib/schema";

export function PieceCard({ item, priority = false }: { item: PublicItem; priority?: boolean }) {
  const width = item.images.pixelWidth ?? 1024;
  const height = item.images.pixelHeight ?? 1024;
  return (
    <article className="group">
      <Link href={`/p/${item.slug}`} className="block">
        <div className="tile relative aspect-[4/5] overflow-hidden">
          <Image
            src={item.images.front}
            alt={item.title}
            width={width}
            height={height}
            quality={92}
            priority={priority}
            sizes="(max-width: 1024px) 46vw, 320px"
            className="piece-shadow absolute inset-0 m-auto h-[82%] w-[82%] object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,0.8,0.22,1)] group-hover:-translate-y-2 group-hover:scale-[1.03]"
          />
        </div>
        <p className="eyebrow mt-4">{item.brand}</p>
        <h3 className="mt-1.5 text-[15px] leading-snug text-ink">{item.shortTitle}</h3>
        <p className="mt-1.5 text-[15px] font-medium text-ink">{formatGBP(priceOf(item))}</p>
      </Link>
    </article>
  );
}
