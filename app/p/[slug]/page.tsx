import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { ProductStage, type StageImage } from "@/components/product/ProductStage";
import { getItem, getPublicItems, getSourcesFor, similarItems } from "@/lib/data";
import { productJsonLd } from "@/lib/jsonld";
import { formatRange } from "@/lib/money";
import { siteOrigin } from "@/lib/site";
import type { PublicItem } from "@/lib/schema";

type Params = { slug: string };

const HOUSE: Record<string, string> = {
  vestiaire: "Vestiaire Collective",
  farfetch: "Farfetch",
  jolicloset: "Joli Closet",
  grailed: "Grailed",
  ebay: "eBay",
  stockx: "StockX",
  retail: "the house",
  other: "the listing",
};

export function generateStaticParams() {
  return getPublicItems().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return { title: "Piece" };
  return {
    title: item.shortTitle,
    description: item.story,
    openGraph: { title: item.title, description: item.story },
  };
}

function stageImages(item: PublicItem): StageImage[] {
  const images: StageImage[] = [
    {
      src: item.images.front,
      alt: item.title,
      width: item.images.pixelWidth ?? 1024,
      height: item.images.pixelHeight ?? 1024,
    },
  ];
  if (item.images.source && item.images.source !== item.images.front) {
    images.push({
      src: item.images.source,
      alt: `${item.title}, listing photograph`,
      width: 1000,
      height: 1000,
    });
  }
  return images;
}

function conditionLabel(condition: PublicItem["condition"]) {
  return condition.replaceAll("-", " ");
}

export default async function PiecePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item || item.status === "vault") notFound();
  const listing = getSourcesFor(item.id).find((source) => !source.sold) ?? getSourcesFor(item.id)[0];
  const similar = similarItems(item);
  const origin = siteOrigin("https://hanger22.example");
  const json = productJsonLd(slug, origin);
  const house = listing ? HOUSE[listing.platform] ?? "the listing" : "";

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-6xl px-6 py-12 pb-28">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,512px)_1fr] lg:gap-20">
          <ProductStage images={stageImages(item)} />
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{item.brand}</p>
            <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">{item.title}</h1>
            <p className="mt-8 text-[17px] leading-relaxed">{item.story}</p>
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 text-[15px]">
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Price</dt>
                <dd className="mt-2 text-ink">{formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Size</dt>
                <dd className="mt-2 text-ink">{item.specs.Size ?? "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Condition</dt>
                <dd className="mt-2 text-ink capitalize">{conditionLabel(item.condition)}</dd>
              </div>
            </dl>
            {listing ? (
              <a href={listing.url} target="_blank" rel="noopener noreferrer" className="pill-btn mt-10">
                Buy on {house}
              </a>
            ) : null}
          </div>
        </div>

        {similar.length > 0 ? (
          <section className="mt-24">
            <h2 className="display text-3xl text-ink">Also in the edit</h2>
            <ul className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-3">
              {similar.map((other) => (
                <li key={other.id}>
                  <PieceCard item={other} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      {json ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} /> : null}
      <SiteFooter />
    </>
  );
}
