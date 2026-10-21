"use client";

import { useScroll, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";
import { Garment } from "@/components/rail/garments";
import type { Drop } from "@/lib/schema";

export function DropSequence({ frames }: { frames: Drop["frames"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(frames.length - 1, Math.max(0, Math.round(value * (frames.length - 1))));
    setIndex(next);
  });

  const frame = frames[index] ?? frames[0];
  if (!frame) return null;

  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-6">
        <div className="dotgrid flex h-[70vh] w-full max-w-3xl items-end justify-center border border-line">
          {frame.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frame.image} alt="" className="max-h-[62vh] w-auto object-contain" />
          ) : (
            <div className="h-[58vh] w-[min(280px,70%)]">
              <Garment art={frame.art} pose="front" uid={`seq-${frame.art}-${index}`} />
            </div>
          )}
        </div>
        <p className="mt-4 text-[13px] text-muted">{frame.caption}</p>
        <p className="mt-1 text-[11px] tracking-[0.14em] text-ink tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
