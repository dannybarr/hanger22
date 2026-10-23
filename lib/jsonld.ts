import { cutLabel, marketNote } from "@/lib/cut";
import { getItem } from "@/lib/data";
import { priceOf } from "@/lib/money";
import type { PublicItem } from "@/lib/schema";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const CONDITION: Record<PublicItem["condition"], string> = {
  new: "https://schema.org/NewCondition",
  "new-with-defects": "https://schema.org/UsedCondition",
  excellent: "https://schema.org/UsedCondition",
  good: "https://schema.org/UsedCondition",
  fair: "https://schema.org/UsedCondition",
};

export function organizationJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#org`,
        name: SITE_NAME,
        url: origin,
        description: SITE_DESCRIPTION,
        address: {
          "@type": "PostalAddress",
          addressLocality: "London",
          addressCountry: "GB",
        },
        email: "requests@hanger22.example",
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: SITE_NAME,
        url: origin,
        publisher: { "@id": `${origin}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/pieces?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function productJsonLd(slug: string, origin: string) {
  const item = getItem(slug);
  if (!item) return null;
  const imagePath = item.images.source ?? item.images.front;
  const availability =
    item.availability === "in_vault"
      ? "https://schema.org/InStock"
      : item.vaultCandidate
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/PreOrder";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    sku: item.id,
    description: [item.story, `${cutLabel(item.cutReason)}. ${marketNote(item.sourceMarket)}.`].filter(Boolean).join(" "),
    image: new URL(imagePath, origin).toString(),
    brand: { "@type": "Brand", name: item.brand },
    category: item.category,
    itemCondition: CONDITION[item.condition],
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: priceOf(item),
      availability,
      url: `${origin}/p/${item.slug}`,
    },
  };
}
