/** Where a wire hanger sits inside a cut-out. Fractions are of the image, origin top-left. */

export type FitPoint = { x: number; y: number };

export type ShoulderFit = {
  collarX: number;
  collarY: number;
  left: FitPoint[];
  right: FitPoint[];
};

const SAMPLE = 180;

function emptyFit(): ShoulderFit {
  return {
    collarX: 0.5,
    collarY: 0.12,
    left: [
      { x: 0.5, y: 0.14 },
      { x: 0.32, y: 0.24 },
    ],
    right: [
      { x: 0.5, y: 0.14 },
      { x: 0.68, y: 0.24 },
    ],
  };
}

/**
 * Collar is the top of the real shoulder mass, ignoring a thin spike left over
 * from a previous hanger. Arms follow that shoulder line, a few pixels inside
 * the cloth, and stop where the sleeve drops away.
 */
export function measureShoulder(image: CanvasImageSource, naturalWidth: number, naturalHeight: number): ShoulderFit | null {
  if (typeof document === "undefined") return null;
  const tw = SAMPLE;
  const th = Math.max(1, Math.round((tw * naturalHeight) / Math.max(1, naturalWidth)));
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, tw, th);
  const data = ctx.getImageData(0, 0, tw, th).data;
  const solid = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= tw || y >= th) return false;
    return data[(y * tw + x) * 4 + 3] > 40;
  };

  const widths = new Int16Array(th);
  const lefts = new Int16Array(th);
  const rights = new Int16Array(th);
  let maxW = 0;
  for (let y = 0; y < th; y += 1) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < tw; x += 1) {
      if (!solid(x, y)) continue;
      if (left < 0) left = x;
      right = x;
    }
    lefts[y] = left;
    rights[y] = right;
    const width = left < 0 ? 0 : right - left + 1;
    widths[y] = width;
    if (width > maxW) maxW = width;
  }
  if (maxW < 8) return null;

  let y = 0;
  while (y < th && widths[y] < Math.max(2, Math.floor(tw * 0.02))) y += 1;
  let spikeMax = 0;
  let body = y;
  while (y < th) {
    spikeMax = Math.max(spikeMax, widths[y] ?? 0);
    const width = widths[y] ?? 0;
    if (spikeMax < maxW * 0.2 && width < Math.max(2, spikeMax * 0.45)) {
      y += 1;
      while (y < th && (widths[y] ?? 0) <= spikeMax) y += 1;
      body = y;
      break;
    }
    if (width >= maxW * 0.18) {
      body = y;
      break;
    }
    y += 1;
  }
  while (body < th && (widths[body] ?? 0) < maxW * 0.16) body += 1;
  if (body >= th || lefts[body] < 0) return emptyFit();

  const cx = Math.round(((lefts[body] ?? 0) + (rights[body] ?? 0)) / 2);
  const top = new Array<number | null>(tw).fill(null);
  const start = Math.max(0, body - 1);
  for (let x = 0; x < tw; x += 1) {
    for (let yy = start; yy < th; yy += 1) {
      if (solid(x, yy)) {
        top[x] = yy;
        break;
      }
    }
  }
  const smooth = new Array<number | null>(tw).fill(null);
  for (let x = 0; x < tw; x += 1) {
    const neighbors: number[] = [];
    for (let i = Math.max(0, x - 4); i < Math.min(tw, x + 5); i += 1) {
      const value = top[i];
      if (value != null) neighbors.push(value);
    }
    if (neighbors.length === 0) continue;
    neighbors.sort((a, b) => a - b);
    smooth[x] = neighbors[Math.floor(neighbors.length / 2)] ?? null;
  }
  const origin = smooth[cx];
  if (origin == null) return emptyFit();
  const collarRow = origin;

  function walk(direction: number) {
    let x = cx;
    let tip = x;
    const limit = collarRow + Math.round(th * 0.16);
    while (true) {
      const next = x + direction;
      if (next < 0 || next >= tw || smooth[next] == null) break;
      const far = next + direction * 5;
      let slope = 0;
      if (far >= 0 && far < tw && smooth[far] != null && smooth[next] != null) {
        slope = ((smooth[far] ?? 0) - (smooth[next] ?? 0)) / 5;
      }
      const nextY = smooth[next] ?? collarRow;
      if (nextY > limit && slope > 0.8) break;
      if (slope > 1.6 && nextY > collarRow + 6) break;
      if (Math.abs(next - cx) > Math.round(tw * 0.38)) break;
      tip = next;
      x = next;
    }
    while (Math.abs(tip - cx) > 4) {
      const tipRow = smooth[tip] ?? collarRow;
      const yy = tipRow + 4;
      let count = 0;
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = 0; dy <= 2; dy += 1) {
          if (solid(tip + dx, yy + dy)) count += 1;
        }
      }
      if (count >= 7) break;
      tip -= direction;
    }
    return tip;
  }

  function samples(x0: number, x1: number): FitPoint[] {
    const points: FitPoint[] = [];
    const steps = 7;
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.round(x0 + ((x1 - x0) * i) / steps);
      const base = smooth[x];
      if (base == null) continue;
      let yy = base + 4;
      let guard = 0;
      while (guard < 10 && !solid(x, yy)) {
        yy += 1;
        guard += 1;
      }
      points.push({ x: x / tw, y: yy / th });
    }
    return points;
  }

  const left = samples(cx, walk(-1));
  const right = samples(cx, walk(1));
  if (left.length < 2 || right.length < 2) return emptyFit();
  return {
    collarX: cx / tw,
    collarY: Math.min(th - 1, collarRow + 2) / th,
    left,
    right,
  };
}

export const EMPTY_SHOULDER = emptyFit();
