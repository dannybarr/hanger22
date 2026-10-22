import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PriceTicker } from "@/components/eggs/PriceTicker";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { Turntable } from "@/components/product/Turntable";
import { cutLabel } from "@/lib/cut";
import { getCollab, getItem, getPublicItems, similarItems } from "@/lib/data";
import { productJsonLd } from "@/lib/jsonld";
import { formatRange } from "@/lib/money";
import { siteOrigin } from "@/lib/site";

type Params = { slug: string };
type Search = { for?: string };

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

function pickedName(raw: string | undefined) {
  if (!raw) return undefined;
  const clean = raw.replace(/[^\p{L}\p{M}\s'.-]/gu, "").trim().slice(0, 24);
  return clean || undefined;
}

export default async function PiecePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const item = getItem(slug);
  if (!item || item.status === "vault") notFound();
  const collab = item.collabId ? getCollab(item.collabId) : undefined;
  const similar = similarItems(item);
  const origin = siteOrigin("https://hanger22.example");
  const json = productJsonLd(slug, origin);
  const forName = pickedName(sp.for);

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-6xl px-6 py-10 pb-28">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <Turntable item={item} pickedFor={forName} />
          <div>
            <p className="text-[11px] tracking-[0.16em] text-ink uppercase">{cutLabel(item.cutReason)}</p>
            <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">{item.title}</h1>
            <p className="mt-5 text-[17px] leading-relaxed">{item.story}</p>
            {item.rarity?.edition ? <p className="mt-3 text-[14px]">1 of {item.rarity.edition}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-line px-3 py-1 text-[12px]">{item.brand}</span>
              {collab ? <span className="rounded-full border border-line px-3 py-1 text-[12px]">{collab.name}</span> : null}
              {item.year ? <span className="rounded-full border border-line px-3 py-1 text-[12px]">{item.year}</span> : null}
            </div>
            <p className="mt-8 text-[11px] tracking-[0.14em] text-muted uppercase">Price</p>
            <p className="mt-1 text-[16px] text-ink">
              <PriceTicker value={formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)} />
            </p>
            <dl className="mt-6 grid gap-3 text-[14px]">
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Condition</dt>
                <dd className="mt-1 capitalize">{item.condition.replaceAll("-", " ")}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-16 max-w-2xl">
          <h3 className="text-[11px] tracking-[0.16em] text-ink uppercase">Specs</h3>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {Object.entries(item.specs).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-4 py-3 text-[14px]">
                <dt className="text-muted">{key}</dt>
                <dd className="col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {similar.length > 0 ? (
          <section className="mt-20">
            <h2 className="display text-3xl text-ink">Similar grails</h2>
            <ul className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-3">
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
