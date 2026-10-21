"use client";

import { useEffect, useRef, useState } from "react";

export function PriceTicker({ value, className }: { value: string; className?: string }) {
  const [shown, setShown] = useState(value);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setShown(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  function play() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current) window.clearInterval(timer.current);
    let frame = 0;
    timer.current = window.setInterval(() => {
      frame += 1;
      if (frame > 7) {
        setShown(value);
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        return;
      }
      setShown(value.replace(/\d/g, () => String(Math.floor(Math.random() * 10))));
    }, 36);
  }

  return (
    <span className={`js-price tabular-nums ${className ?? ""}`} onPointerEnter={play}>
      {shown}
    </span>
  );
}
