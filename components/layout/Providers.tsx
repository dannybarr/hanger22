"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isRailClosed, nightRequested } from "@/lib/night";

declare global {
  interface Window {
    __hangerLenis?: {
      stop: () => void;
      start: () => void;
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <NightWatch />
      {children}
    </MotionConfig>
  );
}

function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085 });
    window.__hangerLenis = lenis;
    return () => {
      if (window.__hangerLenis === lenis) delete window.__hangerLenis;
      lenis.destroy();
    };
  }, []);
  return null;
}

function NightWatch() {
  const pathname = usePathname();
  useEffect(() => {
    const on = nightRequested(window.location.search) || isRailClosed();
    document.documentElement.dataset.night = on ? "1" : "0";
  }, [pathname]);
  return null;
}
