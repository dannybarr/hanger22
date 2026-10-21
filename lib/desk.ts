import { toGBP } from "@/lib/money";
import type { Item } from "@/lib/schema";

/** Markup and margin at the guide midpoint. The public guide stays the customer price. */
export function economicsFromGuide(
  cost: { amount: number; currency: Item["costBasis"]["currency"] },
  guide: { min: number; max: number },
) {
  const costGBP = toGBP(cost.amount, cost.currency);
  const mid = (guide.min + guide.max) / 2;
  const markupPct = Math.round((mid / costGBP - 1) * 1000) / 10;
  const estimatedMarginGBP = Math.round(mid - costGBP);
  return { costGBP, mid, markupPct, estimatedMarginGBP };
}

/** Share of the list midpoint that sits above what the desk pays. */
export function priceToMarketGap(item: Item) {
  const { costGBP, mid } = economicsFromGuide(item.costBasis, item.guidePriceGBP);
  if (mid <= 0) return 0;
  return (mid - costGBP) / mid;
}

/**
 * 0–100. Margin (40), demand (30) and the gap between list and cost (30).
 * A piece already in the vault still has a score; the desk marks it held.
 */
export function buyOutrightScore(item: Item) {
  const marginPoints = Math.max(0, Math.min(item.markupPct / 40, 1)) * 40;
  const demandPoints = Math.max(0, Math.min(item.demandSignal, 1)) * 30;
  const gapPoints = Math.max(0, Math.min(priceToMarketGap(item), 1)) * 30;
  return Math.round(marginPoints + demandPoints + gapPoints);
}

export function demandLabel(signal: number) {
  if (signal >= 0.75) return "Hot";
  if (signal >= 0.45) return "Steady";
  return "Quiet";
}
