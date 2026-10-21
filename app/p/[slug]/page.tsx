import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PriceTicker } from "@/components/eggs/PriceTicker";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { AvailabilityBadge } from "@/components/piece/AvailabilityBadge";
import { ProvenanceBadge } from "@/components/piece/ProvenanceBadge";
import { RequestButton } from "@/components/request/RequestButton";
import { Turntable } from "@/components/product/Turntable";
import { cutLabel, marketNote } from "@/lib/cut";
import { getCollab, getDrop, getItem, getPublicItems, getSourcesFor, similarItems } from "@/lib/data";
import { productJsonLd } from "@/lib/jsonld";
import { FX_NOTE, formatRange } from "@/lib/money";
import { PLACEHOLDER_NOTE, siteOrigin } from "@/lib/site";

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
  const drop = collab ? getDrop(collab.slug) : undefined;
  const sources = getSourcesFor(item.id);
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
            <p className="mt-4 text-[13px] tracking-[0.08em] text-ink">{marketNote(item.sourceMarket)}</p>
            {item.rarity?.edition ? <p className="mt-3 text-[14px]">1 of {item.rarity.edition}</p> : null}
            {item.rarity?.note ? <p className="mt-1 text-[13px] text-muted">{item.rarity.note}</p> : null}
            {item.authConfidence === "high" ? (
              <p className="mt-3 text-[12px] tracking-[0.14em] text-ink uppercase">High confidence</p>
            ) : null}
            <div className="mt-4">
              <AvailabilityBadge availability={item.availability} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-line px-3 py-1 text-[12px]">{item.brand}</span>
              {collab && drop ? (
                <Link href={`/drops/${drop.slug}`} className="rounded-full border border-line px-3 py-1 text-[12px] hover:border-ink">
                  {collab.name}
                </Link>
              ) : collab ? (
                <span className="rounded-full border border-line px-3 py-1 text-[12px]">{collab.name}</span>
              ) : null}
              {item.year ? <span className="rounded-full border border-line px-3 py-1 text-[12px]">{item.year}</span> : null}
            </div>
            <p className="mt-8 text-[11px] tracking-[0.14em] text-muted uppercase">Guide</p>
            <p className="mt-1 text-[16px] text-muted">
              <PriceTicker value={formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)} />
            </p>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-muted">{FX_NOTE}</p>
            {item.vaultCandidate ? (
              <p className="mt-3 text-[12px] tracking-[0.12em] text-ink uppercase">Vault candidate</p>
            ) : null}
            <div className="mt-6 grid gap-2">
              {sources.map((source) => (
                <ProvenanceBadge key={source.id} source={source} />
              ))}
            </div>
            <dl className="mt-6 grid gap-3 text-[14px]">
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Condition</dt>
                <dd className="mt-1 capitalize">{item.condition.replaceAll("-", " ")}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Authentication</dt>
                <dd className="mt-1 leading-relaxed">{item.authRoute}</dd>
              </div>
            </dl>
            <div className="mt-8">
              <RequestButton itemId={item.id} title={item.shortTitle} />
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-2xl">
          {item.images.imageStatus === "placeholder" ? <p className="text-[13px] text-muted">{PLACEHOLDER_NOTE}</p> : null}
          {item.images.licence ? <p className="mt-3 text-[12px] leading-relaxed text-muted">{item.images.licence}</p> : null}
          {item.images.source && !item.images.placeholder ? (
            <figure className="mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.images.source} alt="" className="max-h-[520px] w-full object-contain" />
              <figcaption className="mt-2 text-[12px] text-muted">Listing photograph, kept with its source URL.</figcaption>
            </figure>
          ) : null}
          <h3 className="mt-10 text-[11px] tracking-[0.16em] text-ink uppercase">Specs</h3>
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
