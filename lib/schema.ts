import { z } from "zod";

export const categorySchema = z.enum([
  "outerwear",
  "footwear",
  "apparel",
  "watches",
  "tech",
  "objects",
  "accessories",
]);

export const conditionSchema = z.enum([
  "new",
  "new-with-defects",
  "excellent",
  "good",
  "fair",
]);

export const statusSchema = z.enum([
  "available-to-source",
  "requested",
  "sourced",
  "vault",
]);

export const currencySchema = z.enum(["GBP", "USD", "EUR", "CNY"]);

export const platformSchema = z.enum([
  "ebay",
  "grailed",
  "vestiaire",
  "farfetch",
  "stockx",
  "jolicloset",
  "retail",
  "other",
]);

export const suspensionSchema = z.enum(["wood", "lace", "strap", "webbing"]);

export const availabilitySchema = z.enum(["sourced", "in_vault"]);

export const imageStatusSchema = z.enum(["cutout", "listing-photo", "placeholder"]);

export const cutReasonSchema = z.enum(["collab", "limited", "one_off", "rare_from_range"]);

export const sourceMarketSchema = z.enum(["UK", "JP", "EU", "US", "CN"]);

export const authConfidenceSchema = z.enum(["high", "medium"]);

/** Never serialise these onto a public page, feed, or client prop. */
export const PRIVATE_ITEM_KEYS = ["costBasis", "markupPct", "estimatedMarginGBP", "demandSignal", "notes", "priceProvisional"] as const;

export const itemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  brand: z.string().min(1),
  collabId: z.string().nullable(),
  category: categorySchema,
  year: z.number().int().optional(),
  rarity: z
    .object({
      edition: z.number().int().optional(),
      serial: z.string().optional(),
      hangerMark: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
  story: z.string().min(1),
  /** Desk research behind the story. Server and /studio only. */
  notes: z.string().optional(),
  specs: z.record(z.string(), z.string()),
  images: z.object({
    front: z.string().min(1),
    side: z.string().optional(),
    source: z.string().optional(),
    placeholder: z.boolean(),
    imageStatus: imageStatusSchema,
    licence: z.string().optional(),
    credit: z.string().optional(),
    sourceUrl: z.string().optional(),
    /** Share of the tight alpha bounding box that is opaque. The rail rejects 0.8 and above. */
    alphaCoverage: z.number().min(0).max(1).optional(),
    pixelWidth: z.number().int().positive().optional(),
    pixelHeight: z.number().int().positive().optional(),
  }),
  art: z.string().min(1),
  suspension: suspensionSchema,
  guidePriceGBP: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  /** The one price the shop shows. Falls back to the top of the guide. */
  priceGBP: z.number().positive().optional(),
  /** True until Danny confirms the price. Server and /studio only. */
  priceProvisional: z.boolean().optional(),
  condition: conditionSchema,
  authRoute: z.string().min(1),
  status: statusSchema,
  availability: availabilitySchema,
  cutReason: cutReasonSchema,
  sourceMarket: sourceMarketSchema,
  /** Medium stays off public pages and feeds. High may be shown. */
  authConfidence: authConfidenceSchema,
  /** What the desk would pay, or did pay. Server and /studio only. */
  costBasis: z.object({
    amount: z.number().nonnegative(),
    currency: currencySchema,
  }),
  /** Markup on cost, in percent. Server and /studio only. */
  markupPct: z.number(),
  /** Pounds of margin at the guide midpoint. Server and /studio only. */
  estimatedMarginGBP: z.number(),
  /** 0–1 desk read of demand. Server and /studio only. */
  demandSignal: z.number().min(0).max(1),
  sourceListingIds: z.array(z.string()),
  tags: z.array(z.string()),
  vaultCandidate: z.boolean().optional(),
  unlisted: z.boolean().optional(),
});

export const collabSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  brands: z.array(z.string()).min(1),
  firstYear: z.number().int().nullable(),
  story: z.string(),
  heroImage: z.string(),
});

export const sourceSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  platform: platformSchema,
  url: z.string().url(),
  priceShown: z.object({
    amount: z.number(),
    currency: currencySchema,
  }),
  condition: z.string(),
  seenAt: z.string().datetime(),
  sold: z.boolean(),
  note: z.string().optional(),
  sellerTrust: z
    .object({
      feedback: z.number().optional(),
      positivePct: z.number().optional(),
      authGuarantee: z.boolean().optional(),
    })
    .optional(),
  licence: z.string(),
});

export const dropSchema = z.object({
  slug: z.string(),
  collabId: z.string(),
  title: z.string(),
  kicker: z.string(),
  dek: z.string(),
  story: z.array(z.string()).min(1),
  timeline: z.array(
    z.object({
      year: z.string(),
      label: z.string(),
      text: z.string(),
    }),
  ),
  frames: z.array(
    z.object({
      art: z.string(),
      caption: z.string(),
      image: z.string().optional(),
    }),
  ),
});

export const requestSchema = z.object({
  itemId: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(40).optional(),
  size: z.string().trim().max(40).optional(),
  budgetGBP: z.number().positive().max(1_000_000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const catalogItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  shortTitle: z.string(),
  brand: z.string(),
  collabId: z.string().nullable(),
  category: categorySchema,
  priceGBP: z.number(),
  condition: conditionSchema,
  status: statusSchema,
  availability: availabilitySchema,
  cutReason: cutReasonSchema,
  sourceMarket: sourceMarketSchema,
  authConfidence: z.literal("high").optional(),
  placeholder: z.boolean(),
  imageStatus: imageStatusSchema,
  url: z.string().url(),
  image: z.string().optional(),
  tags: z.array(z.string()),
});

export const catalogFeedSchema = z.object({
  version: z.literal(1),
  generated_at: z.string(),
  items: z.array(catalogItemSchema),
});

export const acpItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  image_link: z.string().url(),
  brand: z.string(),
  condition: z.string(),
  price: z.string(),
  availability: z.string(),
  enable_search: z.literal(true),
  enable_checkout: z.literal(false),
});

export const acpFeedSchema = z.object({
  version: z.literal("2026-04-17"),
  generated_at: z.string(),
  items: z.array(acpItemSchema),
});

export type Item = z.infer<typeof itemSchema>;
export type PublicItem = Omit<Item, (typeof PRIVATE_ITEM_KEYS)[number] | "authConfidence"> & {
  authConfidence?: "high";
};
export type Collab = z.infer<typeof collabSchema>;
export type SourceListing = z.infer<typeof sourceSchema>;
export type Drop = z.infer<typeof dropSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
export type CatalogFeed = z.infer<typeof catalogFeedSchema>;
export type AcpFeed = z.infer<typeof acpFeedSchema>;
