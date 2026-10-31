import Link from "next/link";
import type { House } from "@/lib/brands";

export type DirectoryEntry = { house: House; story?: { founded: string; origin: string; line: string } };

/**
 * All brands, told as stories. The houses whose full story is written lead,
 * then every house from A to Z with a letter index. Shopping by brand lives
 * on Shop all as a filter, so nothing here links to products.
 */
export function BrandDirectory({ entries }: { entries: DirectoryEntry[] }) {
  const told = entries.filter((entry) => entry.story).sort((a, b) => a.house.name.localeCompare(b.house.name));
  const groups = new Map<string, DirectoryEntry[]>();
  for (const entry of [...entries].sort((a, b) => a.house.name.localeCompare(b.house.name))) {
    const letter = entry.house.name[0]!.toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <section className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8" aria-labelledby="all-brands">
      <div className="grid gap-6 border-b border-ink pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="eyebrow">Brand stories</p>
          <h1 id="all-brands" className="display mt-3 text-[48px] text-ink sm:text-[64px]">
            All brands
          </h1>
        </div>
        <p className="max-w-lg text-[16px] leading-relaxed text-muted lg:justify-self-end">
          Every house has a story worth knowing. How it began, who built it, who it was made for and what it stands for today.
        </p>
      </div>

      {told.length > 0 ? (
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {told.map(({ house, story }) => (
            <li key={house.slug}>
              <Link href={`/brands/${house.slug}`} className="group tile flex h-full flex-col p-6 transition-colors hover:bg-[color-mix(in_srgb,var(--color-tile)_88%,var(--color-ink)_6%)] sm:p-8">
                <span
                  aria-hidden
                  className="block h-12 w-full bg-ink [mask-position:left_center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:left_center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
                  style={{ maskImage: `url(/brands/trophy/${house.slug}.png)`, WebkitMaskImage: `url(/brands/trophy/${house.slug}.png)` }}
                />
                <p className="mono mt-10 text-[11px] tracking-[0.12em] text-muted uppercase">
                  {story!.origin}, {story!.founded}
                </p>
                <p className="display mt-3 text-[26px] text-ink">{story!.line}</p>
                <span className="nav-link mt-auto self-start pt-8">Read the story</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <nav aria-label="Brands by letter" className="mt-16 flex flex-wrap gap-x-1 gap-y-2 border-y border-line py-4">
        {alphabet.map((letter) =>
          groups.has(letter) ? (
            <a key={letter} href={`#brands-${letter}`} className="flex h-9 w-9 items-center justify-center text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper">
              {letter}
            </a>
          ) : (
            <span key={letter} aria-hidden className="flex h-9 w-9 items-center justify-center text-[14px] text-[color-mix(in_srgb,var(--color-muted)_45%,transparent)]">
              {letter}
            </span>
          ),
        )}
      </nav>

      <div className="mt-10 columns-2 gap-10 sm:columns-3 lg:columns-4">
        {[...groups.entries()].map(([letter, list]) => (
          <div key={letter} id={`brands-${letter}`} className="mb-10 break-inside-avoid scroll-mt-28">
            <p className="display text-[32px] text-ink">{letter}</p>
            <ul className="mt-3 grid gap-2.5">
              {list.map(({ house, story }) => (
                <li key={house.slug}>
                  {story ? (
                    <Link href={`/brands/${house.slug}`} className="text-[15px] font-medium text-ink underline-offset-4 hover:underline">
                      {house.name}
                    </Link>
                  ) : (
                    <span className="text-[15px] text-muted">
                      {house.name} <span className="text-[11px]">Story coming soon</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
