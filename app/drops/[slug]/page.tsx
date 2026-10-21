import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { DropSequence } from "@/components/drops/DropSequence";
import { MiniRail } from "@/components/drops/MiniRail";
import { getCollab, getDrop, getDrops, getPublicItems } from "@/lib/data";

type Params = { slug: string };

export function generateStaticParams() {
  return getDrops().map((drop) => ({ slug: drop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const drop = getDrop(slug);
  if (!drop) return { title: "Drop" };
  return { title: drop.title, description: drop.dek };
}

export default async function DropPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const drop = getDrop(slug);
  if (!drop) notFound();
  const collab = getCollab(drop.collabId);
  const pieces = getPublicItems().filter((item) => item.collabId === drop.collabId);

  return (
    <>
      <SiteHeader />
      <main id="content">
        <section className="dotgrid flex min-h-[70vh] flex-col justify-end px-6 py-16">
          <div className="mx-auto w-full max-w-4xl">
            <p className="text-[11px] tracking-[0.16em] text-ink uppercase">{drop.kicker}</p>
            <h1 className="display mt-3 text-5xl text-ink sm:text-7xl">{drop.title}</h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed">{drop.dek}</p>
          </div>
        </section>
        <DropSequence frames={drop.frames} />
        <article className="mx-auto max-w-2xl px-6 py-16">
          {drop.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-5 text-[17px] leading-relaxed">
              {paragraph}
            </p>
          ))}
          <ol className="mt-14 border-t border-line">
            {drop.timeline.map((event) => (
              <li key={event.label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[120px_1fr]">
                <p className="text-[12px] tracking-[0.12em] text-muted uppercase">{event.year}</p>
                <div>
                  <h2 className="display text-[24px] text-ink">{event.label}</h2>
                  <p className="mt-1 text-[15px] leading-relaxed">{event.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <h2 className="display text-3xl text-ink">{collab ? collab.name : "On the rail"}</h2>
          <MiniRail items={pieces} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
