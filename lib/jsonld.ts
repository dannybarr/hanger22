import { cutLabel, marketNote } from "@/lib/cut";
import { getCollab, getItem } from "@/lib/data";
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
  const collab = item.collabId ? getCollab(item.collabId) : undefined;
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
    description: [
      item.story,
      `${cutLabel(item.cutReason)}. ${marketNote(item.sourceMarket)}.`,
      item.authConfidence === "high" ? "Authentication confidence is high." : "",
    ]
      .filter(Boolean)
      .join(" "),
    image: new URL(imagePath, origin).toString(),
    brand: { "@type": "Brand", name: item.brand },
    category: item.category,
    itemCondition: CONDITION[item.condition],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: item.guidePriceGBP.min,
      highPrice: item.guidePriceGBP.max,
      availability,
      url: `${origin}/p/${item.slug}`,
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: item.guidePriceGBP.min,
        maxPrice: item.guidePriceGBP.max,
        priceCurrency: "GBP",
      },
    },
    ...(collab
      ? {
          isRelatedTo: {
            "@type": "Product",
            name: collab.name,
            url: `${origin}/drops/${collab.slug}`,
          },
        }
      : {}),
  };
}
