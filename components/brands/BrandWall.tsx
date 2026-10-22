import Image from "next/image";
import Link from "next/link";
import { HOUSES, type House } from "@/lib/brands";

function Cubby({ house }: { house: House }) {
  return (
    <Link href={`/brands/${house.slug}`} className="brand-cubby" aria-label={house.name}>
      <Image src={`/brands/${house.file}`} alt="" width={240} height={120} unoptimized />
    </Link>
  );
}

function Wall({ side, houses }: { side: "left" | "right"; houses: House[] }) {
  return (
    <div className={`brand-wall brand-wall-${side}`}>
      {houses.map((house) => (
        <Cubby key={house.slug} house={house} />
      ))}
    </div>
  );
}

export function BrandWall() {
  const left = HOUSES.slice(0, 16);
  const right = HOUSES.slice(16);
  return (
    <>
      <div className="brand-corridor" aria-hidden="true">
        <div className="brand-ceiling">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="brand-light" />
          ))}
        </div>
        <div className="brand-steel brand-steel-l" />
        <div className="brand-steel brand-steel-r" />
        <div className="brand-marble">
          <span className="brand-marble-face" />
        </div>
        <div className="brand-hall-floor" />
      </div>
      <div className="brand-lintel" aria-hidden="true" />
      <Wall side="left" houses={left} />
      <Wall side="right" houses={right} />
      <div className="brand-forefloor" aria-hidden="true" />
    </>
  );
}
