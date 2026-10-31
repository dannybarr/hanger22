import Link from "next/link";
import type { House } from "@/lib/brands";

type Entry = { house: House; pieces: number; story: boolean };

/**
 * All brands, the way a department store lists its designers: the houses in
 * the edit now first, then every house from A to Z with a letter index.
 * Shopping the pieces always stays one tap away.
 */
export function BrandDirectory({ entries, totalPieces }: { entries: Entry[]; totalPieces: number }) {
  const inEdit = entries.filter((entry) => entry.pieces > 0).sort((a, b) => b.pieces - a.pieces || a.house.name.localeCompare(b.house.name));
  const groups = new Map<string, Entry[]>();
  for (const entry of [...entries].sort((a, b) => a.house.name.localeCompare(b.house.name))) {
    const letter = entry.house.name[0]!.toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <section className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8" aria-labelledby="all-brands">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-8">
        <div>
          <p className="eyebrow">Brands</p>
          <h1 id="all-brands" className="display mt-3 text-[48px] text-ink sm:text-[64px]">
            All brands
          </h1>
        </div>
        <Link href="/pieces" className="btn-solid px-10">
          Shop all {totalPieces} pieces
        </Link>
      </div>

      {inEdit.length > 0 ? (
        <div className="mt-12">
          <p className="eyebrow">In the edit now</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {inEdit.map(({ house, pieces, story }) => (
              <li key={house.slug} className="group tile relative flex flex-col justify-between p-5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-tile)_80%,var(--color-ink)_6%)]">
                <Link href={`/pieces?brand=${house.slug}`} className="absolute inset-0" aria-label={`Shop ${house.name}, ${pieces} ${pieces === 1 ? "piece" : "pieces"}`} />
                <span
                  aria-hidden
                  className="block h-14 w-full bg-ink [mask-position:left_center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:left_center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
                  style={{ maskImage: `url(/brands/trophy/${house.slug}.png)`, WebkitMaskImage: `url(/brands/trophy/${house.slug}.png)` }}
                />
                <div className="mt-10 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-ink">{house.name}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {pieces} {pieces === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  {story ? (
                    <Link href={`/brands/${house.slug}`} className="nav-link relative z-10 text-[11px]">
                      The story
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
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
              {list.map(({ house, pieces, story }) => (
                <li key={house.slug}>
                  <Link href={pieces > 0 ? `/pieces?brand=${house.slug}` : `/brands/${house.slug}`} className="group inline-flex items-baseline gap-2 text-[15px]">
                    <span className={`underline-offset-4 group-hover:underline ${pieces > 0 ? "font-medium text-ink" : "text-body"}`}>{house.name}</span>
                    {pieces > 0 ? <span className="mono text-[11px] text-muted">{pieces}</span> : null}
                    {story && pieces === 0 ? <span className="text-[11px] text-muted">Story</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[13px] text-muted">
        Looking for a house you cannot see here?{" "}
        <Link href="/contact" className="text-ink underline underline-offset-4">
          Our personal shopping team can help
        </Link>
        .
      </p>
    </section>
  );
}
