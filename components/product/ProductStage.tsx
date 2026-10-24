"use client";

import { ArrowsOutSimple, MagnifyingGlassMinus } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type StageImage = { src: string; alt: string; width: number; height: number };

const FRAME_PX = 140; // drag distance that turns the piece by one view
const MIN_VIEWS = 4; // fewer real views than this is not a turn, so no 360 toggle

/**
 * The piece in full focus on its own tile. Tap or click to look closer; the zoom
 * follows your pointer or finger. When we have at least four real views of the
 * piece, the 360 toggle lets you turn it by dragging.
 */
export function ProductStage({ front, spin, title }: { front: StageImage; spin: string[]; title: string }) {
  const canSpin = spin.length >= MIN_VIEWS;
  const [mode, setMode] = useState<"still" | "zoom" | "spin">("still");
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const tileRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  function pointAt(clientX: number, clientY: number) {
    const rect = tileRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    });
  }

  return (
    <div>
      <div
        ref={tileRef}
        className={`tile relative aspect-[4/5] overflow-hidden select-none ${mode === "zoom" ? "cursor-zoom-out" : mode === "spin" ? "cursor-ew-resize" : "cursor-zoom-in"}`}
        style={{ touchAction: mode === "still" ? "pan-y" : "none" }}
        onPointerDown={(event) => {
          press.current = { x: event.clientX, y: event.clientY };
          moved.current = false;
        }}
        onPointerMove={(event) => {
          if (mode !== "zoom") return;
          if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 6) moved.current = true;
          // A mouse looks around by hovering; a finger looks around by dragging.
          if (event.pointerType === "mouse" || press.current) pointAt(event.clientX, event.clientY);
        }}
        onPointerUp={() => {
          press.current = null;
        }}
        onClick={(event) => {
          if (mode === "spin" || moved.current) return;
          pointAt(event.clientX, event.clientY);
          setMode((current) => (current === "zoom" ? "still" : "zoom"));
        }}
      >
        {mode === "spin" ? (
          <Spin frames={spin} title={title} />
        ) : (
          <div className="rise-in absolute inset-[7%]">
            <div
              className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,0.8,0.22,1)] motion-reduce:transition-none"
              style={{ transform: mode === "zoom" ? "scale(2.2)" : "scale(1)", transformOrigin: `${origin.x}% ${origin.y}%` }}
            >
              <Image
                src={front.src}
                alt={front.alt}
                fill
                quality={92}
                priority
                sizes={mode === "zoom" ? "1100px" : "(max-width: 1024px) 92vw, 640px"}
                className="object-contain [filter:drop-shadow(0_26px_22px_rgba(39,31,23,0.2))]"
              />
            </div>
          </div>
        )}
        {canSpin && mode !== "spin" ? (
          // Mounted early and hidden, so every view is loaded before the first turn.
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
            {spin.map((src) => (
              <Image key={src} src={src} alt="" fill quality={92} sizes="(max-width: 1024px) 92vw, 640px" className="object-contain" />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted" aria-live="polite">
          {mode === "spin" ? "Drag to turn the piece, or use the arrow keys." : mode === "zoom" ? "Move to look around. Tap to zoom out." : "Tap the piece to look closer."}
        </p>
        <div className="flex gap-2">
          {mode !== "spin" ? (
            <button
              type="button"
              className="flex h-10 items-center gap-2 border border-line px-3 text-[11px] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:border-ink"
              aria-pressed={mode === "zoom"}
              onClick={() => setMode((current) => (current === "zoom" ? "still" : "zoom"))}
            >
              {mode === "zoom" ? <MagnifyingGlassMinus size={15} aria-hidden /> : <ArrowsOutSimple size={15} aria-hidden />}
              {mode === "zoom" ? "Zoom out" : "Zoom"}
            </button>
          ) : null}
          {canSpin ? (
            <button
              type="button"
              className={`flex h-10 items-center gap-2 border px-3 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors ${mode === "spin" ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink"}`}
              aria-pressed={mode === "spin"}
              onClick={() => setMode((current) => (current === "spin" ? "still" : "spin"))}
            >
              <span className="mono text-[12px] tracking-normal">360°</span>
              {mode === "spin" ? "Done" : "Turn it"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** A turntable built from real views. Neighbouring views cross over as the piece turns. */
function Spin({ frames, title }: { frames: string[]; title: string }) {
  const count = frames.length;
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const velocity = useRef(0);
  const drag = useRef<{ x: number; angle: number; t: number } | null>(null);
  const frame = useRef(0);

  function settle() {
    cancelAnimationFrame(frame.current);
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      velocity.current *= Math.exp(-4 * dt);
      let next = angleRef.current + velocity.current * dt;
      if (Math.abs(velocity.current) < 0.6) {
        const target = Math.round(next);
        next += (target - next) * Math.min(1, dt * 9);
        if (Math.abs(target - next) < 0.002) next = target;
      }
      angleRef.current = next;
      setAngle(next);
      if (Math.abs(velocity.current) > 0.01 || Math.abs(Math.round(next) - next) > 0.001) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }

  function turnTo(target: number) {
    velocity.current = 0;
    angleRef.current = target;
    settle();
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const wrapped = ((angle % count) + count) % count;
  const from = Math.floor(wrapped) % count;
  const to = (from + 1) % count;
  const t = wrapped - Math.floor(wrapped);
  const blend = t * t * (3 - 2 * t);
  const snapped = ((Math.round(angle) % count) + count) % count;
  const degrees = Math.round((snapped / count) * 360) % 360;

  return (
    <div
      tabIndex={0}
      role="slider"
      aria-label={`Turn ${title}`}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={degrees}
      aria-valuetext={`View ${snapped + 1} of ${count}, ${degrees} degrees`}
      className="absolute inset-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--color-ink)]"
      onPointerDown={(event) => {
        cancelAnimationFrame(frame.current);
        velocity.current = 0;
        drag.current = { x: event.clientX, angle: angleRef.current, t: performance.now() };
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {}
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start) return;
        const next = start.angle - (event.clientX - start.x) / FRAME_PX;
        const now = performance.now();
        const dt = Math.max(0.008, (now - start.t) / 1000);
        velocity.current = (next - angleRef.current) / dt;
        drag.current = { ...start, t: now };
        angleRef.current = next;
        setAngle(next);
      }}
      onPointerUp={() => {
        drag.current = null;
        settle();
      }}
      onPointerCancel={() => {
        drag.current = null;
        settle();
      }}
      onKeyDown={(event) => {
        const base = Math.round(angleRef.current);
        if (event.key === "ArrowRight" || event.key === "ArrowUp") turnTo(base + 1);
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") turnTo(base - 1);
        else if (event.key === "Home") turnTo(base - snapped);
        else if (event.key === "End") turnTo(base - snapped + count - 1);
        else return;
        event.preventDefault();
      }}
    >
      {frames.map((src, index) => {
        const opacity = index === from ? 1 - blend : index === to ? blend : 0;
        return (
          <div key={src} className="absolute inset-[7%]" style={{ opacity }}>
            <Image src={src} alt="" fill quality={92} sizes="(max-width: 1024px) 92vw, 640px" className="pointer-events-none object-contain [filter:drop-shadow(0_26px_22px_rgba(39,31,23,0.2))]" draggable={false} />
          </div>
        );
      })}
      <div aria-hidden className="absolute top-3 right-3 h-9 w-9 rounded-full border border-line bg-paper/80">
        <span
          className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-ink"
          style={{ transform: `translate(-50%, -50%) rotate(${(wrapped / count) * 360}deg) translateY(-12px)` }}
        />
      </div>
    </div>
  );
}
