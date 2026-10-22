import Image from "next/image";
import Link from "next/link";
import { getHouse } from "@/lib/brands";
import { CUBBIES } from "@/lib/cubbies";

export function BrandWall() {
  return (
    <div className="wall-frame">
      <div className="wall-stage">
        <Image
          src="/brands/wall.png"
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover"
        />
        {CUBBIES.map((cubby) => {
          if (!cubby.slug) return null;
          const house = getHouse(cubby.slug);
          if (!house) return null;
          return (
            <Link
              key={cubby.id}
              href={`/brands/${house.slug}`}
              className="trophy"
              style={{ left: `${cubby.x}%`, top: `${cubby.y}%`, width: `${cubby.w}%`, height: `${cubby.h}%` }}
              aria-label={house.name}
            >
              <Image src={`/brands/${house.file}`} alt="" width={160} height={80} unoptimized />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
