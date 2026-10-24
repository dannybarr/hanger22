"use client";

import { ArrowsOutSimple, MagnifyingGlassMinus } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type StageImage = { src: string; alt: string; width: number; height: number };

const FRAME_PX = 140; // drag distance that turns the piece by one view

/**
 * The piece in full focus on its own tile. Tap or click to look closer, and the
 * zoom follows your hand. When we have cut-outs from around the piece, the 360
 * toggle lets you turn it by dragging.
 */
export function ProductStage({ front, spin, title }: { front: StageImage; spin: string[]; title: string }) {
  const reduced = useReducedMotion();
  const canSpin = spin.length >= 2;
  const [mode, setMode] = useState<"still" | "zoom" | "spin">("still");
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const tileRef = useRef<HTMLDivElement>(null);

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
        className={`tile relative aspect-[4/5] touch-pan-y overflow-hidden select-none ${mode === "zoom" ? "cursor-zoom-out" : mode === "spin" ? "cursor-ew-resize" : "cursor-zoom-in"}`}
        onClick={(event) => {
          if (mode === "spin") return;
          pointAt(event.clientX, event.clientY);
          setMode((current) => (current === "zoom" ? "still" : "zoom"));
        }}
        onPointerMove={(event) => {
          if (mode === "zoom") pointAt(event.clientX, event.clientY);
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-[18%] bottom-[7%] h-[5%] rounded-[50%] bg-[rgba(39,31,23,0.16)] blur-[18px]" />
        {mode === "spin" ? (
          <Spin frames={spin} title={title} reduced={Boolean(reduced)} />
        ) : (
          <motion.div
            className="absolute inset-[6%]"
            initial={reduced ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 0.8, 0.22, 1] }}
          >
            <div
              className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,0.8,0.22,1)]"
              style={{ transform: mode === "zoom" ? "scale(2.2)" : "scale(1)", transformOrigin: `${origin.x}% ${origin.y}%` }}
            >
              <Image src={front.src} alt={front.alt} fill quality={92} priority sizes="(max-width: 1024px) 92vw, 640px" className="object-contain" />
            </div>
          </motion.div>
        )}

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="flex h-10 items-center gap-2 border border-line bg-paper/85 px-3 text-[11px] font-medium tracking-[0.12em] text-ink uppercase backdrop-blur-sm transition-colors hover:border-ink"
            aria-pressed={mode === "zoom"}
            onClick={() => setMode((current) => (current === "zoom" ? "still" : "zoom"))}
          >
            {mode === "zoom" ? <MagnifyingGlassMinus size={15} aria-hidden /> : <ArrowsOutSimple size={15} aria-hidden />}
            {mode === "zoom" ? "Zoom out" : "Zoom"}
          </button>
          {canSpin ? (
            <button
              type="button"
              className={`flex h-10 items-center gap-2 border px-3 text-[11px] font-medium tracking-[0.12em] uppercase backdrop-blur-sm transition-colors ${mode === "spin" ? "border-ink bg-ink text-paper" : "border-line bg-paper/85 text-ink hover:border-ink"}`}
              aria-pressed={mode === "spin"}
              onClick={() => setMode((current) => (current === "spin" ? "still" : "spin"))}
            >
              <span className="mono text-[12px] tracking-normal">360°</span>
              {mode === "spin" ? "Done" : "Turn it"}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted">
        {mode === "spin" ? "Drag to turn the piece. Arrow keys work too." : "Tap the piece to look closer."}
      </p>
    </div>
  );
}

/** A turntable built from real views. Neighbouring views cross over as the piece turns. */
function Spin({ frames, title, reduced }: { frames: string[]; title: string; reduced: boolean }) {
  const count = frames.length;
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const velocity = useRef(0);
  const drag = useRef<{ x: number; angle: number; t: number } | null>(null);
  const frame = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    stageRef.current?.focus({ preventScroll: true });
    if (reduced) return;
    // One gentle quarter turn and back, so it is clear the piece can move.
    velocity.current = 2.4;
    settle();
    const back = window.setTimeout(() => {
      velocity.current = -2.4;
      settle();
    }, 650);
    return () => {
      window.clearTimeout(back);
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapped = ((angle % count) + count) % count;
  const from = Math.floor(wrapped) % count;
  const to = (from + 1) % count;
  const t = wrapped - Math.floor(wrapped);
  const blend = t * t * (3 - 2 * t);
  const squash = 1 - 0.16 * Math.sin(Math.PI * t);

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="slider"
      aria-label={`Turn ${title}`}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round((wrapped / count) * 360) % 360}
      aria-valuetext={`${Math.round((wrapped / count) * 360) % 360} degrees`}
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
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        velocity.current = 0;
        angleRef.current = Math.round(angleRef.current) + (event.key === "ArrowRight" ? 1 : -1);
        settle();
      }}
    >
      {frames.map((src, index) => {
        const opacity = index === from ? 1 - blend : index === to ? blend : 0;
        // Every view stays mounted so all are loaded before the first turn.
        return (
          <div key={src} className="absolute inset-[6%]" style={{ opacity, transform: `scaleX(${squash.toFixed(4)})` }}>
            <Image src={src} alt="" fill quality={92} priority sizes="(max-width: 1024px) 92vw, 640px" className="pointer-events-none object-contain" draggable={false} />
          </div>
        );
      })}
      <div aria-hidden className="absolute top-3 right-3 h-9 w-9 rounded-full border border-line bg-paper/80">
        <span
          className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
          style={{ transform: `translate(-50%, -50%) rotate(${(wrapped / count) * 360}deg) translateY(-12px)` }}
        />
      </div>
    </div>
  );
}
