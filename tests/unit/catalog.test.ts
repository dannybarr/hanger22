import { describe, expect, it } from "vitest";
import { economicsFromGuide } from "@/lib/desk";
import { getCollabs, getDrops, getItems, getPublicItems, getRailItems, getSources, getSourcesFor, getVaultItems, toPublicItem } from "@/lib/data";
import { toAcpFeed, toCatalog } from "@/lib/feeds";
import { productJsonLd } from "@/lib/jsonld";
import { FX_TO_GBP, guideFromSource, inBand, roundGuide } from "@/lib/money";
import { acpFeedSchema, catalogFeedSchema, PRIVATE_ITEM_KEYS } from "@/lib/schema";

function keysDeep(value: unknown, found = new Set<string>()): Set<string> {
  if (!value || typeof value !== "object") return found;
  for (const [key, child] of Object.entries(value)) {
    found.add(key);
    keysDeep(child, found);
  }
  return found;
}

describe("seed data", () => {
  it("parses every JSON file and keeps references intact", () => {
    const items = getItems();
    const sources = getSources();
    const collabs = getCollabs();
    expect(items.length).toBeGreaterThanOrEqual(12);
    const publicItems = getPublicItems();
    expect(publicItems.length).toBe(6);
    expect(publicItems.some((item) => item.availability === "in_vault")).toBe(true);
    expect(publicItems.some((item) => item.availability === "sourced")).toBe(true);
    expect(publicItems.every((item) => item.images.imageStatus === "cutout" && !item.images.placeholder)).toBe(true);
    const rail = getRailItems();
    expect(rail.map((item) => item.id)).toEqual([
      "h22-ghost-4100044",
      "h22-palm-72059216",
      "h22-komae-70832580",
      "h22-kapital-42633272",
      "h22-supreme-si-69748871",
    ]);
    expect(rail.every((item) => item.category === "apparel" || item.category === "outerwear")).toBe(true);
    expect(rail.every((item) => (item.images.alphaCoverage ?? 1) < 0.8)).toBe(true);
    expect(rail.some((item) => item.category === "watches" || item.category === "footwear")).toBe(false);
    expect(items.filter((item) => item.status === "vault")).toHaveLength(3);

    for (const item of items) {
      expect(item.guidePriceGBP.max).toBeGreaterThanOrEqual(item.guidePriceGBP.min);
      if (item.collabId) {
        expect(collabs.some((collab) => collab.id === item.collabId)).toBe(true);
      }
      for (const sourceId of item.sourceListingIds) {
        const source = sources.find((entry) => entry.id === sourceId);
        expect(source?.itemId).toBe(item.id);
      }
    }

    for (const drop of getDrops()) {
      expect(collabs.some((collab) => collab.id === drop.collabId)).toBe(true);
    }
  });

  it("prices public pieces from the source comp", () => {
    for (const item of getPublicItems()) {
      const listings = getSourcesFor(item.id);
      expect(listings.length).toBeGreaterThan(0);
      const listing = listings[0];
      expect(item.guidePriceGBP).toEqual(guideFromSource(listing.priceShown.amount, listing.priceShown.currency));
      const full = getItems().find((entry) => entry.id === item.id);
      expect(full?.costBasis).toEqual(listing.priceShown);
      expect(full && economicsFromGuide(full.costBasis, full.guidePriceGBP).markupPct).toBe(full?.markupPct);
      expect(full && economicsFromGuide(full.costBasis, full.guidePriceGBP).estimatedMarginGBP).toBe(full?.estimatedMarginGBP);
    }
  });
});

describe("desk fields stay off public data", () => {
  it("strips cost, markup, margin and demand from every public serialisation", () => {
    const blobs = [
      getPublicItems(),
      getVaultItems(),
      getPublicItems().map((item) => productJsonLd(item.slug, "https://hanger22.example")),
      toCatalog("https://hanger22.example", "2026-10-21T00:00:00.000Z"),
      toAcpFeed("https://hanger22.example", "2026-10-21T00:00:00.000Z"),
    ];
    for (const blob of blobs) {
      const present = keysDeep(blob);
      for (const key of PRIVATE_ITEM_KEYS) expect(present.has(key)).toBe(false);
      const text = JSON.stringify(blob);
      for (const key of PRIVATE_ITEM_KEYS) expect(text).not.toContain(key);
    }
    const ledger = getItems()[0];
    expect(ledger && keysDeep(toPublicItem(ledger)).has("costBasis")).toBe(false);
    expect(keysDeep(getItems()).has("costBasis")).toBe(true);
    expect(getItems().some((item) => item.authConfidence === "medium")).toBe(true);
    expect(getItems().some((item) => item.authConfidence === "high")).toBe(true);
    expect(getPublicItems().every((item) => item.authConfidence === undefined || item.authConfidence === "high")).toBe(true);
    expect(JSON.stringify(blobs)).not.toContain('"authConfidence":"medium"');
    expect(getItems().some((item) => item.slug === "audemars-piguet-travis-scott-royal-oak")).toBe(true);
    expect(getPublicItems().some((item) => item.slug === "audemars-piguet-travis-scott-royal-oak")).toBe(false);
    expect(getItems().some((item) => item.sourceMarket === "JP")).toBe(true);
  });
});

describe("money", () => {
  it("rounds guide bands on the documented steps", () => {
    expect(roundGuide(248.4)).toBe(250);
    expect(roundGuide(1224)).toBe(1220);
    expect(roundGuide(6010)).toBe(6000);
    expect(FX_TO_GBP.USD).toBe(0.7532);
  });

  it("places ranges into price bands by overlap", () => {
    expect(inBand(250, 280, "under-500")).toBe(true);
    expect(inBand(250, 280, "500-2000")).toBe(false);
    expect(inBand(950, 1070, "500-2000")).toBe(true);
    expect(inBand(13150, 14800, "8000-plus")).toBe(true);
    expect(inBand(6000, 6750, "2000-8000")).toBe(true);
  });
});

describe("feeds", () => {
  const origin = "https://hanger22.example";

  it("builds a versioned catalog without vault pieces", () => {
    const feed = toCatalog(origin, "2026-10-21T00:00:00.000Z");
    expect(catalogFeedSchema.parse(feed).version).toBe(1);
    expect(feed.items).toHaveLength(getPublicItems().length);
    expect(feed.items.every((item) => item.status !== "vault")).toBe(true);
    expect(feed.items[0]?.url).toBe(`${origin}/p/${feed.items[0]?.slug}`);
  });

  it("builds an ACP stub with search on and checkout off", () => {
    const feed = toAcpFeed(origin, "2026-10-21T00:00:00.000Z");
    expect(acpFeedSchema.parse(feed).version).toBe("2026-04-17");
    for (const item of feed.items) {
      expect(item.enable_search).toBe(true);
      expect(item.enable_checkout).toBe(false);
      expect(item.price).toMatch(/GBP$/);
      expect(item.link.startsWith(origin)).toBe(true);
      expect(item.image_link.startsWith(origin)).toBe(true);
    }
  });
});
