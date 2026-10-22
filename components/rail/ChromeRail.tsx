"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { fulfilmentCopy } from "@/components/piece/AvailabilityBadge";
import { EMPTY_SHOULDER, measureShoulder, type ShoulderFit } from "@/lib/hangerFit";
import { formatRange } from "@/lib/money";
import { layoutCenters, SIDE_YAW, stepRailBody, type RailBody } from "@/lib/railPhysics";
import type { PublicItem } from "@/lib/schema";

const BAR_Y = 0.74;
const BAR_R = 0.028;
const GARMENT_H = 0.9;
const PITCH = 0.68;
const MAX_FLICK = 1.15;
/** Where the neck meets the collar. The arms run from here into the shoulders. */
const COLLAR_Y = -0.05;

type Body = RailBody;

type World = {
  bodies: Body[];
  scroll: number;
  scrollV: number;
  dragging: boolean;
  /** A drag released with speed. Friction carries it, then the nearest piece is faced. */
  flick: boolean;
  /** Ignore hover until the pointer moves again after a drag, so the landing is not stolen. */
  suppressHover: boolean;
  reduced: boolean;
  active: number;
  width: number;
  span: number;
};

/** Hook curls over the bar and stops at the top of the neck. It never crosses the shoulders. */
function hookCurve() {
  const pathR = BAR_R + 0.01;
  const points: THREE.Vector3[] = [];
  const start = Math.PI * 0.08;
  const end = Math.PI * 1.02;
  for (let i = 0; i <= 28; i += 1) {
    const t = start + ((end - start) * i) / 28;
    points.push(new THREE.Vector3(0, Math.sin(t) * pathR, Math.cos(t) * pathR));
  }
  points.push(new THREE.Vector3(0, -0.03, 0));
  return new THREE.CatmullRomCurve3(points);
}

function EnvironmentRig() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    return () => {
      texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function KeyLight() {
  return <directionalLight position={[1.4, 4.2, 4.6]} intensity={2.6} color="#fff6ea" />;
}

function Bar({ gold }: { gold: boolean }) {
  return (
    <group position={[0, BAR_Y, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[BAR_R, BAR_R, 4.7, 64]} />
        <meshPhysicalMaterial
          color={gold ? "#c6a15a" : "#d5dbe2"}
          metalness={1}
          roughness={gold ? 0.22 : 0.16}
          clearcoat={0.35}
          clearcoatRoughness={0.18}
          envMapIntensity={1.15}
        />
      </mesh>
      {[-2.22, 2.22].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0, -0.055]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.0045, 0.0045, 0.07, 8]} />
            <meshStandardMaterial color="#3a332c" metalness={0.78} roughness={0.26} />
          </mesh>
          <mesh position={[0, 0, -0.09]}>
            <boxGeometry args={[0.018, 0.028, 0.006]} />
            <meshStandardMaterial color="#2a241e" metalness={0.45} roughness={0.42} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[BAR_R + 0.005, 0.0032, 8, 18]} />
            <meshStandardMaterial color="#2c2824" metalness={0.8} roughness={0.24} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Wall() {
  const shadow = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const vertical = ctx.createLinearGradient(0, 0, 0, 64);
      vertical.addColorStop(0, "rgba(28, 22, 16, 0)");
      vertical.addColorStop(0.5, "rgba(28, 22, 16, 0.14)");
      vertical.addColorStop(1, "rgba(28, 22, 16, 0)");
      ctx.fillStyle = vertical;
      ctx.fillRect(0, 0, 512, 64);
      ctx.globalCompositeOperation = "destination-in";
      const horizontal = ctx.createLinearGradient(0, 0, 512, 0);
      horizontal.addColorStop(0, "rgba(0, 0, 0, 0)");
      horizontal.addColorStop(0.18, "rgba(0, 0, 0, 1)");
      horizontal.addColorStop(0.82, "rgba(0, 0, 0, 1)");
      horizontal.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = horizontal;
      ctx.fillRect(0, 0, 512, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <mesh position={[0, BAR_Y - 0.055, -0.35]}>
      <planeGeometry args={[3.6, 0.045]} />
      <meshBasicMaterial map={shadow ?? undefined} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

type Hang = {
  centerY: number;
  neck: THREE.Vector3;
  left: THREE.Vector3[];
  right: THREE.Vector3[];
};

function hangFrom(fit: ShoulderFit, width: number): Hang {
  const centerY = COLLAR_Y - GARMENT_H / 2 + fit.collarY * GARMENT_H;
  const yAt = (frac: number) => centerY + GARMENT_H / 2 - frac * GARMENT_H;
  const xAt = (frac: number) => (frac - 0.5) * width;
  // Just behind the cloth. A larger offset swings out past the silhouette once the piece yaws side-on.
  const bury = -0.004;
  const point = (p: { x: number; y: number }, z: number) => new THREE.Vector3(xAt(p.x), yAt(p.y), z);
  const join = fit.left[0] ?? { x: fit.collarX, y: fit.collarY };
  return {
    centerY,
    neck: point(join, 0.006),
    left: fit.left.map((p, index) => point(p, index === 0 ? 0.002 : bury)),
    right: fit.right.map((p, index) => point(p, index === 0 ? 0.002 : bury)),
  };
}

function segmentTubes(points: THREE.Vector3[], radius: number) {
  const tubes: THREE.TubeGeometry[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) continue;
    tubes.push(new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 1, radius, 5, false));
  }
  return tubes;
}

function hangerGeometry(hang: Hang) {
  const hook = hookCurve();
  const neckTop = hook.getPoint(1);
  const wire = 0.0036;
  return {
    hook: new THREE.TubeGeometry(hook, 32, 0.0042, 8, false),
    neck: new THREE.TubeGeometry(new THREE.LineCurve3(neckTop, hang.neck), 4, wire, 6, false),
    left: segmentTubes(hang.left, wire),
    right: segmentTubes(hang.right, wire),
  };
}

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 64, 8, 128, 64, 120);
    gradient.addColorStop(0, "rgba(39, 31, 23, 0.28)");
    gradient.addColorStop(1, "rgba(39, 31, 23, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function FittedPiece({
  url,
  width,
  gold,
  spin,
}: {
  url: string;
  width: number;
  gold: boolean;
  spin: RefObject<THREE.Group | null>;
}) {
  const texture = useTexture(url);
  const gl = useThree((state) => state.gl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  const [fit, setFit] = useState<ShoulderFit>(EMPTY_SHOULDER);
  useLayoutEffect(() => {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image || !image.naturalWidth) return;
    const next = measureShoulder(image, image.naturalWidth, image.naturalHeight);
    if (next) setFit(next);
  }, [texture]);
  const hang = useMemo(() => hangFrom(fit, width), [fit, width]);
  const parts = useMemo(() => hangerGeometry(hang), [hang]);
  useEffect(() => {
    return () => {
      parts.hook.dispose();
      parts.neck.dispose();
      parts.left.forEach((geometry) => geometry.dispose());
      parts.right.forEach((geometry) => geometry.dispose());
    };
  }, [parts]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: gold ? "#6a5332" : "#1a1a1a",
        roughness: gold ? 0.45 : 0.55,
        metalness: gold ? 0.22 : 0.35,
      }),
    [gold],
  );
  const cloth = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [texture],
  );
  const shadow = useMemo(() => shadowTexture(), []);
  useEffect(() => {
    return () => {
      cloth.dispose();
      shadow.dispose();
    };
  }, [cloth, shadow]);
  return (
    <group>
      <mesh geometry={parts.hook} material={material} />
      <group ref={spin}>
        <mesh geometry={parts.neck} material={material} />
        {parts.left.map((geometry, index) => (
          <mesh key={`l${index}`} geometry={geometry} material={material} />
        ))}
        {parts.right.map((geometry, index) => (
          <mesh key={`r${index}`} geometry={geometry} material={material} />
        ))}
        <mesh position={[0, hang.centerY, 0.012]} material={cloth}>
          <planeGeometry args={[width, GARMENT_H]} />
        </mesh>
        <mesh position={[0.02, hang.centerY - GARMENT_H * 0.34, -0.04]} rotation={[-0.4, 0, 0]}>
          <planeGeometry args={[width * 0.78, GARMENT_H * 0.28]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Piece({
  item,
  index,
  world,
  gold,
  register,
}: {
  item: PublicItem;
  index: number;
  world: { current: World | null };
  gold: boolean;
  register: (index: number, object: THREE.Object3D | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const pixelsW = item.images.pixelWidth ?? 700;
  const pixelsH = item.images.pixelHeight ?? 1000;
  const width = Math.min(0.86, Math.max(0.46, GARMENT_H * (pixelsW / pixelsH)));
  const src = item.images.front;

  useLayoutEffect(() => {
    register(index, ref.current);
    return () => register(index, null);
  }, [index, register]);

  useFrame(() => {
    const group = ref.current;
    const state = world.current;
    const body = state?.bodies[index];
    if (!group || !body) return;
    group.position.set(body.x, BAR_Y, 0);
    group.rotation.x = 0;
    group.rotation.y = 0;
    group.rotation.z = body.swing;
    if (spin.current) spin.current.rotation.y = body.yaw;
  });

  return (
    <group ref={ref}>
      <Suspense fallback={null}>
        <FittedPiece url={src} width={width} gold={gold} spin={spin} />
      </Suspense>
    </group>
  );
}

function Simulator({
  world,
  count,
  nodes,
  buttons,
  onSettle,
}: {
  world: { current: World | null };
  count: number;
  nodes: { current: (THREE.Object3D | null)[] };
  buttons: { current: (HTMLButtonElement | null)[] };
  onSettle: (index: number) => void;
}) {
  const { camera, size } = useThree();
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const state = world.current;
    if (!state) return;
    const dt = Math.min(0.033, delta);
    const coastDt = Math.min(0.1, delta);
    const active = state.active;
    let focus = active;
    if (focus < 0 || state.dragging || state.flick) {
      focus = 0;
      let best = Number.POSITIVE_INFINITY;
      state.bodies.forEach((body, i) => {
        const distance = Math.abs(body.x);
        if (distance < best) {
          best = distance;
          focus = i;
        }
      });
    }
    const frontIndex = !state.dragging && !state.flick && active >= 0 ? active : -1;
    const layout = layoutCenters(count, focus, frontIndex);
    const centers = layout.centers;
    if (!state.dragging) {
      state.scrollV *= Math.exp(-3.6 * coastDt);
      state.scroll += state.scrollV * coastDt;
      if (state.scroll > 2.1) {
        state.scroll = 2.1;
        state.scrollV = 0;
      } else if (state.scroll < -2.1) {
        state.scroll = -2.1;
        state.scrollV = 0;
      }
      if (state.flick && Math.abs(state.scrollV) < 0.16) {
        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        for (let i = 0; i < count; i += 1) {
          const distance = Math.abs(centers[i]! + state.scroll);
          if (distance < best) {
            best = distance;
            nearest = i;
          }
        }
        state.flick = false;
        state.scrollV = 0;
        state.active = nearest;
        state.scroll = -centers[nearest]!;
        onSettle(nearest);
      } else if (!state.flick && Math.abs(state.scrollV) < 0.03 && active >= 0) {
        const desired = -centers[active]!;
        state.scroll += (desired - state.scroll) * (1 - Math.exp(-8 * dt));
      }
    }

    state.bodies.forEach((body, i) => {
      const target = centers[i]! + state.scroll;
      const facing = i === frontIndex;
      const yawTarget = facing ? 0 : SIDE_YAW * (i < focus ? -1 : 1);
      if (state.reduced) {
        body.x = target;
        body.vx = 0;
        body.yaw = yawTarget;
        body.swing = 0;
        body.sw = 0;
        return;
      }
      stepRailBody(body, target, delta, yawTarget);
    });

    const list = nodes.current;
    const hits = buttons.current;
    if (!list || !hits) return;
    for (let i = 0; i < count; i += 1) {
      const node = list[i];
      const button = hits[i];
      const body = state.bodies[i];
      if (!node || !button || !body) continue;
      scratch.set(body.x, BAR_Y - 0.55, 0.1);
      scratch.project(camera);
      const left = (scratch.x * 0.5 + 0.5) * size.width;
      const top = (-scratch.y * 0.5 + 0.5) * size.height;
      const front = i === active;
      const hitW = front ? 200 : 64;
      const hitH = Math.round(size.height * 0.5);
      const nextLeft = `${Math.round(left - hitW / 2)}px`;
      const nextTop = `${Math.round(top - hitH * 0.42)}px`;
      const nextWidth = `${hitW}px`;
      const nextHeight = `${hitH}px`;
      if (button.style.left !== nextLeft) button.style.left = nextLeft;
      if (button.style.top !== nextTop) button.style.top = nextTop;
      if (button.style.width !== nextWidth) button.style.width = nextWidth;
      if (button.style.height !== nextHeight) button.style.height = nextHeight;
      const layer = front ? "40" : String(12 + i);
      button.style.zIndex = layer;
      if (button.parentElement) button.parentElement.style.zIndex = layer;
    }
    state.width = size.width;
    state.span = 2 * Math.tan(THREE.MathUtils.degToRad(13)) * 5.4 * (size.width / Math.max(1, size.height));
  });

  return null;
}

export function ChromeRail({
  items,
  activeId,
  vault,
  onHover,
  onOpen,
  onReveal,
}: {
  items: PublicItem[];
  activeId: string | null;
  vault: boolean;
  onHover: (id: string | null) => void;
  onOpen: (id: string) => void;
  onReveal: (id: string) => void;
}) {
  const world = useRef<World>({
    bodies: items.map((_, i) => ({
      x: (i - (items.length - 1) / 2) * PITCH,
      vx: 0,
      yaw: SIDE_YAW,
      swing: 0,
      sw: 0,
    })),
    scroll: 0,
    scrollV: 0,
    dragging: false,
    flick: false,
    suppressHover: false,
    reduced: false,
    active: -1,
    width: 1280,
    span: 4,
  });
  const nodes = useRef<(THREE.Object3D | null)[]>([]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef({ x: 0, moved: 0, active: false });
  const hold = useRef<number | null>(null);
  const swallow = useRef(false);

  useEffect(() => {
    world.current.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    world.current.bodies = items.map((_, i) => ({
      x: (i - (items.length - 1) / 2) * PITCH,
      vx: 0,
      yaw: SIDE_YAW,
      swing: 0,
      sw: 0,
    }));
  }, [items]);

  useEffect(() => {
    const index = items.findIndex((item) => item.id === activeId);
    world.current.active = index;
  }, [activeId, items]);

  function register(index: number, object: THREE.Object3D | null) {
    nodes.current[index] = object;
  }

  function clearHold() {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  }

  return (
    <div
      className="relative h-full min-h-[70vh] w-full touch-none"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        drag.current = { x: event.clientX, moved: 0, active: true };
      }}
      onPointerMove={(event) => {
        if (!drag.current.active) {
          if (world.current.suppressHover && !world.current.flick) world.current.suppressHover = false;
          return;
        }
        const dx = event.clientX - drag.current.x;
        drag.current.x = event.clientX;
        drag.current.moved += Math.abs(dx);
        if (drag.current.moved < 8) return;
        if (!world.current.dragging) {
          world.current.dragging = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        const span = world.current.span || 4;
        const worldDx = (dx / Math.max(1, world.current.width)) * span;
        world.current.scroll += worldDx;
        const velocity = worldDx / 0.016;
        world.current.scrollV = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, velocity));
      }}
      onPointerUp={() => {
        const wasDrag = world.current.dragging;
        drag.current.active = false;
        world.current.dragging = false;
        if (wasDrag) {
          world.current.flick = true;
          world.current.active = -1;
          world.current.suppressHover = true;
        }
      }}
      onPointerLeave={(event) => {
        if (world.current.dragging || world.current.flick || world.current.suppressHover) return;
        if (event.pointerType !== "mouse") return;
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        if (event.currentTarget.contains(document.activeElement)) return;
        onHover(null);
      }}
      onKeyDown={(event) => {
        const index = items.findIndex((item) => item.id === activeId);
        if (event.key === "ArrowRight") {
          onHover(items[Math.min(items.length - 1, index + 1)]?.id ?? null);
        }
        if (event.key === "ArrowLeft") {
          onHover(items[Math.max(0, index - 1)]?.id ?? null);
        }
        if (event.key === "Enter" && activeId) onOpen(activeId);
      }}
    >
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0.02, 5.4], fov: 26, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <EnvironmentRig />
        <KeyLight />
        <hemisphereLight args={["#f4efe6", "#8d7b68", 0.55]} />
        <ambientLight intensity={0.28} />
        <Wall />
        <Bar gold={vault} />
        {items.map((item, index) => (
          <Piece key={item.id} item={item} index={index} world={world} gold={vault} register={register} />
        ))}
        <Simulator
          world={world}
          count={items.length}
          nodes={nodes}
          buttons={buttons}
          onSettle={(index) => {
            const piece = items[index];
            if (piece) onHover(piece.id);
          }}
        />
      </Canvas>
      <ul role="list" aria-label="Pieces on the rail" data-testid="rail" className="absolute inset-0 z-10">
        {items.map((item, index) => {
          const front = item.id === activeId || (activeId == null && index === world.current.active);
          return (
            <li key={item.id} className="contents">
              <button
                ref={(node) => {
                  buttons.current[index] = node;
                }}
                id={`rail-btn-${item.id}`}
                type="button"
                data-piece-id={item.id}
                data-unlisted={item.unlisted ? "true" : undefined}
                data-state={front ? "front" : "side"}
                aria-label={`${item.shortTitle}, ${item.brand}, guide ${formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)}. ${fulfilmentCopy(item.availability)}`}
                className="absolute cursor-grab border-0 bg-transparent p-0"
                style={{ width: 72, height: "42vh", left: `${8 + index * 18}%`, top: "28%" }}
                onPointerEnter={(event) => {
                  if (world.current.dragging || world.current.flick || world.current.suppressHover) return;
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
                onPointerLeave={(event) => {
                  clearHold();
                  if (world.current.dragging || world.current.flick || world.current.suppressHover) return;
                  const next = event.relatedTarget;
                  if (next instanceof Element && next.closest("[data-piece-id]")) return;
                  onHover(null);
                }}
                onClick={(event) => {
                  if (drag.current.moved > 12) {
                    drag.current.moved = 0;
                    event.preventDefault();
                    return;
                  }
                  if (swallow.current) {
                    swallow.current = false;
                    event.preventDefault();
                    return;
                  }
                  if (item.id !== activeId) {
                    onHover(item.id);
                    return;
                  }
                  onOpen(item.id);
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
