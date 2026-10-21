import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { filterItems, getCollabs, getPublicItems, type CatalogueQuery } from "@/lib/data";
import { PRICE_BANDS } from "@/lib/money";

export const metadata: Metadata = {
  title: "Pieces",
  description: "A curated edit of rare collabs, ghost pieces and luxury objects. Some ship from the vault. The rest are sourced to order.",
};

type SP = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hrefFor(current: CatalogueQuery, patch: CatalogueQuery) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/pieces?${query}` : "/pieces";
}

export default async function PiecesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const query: CatalogueQuery = {
    category: one(sp.category),
    brand: one(sp.brand),
    collab: one(sp.collab),
    band: one(sp.band),
    availability: one(sp.availability),
    q: one(sp.q),
  };
  const all = getPublicItems();
  const items = filterItems(all, query);
  const brands = [...new Set(all.map((item) => item.brand))].sort();
  const categories = [...new Set(all.map((item) => item.category))].sort();
  const collabs = getCollabs().filter((collab) => all.some((item) => item.collabId === collab.id));

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Catalogue</p>
        <h1 className="display mt-3 text-5xl text-ink">The edit</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {all.length} pieces in the edit. The rail itself is five jackets. In the vault means we hold it. Sourced to order means five to ten days, if the listing is still there.
        </p>
        <form className="mt-8 flex max-w-md gap-2" action="/pieces">
          <label className="sr-only" htmlFor="q">
            Search
          </label>
          <input id="q" name="q" defaultValue={query.q ?? ""} placeholder="Search the rail" className="field" />
          {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
          {query.brand ? <input type="hidden" name="brand" value={query.brand} /> : null}
          {query.collab ? <input type="hidden" name="collab" value={query.collab} /> : null}
          {query.band ? <input type="hidden" name="band" value={query.band} /> : null}
          {query.availability ? <input type="hidden" name="availability" value={query.availability} /> : null}
          <button className="pill-btn" type="submit">
            Search
          </button>
        </form>
        <div className="mt-8 flex flex-col gap-4">
          <FilterRow label="Category" current={query.category} options={categories.map((id) => ({ id, label: id }))} query={query} param="category" />
          <FilterRow label="Brand" current={query.brand} options={brands.map((id) => ({ id, label: id }))} query={query} param="brand" />
          <FilterRow label="Collab" current={query.collab} options={collabs.map((collab) => ({ id: collab.id, label: collab.name }))} query={query} param="collab" />
          <FilterRow label="Price" current={query.band} options={PRICE_BANDS.map((band) => ({ id: band.id, label: band.label }))} query={query} param="band" />
          <FilterRow
            label="Ships"
            current={query.availability}
            options={[
              { id: "in_vault", label: "In the Vault" },
              { id: "sourced", label: "Sourced to order" },
            ]}
            query={query}
            param="availability"
          />
        </div>
        {items.length === 0 ? (
          <p className="mt-16 text-[16px]">
            Nothing in the edit matches that filter. <Link href="/pieces" className="text-ink underline">Clear it</Link>.
          </p>
        ) : (
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <PieceCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function FilterRow({
  label,
  current,
  options,
  query,
  param,
}: {
  label: string;
  current?: string;
  options: { id: string; label: string }[];
  query: CatalogueQuery;
  param: keyof CatalogueQuery;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-[11px] tracking-[0.14em] text-muted uppercase">{label}</span>
      <Link href={hrefFor(query, { [param]: undefined })} className={chip(!current)} aria-current={!current ? "true" : undefined}>
        All
      </Link>
      {options.map((option) => (
        <Link
          key={option.id}
          href={hrefFor(query, { [param]: current === option.id ? undefined : option.id })}
          className={chip(current === option.id)}
          aria-current={current === option.id ? "true" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function chip(on: boolean) {
  return on
    ? "rounded-full bg-ink px-3 py-1 text-[12px] text-paper"
    : "rounded-full border border-line px-3 py-1 text-[12px] text-body hover:border-ink";
}
