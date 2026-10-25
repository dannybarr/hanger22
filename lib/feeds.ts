import { cutLabel } from "@/lib/cut";
import { getPublicItems } from "@/lib/data";
import { acpPrice, priceOf } from "@/lib/money";
import { acpFeedSchema, catalogFeedSchema, type PublicItem } from "@/lib/schema";

const ACP_CONDITION: Record<PublicItem["condition"], string> = {
  new: "new",
  "new-with-defects": "used",
  excellent: "used",
  good: "used",
  fair: "used",
};

function acpAvailability(item: PublicItem) {
  return item.availability === "in_vault" ? "in_stock" : "preorder";
}

function fulfilmentLine(item: PublicItem) {
  return item.availability === "in_vault"
    ? "In the Vault, ships now."
    : "Delivery date confirmed at checkout.";
}

export function toCatalog(origin: string, generatedAt = new Date().toISOString()) {
  const feed = {
    version: 1 as const,
    generated_at: generatedAt,
    items: getPublicItems().map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      shortTitle: item.shortTitle,
      brand: item.brand,
      collabId: item.collabId,
      category: item.category,
      priceGBP: priceOf(item),
      condition: item.condition,
      availability: item.availability,
      cutReason: item.cutReason,
      placeholder: item.images.placeholder,
      imageStatus: item.images.imageStatus,
      url: `${origin}/p/${item.slug}`,
      image: item.images.front,
    })),
  };
  return catalogFeedSchema.parse(feed);
}

export function toAcpFeed(origin: string, generatedAt = new Date().toISOString()) {
  const feed = {
    version: "2026-04-17" as const,
    generated_at: generatedAt,
    items: getPublicItems().map((item) => {
      const imagePath = item.images.front;
      return {
        id: item.id,
        title: item.title,
        description: [
          item.story,
          `${cutLabel(item.cutReason)}.`,
          fulfilmentLine(item),
          item.images.imageStatus === "placeholder"
            ? "Image is a placeholder."
            : "",
          `${priceOf(item)} GBP. Buy on Hanger 22 by private checkout.`,
        ]
          .filter(Boolean)
          .join(" "),
        link: `${origin}/p/${item.slug}`,
        image_link: new URL(imagePath, origin).toString(),
        brand: item.brand,
        condition: ACP_CONDITION[item.condition],
        price: acpPrice(priceOf(item)),
        availability: acpAvailability(item),
        enable_search: true as const,
        enable_checkout: false as const,
      };
    }),
  };
  return acpFeedSchema.parse(feed);
}
