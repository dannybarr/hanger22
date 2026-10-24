import Link from "next/link";
import type { House } from "@/lib/brands";

/**
 * The Stüssy Milan wall, rebuilt in oak and light. Each opening holds one house
 * as a brass trophy. Cubbies for houses on the rail now are lit brighter.
 */
export function TrophyWall({ houses, stocked, children }: { houses: House[]; stocked: Set<string>; children: React.ReactNode }) {
  const half = Math.ceil(houses.length / 2);
  const left = houses.slice(0, half);
  const right = houses.slice(half);

  return (
    <div className="mx-auto grid max-w-[1500px] items-stretch gap-4 px-4 lg:grid-cols-[1fr_minmax(300px,0.72fr)_1fr] lg:gap-0 lg:px-8">
      <Block houses={left} stocked={stocked} className="order-2 lg:order-1" />
      <div className="order-1 flex flex-col justify-end lg:order-2 lg:px-2">{children}</div>
      <Block houses={right} stocked={stocked} className="order-3" />
    </div>
  );
}

function Block({ houses, stocked, className }: { houses: House[]; stocked: Set<string>; className: string }) {
  return (
    <ul className={`oak-frame grid grid-cols-4 gap-[6px] p-[6px] sm:gap-2 sm:p-2 ${className}`}>
      {houses.map((house) => (
        <li key={house.slug}>
          <Link
            href={`/brands/${house.slug}`}
            className="cubby"
            data-stocked={stocked.has(house.slug) ? "true" : undefined}
            aria-label={`${house.name}${stocked.has(house.slug) ? ", on the rail now" : ""}`}
          >
            <span aria-hidden className="trophy-pool" />
            <span aria-hidden className="trophy-stand" />
            <span
              aria-hidden
              className="trophy-cast"
              style={{ maskImage: `url(/brands/trophy/${house.slug}.png)`, WebkitMaskImage: `url(/brands/trophy/${house.slug}.png)` }}
            />
            <span aria-hidden className="trophy-plate">
              {house.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
