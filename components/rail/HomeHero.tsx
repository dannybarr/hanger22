"use client";

import { useEffect, useState } from "react";
import { Conveyor } from "@/components/rail/Conveyor";
import type { ShopItem } from "@/lib/data";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export function HomeHero({ items }: { items: ShopItem[] }) {
  const [gold, setGold] = useState(false);
  const [sound, setSound] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      setSound(window.localStorage.getItem("hanger22.sound") === "on");
    } catch {}
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let progress = 0;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const key = event.key.toLowerCase();
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        setGold((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleSound() {
    setSound((value) => {
      const next = !value;
      try {
        window.localStorage.setItem("hanger22.sound", next ? "on" : "off");
      } catch {}
      return next;
    });
  }

  return (
    <section
      aria-label="The rail"
      data-vault={gold ? "open" : "closed"}
      className="relative h-[min(calc(100dvh-97px),calc(100vw*1.05+230px))] min-h-[540px] lg:h-[calc(100dvh-97px)]"
    >
      <h1 className="sr-only">Hanger 22, London. Limited editions and rare collaborations</h1>
      <div className="absolute top-3 right-5 z-20 flex items-center gap-5 sm:right-8">
        {gold ? (
          <p className="eyebrow text-[var(--color-ink)]" role="status">
            After hours. The rail runs in gold
          </p>
        ) : null}
        <button type="button" className="eyebrow transition-colors hover:text-ink" aria-pressed={sound} onClick={toggleSound}>
          Sound {sound ? "on" : "off"}
        </button>
      </div>
      <Conveyor items={items} gold={gold} sound={sound} reduced={reduced} />
    </section>
  );
}
