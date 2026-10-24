export const SITE_NAME = "Hanger 22";

export const SITE_DESCRIPTION = "Hanger 22, London. Rare collabs and grails.";

export const MARQUEE_PHRASE = "STONE ISLAND  •  MONCLER  •  KAPITAL  •  SUPREME  •  PALACE  •  ";

/** Shown in the utility bar. Each line must stay true to how the shop actually works. */
export const PROMISES = [
  "Reserve now. Pay only once we confirm",
  "14 days to change your mind",
  "Photographs before you pay",
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
  new: { label: "New", note: "Described as never worn. We confirm it with photographs before you pay." },
  "new-with-defects": { label: "New, with a mark", note: "Described as never worn, with a small flaw. We photograph it for you before you pay." },
  excellent: { label: "Excellent", note: "Described as lightly worn. We photograph the condition for you before you pay." },
  good: { label: "Good", note: "Worn, with signs of use. We photograph any wear for you before you pay." },
  fair: { label: "Fair", note: "Clearly worn. We photograph every mark for you before you pay." },
} as const;

export const PHOTO_LICENCE =
  "Marketplace photograph shown only to identify the piece. Copyright stays with the seller or the marketplace. Not licensed for reuse outside this site. The source URL is kept on the listing.";

export const PLACEHOLDER_NOTE =
  "Placeholder silhouette. No listing photograph on file.";

export function siteOrigin(fallback: string) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || fallback;
}
