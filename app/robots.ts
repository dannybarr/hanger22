import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin("https://hanger22.example");
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/studio" },
      { userAgent: "GPTBot", allow: "/", disallow: "/studio" },
      { userAgent: "Google-Extended", allow: "/", disallow: "/studio" },
      { userAgent: "PerplexityBot", allow: "/", disallow: "/studio" },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: "/studio" },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
