import { BelowFold } from "@/components/home/BelowFold";
import { HomeHero } from "@/components/rail/HomeHero";
import { getRailItems, getVaultItems } from "@/lib/data";

export default function HomePage() {
  return (
    <main id="content">
      <HomeHero items={getRailItems()} vaultItems={getVaultItems()} />
      <BelowFold />
    </main>
  );
}
