export const SITE_NAME = "Hanger 22";

export const SITE_DESCRIPTION = "Hanger 22, London. Rare collabs and grails.";

export const MARQUEE_PHRASE = "STONE ISLAND  •  MONCLER  •  KAPITAL  •  SUPREME  •  PALACE  •  ";

export const PHOTO_LICENCE =
  "Marketplace photograph shown only to identify the piece. Copyright stays with the seller or the marketplace. Not licensed for reuse outside this site. The source URL is kept on the listing.";

export const PLACEHOLDER_NOTE =
  "Placeholder silhouette. No listing photograph on file.";

export function siteOrigin(fallback: string) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || fallback;
}
