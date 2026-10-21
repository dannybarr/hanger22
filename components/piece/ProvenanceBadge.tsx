import { formatSeen, formatSourceMoney } from "@/lib/money";
import type { SourceListing } from "@/lib/schema";

const PLATFORM: Record<SourceListing["platform"], string> = {
  ebay: "eBay",
  grailed: "Grailed",
  vestiaire: "Vestiaire",
  farfetch: "Farfetch",
  stockx: "StockX",
  jolicloset: "Joli Closet",
  retail: "Retail reference",
  other: "Desk comp",
};

export function ProvenanceBadge({ source }: { source: SourceListing }) {
  return (
    <a
      href={source.url}
      className="block border border-line px-3 py-2 text-[12px] leading-relaxed text-body hover:border-ink"
      rel="noreferrer"
      target="_blank"
    >
      <span className="tracking-[0.12em] text-ink uppercase">{PLATFORM[source.platform]}</span>
      <span className="mx-2 text-muted">·</span>
      <span className="js-price tabular-nums">{formatSourceMoney(source.priceShown.amount, source.priceShown.currency)}</span>
      <span className="mx-2 text-muted">·</span>
      <span>{formatSeen(source.seenAt)}</span>
      <span className="mx-2 text-muted">·</span>
      <span>{source.sold ? "Sold comp" : "Live when seen"}</span>
      {source.note ? <span className="mt-1 block text-muted">{source.note}</span> : null}
    </a>
  );
}
