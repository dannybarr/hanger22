import { ArrowsClockwise, Lock, SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { ProductStage, type StageImage } from "@/components/product/ProductStage";
import { BuyButton } from "@/components/product/BuySheet";
import { housesFor } from "@/lib/brands";
import { getItem, getPublicItems, similarItems } from "@/lib/data";
import { productJsonLd } from "@/lib/jsonld";
import { formatGBP, priceOf } from "@/lib/money";
import { CATEGORY_LABEL, CONDITION_COPY, siteOrigin } from "@/lib/site";
import type { PublicItem } from "@/lib/schema";

type Params = { slug: string };

/** A size the buyer can rely on, or null when it is confirmed at checkout. */
function knownSize(item: PublicItem) {
  const size = item.specs.Size;
  if (!size || /confirm|request/i.test(size)) return null;
  return size;
}

export function generateStaticParams() {
  return getPublicItems().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return { title: "Piece" };
  const description = `${item.brand}, ${formatGBP(priceOf(item))}. ${item.story.split(". ")[0]}.`;
  return {
    title: item.title,
    description,
    openGraph: { title: item.title, description, images: [item.images.front] },
  };
}

function frontImage(item: PublicItem): StageImage {
  return {
    src: item.images.front,
    alt: `${item.title}, front`,
    width: item.images.pixelWidth ?? 1024,
    height: item.images.pixelHeight ?? 1024,
  };
}

export default async function PiecePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item || item.status === "vault") notFound();
  const similar = similarItems(item, 4);
  const origin = siteOrigin("https://hanger22.vercel.app");
  const json = productJsonLd(slug, origin);
  const price = formatGBP(priceOf(item));
  const size = knownSize(item);
  const condition = CONDITION_COPY[item.condition];
  const houses = housesFor(item.brand);
  const specs = Object.entries(item.specs).filter(([key]) => key !== "Size");

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-7xl px-5 pt-6 pb-32 sm:px-8 lg:pb-24">
        <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/pieces" className="hover:text-ink">
                Shop all
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/pieces?category=${item.category}`} className="hover:text-ink">
                {CATEGORY_LABEL[item.category]}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink" aria-current="page">
              {item.shortTitle}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <ProductStage front={frontImage(item)} spin={item.images.spin ?? []} title={item.shortTitle} />
            {item.images.studio ? (
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Studio image of this piece. Every detail is described in full below.
              </p>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-8">
            <p className="eyebrow">
              {houses.length > 0
                ? houses.map((house, index) => (
                    <span key={house.slug}>
                      {index > 0 ? " x " : ""}
                      <Link href={`/brands/${house.slug}`} className="hover:text-ink">
                        {house.name}
                      </Link>
                    </span>
                  ))
                : item.brand}
            </p>
            <h1 className="display mt-3 text-[40px] text-ink sm:text-[52px]">{item.shortTitle}</h1>
            <div className="mt-5 flex items-center gap-4">
              <p className="text-[22px] font-medium text-ink">{price}</p>
            </div>

            <dl className="mt-8 grid gap-6 border-t border-line pt-6">
              <div>
                <dt className="field-label">Size</dt>
                <dd className="mt-2">
                  {size ? (
                    <span className="inline-flex min-h-11 items-center border border-ink px-4 text-[14px] font-medium text-ink">{size}</span>
                  ) : (
                    <span className="text-[15px] text-ink">Tell us your size and we confirm it with your checkout.</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="field-label">Condition</dt>
                <dd className="mt-2 text-[15px] text-ink">
                  <span className="font-medium">{condition.label}.</span> <span className="text-muted">{condition.note}</span>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <BuyButton piece={{ id: item.id, brand: item.brand, title: item.shortTitle, price, size, image: item.images.front }} />
              <p className="mt-3 text-center text-[13px] text-muted">Private checkout. Your personal checkout link arrives by email.</p>
            </div>

            <ul className="mt-8 grid gap-4 border-y border-line py-6 text-[14px]">
              <li className="flex gap-3">
                <Lock size={18} className="mt-0.5 shrink-0" aria-hidden />
                <span>Private checkout, sent to you personally.</span>
              </li>
              <li className="flex gap-3">
                <SealCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
                <span>Condition graded and described in full.</span>
              </li>
              <li className="flex gap-3">
                <ArrowsClockwise size={18} className="mt-0.5 shrink-0" aria-hidden />
                <span>14 days to change your mind after delivery.</span>
              </li>
            </ul>

            <div className="divide-y divide-line border-b border-line">
              <Fold title="The story" open>
                <p className="text-[15px] leading-relaxed">{item.story}</p>
              </Fold>
              {specs.length > 0 ? (
                <Fold title="Details">
                  <dl className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-6 gap-y-2.5 text-[14px]">
                    {specs.map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-muted">{key}</dt>
                        <dd className="text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </Fold>
              ) : null}
              <Fold title="Delivery and returns">
                <p className="text-[15px] leading-relaxed">
                  Your delivery date and method are confirmed with your checkout. You have 14 days from delivery to change your mind.
                </p>
                <Link href="/legal/returns" className="nav-link mt-4 inline-block">
                  Delivery and returns
                </Link>
              </Fold>
              <Fold title="How to buy">
                <p className="text-[15px] leading-relaxed">
                  Press Buy now and leave your details. We send your personal checkout link by email, and you complete your order there.
                </p>
                <Link href="/how-to-buy" className="nav-link mt-4 inline-block">
                  More on buying
                </Link>
              </Fold>
            </div>
          </div>
        </div>

        {similar.length > 0 ? (
          <section className="mt-24" aria-labelledby="more">
            <h2 id="more" className="display text-[30px] text-ink">
              More from the rail
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
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

function Fold({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="fold group" open={open}>
      <summary className="flex items-center justify-between py-5 text-[13px] font-medium tracking-[0.1em] text-ink uppercase">
        {title}
        <span className="fold-mark text-[18px] leading-none font-normal" aria-hidden>
          +
        </span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
