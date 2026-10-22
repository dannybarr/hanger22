import { Storefront } from "@/components/home/Storefront";
import { SiteFooter } from "@/components/layout/SiteChrome";
import type { PublicItem } from "@/lib/schema";

export function BelowFold({ items }: { items: PublicItem[] }) {
  return (
    <>
      <Storefront items={items} />
      <SiteFooter />
    </>
  );
}
