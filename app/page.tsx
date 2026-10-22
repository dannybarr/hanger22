import { BelowFold } from "@/components/home/BelowFold";
import { HomeHero } from "@/components/rail/HomeHero";
import { getPublicItems, getRailItems, getVaultItems } from "@/lib/data";

export default function HomePage() {
  const rail = getRailItems();
  const rest = getPublicItems().filter((item) => !rail.some((piece) => piece.id === item.id));
  return (
    <main id="content">
      <HomeHero items={rail} vaultItems={getVaultItems()} />
      <BelowFold items={[...rail, ...rest]} />
    </main>
  );
}
