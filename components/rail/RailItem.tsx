"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HANGER_H, RailHanger } from "@/components/rail/Hanger";
import { GARMENT_TOP, pieceSize, type RailMetrics } from "@/components/rail/Rail";
import { fulfilmentCopy } from "@/components/piece/AvailabilityBadge";
import { formatGBP, priceOf } from "@/lib/money";
import { railSpring, restAngle, sideScale, sideYaw } from "@/lib/motion";
import type { PublicItem } from "@/lib/schema";

export function RailItem({
  item,
  index,
  active,
  metrics,
  vault,
  priority,
  swinging,
  onHover,
  onOpen,
  onReveal,
}: {
  item: PublicItem;
  index: number;
  active: boolean;
  metrics: RailMetrics;
  vault: boolean;
  priority: boolean;
  swinging: boolean;
  onHover: (id: string) => void;
  onOpen: (id: string) => void;
  onReveal: (id: string) => void;
}) {
  const rest = restAngle(item.id);
  const yaw = sideYaw(index);
  const scale = sideScale(index);
  const size = pieceSize(item, index, metrics.piece);
  const [swingTick, setSwingTick] = useState(0);
  const wasActive = useRef(active);
  const hold = useRef<number | null>(null);
  const swallow = useRef(false);
  const cutout = item.images.imageStatus === "cutout" && !item.images.placeholder ? item.images.front : undefined;
  const hangerW = Math.max(72, Math.round(size.front * 0.82));
  const hangerH = HANGER_H;

  useEffect(() => {
    if (wasActive.current && !active) setSwingTick((tick) => tick + 1);
    wasActive.current = active;
  }, [active]);

  function clearHold() {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  }

  const depth = (index % 3) - 1;

  return (
    <motion.li
      className="piece-drop relative shrink-0"
      style={{
        marginLeft: index === 0 ? 0 : metrics.gap,
        zIndex: active ? 40 : 12 + depth,
        ["--drop-delay" as string]: `${600 + index * 40}ms`,
      }}
      initial={false}
      animate={{ width: active ? size.front : size.side }}
      transition={railSpring}
      data-unlisted={item.unlisted ? "true" : undefined}
    >
      <button
        id={`rail-btn-${item.id}`}
        type="button"
        data-piece-id={item.id}
        data-state={active ? "front" : "side"}
        aria-label={`${item.shortTitle}, ${item.brand}, ${formatGBP(priceOf(item))}. ${fulfilmentCopy(item.availability)}`}
        className="relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left touch-manipulation"
        style={{ height: GARMENT_TOP + size.height }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") onHover(item.id);
        }}
        onFocus={() => onHover(item.id)}
        onPointerDown={() => {
          clearHold();
          hold.current = window.setTimeout(() => {
            swallow.current = true;
            onReveal(item.id);
          }, 480);
        }}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onClick={(event) => {
          if (swallow.current) {
            swallow.current = false;
            event.preventDefault();
            return;
          }
          if (!active) {
            onHover(item.id);
            return;
          }
          onOpen(item.id);
        }}
      >
        <motion.div
          className="pointer-events-none absolute top-0 left-1/2 z-[2]"
          style={{ transformOrigin: "50% 8px", perspective: 700 }}
          initial={false}
          animate={{
            width: active ? hangerW : Math.max(42, size.side + 6),
            x: "-50%",
            rotate: active ? 0 : rest,
            rotateY: active ? 0 : yaw * 0.35,
          }}
          transition={railSpring}
        >
          <RailHanger width={active ? hangerW : Math.max(42, size.side + 6)} uid={`${item.id}-hanger`} gold={vault} />
        </motion.div>
        <div className="pointer-events-none absolute top-0 left-1/2" style={{ perspective: 900 }}>
          <motion.div
            style={{
              width: size.front,
              marginLeft: -size.front / 2,
              transformOrigin: "50% 8px",
            }}
            initial={false}
            animate={
              active
                ? { scaleX: 1, rotateY: 0, rotate: 0, z: 20 }
                : swingTick > 0
                  ? {
                      scaleX: scale,
                      rotateY: yaw,
                      rotate: [rest + 2.4, rest - 1.5, rest + 0.45, rest],
                      z: depth * 18,
                    }
                  : swinging
                    ? {
                        scaleX: scale,
                        rotateY: yaw,
                        rotate: [rest, rest + 2.1, rest - 1.4, rest],
                        z: depth * 18,
                      }
                    : { scaleX: scale, rotateY: yaw, rotate: rest, z: depth * 18 }
            }
            transition={
              active
                ? railSpring
                : swingTick > 0 || swinging
                  ? { scaleX: railSpring, rotateY: railSpring, z: railSpring, rotate: { duration: 0.55, ease: "easeOut" } }
                  : railSpring
            }
          >
            <div style={{ height: hangerH }} />
            <div className="relative" style={{ marginTop: -(hangerH - GARMENT_TOP), height: size.height }}>
              {cutout ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cutout}
                  alt=""
                  draggable={false}
                  width={item.images.pixelWidth}
                  height={item.images.pixelHeight}
                  className="block h-full w-full"
                  style={{
                    filter: active
                      ? "drop-shadow(0 22px 16px rgba(39, 31, 23, 0.22))"
                      : "drop-shadow(10px 16px 10px rgba(39, 31, 23, 0.18))",
                  }}
                  fetchPriority={priority ? "high" : "auto"}
                />
              ) : null}
              {cutout && !active ? (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(18,12,8,0.62) 0%, rgba(18,12,8,0.22) 16%, rgba(255,248,236,0.08) 42%, transparent 62%, rgba(18,12,8,0.2) 100%)",
                    maskImage: `url(${cutout})`,
                    WebkitMaskImage: `url(${cutout})`,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskMode: "alpha",
                  }}
                />
              ) : null}
            </div>
          </motion.div>
        </div>
      </button>
    </motion.li>
  );
}
