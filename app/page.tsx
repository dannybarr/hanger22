import { BelowFold } from "@/components/home/BelowFold";
import { HomeHero } from "@/components/rail/HomeHero";
import { getRailItems, getVaultItems } from "@/lib/data";

export default function HomePage() {
  const rail = getRailItems();
  return (
    <main id="content">
      <HomeHero items={rail} vaultItems={getVaultItems()} />
      <BelowFold items={rail} />
    </main>
  );
}
