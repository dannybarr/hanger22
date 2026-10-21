"use client";

import { useEffect, useState } from "react";
import { measureShoulder, type ShoulderFit } from "@/lib/hangerFit";

/**
 * Wire drawn in the cut-out's own coordinates, behind the photograph.
 * The cloth covers the arms. Only the hook and the neck, which sit in the
 * transparent padding above the collar, stay visible.
 */
export function ShoulderWire({ src, gold }: { src?: string; gold?: boolean }) {
  const [fit, setFit] = useState<ShoulderFit | null>(null);
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setFit(measureShoulder(image, image.naturalWidth, image.naturalHeight));
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  if (!fit) return null;

  const stroke = gold ? "#6e4e22" : "#1a1a1a";
  const cx = fit.collarX * 100;
  const cy = fit.collarY * 100;
  const line = (points: { x: number; y: number }[]) =>
    points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x * 100} ${point.y * 100}`).join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute top-0 left-1/2 h-auto w-full -translate-x-1/2 overflow-visible"
      style={{ aspectRatio: "1 / 1" }}
    >
      <path
        d={`M${cx} ${cy + 1.6} L${cx} ${cy - 7} C${cx} ${cy - 11} ${cx + 6.5} ${cy - 11.4} ${cx + 7} ${cy - 7.2} C${cx + 7.4} ${cy - 4.4} ${cx + 3.6} ${cy - 4.8} ${cx + 2} ${cy - 7}`}
        fill="none"
        stroke={stroke}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path d={line(fit.left)} fill="none" stroke={stroke} strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
      <path d={line(fit.right)} fill="none" stroke={stroke} strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
