export const SITE_NAME = "Hanger 22";

export const SITE_DESCRIPTION = "Hanger 22, London. Limited editions, rare collaborations and grails.";

export const MARQUEE_PHRASE = "STONE ISLAND  •  MONCLER  •  KAPITAL  •  SUPREME  •  PALACE  •  ";

/** Shown in the utility bar. Each line must stay true to how the shop actually works. */
export const PROMISES = [
  "Limited editions and rare collaborations",
  "Private checkout on every piece",
  "14 days to change your mind",
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
  new: { label: "New", note: "Never worn." },
  "new-with-defects": { label: "New, with a mark", note: "Unworn, with a small mark described in the details." },
  excellent: { label: "Excellent", note: "Worn with care and kept beautifully." },
  good: { label: "Good", note: "Worn and well kept, with light signs of use." },
  fair: { label: "Fair", note: "Clearly worn, with visible signs of use." },
} as const;

export const PHOTO_LICENCE =
  "Marketplace photograph shown only to identify the piece. Copyright stays with the seller or the marketplace. Not licensed for reuse outside this site. The source URL is kept on the listing.";

export const PLACEHOLDER_NOTE =
  "Placeholder silhouette. No listing photograph on file.";

export function siteOrigin(fallback: string) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || fallback;
}

/**
 * Hanger 22's social accounts. Brand stories link here once accounts exist.
 * Empty until Danny confirms the handles, so no page links to an account that is not live.
 */
export const SOCIAL: { label: string; url: string }[] = [];
