"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Marquee } from "@/components/marquee/Marquee";
import { Rail } from "@/components/rail/Rail";
import { RailFocus } from "@/components/rail/RailFocus";
import { RequestSheet } from "@/components/request/RequestSheet";
import { isRailClosed, nightRequested } from "@/lib/night";
import { playClink } from "@/lib/sound";
import { cutLabel } from "@/lib/cut";
import type { PublicItem } from "@/lib/schema";
import { PLACEHOLDER_NOTE } from "@/lib/site";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

type Box = { left: number; top: number; width: number; height: number };

export function HomeHero({ items, vaultItems }: { items: PublicItem[]; vaultItems: PublicItem[] }) {
  const [vault, setVault] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Box | null>(null);
  const [sound, setSound] = useState(false);
  const [night, setNight] = useState(false);
  const [swinging, setSwinging] = useState(false);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [caption, setCaption] = useState<{
    x: number;
    y: number;
    text: string;
    availability: PublicItem["availability"];
    cut: string;
  } | null>(null);
  const [request, setRequest] = useState<PublicItem | null | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);
  const openerId = useRef<string | null>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const shown = useMemo(() => (vault ? [...items, ...vaultItems] : items), [vault, items, vaultItems]);

  useEffect(() => {
    const saved = window.localStorage.getItem("hanger22.sound");
    if (saved === "on") setSound(true);
    setNight(nightRequested(window.location.search) || isRailClosed());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (focusIndex != null) return;
    const id = openerId.current;
    if (!id) return;
    openerId.current = null;
    document.getElementById(`rail-btn-${id}`)?.focus();
  }, [focusIndex]);

  useEffect(() => {
    let progress = 0;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const key = event.key.toLowerCase();
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        setVault(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let frame = 0;
    const started = performance.now();
    const measure = () => {
      const el = document.getElementById(`rail-btn-${activeId}`);
      const cluster = clusterRef.current;
      if (el && cluster) {
        const er = el.getBoundingClientRect();
        const cr = cluster.getBoundingClientRect();
        const piece = shown.find((item) => item.id === activeId);
        setCaption({
          x: er.left - cr.left + er.width / 2,
          y: er.bottom - cr.top + 8,
          text: piece?.shortTitle ?? "",
          availability: piece?.availability ?? "sourced",
          cut: piece ? cutLabel(piece.cutReason) : "",
        });
      }
      if (performance.now() - started < 520) frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [activeId, shown]);

  useEffect(() => {
    const node = clusterRef.current;
    if (!node) return;
    let lastX = 0;
    let lastT = 0;
    let cooled = 0;
    function kick() {
      const now = performance.now();
      if (now - cooled < 900) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      cooled = now;
      setSwinging(true);
      window.setTimeout(() => setSwinging(false), 720);
    }
    function onMove(event: PointerEvent) {
      const t = performance.now();
      if (lastT) {
        const velocity = Math.abs(event.clientX - lastX) / (t - lastT);
        if (velocity > 2.4) kick();
      }
      lastX = event.clientX;
      lastT = t;
    }
    function onMotion(event: DeviceMotionEvent) {
      const accel = event.acceleration;
      if (!accel) return;
      const magnitude = Math.abs(accel.x ?? 0) + Math.abs(accel.y ?? 0);
      if (magnitude > 18) kick();
    }
    node.addEventListener("pointermove", onMove);
    window.addEventListener("devicemotion", onMotion);
    return () => {
      node.removeEventListener("pointermove", onMove);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, []);

  function hover(id: string | null) {
    setActiveId(id);
    if (id && sound) playClink();
    if (!id) setCaption(null);
  }

  function open(id: string) {
    openerId.current = openerId.current ?? id;
    const el = document.getElementById(`rail-btn-${id}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    setFocusIndex(shown.findIndex((item) => item.id === id));
    setRevealId(null);
  }

  const reveal = shown.find((item) => item.id === revealId);
  const focused = focusIndex != null ? shown[focusIndex] : undefined;

  return (
    <section
      id="rail"
      data-vault={vault ? "open" : "closed"}
      data-hydrated={hydrated ? "true" : "false"}
      className="relative h-dvh overflow-hidden"
    >
      <header className={`absolute inset-x-0 top-[1.4vh] z-20 px-[4vw] transition-opacity duration-300 ${focused ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <nav aria-label="Primary" className="flex items-start justify-between">
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
        <Link href="/" className="absolute top-0 left-1/2 -translate-x-1/2 text-ink">
          <h1 className="text-center leading-[0.9]">
            <span className="block font-script text-[26px]">Hanger</span>
            <span className="block font-script text-[18px]">22</span>
          </h1>
        </Link>
        {night ? (
          <p className="pointer-events-none absolute top-16 left-1/2 w-max -translate-x-1/2 text-center text-[12px] text-ink">
            The rail’s still open for requests.
          </p>
        ) : null}
        {vault ? (
          <p className="pointer-events-none absolute top-[4.5rem] left-1/2 w-max -translate-x-1/2 text-[11px] tracking-[0.16em] text-ink uppercase" role="status">
            The vault — three hangers with no listing
          </p>
        ) : null}
      </header>

      <div className={`absolute inset-0 transition-[filter,opacity] duration-300 ${focused ? "pointer-events-none opacity-20 blur-[20px]" : ""}`}>
        <div ref={clusterRef} className="absolute inset-0">
          <Rail
            items={shown}
            activeId={activeId}
            vault={vault}
            swinging={swinging}
            onHover={hover}
            onOpen={open}
            onReveal={setRevealId}
          />
          <p
            data-testid="rail-caption"
            className="display pointer-events-none absolute z-20 -translate-x-1/2 text-[15px] whitespace-nowrap text-ink"
            style={{
              left: caption?.x ?? 0,
              top: caption?.y ?? 0,
              opacity: caption && activeId && !focused ? 1 : 0,
              transition: "opacity 220ms ease",
            }}
          >
            {caption?.text}
          </p>
        </div>
      </div>
      <div className={`absolute top-[87.5vh] left-1/2 z-20 -translate-x-1/2 transition-opacity duration-300 ${focused ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <button
          type="button"
          className="pill-btn"
          onClick={() => {
            const piece = shown.find((item) => item.id === activeId) ?? null;
            setRequest(piece);
          }}
        >
          Request a piece
        </button>
      </div>

      <div className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${focused ? "opacity-0" : "opacity-100"}`}>
        <Marquee />
      </div>

      {focused && origin && focusIndex != null ? (
        <RailFocus
          items={shown}
          index={focusIndex}
          origin={origin}
          vault={vault}
          onClose={() => setFocusIndex(null)}
          onIndex={setFocusIndex}
          onRequest={(item) => setRequest(item)}
        />
      ) : null}

      {request !== undefined ? (
        <RequestSheet
          itemId={request?.id}
          title={request?.shortTitle}
          onClose={() => setRequest(undefined)}
        />
      ) : null}

      {reveal ? (
        <div className="fixed bottom-16 left-1/2 z-30 w-[min(420px,92vw)] -translate-x-1/2 bg-paper p-4 text-body shadow-lg" role="dialog" aria-label="Found it here">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] tracking-[0.14em] text-ink uppercase">Found it here</p>
            <button type="button" className="nav-link" onClick={() => setRevealId(null)}>
              Close
            </button>
          </div>
          {reveal.images.placeholder ? <p className="mt-2 text-[13px]">{PLACEHOLDER_NOTE}</p> : null}
          {reveal.images.source && !reveal.images.placeholder ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reveal.images.source} alt="" className="mt-3 max-h-48 w-full object-contain" />
          ) : null}
          {reveal.images.licence ? <p className="mt-2 text-[11px] leading-relaxed text-muted">{reveal.images.licence}</p> : null}
          <a className="mt-3 inline-block text-[13px] text-ink underline" href={`/p/${reveal.slug}`}>
            Open the piece
          </a>
        </div>
      ) : null}
    </section>
  );
}
