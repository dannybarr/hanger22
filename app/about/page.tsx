import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "About",
  description: "Hanger 22 is a London desk for rare collabs and grails. A few pieces are already in the vault. The rest are sourced to order.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[11px] tracking-[0.16em] text-ink uppercase">About</p>
        <h1 className="display mt-3 text-5xl text-ink">A desk, not a shop floor</h1>
        <div className="mt-8 space-y-5 text-[17px] leading-relaxed">
          <p>
            Hanger 22 is a London desk. The homepage rail hangs five jackets, checked live on 21 October 2026, and nothing else.
          </p>
          <p>
            Stone Island Ghost 4100044, grey cotton canvas, is on Farfetch at $1,450. That listing photograph is a model, so the hanger uses Bloomingdale’s UAE packshot of the same light-grey jacket. Moncler x Palm Angels 72059216, 2 Moncler 1952 Komae 70832580, Kapital’s purple bandana patchwork 42633272, and Supreme x Stone Island 69748871 are Vestiaire listings. Each of those rail pictures is the seller’s garment-only frame.
          </p>
          <p>
            The five are sourced to order, usually in five to ten days, and only if the listing is still there. A request does not take payment. The Moncler x Zellerfeld Trailgrip is already in the vault and stays on its own page, off the rail. Watches, trainers and objects stay off it too.
          </p>
          <p>
            Guide prices are in pounds. The original currency stays on the source. What the desk paid is not on this site.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
