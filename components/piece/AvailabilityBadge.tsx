import type { PublicItem } from "@/lib/schema";

export function fulfilmentCopy(availability: PublicItem["availability"]) {
  return availability === "in_vault" ? "In the Vault, ships now" : "Sourced to order, 5–10 days";
}

export function AvailabilityBadge({ availability }: { availability: PublicItem["availability"] }) {
  const held = availability === "in_vault";
  return (
    <p className={`inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase ${held ? "text-ink" : "text-muted"}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${held ? "bg-ink" : "border border-muted"}`} aria-hidden />
      {fulfilmentCopy(availability)}
    </p>
  );
}
