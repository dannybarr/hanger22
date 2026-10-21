import type { MetadataRoute } from "next";
import { getDrops, getPublicItems } from "@/lib/data";
import { siteOrigin } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin("https://hanger22.example");
  const staticRoutes = ["", "/pieces", "/about", "/contact", "/legal/terms", "/legal/privacy", "/legal/returns"].map((path) => ({
    url: `${origin}${path || "/"}`,
  }));
  const pieces = getPublicItems().map((item) => ({ url: `${origin}/p/${item.slug}` }));
  const drops = getDrops().map((drop) => ({ url: `${origin}/drops/${drop.slug}` }));
  return [...staticRoutes, ...pieces, ...drops];
}
