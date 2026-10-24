"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

/** Fades and lifts its content in once, as it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`reveal ${className ?? ""}`}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 0.8, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A brass line that fills as the reader moves through the chapters. */
export function TimelineRail({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <div aria-hidden className="absolute top-0 bottom-0 left-[7px] w-px bg-line md:left-1/2">
        <motion.div className="brass-rule absolute inset-x-0 top-0 h-full origin-top" style={{ scaleY: fill }} />
      </div>
      {children}
    </div>
  );
}
