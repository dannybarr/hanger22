import type { Metadata } from "next";
import { BrandDirectory } from "@/components/brands/BrandDirectory";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { HOUSES, housesFor } from "@/lib/brands";
import { getPublicItems } from "@/lib/data";
import { HOUSE_STORIES } from "@/lib/houseStories";

export const metadata: Metadata = {
  title: "All brands",
  description: "Every house at Hanger 22 from A to Z, with the brands in the edit now first.",
};

export default function BrandsPage() {
  const items = getPublicItems();
  return (
    <>
      <SiteHeader />
      <main id="content">
        <BrandDirectory
          totalPieces={items.length}
          entries={HOUSES.map((house) => ({
            house,
            pieces: items.filter((item) => housesFor(item.brand).includes(house)).length,
            story: Boolean(HOUSE_STORIES[house.slug]),
          }))}
        />
      </main>
      <SiteFooter />
    </>
  );
}
