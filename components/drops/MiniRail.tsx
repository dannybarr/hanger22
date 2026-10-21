"use client";

import Link from "next/link";
import { useState } from "react";
import { Garment } from "@/components/rail/garments";
import { Suspension } from "@/components/rail/Hanger";
import type { PublicItem } from "@/lib/schema";

export function MiniRail({ items }: { items: PublicItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  if (items.length === 0) return <p className="text-[14px] text-muted">Nothing from this story is in the public edit.</p>;
  return (
    <ul aria-label="Pieces from this drop" className="flex items-end justify-start gap-3 overflow-x-auto py-6">
      {items.map((item) => {
        const on = item.id === active;
        return (
          <li key={item.id}>
            <Link
              href={`/p/${item.slug}`}
              className="block text-center"
              style={{ width: on ? 150 : 64 }}
              onMouseEnter={() => setActive(item.id)}
              onFocus={() => setActive(item.id)}
            >
              <Suspension mode={item.suspension} width={on ? 150 : 64} uid={`mini-${item.id}`} />
              <div className="mx-auto h-40">
                <Garment
                  art={item.art}
                  pose={on ? "front" : "side"}
                  uid={`mini-${item.id}`}
                  src={item.images.imageStatus === "cutout" ? item.images.front : undefined}
                />
              </div>
              <span className="mt-2 block text-[12px] text-ink">{item.shortTitle}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
