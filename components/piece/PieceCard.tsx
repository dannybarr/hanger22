import Link from "next/link";
import { PriceTicker } from "@/components/eggs/PriceTicker";
import { Garment } from "@/components/rail/garments";
import { cutLabel, marketNote } from "@/lib/cut";
import { AvailabilityBadge } from "@/components/piece/AvailabilityBadge";
import { formatRange } from "@/lib/money";
import type { PublicItem } from "@/lib/schema";
import { PLACEHOLDER_NOTE } from "@/lib/site";

export function PieceCard({ item }: { item: PublicItem }) {
  return (
    <article className="group">
      <Link href={`/p/${item.slug}`} className="block">
        <div className="dotgrid relative flex h-64 items-end justify-center overflow-hidden border border-line px-4 pt-6">
          <div className="relative h-52 w-36">
            <Garment
              art={item.art}
              pose="front"
              uid={`card-${item.id}`}
              src={item.images.imageStatus === "cutout" ? item.images.front : undefined}
              label={item.images.imageStatus === "placeholder" ? item.shortTitle : undefined}
            />
          </div>
        </div>
        <p className="mt-4 text-[11px] tracking-[0.14em] text-ink uppercase">{cutLabel(item.cutReason)}</p>
        <h2 className="display mt-1 text-[22px] text-ink">{item.shortTitle}</h2>
        <p className="mt-1 text-[12px] tracking-[0.08em] text-muted uppercase">{item.brand}</p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed">{item.story}</p>
        <p className="mt-2 text-[12px] text-ink">{marketNote(item.sourceMarket)}</p>
        <div className="mt-2">
          <AvailabilityBadge availability={item.availability} />
        </div>
        <p className="mt-2 text-[12px] text-muted">
          <PriceTicker value={formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)} />
        </p>
        {item.images.imageStatus === "placeholder" ? <p className="mt-2 text-[11px] text-muted">{PLACEHOLDER_NOTE}</p> : null}
        {item.vaultCandidate ? <p className="mt-1 text-[11px] tracking-[0.12em] text-ink uppercase">Vault candidate</p> : null}
      </Link>
    </article>
  );
}
