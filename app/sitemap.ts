import type { MetadataRoute } from "next";
import { HOUSES } from "@/lib/brands";
import { getPublicItems } from "@/lib/data";
import { siteOrigin } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin("https://hanger22.vercel.app");
  const staticRoutes = ["", "/pieces", "/brands", "/reserving", "/contact", "/legal/terms", "/legal/privacy", "/legal/returns"].map(
    (path) => ({
      url: `${origin}${path || "/"}`,
    }),
  );
  const pieces = getPublicItems().map((item) => ({ url: `${origin}/p/${item.slug}` }));
  const houses = HOUSES.map((house) => ({ url: `${origin}/brands/${house.slug}` }));
  return [...staticRoutes, ...pieces, ...houses];
}
