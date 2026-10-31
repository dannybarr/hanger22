"use client";

import { ArrowsOutSimple, MagnifyingGlassMinus } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type StageImage = { src: string; alt: string; width: number; height: number };

const FRAME_PX = 180; // drag distance on the image that turns the piece from one view to the next

/**
 * The piece in full focus on its own tile. Tap or click to look closer; the zoom
 * follows your pointer or finger. When the piece has a second real view, it can
 * be turned horizontally: drag the image, or on desktop use the 360 dragger
 * beneath it. Views run front, sides and back, in order. Never an invented side.
 */
export function ProductStage({ front, spin, title }: { front: StageImage; spin: string[]; title: string }) {
  const views = [front.src, ...spin.filter((src) => src !== front.src)];
  const canSpin = views.length >= 2;
  const turn = useTurntable(views.length);
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
          <Spin frames={views} title={title} turn={turn} />
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
            {views.map((src) => (
              <Image key={src} src={src} alt="" fill quality={92} sizes="(max-width: 1024px) 92vw, 640px" className="object-contain" />
            ))}
          </div>
        ) : null}
      </div>

      {canSpin ? (
        <Dragger
          title={title}
          count={views.length}
          turn={turn}
          onStart={() => {
            if (mode !== "spin") setMode("spin");
          }}
        />
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted" aria-live="polite">
          {mode === "spin" ? "Drag the piece or the dial to turn it." : mode === "zoom" ? "Move to look around. Tap to zoom out." : "Tap the piece to look closer."}
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
              className={`flex h-10 items-center gap-2 border px-3 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors sm:hidden ${mode === "spin" ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink"}`}
              aria-pressed={mode === "spin"}
              onClick={() => setMode((current) => (current === "spin" ? "still" : "spin"))}
            >
              <span className="mono text-[12px] tracking-normal">360°</span>
              {mode === "spin" ? "Done" : "Turn it"}
            </button>
          ) : null}
          {mode === "spin" ? (
            <button
              type="button"
              className="hidden h-10 items-center border border-line px-3 text-[11px] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:border-ink sm:flex"
              onClick={() => {
                turn.turnTo(0);
                setMode("still");
              }}
            >
              Back to front
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type Turntable = ReturnType<typeof useTurntable>;

/** One angle shared by the image drag and the dragger. Units are views: 1 = the next view. */
function useTurntable(count: number) {
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const velocity = useRef(0);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /** Let any momentum run out, then come to rest on the nearest real view. */
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

  /** Follow a hand exactly, with no easing. */
  function jump(next: number, nextVelocity = 0) {
    cancelAnimationFrame(frame.current);
    velocity.current = nextVelocity;
    angleRef.current = next;
    setAngle(next);
  }

  function turnTo(target: number) {
    velocity.current = 0;
    angleRef.current = target;
    settle();
  }

  const wrapped = ((angle % count) + count) % count;
  return { angle, angleRef, velocity, wrapped, degrees: (wrapped / count) * 360, settle, jump, turnTo, count };
}

/**
 * Desktop 360 control beneath the image: drag the handle along the dial to turn
 * the piece through a full circle. Marks show where each real view sits.
 */
function Dragger({ title, count, turn, onStart }: { title: string; count: number; turn: Turntable; onStart: () => void }) {
  const value = Math.round(turn.degrees) % 360;
  return (
    <div className="mt-4 hidden items-center gap-4 sm:flex">
      <span className="mono shrink-0 text-[12px] text-ink">360°</span>
      <div className="relative flex-1">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-[9px]">
          {Array.from({ length: count + 1 }, (_, index) => (
            <span key={index} className="h-2.5 w-px bg-[var(--color-muted)] opacity-60" />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={value}
          aria-label={`Turn ${title} through 360 degrees`}
          aria-valuetext={`${value} degrees`}
          className="turn-range relative w-full"
          onPointerDown={onStart}
          onKeyDown={onStart}
          onChange={(event) => {
            onStart();
            const degrees = Number(event.target.value);
            const target = (degrees / 360) * count;
            // Keep the turn continuous across laps rather than snapping back.
            const lap = Math.round((turn.angleRef.current - target) / count) * count;
            turn.jump(target + lap);
          }}
          onPointerUp={() => turn.settle()}
          onKeyUp={() => turn.settle()}
          onBlur={() => turn.settle()}
        />
      </div>
      <span className="mono w-11 shrink-0 text-right text-[12px] text-muted">{value}°</span>
    </div>
  );
}

/**
 * A horizontal turntable built from real views. As you drag, the piece turns
 * edge on, darkening slightly as it leaves the light, and the next view turns in.
 */
function Spin({ frames, title, turn }: { frames: string[]; title: string; turn: Turntable }) {
  const count = frames.length;
  const drag = useRef<{ x: number; angle: number; t: number } | null>(null);
  const wrapped = turn.wrapped;
  const from = Math.floor(wrapped) % count;
  const to = (from + 1) % count;
  const t = wrapped - Math.floor(wrapped);
  const snapped = ((Math.round(turn.angle) % count) + count) % count;
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
        drag.current = { x: event.clientX, angle: turn.angleRef.current, t: performance.now() };
        turn.jump(turn.angleRef.current);
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
        drag.current = { ...start, t: now };
        turn.jump(next, (next - turn.angleRef.current) / dt);
      }}
      onPointerUp={() => {
        drag.current = null;
        turn.settle();
      }}
      onPointerCancel={() => {
        drag.current = null;
        turn.settle();
      }}
      onKeyDown={(event) => {
        const base = Math.round(turn.angleRef.current);
        if (event.key === "ArrowRight" || event.key === "ArrowUp") turn.turnTo(base + 1);
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") turn.turnTo(base - 1);
        else if (event.key === "Home") turn.turnTo(base - snapped);
        else if (event.key === "End") turn.turnTo(base - snapped + count - 1);
        else return;
        event.preventDefault();
      }}
    >
      <div className="absolute inset-[7%] [perspective:1600px]">
        {frames.map((src, index) => {
          // First half of a step: the current view turns away to edge on.
          // Second half: the next view turns in from the other edge.
          const showing = t < 0.5 ? index === from : index === to;
          const angle = t < 0.5 ? t * 180 : (t - 1) * 180;
          const edge = Math.abs(Math.sin((angle * Math.PI) / 180));
          return (
            <div
              key={src}
              className="absolute inset-0 [backface-visibility:hidden] [transform-style:preserve-3d]"
              style={{
                visibility: showing ? "visible" : "hidden",
                transform: `rotateY(${angle.toFixed(2)}deg)`,
                filter: `brightness(${(1 - edge * 0.22).toFixed(3)})`,
              }}
            >
              <Image src={src} alt="" fill quality={92} sizes="(max-width: 1024px) 92vw, 640px" className="pointer-events-none object-contain [filter:drop-shadow(0_26px_22px_rgba(39,31,23,0.2))]" draggable={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
