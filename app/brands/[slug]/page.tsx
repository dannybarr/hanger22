import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { Reveal, TimelineRail } from "@/components/ui/Reveal";
import { getHouse, HOUSES, housesFor, type House } from "@/lib/brands";
import { getPublicItems } from "@/lib/data";
import { HOUSE_STORIES, storyFor } from "@/lib/houseStories";
import { SOCIAL } from "@/lib/site";

type Params = { slug: string };

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function generateStaticParams() {
  return HOUSES.map((house) => ({ slug: house.slug }));
}

function piecesFor(house: House) {
  return getPublicItems().filter((item) => housesFor(item.brand).some((entry) => entry.slug === house.slug));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const house = getHouse(slug);
  if (!house) return { title: "House" };
  const story = storyFor(slug);
  const indexable = Boolean(story) || piecesFor(house).length > 0;
  return {
    robots: indexable ? undefined : { index: false, follow: true },
    title: `${house.name}, the story`,
    description: story ? `${house.name}, founded ${story.founded} in ${story.origin}. ${story.line}` : `${house.name} at Hanger 22.`,
  };
}

function Trophy({ slug, className = "" }: { slug: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`block bg-[image:var(--brass)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] ${className}`}
      style={{ maskImage: `url(/brands/trophy/${slug}.png)`, WebkitMaskImage: `url(/brands/trophy/${slug}.png)`, filter: "drop-shadow(0 18px 18px rgba(0,0,0,0.55)) drop-shadow(0 1px 0 rgba(255,236,190,0.4))" }}
    />
  );
}

export default async function HousePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const house = getHouse(slug);
  if (!house) notFound();
  const story = storyFor(slug);
  const pieces = piecesFor(house);

  const storied = HOUSES.filter((entry) => HOUSE_STORIES[entry.slug]);
  const ring = storied.length > 1 && story ? storied : HOUSES;
  const next = ring[(ring.findIndex((entry) => entry.slug === slug) + 1) % ring.length] ?? HOUSES[0]!;

  return (
    <>
      <SiteHeader />
      <main id="content">
        <section className="spotlight relative overflow-hidden text-[#f3e8d6]">
          <div className="mx-auto flex min-h-[calc(88dvh-97px)] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center">
            <nav aria-label="Breadcrumb" className="mono text-[11px] tracking-[0.2em] text-[#bfae95] uppercase">
              <Link href="/brands" className="hover:text-[#f3e8d6]">
                The houses
              </Link>
            </nav>
            <div className="rise-in mt-12 w-full">
              <Trophy slug={house.slug} className="mx-auto h-[clamp(90px,16vw,170px)] w-[min(560px,82vw)]" />
              <div aria-hidden className="mx-auto mt-3 h-2 w-[min(240px,40vw)] bg-[linear-gradient(180deg,#2a1a0c,#0f0804)] shadow-[inset_0_1px_0_rgba(255,220,160,0.25),0_10px_24px_rgba(0,0,0,0.6)]" />
            </div>
            <div className="rise-in [animation-delay:150ms]">
              {story ? (
                <h1 className="display mx-auto mt-14 max-w-4xl text-[44px] text-[#f8eedd] sm:text-[80px]">
                  <span className="sr-only">{house.name}. </span>
                  {story.line}
                </h1>
              ) : (
                <h1 className="display mt-14 text-[56px] text-[#f8eedd] sm:text-[96px]">{house.name}</h1>
              )}
            </div>
            {story ? (
              <div className="rise-in mt-12 w-full max-w-3xl [animation-delay:300ms]">
                <dl className="grid grid-cols-1 border-y border-[rgba(217,187,117,0.35)] sm:grid-cols-3">
                  {[
                    ["Founded", story.founded],
                    ["Origin", story.origin],
                    ["Founded by", story.founders],
                  ].map(([label, value]) => (
                    <div key={label} className="border-[rgba(217,187,117,0.35)] px-4 py-5 sm:border-l sm:first:border-l-0">
                      <dt className="mono text-[10px] tracking-[0.2em] text-[#bfae95] uppercase">{label}</dt>
                      <dd className="mt-2 text-[15px] text-[#f3e8d6]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </section>

        {story ? (
          <>
            <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
              <Reveal className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-24">
                <p className="text-[24px] leading-[1.45] text-ink sm:text-[32px]">{story.intro}</p>
                <div className="self-end border-t border-ink pt-5">
                  <p className="eyebrow">On the rail now</p>
                  <p className="mt-3 text-[15px] leading-relaxed">
                    {pieces.length > 0 ? `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"} from ${house.name}.` : `Nothing from ${house.name} on the rail today.`}
                  </p>
                  <Link href={pieces.length > 0 ? "#on-the-rail" : "/contact"} className="nav-link mt-5 inline-block">
                    {pieces.length > 0 ? "See the pieces" : "Ask us for a piece"}
                  </Link>
                </div>
              </Reveal>
            </section>

            <section className="tile py-24 sm:py-32" aria-labelledby="chapters">
              <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <p className="eyebrow text-center">The story</p>
                <h2 id="chapters" className="display mt-3 text-center text-[40px] text-ink sm:text-[56px]">
                  {story.chapters.length} chapters
                </h2>
                <TimelineRail className="mt-16">
                  <ol className="grid gap-20 sm:gap-28">
                    {story.chapters.map((chapter, index) => (
                      <li key={`${chapter.year}-${chapter.title}`} className="relative grid gap-6 pl-10 md:grid-cols-2 md:gap-20 md:pl-0">
                        <span aria-hidden className="brass-rule absolute top-3 left-[3px] h-[9px] w-[9px] rotate-45 md:left-1/2 md:-ml-[4px]" />
                        <Reveal className={`md:text-right ${index % 2 ? "md:order-2 md:text-left" : ""}`}>
                          <p className="display brass-text text-[88px] leading-none sm:text-[128px]">{chapter.year}</p>
                        </Reveal>
                        <Reveal delay={0.1} className={index % 2 ? "md:order-1 md:text-right" : ""}>
                          <p className="mono text-[11px] tracking-[0.2em] text-muted uppercase">Chapter {NUMERALS[index] ?? index + 1}</p>
                          <h3 className="display mt-3 text-[32px] text-ink sm:text-[40px]">{chapter.title}</h3>
                          <p className={`mt-4 max-w-md text-[17px] leading-relaxed ${index % 2 ? "md:ml-auto" : ""}`}>{chapter.body}</p>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                </TimelineRail>
              </div>
            </section>

            <section className="house-room py-24 sm:py-32" aria-labelledby="codes">
              <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <p className="mono text-[11px] tracking-[0.2em] text-[#bfae95] uppercase">What makes it {house.name}</p>
                <h2 id="codes" className="display mt-3 text-[40px] text-[#f6ecda] sm:text-[56px]">
                  The codes
                </h2>
                <ul className={`mt-14 grid gap-px bg-[rgba(217,187,117,0.25)] sm:grid-cols-2 ${story.codes.length > 2 ? "lg:grid-cols-3" : ""}`}>
                  {story.codes.map((code, index) => (
                    <li key={code.name} className="bg-[#140c06] p-8 sm:p-10">
                      <Reveal delay={index * 0.08}>
                        <p className="mono brass-text text-[13px]">{String(index + 1).padStart(2, "0")}</p>
                        <h3 className="display mt-6 text-[28px] text-[#f6ecda]">{code.name}</h3>
                        <p className="mt-4 text-[15px] leading-relaxed text-[#d8c9b2]">{code.body}</p>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
            <p className="text-[22px] leading-relaxed text-ink">
              We are still writing the story of {house.name}. Every line will be checked before it goes up.
            </p>
            <p className="mt-4 text-[15px] text-muted">Until then, tell us what you are looking for and our team will find it for you.</p>
            <Link href="/contact" className="pill-btn mt-8">
              Ask for a piece
            </Link>
          </section>
        )}

        {pieces.length > 0 ? (
          <section id="on-the-rail" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8" aria-labelledby="rail-title">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">{house.name} at Hanger 22</p>
                <h2 id="rail-title" className="display mt-3 text-[40px] text-ink sm:text-[48px]">
                  On the rail now
                </h2>
              </div>
              <Link href={`/pieces?brand=${house.slug}`} className="nav-link mb-2">
                Shop {house.name}
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
              {pieces.map((item) => (
                <li key={item.id}>
                  <PieceCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {story && SOCIAL.length > 0 ? (
          <section className="border-t border-line" aria-labelledby="social">
            <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-16 sm:px-8">
              <div>
                <p className="eyebrow">The story continues</p>
                <h2 id="social" className="display mt-3 text-[32px] text-ink">
                  {house.name} on our channels
                </h2>
              </div>
              <ul className="flex gap-3">
                {SOCIAL.map((account) => (
                  <li key={account.url}>
                    <a href={account.url} className="pill-btn" rel="noopener noreferrer" target="_blank">
                      {account.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {story ? (
          <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
            <details className="fold border-y border-line">
              <summary className="flex items-center justify-between py-5 text-[13px] font-medium tracking-[0.1em] text-ink uppercase">
                Sources
                <span className="fold-mark text-[18px] leading-none font-normal" aria-hidden>
                  +
                </span>
              </summary>
              <ul className="grid gap-2 pb-6 text-[14px]">
                {story.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-muted">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </section>
        ) : null}

        <Link href={`/brands/${next.slug}`} className="group spotlight block text-[#f3e8d6]">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 py-20 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
            <div>
              <p className="mono text-[11px] tracking-[0.2em] text-[#bfae95] uppercase">Next house</p>
              <p className="display mt-3 text-[48px] text-[#f8eedd] transition-transform duration-500 group-hover:translate-x-2 sm:text-[72px]">{next.name}</p>
            </div>
            <Trophy slug={next.slug} className="h-20 w-64 transition-transform duration-500 group-hover:-translate-y-1" />
          </div>
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
