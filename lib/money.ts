export const FX_TO_GBP = {
  GBP: 1,
  USD: 0.7532,
  EUR: 0.843,
  CNY: 0.1055,
} as const;

export type Currency = keyof typeof FX_TO_GBP;

/** Illustrative mid-market rates for guide prices, October 2026. Not a live FX feed. */
export const FX_NOTE =
  "Guide prices use fixed October 2026 rates (USD 0.7532, EUR 0.843, CNY 0.1055 to GBP), then a sourcing margin of 1.20–1.35, rounded.";

export function toGBP(amount: number, currency: Currency) {
  return amount * FX_TO_GBP[currency];
}

export function roundGuide(n: number) {
  const step = n >= 5000 ? 50 : n >= 500 ? 10 : 5;
  return Math.round(n / step) * step;
}

/** Source price × 1.20 (min) and × 1.35 (max), in GBP, rounded. */
export function guideFromSource(amount: number, currency: Currency) {
  const gbp = toGBP(amount, currency);
  return { min: roundGuide(gbp * 1.2), max: roundGuide(gbp * 1.35) };
}

export const PRICE_BANDS = [
  { id: "under-500", label: "Under £500", min: 0, max: 500 },
  { id: "500-2000", label: "£500–£2,000", min: 500, max: 2000 },
  { id: "2000-8000", label: "£2,000–£8,000", min: 2000, max: 8000 },
  { id: "8000-plus", label: "£8,000+", min: 8000, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

export function inBand(priceMin: number, priceMax: number, bandId: string) {
  const band = PRICE_BANDS.find((entry) => entry.id === bandId);
  if (!band) return true;
  return priceMax >= band.min && priceMin < (band.max === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : band.max);
}

export function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRange(min: number, max: number) {
  return `${formatGBP(min)}–${formatGBP(max)}`;
}

export function formatSourceMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatSeen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function acpPrice(min: number) {
  return `${min.toFixed(2)} GBP`;
}

/** The single price a piece is sold at. */
export function priceOf(item: { priceGBP?: number; guidePriceGBP: { max: number } }) {
  return item.priceGBP ?? item.guidePriceGBP.max;
}
