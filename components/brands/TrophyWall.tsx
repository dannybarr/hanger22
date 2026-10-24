import Link from "next/link";
import type { House } from "@/lib/brands";

/**
 * The Stüssy Milan wall, rebuilt in oak and light. Two banks of cubbies curve
 * away from a doorway. Each opening holds one house as a brass trophy, and
 * cubbies for houses on the rail now are lit brighter.
 */
export function TrophyWall({ houses, stocked, children }: { houses: House[]; stocked: Set<string>; children: React.ReactNode }) {
  const half = Math.ceil(houses.length / 2);
  const left = houses.slice(0, half);
  const right = houses.slice(half);

  return (
    <div className="wall-stage wall-reflect mx-auto grid max-w-[1500px] items-stretch gap-4 px-4 lg:grid-cols-[1fr_minmax(300px,0.72fr)_1fr] lg:gap-0 lg:px-8">
      <Block houses={left} stocked={stocked} className="wall-left order-2 lg:order-1" />
      <Doorway>{children}</Doorway>
      <Block houses={right} stocked={stocked} className="wall-right order-3" />
    </div>
  );
}

function Doorway({ children }: { children: React.ReactNode }) {
  const lights = [
    { top: "17%", width: "64%" },
    { top: "25%", width: "44%" },
    { top: "30.5%", width: "31%" },
    { top: "34%", width: "22%" },
    { top: "36.3%", width: "16%" },
  ];
  return (
    <div className="doorway order-1 flex min-h-[420px] flex-col justify-end lg:order-2 lg:min-h-0">
      <span aria-hidden className="doorway-lintel hidden lg:block" />
      <span aria-hidden className="doorway-return left hidden lg:block" />
      <span aria-hidden className="doorway-return right hidden lg:block" />
      {lights.map((light) => (
        <span key={light.top} aria-hidden className="doorway-light" style={{ top: light.top, width: light.width, opacity: Number.parseFloat(light.width) / 64 }} />
      ))}
      <div className="relative z-10 px-6 pt-48 pb-8 text-center lg:pb-12">{children}</div>
    </div>
  );
}

function Block({ houses, stocked, className }: { houses: House[]; stocked: Set<string>; className: string }) {
  return (
    <ul className={`oak-frame grid grid-cols-4 gap-[7px] p-[7px] sm:gap-[10px] sm:p-[10px] ${className}`}>
      {houses.map((house) => (
        <li key={house.slug}>
          <Link
            href={`/brands/${house.slug}`}
            className="cubby"
            data-stocked={stocked.has(house.slug) ? "true" : undefined}
            aria-label={`${house.name}${stocked.has(house.slug) ? ", on the rail now" : ""}`}
          >
            <span aria-hidden className="c-back" />
            <span aria-hidden className="c-side left" />
            <span aria-hidden className="c-side right" />
            <span aria-hidden className="c-top" />
            <span aria-hidden className="c-floor" />
            <span aria-hidden className="c-cone" />
            <span aria-hidden className="c-led" />
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
