export const SITE_NAME = "Hanger 22";

export const SITE_DESCRIPTION = "Hanger 22, London. Rare collabs and grails.";

export const MARQUEE_PHRASE = "STONE ISLAND  •  MONCLER  •  KAPITAL  •  SUPREME  •  PALACE  •  ";

/** Shown in the utility bar. Each line must stay true to how the shop actually works. */
export const PROMISES = [
  "Reserve now. Pay only once we confirm",
  "14 days to change your mind",
  "One of each, then gone",
] as const;

export const CATEGORY_LABEL = {
  outerwear: "Outerwear",
  apparel: "Clothing",
  footwear: "Footwear",
  watches: "Watches",
  accessories: "Accessories",
  tech: "Tech",
  objects: "Objects",
} as const;

export const CONDITION_COPY = {
  new: { label: "New", note: "Never worn. Any tags or packaging are listed in the details." },
  "new-with-defects": { label: "New, with a mark", note: "Never worn, with a small flaw that we describe and photograph before you pay." },
  excellent: { label: "Excellent", note: "Worn lightly. No marks you would notice without looking for them." },
  good: { label: "Good", note: "Worn, with gentle signs of use. We describe them before you pay." },
  fair: { label: "Fair", note: "Clearly worn. Every mark is described before you pay." },
} as const;

export const PHOTO_LICENCE =
  "Marketplace photograph shown only to identify the piece. Copyright stays with the seller or the marketplace. Not licensed for reuse outside this site. The source URL is kept on the listing.";

export const PLACEHOLDER_NOTE =
  "Placeholder silhouette. No listing photograph on file.";

export function siteOrigin(fallback: string) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || fallback;
}
