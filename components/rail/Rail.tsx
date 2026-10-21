"use client";

import dynamic from "next/dynamic";
import { hangLength, sideScale } from "@/lib/motion";
import type { PublicItem } from "@/lib/schema";

const ChromeRail = dynamic(() => import("@/components/rail/ChromeRail").then((mod) => mod.ChromeRail), {
  ssr: false,
});

/** Dark core of the bar sits ~21px into the bracket row. Garments start 15px under that. */
export const GARMENT_TOP = 36;

export type RailMetrics = {
  piece: number;
  railWidth: number;
  gap: number;
};

export type PieceSize = { height: number; front: number; side: number };

export function pieceSize(item: PublicItem, index: number, baseHeight: number): PieceSize {
  const pixelsW = item.images.pixelWidth ?? 520;
  const pixelsH = item.images.pixelHeight ?? 1000;
  const height = Math.round(baseHeight * hangLength(item.id));
  const front = Math.max(86, Math.round(height * (pixelsW / pixelsH)));
  const side = Math.max(26, Math.round(front * sideScale(index)));
  return { height, front, side };
}

export function Rail({
  items,
  activeId,
  vault,
  swinging,
  onHover,
  onOpen,
  onReveal,
}: {
  items: PublicItem[];
  activeId: string | null;
  vault: boolean;
  swinging: boolean;
  onHover: (id: string | null) => void;
  onOpen: (id: string) => void;
  onReveal: (id: string) => void;
}) {
  void swinging;

  return (
    <ChromeRail
      items={items}
      activeId={activeId}
      vault={vault}
      onHover={onHover}
      onOpen={onOpen}
      onReveal={onReveal}
    />
  );
}
