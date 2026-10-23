"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import fitJson from "@/data/fit.json";
import { formatGBP, priceOf } from "@/lib/money";
import { hangLength } from "@/lib/motion";
import { motorHum, playClink } from "@/lib/sound";
import type { PublicItem } from "@/lib/schema";

/**
 * A dry-cleaner's conveyor. The rail only moves when something drives it:
 * the motor (hold, arrows, or a tap on a piece), or a hand dragging it.
 * Every swing comes from the rail's acceleration or a cursor brushing past,
 * so nothing moves without a cause.
 */

type Fit = { box: number[]; collar: number[]; pivot: number[] | null; px: number[] };
const FIT = fitJson as Record<string, Fit>;

const G = 2400; // px/s², gravity at screen scale
const DAMP = 1.7; // per second
const AIR = 0.00045; // lean while the rail runs at speed
const V_MAX = 680; // px/s
const ACCEL = 650; // motor pull-away, px/s²
const BRAKE = 520; // motor brake, px/s²
const SWING_CAP = 0.42; // radians. A garment never swings off its hook.
const TICKET_LEN = 38;

type Piece = {
  item: PublicItem;
  fit: Fit;
  garmentH: number;
  imgW: number;
  imgH: number;
  width: number;
  hookLen: number;
  ownHook: boolean;
  pendulum: number;
  base: number;
  /** Bottom displacement angle, positive to the right. */
  phi: number;
  omega: number;
  ticket: number;
  ticketOmega: number;
  lastBrush: number;
};

type Layout = { width: number; height: number; railY: number; loop: number; hatch: number };

type Mode =
  | { kind: "idle" }
  | { kind: "motor"; dir: 1 | -1 }
  | { kind: "seek"; target: number }
  | { kind: "drag"; pointerX: number; startOffset: number; startX: number };

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function fitFor(item: PublicItem): Fit {
  return (
    FIT[item.images.front] ?? {
      box: [0.1, 0.06, 0.9, 0.94],
      collar: [0.5, 0.08],
      pivot: null,
      px: [item.images.pixelWidth ?? 1024, item.images.pixelHeight ?? 1024],
    }
  );
}

export function Conveyor({
  items,
  gold,
  sound,
  reduced,
}: {
  items: PublicItem[];
  gold: boolean;
  sound: boolean;
  reduced: boolean;
}) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const piecesRef = useRef<Piece[]>([]);
  const layoutRef = useRef<Layout>({ width: 0, height: 0, railY: 0, loop: 1, hatch: 0 });
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const modeRef = useRef<Mode>({ kind: "idle" });
  const liftRef = useRef<{ index: number; start: number; href: string } | null>(null);
  const soundRef = useRef(sound);
  const reducedRef = useRef(reduced);
  const holdTimer = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [centre, setCentre] = useState(0);
  const [moving, setMoving] = useState(false);
  const [lifting, setLifting] = useState<number | null>(null);
  const [hint, setHint] = useState(false);

  soundRef.current = sound;
  reducedRef.current = reduced;

  useEffect(() => {
    if (!sound) motorHum(0);
  }, [sound]);

  useEffect(() => {
    items.forEach((item) => router.prefetch(`/p/${item.slug}`));
  }, [items, router]);

  /** Size every piece from the stage, then space them along a loop longer than the screen. */
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const railY = Math.round(Math.min(110, Math.max(44, height * 0.08)));
    const baseH = Math.max(220, height - railY - Math.max(28, height * 0.06));
    const previous = piecesRef.current;

    const pieces: Piece[] = items.map((item, index) => {
      const fit = fitFor(item);
      const [bx0, by0, bx1, by1] = fit.box;
      const [pw, ph] = fit.px;
      const aspect = ((bx1 - bx0) * pw) / ((by1 - by0) * ph);
      const variation = 0.9 + ((hangLength(item.id) - 0.74) / 0.26) * 0.1;
      let garmentH = baseH * 0.9 * variation;
      const widthCap = width < 640 ? 0.8 : 0.72;
      if (garmentH * aspect > width * widthCap) garmentH = (width * widthCap) / aspect;
      const imgH = garmentH / (by1 - by0);
      const imgW = imgH * (pw / ph);
      const ownHook = Boolean(fit.pivot);
      const hookLen = ownHook ? 0 : Math.max(22, Math.round(garmentH * 0.075));
      const prior = previous[index];
      return {
        item,
        fit,
        garmentH,
        imgW,
        imgH,
        width: garmentH * aspect,
        hookLen,
        ownHook,
        pendulum: hookLen + garmentH * 0.46,
        base: 0,
        phi: prior?.phi ?? 0,
        omega: prior?.omega ?? 0,
        ticket: prior?.ticket ?? 0,
        ticketOmega: prior?.ticketOmega ?? 0,
        lastBrush: 0,
      };
    });

    const widest = Math.max(...pieces.map((piece) => piece.width));
    const gap = Math.max(28, width * 0.035);
    let cursor = 0;
    pieces.forEach((piece, index) => {
      if (index > 0) cursor += pieces[index - 1]!.width / 2 + gap + piece.width / 2;
      piece.base = cursor;
    });
    const natural = cursor + pieces[pieces.length - 1]!.width / 2 + gap + pieces[0]!.width / 2;
    const needed = width + widest * 1.35;
    const loop = Math.max(natural, needed);
    if (loop > natural) {
      const extra = (loop - natural) / pieces.length;
      pieces.forEach((piece, index) => {
        piece.base += extra * index;
      });
    }

    piecesRef.current = pieces;
    const next = { width, height, railY, loop, hatch: Math.round(Math.min(72, Math.max(20, width * 0.04))) };
    layoutRef.current = next;
    setLayout(next);
  }, [items]);

  useEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(stage);
    return () => observer.disconnect();
  }, [measure]);

  /** Offset at which a piece sits in the centre, chosen nearest to `near` on the loop. */
  const alignment = useCallback((index: number, near: number) => {
    const piece = piecesRef.current[index];
    const { loop } = layoutRef.current;
    if (!piece) return near;
    const k = Math.round((near - piece.base) / loop);
    return piece.base + k * loop;
  }, []);

  /** The piece the rail would stop on if it braked from `projected`, travelling in `dir`. */
  const stopFor = useCallback(
    (projected: number, dir: number) => {
      const pieces = piecesRef.current;
      let best = projected;
      let bestDistance = Number.POSITIVE_INFINITY;
      pieces.forEach((_, index) => {
        const candidate = alignment(index, projected);
        for (const value of [candidate, candidate + layoutRef.current.loop, candidate - layoutRef.current.loop]) {
          const ahead = (value - projected) * (dir || 1);
          const distance = dir === 0 ? Math.abs(value - projected) : ahead >= -2 ? ahead : Number.POSITIVE_INFINITY;
          if (distance < bestDistance) {
            bestDistance = distance;
            best = value;
          }
        }
      });
      return best;
    },
    [alignment],
  );

  const seek = useCallback((target: number) => {
    if (reducedRef.current) {
      offsetRef.current = target;
      velocityRef.current = 0;
      modeRef.current = { kind: "idle" };
      return;
    }
    modeRef.current = { kind: "seek", target };
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const current = modeRef.current.kind === "seek" ? modeRef.current.target : offsetRef.current;
      seek(stopFor(current + dir * 4, dir));
    },
    [seek, stopFor],
  );

  const release = useCallback(() => {
    const mode = modeRef.current;
    if (mode.kind !== "motor" && mode.kind !== "drag") return;
    const v = velocityRef.current;
    const projected = offsetRef.current + (v * Math.abs(v)) / (2 * BRAKE);
    seek(stopFor(projected, Math.abs(v) < 30 ? 0 : (Math.sign(v) as 1 | -1)));
  }, [seek, stopFor]);

  const open = useCallback(
    (index: number) => {
      const piece = piecesRef.current[index];
      if (!piece) return;
      const href = `/p/${piece.item.slug}`;
      if (reducedRef.current) {
        router.push(href);
        return;
      }
      liftRef.current = { index, start: performance.now(), href };
      setLifting(index);
    },
    [router],
  );

  /** The single animation loop: drive the rail, swing the pieces, draw. */
  useEffect(() => {
    if (!layout) return;
    let frame = 0;
    let last = performance.now();
    let lastVelocity = velocityRef.current;
    let lastCentre = -1;
    let wasMoving = false;

    const tick = (now: number) => {
      const elapsed = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { width, railY, loop } = layoutRef.current;
      const pieces = piecesRef.current;
      const mode = modeRef.current;
      let v = velocityRef.current;

      if (mode.kind === "motor") {
        v += mode.dir * ACCEL * elapsed;
        if (Math.abs(v) > V_MAX) v = mode.dir * V_MAX;
        offsetRef.current += v * elapsed;
      } else if (mode.kind === "seek") {
        const remaining = mode.target - offsetRef.current;
        const dir = Math.sign(remaining);
        const cap = Math.sqrt(2 * BRAKE * Math.abs(remaining));
        const speed = Math.min(Math.abs(v) * (Math.sign(v) === dir ? 1 : 0) + ACCEL * elapsed, V_MAX, cap);
        v = dir * speed;
        offsetRef.current += v * elapsed;
        if (Math.abs(mode.target - offsetRef.current) < 0.6 || Math.sign(mode.target - offsetRef.current) !== dir) {
          offsetRef.current = mode.target;
          v = 0;
          modeRef.current = { kind: "idle" };
          if (soundRef.current && wasMoving) playClink();
        }
      } else if (mode.kind === "drag") {
        // A held hand that stops moving stops the rail.
        v *= Math.exp(-10 * elapsed);
      } else {
        v = 0;
      }

      const railAccel = elapsed > 0 ? (v - lastVelocity) / elapsed : 0;
      lastVelocity = v;
      velocityRef.current = v;
      // Pieces travel opposite to the offset.
      const pieceAccel = -railAccel;
      const pieceVelocity = -v;

      const isMoving = Math.abs(v) > 1;
      if (isMoving !== wasMoving) {
        setMoving(isMoving);
        wasMoving = isMoving;
      }
      if (soundRef.current) motorHum(Math.abs(v) / V_MAX);

      const lift = liftRef.current;
      const liftT = lift ? Math.min(1, (now - lift.start) / 420) : 0;
      if (lift && liftT >= 1) {
        liftRef.current = null;
        router.push(lift.href);
      }

      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      const substeps = 3;
      const dt = elapsed / substeps;

      pieces.forEach((piece, index) => {
        const x = mod(piece.base - offsetRef.current + loop / 2, loop) - loop / 2 + width / 2;
        const distance = Math.abs(x - width / 2);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }

        if (!reducedRef.current) {
          const air = AIR * pieceVelocity * Math.abs(pieceVelocity);
          const drive = pieceAccel + air;
          const tieArm = piece.hookLen * 0.7 + 6;
          for (let s = 0; s < substeps; s += 1) {
            const alpha = (-G * Math.sin(piece.phi) - drive * Math.cos(piece.phi)) / piece.pendulum - DAMP * piece.omega;
            piece.omega += alpha * dt;
            piece.phi += piece.omega * dt;
            if (Math.abs(piece.phi) > SWING_CAP) {
              piece.phi = Math.sign(piece.phi) * SWING_CAP;
              piece.omega *= -0.3;
            }
            const tieAccel = drive + tieArm * alpha;
            const ticketAlpha = (-G * Math.sin(piece.ticket) - tieAccel * Math.cos(piece.ticket)) / TICKET_LEN - 2.2 * piece.ticketOmega;
            piece.ticketOmega += ticketAlpha * dt;
            piece.ticket += piece.ticketOmega * dt;
            piece.ticket = Math.max(-0.9, Math.min(0.9, piece.ticket));
          }
        } else {
          piece.phi = 0;
          piece.ticket = 0;
        }

        const group = groupRefs.current[index];
        if (group) {
          const lifted = lift && lift.index === index ? 1 - Math.pow(1 - liftT, 3) : 0;
          const rise = lifted * -Math.max(28, railY * 0.6);
          const angle = (-piece.phi * (1 - lifted) * 180) / Math.PI;
          group.style.transform = `translate3d(${x.toFixed(2)}px, ${(railY + rise).toFixed(2)}px, 0) rotate(${angle.toFixed(3)}deg) scale(${(1 + lifted * 0.04).toFixed(4)})`;
        }
        const ticket = ticketRefs.current[index];
        if (ticket) {
          const relative = ((-(piece.ticket - piece.phi)) * 180) / Math.PI;
          ticket.style.transform = `rotate(${relative.toFixed(3)}deg)`;
        }
      });

      if (nearest !== lastCentre && nearestDistance < width * 0.25) {
        lastCentre = nearest;
        setCentre(nearest);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      motorHum(0);
    };
  }, [layout, router]);

  /** The delivery: the rail starts with every piece behind the right-hand hatch and runs them in. */
  const introDone = useRef(false);
  const hasLayout = layout != null;
  useEffect(() => {
    if (!hasLayout || introDone.current) return;
    const target = alignment(0, 0);
    if (reducedRef.current) {
      introDone.current = true;
      offsetRef.current = target;
      setHint(true);
      return;
    }
    offsetRef.current = target - layoutRef.current.width * 0.95 - layoutRef.current.hatch;
    const start = window.setTimeout(() => {
      introDone.current = true;
      seek(target);
    }, 380);
    const hintTimer = window.setTimeout(() => setHint(true), 2800);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(hintTimer);
    };
  }, [hasLayout, alignment, seek]);

  function startMotor(dir: 1 | -1) {
    if (reducedRef.current) {
      step(dir);
      return;
    }
    modeRef.current = { kind: "motor", dir };
  }

  function clearHold() {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }

  function onStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || liftRef.current) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-control]")) return;
    pointerRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    const startX = event.clientX;
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      if (modeRef.current.kind !== "drag") startMotor(1);
    }, 220);
    modeRef.current =
      modeRef.current.kind === "seek" || modeRef.current.kind === "idle"
        ? { kind: "drag", pointerX: startX, startOffset: offsetRef.current, startX }
        : modeRef.current;
    if (modeRef.current.kind === "drag") velocityRef.current = 0;
    capture(event);
  }

  function onStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const mode = modeRef.current;
    const previous = pointerRef.current;
    const now = performance.now();

    if (mode.kind === "drag" && previous) {
      const moved = Math.abs(event.clientX - mode.startX);
      if (moved > 6) clearHold();
      const nextOffset = mode.startOffset - (event.clientX - mode.startX);
      const dtMs = Math.max(8, now - previous.t);
      const v = ((offsetRef.current - nextOffset) / dtMs) * -1000;
      velocityRef.current = velocityRef.current * 0.6 + v * 0.4;
      offsetRef.current = nextOffset;
    } else if (event.pointerType === "mouse" && previous && !reducedRef.current) {
      brush(event, previous, now);
    }
    pointerRef.current = { x: event.clientX, y: event.clientY, t: now };
  }

  /** A hand passing through the rail nudges whatever it touches. */
  function brush(event: React.PointerEvent<HTMLDivElement>, previous: { x: number; y: number; t: number }, now: number) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const vx = (event.clientX - previous.x) / Math.max(8, now - previous.t);
    if (Math.abs(vx) < 0.35) return;
    const { width, railY, loop } = layoutRef.current;
    piecesRef.current.forEach((piece) => {
      const x = mod(piece.base - offsetRef.current + loop / 2, loop) - loop / 2 + width / 2;
      const top = railY + piece.hookLen;
      if (Math.abs(px - x) > piece.width / 2 || py < top || py > top + piece.garmentH) return;
      if (now - piece.lastBrush < 260) return;
      piece.lastBrush = now;
      const reach = (py - railY) / piece.pendulum;
      piece.omega += Math.max(-0.9, Math.min(0.9, vx * 0.42 * Math.min(1.4, reach)));
    });
  }

  function onStagePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    clearHold();
    const mode = modeRef.current;
    if (mode.kind === "drag") {
      const travelled = Math.abs(event.clientX - mode.startX);
      if (travelled < 6) {
        modeRef.current = { kind: "idle" };
        tapAt(event);
        return;
      }
      release();
    } else if (mode.kind === "motor") {
      release();
    }
  }

  /** A tap on a piece brings it to the centre. A tap on the centred piece opens it. */
  function tapAt(event: React.PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const { width, railY, loop } = layoutRef.current;
    let hit = -1;
    let hitDistance = Number.POSITIVE_INFINITY;
    piecesRef.current.forEach((piece, index) => {
      const x = mod(piece.base - offsetRef.current + loop / 2, loop) - loop / 2 + width / 2;
      const top = railY + piece.hookLen;
      if (Math.abs(px - x) > piece.width / 2 || py < railY - 10 || py > top + piece.garmentH) return;
      const d = Math.abs(px - x);
      if (d < hitDistance) {
        hitDistance = d;
        hit = index;
      }
    });
    if (hit < 0) return;
    if (hit === centre && hitDistance < width * 0.25 && Math.abs(velocityRef.current) < 5) {
      open(hit);
      return;
    }
    seek(alignment(hit, offsetRef.current));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  }

  const current = items[centre];
  const total = items.length;
  const pieces = piecesRef.current;
  const rail = gold
    ? "linear-gradient(180deg,#fff6e4 0%,#f0d48a 18%,#c4923e 46%,#ffe9b5 62%,#8c6424 84%,#e7c98a 100%)"
    : "linear-gradient(180deg,#fbfbfa 0%,#d9dad8 26%,#3b3b39 48%,#4a4a47 60%,#c3c4c2 100%)";

  return (
    <div className="relative flex h-full flex-col">
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="The rail. Use the arrow keys to run it."
        tabIndex={0}
        className="relative min-h-0 flex-1 cursor-grab touch-pan-y overflow-hidden outline-none select-none active:cursor-grabbing"
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
        onKeyDown={onKeyDown}
      >
        {layout ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0"
              style={{ top: layout.railY - 4, height: 8, background: rail, boxShadow: "0 10px 14px -8px rgba(39,31,23,0.35)" }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                maskImage: `linear-gradient(90deg, transparent 0, #000 ${layout.hatch * 1.6}px, #000 calc(100% - ${layout.hatch * 1.6}px), transparent 100%)`,
                WebkitMaskImage: `linear-gradient(90deg, transparent 0, #000 ${layout.hatch * 1.6}px, #000 calc(100% - ${layout.hatch * 1.6}px), transparent 100%)`,
              }}
            >
              {pieces.map((piece, index) => {
                const [cx, cy] = piece.fit.pivot ?? piece.fit.collar;
                const left = -cx * piece.imgW;
                const top = piece.ownHook ? -cy * piece.imgH - 3 : piece.hookLen - cy * piece.imgH;
                const dimmed = lifting != null && lifting !== index;
                return (
                  <div
                    key={piece.item.id}
                    ref={(node) => {
                      groupRefs.current[index] = node;
                    }}
                    className="absolute top-0 left-0 will-change-transform"
                    style={{
                      transform: `translate3d(-9999px, ${layout.railY}px, 0)`,
                      transformOrigin: "0 0",
                      opacity: dimmed ? 0.18 : 1,
                      transition: "opacity 320ms ease",
                    }}
                  >
                    {!piece.ownHook ? <Hook length={piece.hookLen} gold={gold} /> : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={piece.item.images.front}
                      alt=""
                      draggable={false}
                      className="absolute max-w-none"
                      style={{
                        left,
                        top,
                        width: piece.imgW,
                        height: piece.imgH,
                        filter: "drop-shadow(12px 22px 16px rgba(39, 31, 23, 0.2))",
                      }}
                      fetchPriority={index < 3 ? "high" : "auto"}
                    />
                    <div
                      ref={(node) => {
                        ticketRefs.current[index] = node;
                      }}
                      className="absolute"
                      style={{ left: 5, top: piece.ownHook ? Math.max(10, piece.imgH * 0.05) : piece.hookLen * 0.62, transformOrigin: "0 0" }}
                    >
                      <Ticket number={index + 1} price={formatGBP(priceOf(piece.item))} gold={gold} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Hatch side="left" layout={layout} />
            <Hatch side="right" layout={layout} />
          </>
        ) : null}

        <ul className="sr-only">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/p/${item.slug}`}>
                {item.brand}, {item.shortTitle}, {formatGBP(priceOf(item))}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div data-control className="relative z-10 border-t border-line bg-paper/80 backdrop-blur-[2px]">
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 py-4 sm:px-8 md:grid-cols-[1fr_auto] md:py-5">
          <div
            className="flex min-w-0 items-end gap-5 transition-opacity duration-300"
            style={{ opacity: moving ? 0.25 : 1 }}
            aria-live="polite"
          >
            <p className="mono shrink-0 pb-1 text-[12px] text-muted">
              {String(centre + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            {current ? (
              <Link href={`/p/${current.slug}`} className="min-w-0">
                <p className="eyebrow truncate">{current.brand}</p>
                <p className="display mt-1 text-[24px] text-ink sm:truncate sm:text-[32px]">{current.shortTitle}</p>
                <p className="mt-1 text-[15px] font-medium text-ink sm:hidden">{formatGBP(priceOf(current))}</p>
              </Link>
            ) : null}
            {current ? (
              <div className="ml-auto hidden shrink-0 items-center gap-6 sm:flex md:ml-8">
                <p className="text-[17px] font-medium text-ink">{formatGBP(priceOf(current))}</p>
                <Link href={`/p/${current.slug}`} className="nav-link">
                  View the piece
                </Link>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2 md:justify-end">
            <button type="button" className="pill-btn w-11 px-0" aria-label="Previous piece" onClick={() => step(-1)}>
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              className="pill-btn flex-1 md:flex-none"
              onPointerDown={(event) => {
                capture(event);
                startMotor(1);
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onKeyDown={(event) => {
                if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                  event.preventDefault();
                  startMotor(1);
                }
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") release();
              }}
              onContextMenu={(event) => event.preventDefault()}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${moving ? "bg-[#b5442c]" : "bg-current opacity-40"}`} aria-hidden />
              Hold to run the rail
            </button>
            <button type="button" className="pill-btn w-11 px-0" aria-label="Next piece" onClick={() => step(1)}>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <p
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-[0.14em] whitespace-nowrap text-muted uppercase transition-opacity duration-700"
          style={{ opacity: hint && !moving ? 1 : 0 }}
          aria-hidden
        >
          Drag the rail, or tap a piece
        </p>
      </div>
    </div>
  );
}

function capture(event: React.PointerEvent<HTMLElement>) {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Synthetic or already-released pointers cannot be captured. The gesture still works.
  }
}

function Hook({ length, gold }: { length: number; gold: boolean }) {
  const light = gold ? "#f3dfa8" : "#f2f3f4";
  const dark = gold ? "#8a6428" : "#6f757d";
  const h = length + 6;
  return (
    <svg
      aria-hidden
      width={30}
      height={h}
      viewBox={`0 0 30 ${h}`}
      className="absolute overflow-visible"
      style={{ left: -15, top: -9 }}
    >
      <defs>
        <linearGradient id={gold ? "hook-gold" : "hook-steel"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.45" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <path
        d={`M15 ${h} L15 13 C15 6 21 3 24 7 C26 10 23 13 20 12`}
        fill="none"
        stroke={`url(#${gold ? "hook-gold" : "hook-steel"})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Ticket({ number, price, gold }: { number: number; price: string; gold: boolean }) {
  return (
    <div className="flex flex-col items-start" aria-hidden>
      <span className="block h-4 w-px bg-[#8b7a62]" />
      <span
        className="mono -mt-px block border border-[#cdb98f] px-1.5 pt-1.5 pb-1 text-[10px] leading-[1.25] text-[#3a2c20] shadow-[0_2px_3px_rgba(39,31,23,0.18)]"
        style={{ background: gold ? "#f3dfa8" : "var(--color-ticket)" }}
      >
        <span className="mx-auto mb-1 block h-1 w-1 rounded-full bg-[#3a2c20]/40" />
        No.{String(number).padStart(2, "0")}
        <br />
        {price}
      </span>
    </div>
  );
}

function Hatch({ side, layout }: { side: "left" | "right"; layout: Layout }) {
  const toward = side === "left" ? "90deg" : "270deg";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0"
      style={{
        [side]: 0,
        top: layout.railY - 26,
        width: layout.hatch,
        background: `linear-gradient(${toward}, rgba(23,19,15,0.30), rgba(23,19,15,0.10) 55%, rgba(23,19,15,0))`,
        borderTop: "1px solid rgba(23,19,15,0.14)",
      }}
    />
  );
}
