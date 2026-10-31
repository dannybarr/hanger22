import type { Metadata } from "next";
import { BrandDirectory } from "@/components/brands/BrandDirectory";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { HOUSES } from "@/lib/brands";
import { HOUSE_STORIES } from "@/lib/houseStories";

export const metadata: Metadata = {
  title: "All brands",
  description: "The stories behind the houses at Hanger 22: how each began, who built it, who it was made for and what it stands for.",
};

export default function BrandsPage() {
  return (
    <>
      <SiteHeader />
      <main id="content">
        <BrandDirectory entries={HOUSES.map((house) => ({ house, story: HOUSE_STORIES[house.slug] }))} />
      </main>
      <SiteFooter />
    </>
  );
}
