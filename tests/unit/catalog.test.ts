import { describe, expect, it } from "vitest";
import { economicsFromGuide } from "@/lib/desk";
import { getCollabs, getDrops, getItem, getItems, getPublicItems, getRailItems, getSources, getSourcesFor, getVaultItems, toPublicItem, toShopItem } from "@/lib/data";
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
    expect(publicItems.length).toBeGreaterThanOrEqual(6);
    // Nothing is held in stock yet, so no live piece may claim to ship now.
    expect(publicItems.every((item) => item.availability === "sourced")).toBe(true);
    expect(publicItems.every((item) => item.images.imageStatus === "cutout" && !item.images.placeholder)).toBe(true);
    const rail = getRailItems();
    // The rail keeps the order set in RAIL_SEQUENCE and always opens on the Ghost jacket.
    expect(rail.length).toBeGreaterThanOrEqual(5);
    expect(rail[0]?.id).toBe("h22-ghost-4100044");
    expect(new Set(rail.map((item) => item.id)).size).toBe(rail.length);
    expect(rail.every((item) => item.category === "apparel" || item.category === "outerwear")).toBe(true);
    expect(
      rail
        .filter((item) => item.id !== "h22-moncler-ryuha-39226893")
        .every((item) => (item.images.alphaCoverage ?? 1) < 0.8),
    ).toBe(true);
    expect(rail.some((item) => item.id === "h22-moncler-ryuha-39226893")).toBe(true);
    expect(rail.some((item) => item.category === "watches" || item.category === "footwear")).toBe(false);
    expect(items.filter((item) => item.status === "vault")).toHaveLength(8);
    const withdrawn = ["h22-palace-hood", "h22-speedmaster-3570", "h22-dior-si-ring-7503587", "h22-chanel-pharrell-38058392", "h22-jwa-guinness-38459217"];
    expect(withdrawn.every((id) => items.find((item) => item.id === id)?.status === "vault")).toBe(true);
    expect(publicItems.some((item) => withdrawn.includes(item.id))).toBe(false);
    expect(rail.some((item) => withdrawn.includes(item.id))).toBe(false);
    expect(getItem("palace-oakley-logo-hood-off-white")).toBeUndefined();
    expect(getItem("omega-speedmaster-3570-50")).toBeUndefined();
    expect(getItem("dior-stone-island-signet-ring")).toBeUndefined();
    expect(getItem("chanel-pharrell-logo-mules")).toBeUndefined();
    expect(getItem("jw-anderson-guinness-chore-jacket")).toBeUndefined();
    expect(sources.find((source) => source.id === "src-palace")?.sold).toBe(true);
    expect(sources.find((source) => source.id === "src-speedy-3570")?.sold).toBe(true);
    expect(sources.find((source) => source.id === "src-h22-dior-si-ring-7503587")?.sold).toBe(true);
    expect(sources.find((source) => source.id === "src-h22-chanel-pharrell-38058392")?.sold).toBe(true);
    expect(sources.find((source) => source.id === "src-h22-jwa-guinness-38459217")?.sold).toBe(true);
    // Shop catalogue order. The Travis Scott Royal Oak stays third.
    expect(publicItems[2]?.id).toBe("h22-ap-travis");
    // Conveyor order is unchanged. The third hanger is still the Komae jacket.
    expect(rail[2]?.id).toBe("h22-komae-70832580");

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

  it("keeps the 7 November 2026 pieces above an 8 percent after-cost floor", () => {
    // Buyer card 2 percent of the duties-included source, then a fixed desk cost.
    // Sale fee is 2.5 percent plus 20p. Profit is what remains, divided by the sale price.
    const added = [
      { id: "h22-lv-supreme-33263118", priceGBP: 1890, extrasGBP: 66, size: "46", onRail: true },
      { id: "h22-hermes-tambours-36757190", priceGBP: 2650, extrasGBP: 76, size: "50", onRail: true },
      { id: "h22-balenciaga-fringe-26873278", priceGBP: 4290, extrasGBP: 71, size: "M", onRail: true },
      { id: "h22-chanel-pharrell-38058392", priceGBP: 950, extrasGBP: 70, size: "41", onRail: false },
    ];
    const feeRate = 0.025;
    const buyerCardRate = 0.02;
    for (const row of added) {
      const item = getItems().find((entry) => entry.id === row.id);
      expect(item?.status).toBe(row.id === "h22-chanel-pharrell-38058392" ? "vault" : "available-to-source");
      expect(item?.availability).toBe("sourced");
      expect(item?.priceGBP).toBe(row.priceGBP);
      expect(item?.priceProvisional).toBe(false);
      expect(item?.specs.Size).toBe(row.size);
      const listing = getSourcesFor(row.id)[0];
      expect(listing?.sold).toBe(row.id === "h22-chanel-pharrell-38058392");
      expect(listing?.priceShown.currency).toBe("GBP");
      const source = listing?.priceShown.amount ?? 0;
      const fixed = source * (1 + buyerCardRate) + row.extrasGBP;
      const profit = row.priceGBP - fixed - (row.priceGBP * feeRate + 0.2);
      const floor = (fixed + 0.2) / (1 - feeRate - 0.08);
      expect(row.priceGBP).toBeGreaterThanOrEqual(Math.ceil(floor));
      expect(profit / row.priceGBP).toBeGreaterThanOrEqual(0.08);
      // Listing-cost margin at the guide midpoint is a different figure from after-cost profit.
      expect(item?.estimatedMarginGBP).not.toBe(Math.round(profit));
      expect(item?.guidePriceGBP.min).toBeLessThanOrEqual(row.priceGBP);
      expect(item?.guidePriceGBP.max).toBeGreaterThanOrEqual(row.priceGBP);
      const story = item?.story ?? "";
      expect(story.split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(60);
      expect(story.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(140);
      expect(story).not.toMatch(/farfetch|vestiaire|grailed|markup|cost basis/i);
      expect(story).not.toMatch(/[;—]| - /);
    }
    expect(getItems().some((item) => item.id === "h22-lv-bugs-36674437")).toBe(false);
    expect(getItems().some((item) => item.id === "h22-fendi-mj-38710603")).toBe(false);
    expect(getPublicItems()[2]?.id).toBe("h22-ap-travis");
    const rail = getRailItems();
    expect(rail[0]?.id).toBe("h22-ghost-4100044");
    expect(rail[2]?.id).toBe("h22-komae-70832580");
    for (const row of added) {
      expect(rail.some((item) => item.id === row.id)).toBe(row.onRail);
    }
    const mules = getItems().find((item) => item.id === "h22-chanel-pharrell-38058392");
    expect(mules?.status).toBe("vault");
    expect(mules?.category).toBe("footwear");
    expect(getPublicItems().some((item) => item.id === "h22-chanel-pharrell-38058392")).toBe(false);
    expect(getItem("chanel-pharrell-logo-mules")).toBeUndefined();
    expect(rail.some((item) => item.category === "footwear" || item.category === "watches")).toBe(false);
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
    expect(getPublicItems().some((item) => item.slug === "audemars-piguet-travis-scott-royal-oak")).toBe(true);
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
    const vault = new Set(getItems().filter((item) => item.status === "vault").map((item) => item.id));
    expect(feed.items.every((item) => !vault.has(item.id))).toBe(true);
    expect(feed.items[0]?.url).toBe(`${origin}/p/${feed.items[0]?.slug}`);
  });

  it("keeps sourcing details out of everything a page or feed serves", () => {
    const served = JSON.stringify([
      getRailItems().map(toShopItem),
      toCatalog(origin, "2026-10-21T00:00:00.000Z"),
      toAcpFeed(origin, "2026-10-21T00:00:00.000Z"),
    ]).toLowerCase();
    for (const word of ["vestiaire", "farfetch", "joli", "bloomingdale", "authroute", "sourceurl", "sourcemarket", "costbasis", "markup"]) {
      expect(served).not.toContain(word);
    }
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
