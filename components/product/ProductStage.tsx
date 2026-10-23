"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export type StageImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Where the piece hangs from, as fractions of the image. Absent for photographs, which sit flat. */
  hang?: { x: number; y: number; ownHook: boolean };
};

const RAIL = "linear-gradient(180deg,#fbfbfa 0%,#d9dad8 26%,#3b3b39 48%,#4a4a47 60%,#c3c4c2 100%)";

/**
 * The piece is hung for you: lowered onto a short bar, it stops, and the stop
 * sets off one small swing that settles. Sizes use container units so the
 * hook meets the collar at any width.
 */
export function ProductStage({ images }: { images: StageImage[] }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const current = images[index] ?? images[0];
  if (!current) return null;
  const hang = current.hang;
  const imageW = 80;
  const imageH = (imageW * current.height) / current.width;
  const bar = 11;
  const drop = 5;
  const left = hang ? 50 - hang.x * imageW : 50 - imageW / 2;
  const top = hang ? (hang.ownHook ? bar - hang.y * imageH : bar + drop - hang.y * imageH) : 10;

  return (
    <div>
      <div className="tile relative aspect-[10/11] overflow-hidden [container-type:inline-size]">
        {hang ? <div aria-hidden className="absolute inset-x-[16%] h-[7px] -translate-y-1/2" style={{ top: `${bar}cqw`, background: RAIL, boxShadow: "0 10px 14px -8px rgba(39,31,23,0.35)" }} /> : null}
        <motion.div
          key={current.src}
          className="absolute"
          style={{ left: `${left}cqw`, top: `${top}cqw`, width: `${imageW}cqw`, height: `${imageH}cqw`, transformOrigin: hang ? `${hang.x * 100}% ${((bar - top) / imageH) * 100}%` : "50% 50%" }}
          initial={reduced ? false : hang ? { y: -70, opacity: 0 } : { opacity: 0 }}
          animate={reduced || !hang ? { y: 0, opacity: 1 } : { y: 0, opacity: 1, rotate: [0, 0, 1.6, -1.1, 0.5, 0] }}
          transition={{
            y: { type: "spring", stiffness: 130, damping: 19 },
            opacity: { duration: 0.25 },
            rotate: { duration: 2.2, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: "easeInOut" },
          }}
        >
          {hang && !hang.ownHook ? (
            <svg
              aria-hidden
              viewBox="0 0 30 40"
              preserveAspectRatio="none"
              className="absolute overflow-visible"
              style={{ left: `calc(${hang.x * 100}% - 15px)`, top: `calc(${((bar - top) / imageH) * 100}% - 9px)`, width: 30, height: `calc(${drop}cqw + 9px)` }}
            >
              <path d="M15 40 L15 13 C15 6 21 3 24 7 C26 10 23 13 20 12" fill="none" stroke="#7d848e" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          ) : null}
          <Image
            src={current.src}
            alt={current.alt}
            fill
            quality={92}
            priority
            sizes="(max-width: 1024px) 80vw, 520px"
            className={hang ? "piece-shadow object-contain" : "object-contain"}
          />
        </motion.div>
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-3">
          {images.map((image, imageIndex) => (
            <li key={image.src}>
              <button
                type="button"
                aria-pressed={imageIndex === index}
                aria-label={`View ${imageIndex + 1} of ${images.length}`}
                className={`tile block h-20 w-20 border p-1.5 transition-colors ${imageIndex === index ? "border-ink" : "border-transparent hover:border-line"}`}
                onClick={() => setIndex(imageIndex)}
              >
                <Image src={image.src} alt="" width={image.width} height={image.height} quality={75} sizes="80px" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
