export const EASE = [0.22, 0.8, 0.22, 1] as const;

/** Near-critical settle. About a third softer than the first rail, with almost no overshoot. */
export const railSpring = {
  type: "spring" as const,
  stiffness: 72,
  damping: 18,
  mass: 1,
};

/** Edge-on compression. Varied slightly so the row is not a set of identical strips. */
export function sideScale(index: number) {
  return 0.26 + (index % 4) * 0.012;
}

/** Subtle yaw, degrees. Same general direction, staggered a couple of degrees. */
export function sideYaw(index: number) {
  return 16 + ((index % 3) - 1) * 2;
}

/** Hem length as a fraction of the base piece height. Tops stay on the rail. */
export function hangLength(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = (h >>> 0) % 1000;
  return 0.74 + (n / 1000) * 0.26;
}

/** Deterministic rest angle, ±1.5°, stable across server and client. */
export function restAngle(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = (h >>> 0) % 1000;
  return (n / 1000 - 0.5) * 3;
}

export const HANG_PX: Record<string, number> = {
  trailgrip: 148,
  puffer: 236,
  hoodie: 220,
  laptop: 206,
  moonwatch: 196,
  "moonwatch-vintage": 196,
  submariner: 190,
  snowboard: 262,
  "vault-sample": 236,
  "vault-goggle": 138,
  "vault-chrono": 190,
  ghost: 228,
  "si-dior": 232,
  skis: 268,
  af1: 150,
  daytona: 196,
  "royal-oak": 200,
};

export function hangHeight(art: string) {
  return HANG_PX[art] ?? 210;
}
