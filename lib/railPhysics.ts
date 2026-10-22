/** Wardrobe rail motion. Softer than the first pass, and clamped so a flick cannot throw a piece off its hook. */

export const SWING_LIMIT = 0.045;
export const ACTIVE_HALF = 0.46;
export const SIDE_YAW = 1.2;
export const MAX_LAG = 0.4;

export type RailBody = {
  x: number;
  vx: number;
  yaw: number;
  swing: number;
  sw: number;
};

export function clampSwing(swing: number, velocity: number) {
  if (swing > SWING_LIMIT) return { swing: SWING_LIMIT, velocity: 0 };
  if (swing < -SWING_LIMIT) return { swing: -SWING_LIMIT, velocity: 0 };
  return { swing, velocity };
}

/** Side pieces get thinner as they leave the piece in focus. */
export function pieceHalf(distance: number, front: boolean) {
  if (front) return ACTIVE_HALF;
  const t = Math.min(1, Math.max(0, distance) / 3);
  return 0.125 * (1 - t) + 0.04 * t;
}

/** Near the focus the gap is a breath. Further along, the gap goes negative and the shoulders overlap. */
export function gapBetween(distance: number) {
  const t = Math.min(1, Math.max(0, distance) / 3);
  return 0.045 * (1 - t) - 0.02 * t;
}

export function layoutCenters(count: number, focus: number, frontIndex: number) {
  const halves: number[] = [];
  const gaps: number[] = [];
  const safeFocus = Math.max(0, Math.min(count - 1, focus));
  for (let i = 0; i < count; i += 1) {
    halves.push(pieceHalf(Math.abs(i - safeFocus), i === frontIndex));
  }
  for (let i = 0; i < count - 1; i += 1) {
    const dist = Math.min(Math.abs(i - safeFocus), Math.abs(i + 1 - safeFocus));
    gaps.push(gapBetween(dist));
  }
  const raw: number[] = [];
  let cursor = 0;
  for (let i = 0; i < count; i += 1) {
    raw.push(cursor + halves[i]!);
    cursor += halves[i]! * 2 + (gaps[i] ?? 0);
  }
  const mid = cursor / 2;
  return {
    halves,
    gaps,
    centers: raw.map((center) => center - mid),
    span: cursor,
  };
}

/** One integration step. Position lags the slot, but only by MAX_LAG, and swing stays inside SWING_LIMIT. */
export function stepRailBody(body: RailBody, target: number, dt: number, yawTarget: number) {
  const step = Math.min(0.05, Math.max(0, dt));
  const accel = (target - body.x) * 10.2 - body.vx * 13;
  body.vx += accel * step;
  body.x += body.vx * step;
  const lag = body.x - target;
  if (Math.abs(lag) > MAX_LAG) {
    body.x = target + Math.sign(lag) * MAX_LAG;
    body.vx *= 0.35;
  }
  const yawBlend = 1 - Math.exp(-4 * step);
  body.yaw += (yawTarget - body.yaw) * yawBlend;
  body.sw += (-5 * body.swing - body.vx * 1.4) * step;
  body.sw *= Math.exp(-3.2 * step);
  body.swing += body.sw * step;
  const clamped = clampSwing(body.swing, body.sw);
  body.swing = clamped.swing;
  body.sw = clamped.velocity;
  return body;
}
