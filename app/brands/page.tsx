import type { Metadata } from "next";
import Link from "next/link";
import { TrophyWall } from "@/components/brands/TrophyWall";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { HOUSES, housesFor, type House } from "@/lib/brands";
import { getPublicItems } from "@/lib/data";
import { HOUSE_STORIES } from "@/lib/houseStories";

export const metadata: Metadata = {
  title: "The houses",
  description: "The houses Hanger 22 hunts for, each with its story. The lit ones are on the rail now.",
};

const WALL_COLUMNS = 4;

/**
 * Houses with a story or stock sit at eye level, beside the doorway: the middle
 * rows, filling outwards from the columns nearest the opening, alternating sides.
 */
function arrange(houses: House[], featured: Set<string>) {
  const perSide = Math.ceil(houses.length / 2);
  const rows = Math.ceil(perSide / WALL_COLUMNS);
  const middle = [...new Set([Math.floor((rows - 1) / 2), Math.ceil((rows - 1) / 2)])];
  const rowsByReach = [...middle, ...Array.from({ length: rows }, (_, row) => row).filter((row) => !middle.includes(row))];
  const eyeLevel: number[] = [];
  for (let reach = 0; reach < WALL_COLUMNS; reach += 1) {
    for (const row of rowsByReach) {
      eyeLevel.push(row * WALL_COLUMNS + (WALL_COLUMNS - 1 - reach), perSide + row * WALL_COLUMNS + reach);
    }
  }
  const front = houses.filter((house) => featured.has(house.slug));
  const rest = houses.filter((house) => !featured.has(house.slug));
  const slots: (House | undefined)[] = new Array(houses.length).fill(undefined);
  front.forEach((house, index) => {
    const slot = eyeLevel.find((candidate, position) => position >= index && candidate < slots.length && !slots[candidate]);
    if (slot != null) slots[slot] = house;
    else rest.unshift(house);
  });
  return slots.map((slot) => slot ?? rest.shift()).filter((house): house is House => Boolean(house));
}

export default function BrandsPage() {
  const items = getPublicItems();
  const stocked = new Set(items.flatMap((item) => housesFor(item.brand)).map((house) => house.slug));
  const featured = new Set([...stocked, ...Object.keys(HOUSE_STORIES)]);
  const wall = arrange(HOUSES, featured);
  const index = [...HOUSES].sort((a, b) => Number(featured.has(b.slug)) - Number(featured.has(a.slug)) || a.name.localeCompare(b.name));

  return (
    <>
      <SiteHeader />
      <main id="content">
        <section className="house-room pt-10 pb-16 sm:pt-14 sm:pb-24" aria-labelledby="houses-title">
          <TrophyWall houses={wall} stocked={stocked}>
            <div>
              <p className="mono text-[11px] tracking-[0.2em] text-[#d9bb75] uppercase">Hanger 22</p>
              <h1 id="houses-title" className="display mt-4 text-[52px] text-[#f6ecda] sm:text-[72px]">
                The houses
              </h1>
              <p className="mx-auto mt-5 max-w-[30ch] text-[15px] leading-relaxed text-[#d8c9b2]">
                Every trophy is a house we hunt for. Choose one to read its story.
              </p>
              <p className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[#bfae95]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#ffd79a] shadow-[0_0_10px_2px_rgba(255,200,120,0.7)]" />
                Lit cubbies are on the rail now
              </p>
            </div>
          </TrophyWall>
          <p className="mx-auto mt-14 max-w-2xl px-5 text-center text-[12px] leading-relaxed text-[#9c8c76]">
            Hanger 22 is an independent reseller and is not affiliated with, or endorsed by, the houses on this wall. Their names and marks belong to them.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-labelledby="archive">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">The archive</p>
              <h2 id="archive" className="display mt-3 text-[40px] text-ink sm:text-[48px]">
                Every house on the wall
              </h2>
            </div>
            <Link href="/pieces" className="nav-link mb-2">
              Shop all
            </Link>
          </div>
          <ol className="mt-10 border-t border-ink">
            {index.map((house, position) => {
              const story = HOUSE_STORIES[house.slug];
              const onRail = stocked.has(house.slug);
              return (
                <li key={house.slug} className="border-b border-line">
                  <Link href={`/brands/${house.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[3rem_1.4fr_1fr_1fr_auto]">
                    <span className="mono text-[12px] text-muted">{String(position + 1).padStart(2, "0")}</span>
                    <span className="display text-[22px] text-ink transition-transform duration-300 group-hover:translate-x-1 sm:text-[26px]">{house.name}</span>
                    <span className="hidden text-[13px] text-muted sm:block">{story ? `${story.origin}, ${story.founded}` : ""}</span>
                    <span className="hidden text-[13px] sm:block">{onRail ? "On the rail now" : <span className="text-muted">Ask us</span>}</span>
                    <span className="text-[12px] font-medium tracking-[0.1em] text-ink uppercase">{story ? "Read the story" : "View"}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
