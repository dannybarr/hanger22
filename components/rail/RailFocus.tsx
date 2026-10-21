"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Garment } from "@/components/rail/garments";
import { ShoulderWire } from "@/components/rail/ShoulderWire";
import { EASE } from "@/lib/motion";
import { formatRange } from "@/lib/money";
import { cutLabel, marketNote } from "@/lib/cut";
import { AvailabilityBadge } from "@/components/piece/AvailabilityBadge";
import type { PublicItem } from "@/lib/schema";
import { PLACEHOLDER_NOTE } from "@/lib/site";

type Box = { left: number; top: number; width: number; height: number };

function targetBox(): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const height = vh * 0.48;
  const width = Math.min(vw * 0.3, height * 0.9);
  return {
    left: (vw - width) / 2,
    top: vh * 0.15,
    width,
    height,
  };
}

export function RailFocus({
  items,
  index,
  origin,
  vault,
  onClose,
  onIndex,
  onRequest,
}: {
  items: PublicItem[];
  index: number;
  origin: Box;
  vault: boolean;
  onClose: () => void;
  onIndex: (index: number) => void;
  onRequest: (item: PublicItem) => void;
}) {
  const item = items[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const indexRef = useRef(index);
  const itemsRef = useRef(items);
  indexRef.current = index;
  itemsRef.current = items;
  const [closing, setClosing] = useState(false);
  const [back, setBack] = useState<Box>(origin);
  const [target, setTarget] = useState<Box>(origin);
  const [dir, setDir] = useState(0);
  const total = items.length;

  function step(delta: number) {
    const list = itemsRef.current;
    const current = indexRef.current;
    setDir(delta);
    onIndex((current + delta + list.length) % list.length);
  }

  function beginClose() {
    const current = itemsRef.current[indexRef.current];
    const el = current ? document.getElementById(`rail-btn-${current.id}`) : null;
    if (el) {
      const rect = el.getBoundingClientRect();
      setBack({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    }
    if (el) opener.current = el;
    setClosing(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      onClose();
      (el ?? opener.current)?.focus();
    }, reduced ? 0 : 520);
  }

  useEffect(() => {
    opener.current = document.getElementById(`rail-btn-${itemsRef.current[indexRef.current]?.id ?? ""}`);
    setTarget(targetBox());
    const node = dialogRef.current;
    node?.focus();
    const root = document.documentElement;
    const previousHtml = root.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousScroll = window.scrollY;
    const lenis = window.__hangerLenis;
    lenis?.stop();
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    function blockScroll(event: Event) {
      event.preventDefault();
    }
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        beginClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusable = [...root.querySelectorAll<HTMLElement>("button, a[href]")];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      root.style.overflow = previousHtml;
      document.body.style.overflow = previousOverflow;
      window.__hangerLenis?.start();
      window.scrollTo(0, previousScroll);
    };
    // Key handlers read refs so the listener can stay put for the life of the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPointerDown(event: React.PointerEvent) {
    const startX = event.clientX;
    const startY = event.clientY;
    function move(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
        cleanup();
        step(dx < 0 ? 1 : -1);
      } else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        cleanup();
        beginClose();
      }
    }
    function cleanup() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup);
  }

  const box = closing ? back : target;
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  if (!item) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
      tabIndex={-1}
      className="fixed inset-0 z-[80] h-dvh w-screen overflow-hidden bg-paper outline-none"
    >
      <button type="button" className="nav-link absolute top-[3.6vh] right-[4vw] z-10" onClick={beginClose}>
        Close
      </button>
      <p className="sr-only">Left and right arrows move between pieces. Escape closes.</p>
      <motion.div
        className="fixed z-10"
        initial={{ left: origin.left, top: origin.top, width: origin.width, height: origin.height }}
        animate={{ left: box.left, top: box.top, width: box.width, height: box.height }}
        transition={{ duration: 0.5, ease: EASE }}
        onPointerDown={onPointerDown}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={item.id}
            className="absolute inset-0"
            initial={{ x: dir * 80, opacity: dir === 0 ? 1 : 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -80, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="relative h-full w-full">
              <ShoulderWire src={item.images.imageStatus === "cutout" ? item.images.front : undefined} gold={vault} />
              <div className="relative z-[1] h-full w-full">
                <Garment
                  art={item.art}
                  pose="front"
                  uid={`${item.id}-focus`}
                  priority
                  align="top"
                  src={item.images.imageStatus === "cutout" ? item.images.front : undefined}
                  label={item.images.imageStatus === "placeholder" ? item.shortTitle : undefined}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <button
        type="button"
        aria-label="Previous piece"
        className="absolute top-[42%] left-[7vw] z-20 grid h-7 w-7 place-items-center text-[22px] leading-none text-ink"
        onClick={() => step(-1)}
      >
        <span aria-hidden className="text-[18px] leading-none">‹</span>
      </button>
      <button
        type="button"
        aria-label="Next piece"
        className="absolute top-[42%] right-[7vw] z-20 grid h-7 w-7 place-items-center text-[22px] leading-none text-ink"
        onClick={() => step(1)}
      >
        <span aria-hidden className="text-[18px] leading-none">›</span>
      </button>

      <div className="absolute inset-x-0 top-[83.5vh] z-20 flex flex-col items-center gap-1 px-6 text-center">
        <p data-testid="counter" className="font-mono text-[11px] leading-none tracking-[0.14em] text-ink tabular-nums">
          {counter}
        </p>
        <h2 id="focus-title" className="display text-[22px] leading-none text-ink">
          {item.shortTitle}
        </h2>
        <p className="sr-only">{cutLabel(item.cutReason)}. {marketNote(item.sourceMarket)}</p>
        <AvailabilityBadge availability={item.availability} />
        {item.images.placeholder ? (
          <p className="text-[11px] tracking-[0.04em] text-muted">{PLACEHOLDER_NOTE}</p>
        ) : null}
        <button type="button" className="pill-btn" onClick={() => onRequest(item)}>
          Request this piece
        </button>
        <a href={`/p/${item.slug}`} className="sr-only">
          View details
        </a>
        <p className="sr-only">{formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)}</p>
      </div>

      <div
        data-testid="drag-handle"
        className="absolute bottom-4 left-1/2 z-20 h-1 w-10 -translate-x-1/2 rounded-full bg-[#bdbdbd]"
        onPointerDown={onPointerDown}
      />
    </div>,
    document.body,
  );
}
