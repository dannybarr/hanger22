import type { Item } from "@/lib/schema";

export const CUT_LABEL: Record<Item["cutReason"], string> = {
  collab: "Collaboration",
  limited: "Limited",
  one_off: "One of one",
  rare_from_range: "Rare from the range",
};

export const MARKET_NOTE: Record<Item["sourceMarket"], string> = {
  JP: "Imported from Japan",
  UK: "From the UK",
  EU: "From Europe",
  US: "From the United States",
  CN: "Retail reference, China",
};

export function cutLabel(reason: Item["cutReason"]) {
  return CUT_LABEL[reason];
}

export function marketNote(market: Item["sourceMarket"]) {
  return MARKET_NOTE[market];
}
