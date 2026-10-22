import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { getHouse, HOUSES } from "@/lib/brands";

type Params = { slug: string };

export function generateStaticParams() {
  return HOUSES.map((house) => ({ slug: house.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const house = getHouse(slug);
  if (!house) return { title: "House" };
  return {
    title: house.name,
    description: `${house.name}. History coming soon.`,
  };
}

export default async function HousePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const house = getHouse(slug);
  if (!house) notFound();

  return (
    <main id="content" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <article className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-20 text-center">
        <Image src={`/brands/${house.file}`} alt="" width={280} height={64} unoptimized className="h-16 w-auto max-w-[280px] object-contain" />
        <h1 className="display mt-10 text-5xl text-ink sm:text-6xl">{house.name}</h1>
        <p className="mt-6 text-[16px] text-muted">History coming soon</p>
        <Link href="/brands" className="nav-link mt-12">
          The wall
        </Link>
      </article>
      <SiteFooter />
    </main>
  );
}
