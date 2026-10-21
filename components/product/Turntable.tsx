"use client";

import { useRef, useState } from "react";
import { Garment } from "@/components/rail/garments";
import { RailHanger } from "@/components/rail/Hanger";
import type { PublicItem } from "@/lib/schema";

export function Turntable({ item, pickedFor }: { item: PublicItem; pickedFor?: string }) {
  const [turn, setTurn] = useState(0);
  const drag = useRef<{ x: number; turn: number } | null>(null);

  return (
    <div className="dotgrid relative border border-line">
      <div
        className="flex min-h-[460px] cursor-ew-resize flex-col items-center justify-end px-8 pt-10 pb-8"
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, turn };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const delta = (event.clientX - drag.current.x) / 180;
          setTurn(Math.min(1, Math.max(0, drag.current.turn + delta)));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <div className="relative w-[min(280px,70%)]">
          {pickedFor ? (
            <p className="absolute -top-2 right-0 z-10 max-w-28 rotate-3 border border-ink bg-paper px-2 py-1 text-center font-script text-[20px] leading-none text-ink">
              Picked for {pickedFor}
            </p>
          ) : null}
          <div className="flex justify-center">
            <RailHanger width={168} uid={`${item.id}-stage`} />
          </div>
          <div className="relative mx-auto h-72 w-full">
            <div className="absolute inset-0" style={{ opacity: 1 - turn }}>
              <Garment
                art={item.art}
                pose="front"
                uid={`${item.id}-stage`}
                priority
                src={item.images.imageStatus === "cutout" ? item.images.front : undefined}
                label={item.images.imageStatus === "placeholder" ? item.shortTitle : undefined}
              />
            </div>
            <div className="absolute inset-0" style={{ opacity: turn }}>
              <Garment
                art={item.art}
                pose="side"
                uid={`${item.id}-stage`}
                src={item.images.imageStatus === "cutout" ? item.images.front : undefined}
              />
            </div>
          </div>
        </div>
      </div>
      <label className="flex items-center gap-3 border-t border-line px-4 py-3 text-[11px] tracking-[0.12em] text-muted uppercase">
        Drag to turn
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(turn * 100)}
          aria-label="Rotate piece"
          className="w-full"
          onChange={(event) => setTurn(Number(event.target.value) / 100)}
        />
      </label>
    </div>
  );
}
