import { describe, expect, it } from "vitest";
import { frameTransparentGarment, type Raster } from "../../scripts/process-images";
import { clampSwing, layoutCenters, MAX_LAG, stepRailBody, SWING_LIMIT } from "@/lib/railPhysics";

function opaqueBox(width: number, height: number, rect: { x: number; y: number; w: number; h: number }): Raster {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const i = (y * width + x) * 4;
      data[i] = 20;
      data[i + 1] = 30;
      data[i + 2] = 40;
      data[i + 3] = 255;
    }
  }
  return { data, width, height };
}

function opaqueBounds(raster: Raster) {
  let minX = raster.width;
  let minY = raster.height;
  let maxX = -1;
  let maxY = -1;
  for (let i = 0, p = 0; i < raster.data.length; i += 4, p += 1) {
    if (raster.data[i + 3]! <= 8) continue;
    const x = p % raster.width;
    const y = Math.floor(p / raster.width);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { w: maxX - minX + 1, h: maxY - minY + 1 };
}

describe("cut-out framing", () => {
  it("does not enlarge a source smaller than the 1600 target", () => {
    const framed = frameTransparentGarment(opaqueBox(240, 500, { x: 40, y: 20, w: 80, h: 400 }), 1600, 0.88);
    const bounds = opaqueBounds(framed);
    expect(Math.max(bounds.w, bounds.h)).toBeLessThanOrEqual(400);
    expect(framed.width).toBeLessThan(1600);
  });

  it("scales a large source down into the 1600 canvas", () => {
    const framed = frameTransparentGarment(opaqueBox(3200, 3200, { x: 100, y: 100, w: 3000, h: 2800 }), 1600, 0.88);
    const bounds = opaqueBounds(framed);
    expect(framed.width).toBeLessThanOrEqual(1600);
    expect(Math.max(bounds.w, bounds.h)).toBeLessThanOrEqual(Math.round(1600 * 0.88) + 2);
    expect(Math.max(bounds.w, bounds.h)).toBeGreaterThan(1200);
  });
});

describe("wardrobe rail", () => {
  it("packs the far side tighter when the view sits on the left", () => {
    const layout = layoutCenters(5, 0, 0);
    const pitch = (index: number) => layout.centers[index + 1]! - layout.centers[index]!;
    expect(pitch(3)).toBeLessThan(pitch(0));
    expect(pitch(3)).toBeLessThan(pitch(1));
    expect(layout.halves[0]).toBeGreaterThan(layout.halves[4]!);
  });

  it("packs the far side tighter when the view sits on the right", () => {
    const layout = layoutCenters(5, 4, 4);
    const pitch = (index: number) => layout.centers[index + 1]! - layout.centers[index]!;
    expect(pitch(0)).toBeLessThan(pitch(3));
  });

  it("keeps swing and lag inside their limits through a hard flick", () => {
    const body = { x: 0, vx: 0, yaw: 0, swing: 0, sw: 0 };
    let target = 0;
    for (let frame = 0; frame < 240; frame += 1) {
      if (frame === 20) target = 8;
      if (frame === 80) target = -6;
      if (frame === 140) target = 3;
      stepRailBody(body, target, 0.016, frame % 2 === 0 ? 1.2 : -1.2);
      expect(Math.abs(body.swing)).toBeLessThanOrEqual(SWING_LIMIT + 1e-6);
      expect(Math.abs(body.x - target)).toBeLessThanOrEqual(MAX_LAG + 1e-6);
    }
    expect(clampSwing(1, 4).swing).toBe(SWING_LIMIT);
    expect(clampSwing(-1, -4).velocity).toBe(0);
  });
});
