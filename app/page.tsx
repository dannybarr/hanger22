import { BelowFold } from "@/components/home/BelowFold";
import { SiteHeader } from "@/components/layout/SiteChrome";
import { HomeHero } from "@/components/rail/HomeHero";
import { getPublicItems, getRailItems } from "@/lib/data";

export default function HomePage() {
  const rail = getRailItems();
  const rest = getPublicItems().filter((item) => !rail.some((piece) => piece.id === item.id));
  return (
    <>
      <SiteHeader />
      <main id="content">
        <HomeHero items={rail} />
        <BelowFold items={[...rail, ...rest]} />
      </main>
    </>
  );
}
