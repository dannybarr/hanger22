import type { MetadataRoute } from "next";
import { getPublicItems } from "@/lib/data";
import { siteOrigin } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin("https://hanger22.example");
  const staticRoutes = ["", "/pieces", "/contact", "/legal/terms", "/legal/privacy", "/legal/returns"].map((path) => ({
    url: `${origin}${path || "/"}`,
  }));
  const pieces = getPublicItems().map((item) => ({ url: `${origin}/p/${item.slug}` }));
  return [...staticRoutes, ...pieces];
}
