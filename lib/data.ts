import collabsJson from "@/data/collabs.json";
import dropsJson from "@/data/drops.json";
import itemsJson from "@/data/items.json";
import sourcesJson from "@/data/sources.json";
import { inBand, priceOf } from "@/lib/money";
import {
  collabSchema,
  dropSchema,
  itemSchema,
  sourceSchema,
  type Collab,
  type Drop,
  type Item,
  type PublicItem,
  type SourceListing,
} from "@/lib/schema";

const items = itemSchema.array().parse(itemsJson);
const collabs = collabSchema.array().parse(collabsJson);
const sources = sourceSchema.array().parse(sourcesJson);
const drops = dropSchema.array().parse(dropsJson);

export function toPublicItem(item: Item): PublicItem {
  const { costBasis, markupPct, estimatedMarginGBP, demandSignal, notes, priceProvisional, authConfidence, ...publicItem } = item;
  void costBasis;
  void markupPct;
  void estimatedMarginGBP;
  void demandSignal;
  void notes;
  void priceProvisional;
  if (authConfidence !== "high") return publicItem;
  return { ...publicItem, authConfidence: "high" };
}

/**
 * The only shape a client component may receive. An allowlist, so a new field
 * on the record can never leak sourcing details into page source by default.
 */
export type ShopItem = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  brand: string;
  priceGBP: number;
  images: { front: string; pixelWidth?: number; pixelHeight?: number };
};

export function toShopItem(item: PublicItem): ShopItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    shortTitle: item.shortTitle,
    brand: item.brand,
    priceGBP: priceOf(item),
    images: { front: item.images.front, pixelWidth: item.images.pixelWidth, pixelHeight: item.images.pixelHeight },
  };
}

/** Full records, including cost and margin. Desk route and tests only. Never pass to a client component. */
export function getItems(): Item[] {
  return items;
}

function isOnTheRail(item: Item) {
  return item.status !== "vault" && item.images.imageStatus === "cutout" && !item.images.placeholder;
}

const RAIL_SEQUENCE = [
  "h22-ghost-4100044",
  "h22-palm-72059216",
  "h22-komae-70832580",
  "h22-kapital-42633272",
  "h22-supreme-si-69748871",
  "h22-gucci-tnf-26804231",
  "h22-moncler-ryuha-39226893",
  "h22-junya-carhartt-25093264",
  "h22-sacai-levis-39861256",
  "h22-jwa-guinness-38459217",
  "h22-si-dior",
  "h22-dior-si-elbow-36434990",
];

/**
 * The pilot jackets stay first. Later jackets follow in the order they were added.
 * Flat-lay outerwear fills more of its box than a side-on shirt, so the
 * ceiling is 0.8. A near-solid frame still stays off.
 */
function isHangable(item: Item) {
  const coverage = item.images.alphaCoverage;
  const garment = item.category === "apparel" || item.category === "outerwear";
  return (
    isOnTheRail(item) &&
    garment &&
    RAIL_SEQUENCE.includes(item.id) &&
    coverage !== undefined &&
    // The Ryūha shirt jacket sits just over the usual 0.8 gate. It still hangs.
    // Every other piece keeps the same gate.
    (coverage < 0.8 || item.id === "h22-moncler-ryuha-39226893")
  );
}

export function getPublicItems(): PublicItem[] {
  return items.filter(isOnTheRail).map(toPublicItem);
}

/** Home rail only. Watches, trainers and anything that failed the alpha gate stay off it. */
export function getRailItems(): PublicItem[] {
  return items
    .filter(isHangable)
    .sort((a, b) => {
      const ai = RAIL_SEQUENCE.indexOf(a.id);
      const bi = RAIL_SEQUENCE.indexOf(b.id);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    })
    .map(toPublicItem);
}

export function getVaultItems(): PublicItem[] {
  return items.filter((item) => item.status === "vault").map(toPublicItem);
}

export function getItem(slug: string): PublicItem | undefined {
  const item = items.find((entry) => entry.slug === slug);
  if (!item || !isOnTheRail(item)) return undefined;
  return toPublicItem(item);
}

export function getCollabs(): Collab[] {
  return collabs;
}

export function getCollab(idOrSlug: string): Collab | undefined {
  return collabs.find((collab) => collab.id === idOrSlug || collab.slug === idOrSlug);
}

export function getSources(): SourceListing[] {
  return sources;
}

export function getSourcesFor(itemId: string): SourceListing[] {
  return sources.filter((source) => source.itemId === itemId);
}

export function getDrops(): Drop[] {
  return drops;
}

export function getDrop(slug: string): Drop | undefined {
  return drops.find((drop) => drop.slug === slug);
}

export type CatalogueQuery = {
  category?: string;
  brand?: string;
  collab?: string;
  band?: string;
  availability?: string;
  q?: string;
};

export function filterItems(list: PublicItem[], query: CatalogueQuery) {
  const q = query.q?.trim().toLowerCase();
  return list.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.brand && item.brand !== query.brand) return false;
    if (query.collab && item.collabId !== query.collab) return false;
    if (query.availability && item.availability !== query.availability) return false;
    if (query.band && !inBand(priceOf(item), priceOf(item), query.band)) return false;
    if (q) {
      const collab = item.collabId ? getCollab(item.collabId)?.name ?? "" : "";
      const hay = `${item.title} ${item.shortTitle} ${item.brand} ${collab} ${item.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function similarItems(item: PublicItem, limit = 3): PublicItem[] {
  return getPublicItems()
    .filter((other) => {
      if (other.id === item.id) return false;
      const sameCollab = Boolean(item.collabId && other.collabId === item.collabId);
      return sameCollab || other.category === item.category || other.brand === item.brand;
    })
    .slice(0, limit);
}
