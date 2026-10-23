import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { PieceCard } from "@/components/piece/PieceCard";
import { filterItems, getPublicItems, type CatalogueQuery } from "@/lib/data";
import { PRICE_BANDS, priceOf } from "@/lib/money";
import { CATEGORY_LABEL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Every piece on the Hanger 22 rail. Rare collaborations and hard-to-find pieces, one of each.",
};

type SP = Record<string, string | string[] | undefined>;

const SORTS = [
  { id: "", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
] as const;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type Query = CatalogueQuery & { sort?: string };

function hrefFor(current: Query, patch: Query) {
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
  const query: Query = {
    category: one(sp.category),
    brand: one(sp.brand),
    band: one(sp.band),
    q: one(sp.q),
    sort: one(sp.sort),
  };
  const all = getPublicItems();
  let items = filterItems(all, query);
  if (query.sort === "price-asc") items = [...items].sort((a, b) => priceOf(a) - priceOf(b));
  if (query.sort === "price-desc") items = [...items].sort((a, b) => priceOf(b) - priceOf(a));
  const brands = [...new Set(all.map((item) => item.brand))].sort();
  const categories = Object.keys(CATEGORY_LABEL).filter((id) => all.some((item) => item.category === id)) as (keyof typeof CATEGORY_LABEL)[];
  const bands = PRICE_BANDS.filter((band) => all.some((item) => priceOf(item) >= band.min && priceOf(item) < band.max));
  const title = query.category ? CATEGORY_LABEL[query.category as keyof typeof CATEGORY_LABEL] ?? "Shop all" : "Shop all";
  const filtered = Boolean(query.brand || query.band || query.q);

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Hanger 22</p>
            <h1 className="display mt-3 text-[48px] text-ink sm:text-[64px]">{title}</h1>
          </div>
          <form id="search" action="/pieces" className="flex w-full max-w-sm gap-2 sm:w-auto">
            <label className="sr-only" htmlFor="q">
              Search the rail
            </label>
            <input id="q" name="q" type="search" defaultValue={query.q ?? ""} placeholder="Moncler, Kapital, jacket" className="field" />
            {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
            <button className="pill-btn shrink-0" type="submit">
              Search
            </button>
          </form>
        </div>

        <nav aria-label="Categories" className="mt-10 flex gap-7 overflow-x-auto overflow-y-hidden border-b border-line">
          <Tab href={hrefFor({ ...query, category: undefined }, {})} active={!query.category}>
            All
          </Tab>
          {categories.map((id) => (
            <Tab key={id} href={hrefFor(query, { category: id })} active={query.category === id}>
              {CATEGORY_LABEL[id]}
            </Tab>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
          <FilterRow label="Brand" current={query.brand} options={brands.map((id) => ({ id, label: id }))} query={query} param="brand" />
          {bands.length > 1 ? (
            <FilterRow label="Price" current={query.band} options={bands.map((band) => ({ id: band.id, label: band.label }))} query={query} param="band" />
          ) : null}
          <div className="flex items-center gap-3 text-[13px] lg:ml-auto">
            <span className="field-label">Sort</span>
            {SORTS.map((sort) => (
              <Link
                key={sort.id}
                href={hrefFor(query, { sort: sort.id || undefined })}
                className={(query.sort ?? "") === sort.id ? "text-ink underline underline-offset-4" : "text-muted hover:text-ink"}
                aria-current={(query.sort ?? "") === sort.id ? "true" : undefined}
              >
                {sort.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[13px] text-muted" aria-live="polite">
          {items.length} {items.length === 1 ? "piece" : "pieces"}
          {filtered ? (
            <>
              {" "}
              ·{" "}
              <Link href={hrefFor({ category: query.category }, {})} className="text-ink underline underline-offset-4">
                Clear filters
              </Link>
            </>
          ) : null}
        </p>

        {items.length === 0 ? (
          <div className="mt-16 max-w-md">
            <p className="display text-[28px] text-ink">Nothing on the rail matches that</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">Tell us what you are looking for and we will search for it.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/contact" className="pill-btn">
                Ask for a piece
              </Link>
              <Link href="/pieces" className="pill-btn">
                Clear search
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
            {items.map((item, index) => (
              <li key={item.id}>
                <PieceCard item={item} priority={index < 4} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`-mb-px shrink-0 border-b-2 pb-3 text-[13px] font-medium tracking-[0.1em] uppercase transition-colors ${active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
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
  query: Query;
  param: keyof Query;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="field-label mr-1">{label}</span>
      {options.map((option) => (
        <Link
          key={option.id}
          href={hrefFor(query, { [param]: current === option.id ? undefined : option.id })}
          className={
            current === option.id
              ? "border border-ink bg-ink px-3 py-1.5 text-[12px] text-paper"
              : "border border-line px-3 py-1.5 text-[12px] text-body transition-colors hover:border-ink"
          }
          aria-current={current === option.id ? "true" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
