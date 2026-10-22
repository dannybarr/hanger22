/**
 * Cut-out stage, ported from Wardrobe Vaulted's pixels.ts.
 *
 * The original ran in a browser canvas because that app cannot ship `sharp`.
 * This script is the same maths on raw RGBA: trim where alpha > 8, centre at
 * 88% occupancy, chroma-key distance with feather 80, spill removal, and the
 * same contamination check. The canvas aims for 1600px but never enlarges a
 * source: a smaller cut-out stays at its native long edge. Background removal
 * itself is done before this step (rembg, or a chroma render). The shadow stays
 * with the garment in the scene, not baked into the pixels.
 *
 *   node --experimental-strip-types scripts/process-images.ts <in.png> <out.webp>
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export type Raster = { data: Uint8ClampedArray; width: number; height: number };

export function chooseChromaKey(primary = "#808080"): string {
  const value = HEX_COLOR.test(primary) ? primary : "#808080";
  const source = [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  const candidates = [
    [0, 255, 0],
    [255, 0, 255],
    [0, 255, 255],
  ];
  const distance = (color: number[]) =>
    color.reduce((total, channel, index) => total + (channel - (source[index] ?? 0)) ** 2, 0);
  const selected = [...candidates].sort((a, b) => distance(b) - distance(a))[0]!;
  return `#${selected.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function cleanupTolerance(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(18, Math.min(110, Math.round(parsed))) : 46;
}

function keyChannels(key: string) {
  const target = [1, 3, 5].map((offset) => Number.parseInt(key.slice(offset, offset + 2), 16));
  return {
    target,
    keyed: target.map((channel, index) => (channel > 200 ? index : -1)).filter((index) => index >= 0),
    neutral: target.map((channel, index) => (channel < 55 ? index : -1)).filter((index) => index >= 0),
  };
}

function average(data: Uint8ClampedArray, index: number, channels: number[]): number {
  if (!channels.length) return 0;
  return channels.reduce((total, channel) => total + data[index + channel]!, 0) / channels.length;
}

function removeKeyedSpill(data: Uint8ClampedArray, index: number, keyed: number[], neutralLevel: number): void {
  let remaining = Math.ceil(keyed.reduce((total, channel) => total + data[index + channel]!, 0) - neutralLevel * keyed.length);
  let active = keyed.filter((channel) => data[index + channel]! > 0);
  while (remaining > 0 && active.length) {
    const share = Math.ceil(remaining / active.length);
    const next: number[] = [];
    for (const channel of active) {
      const reduction = Math.min(data[index + channel]!, share, remaining);
      data[index + channel] = data[index + channel]! - reduction;
      remaining -= reduction;
      if (data[index + channel]! > 0) next.push(channel);
    }
    active = next;
  }
}

function stripSpill(raster: Raster, keyed: number[], neutral: number[]): void {
  const { data } = raster;
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) continue;
    const residual = Math.max(0, average(data, index, keyed) - average(data, index, neutral));
    if (residual > 0) removeKeyedSpill(data, index, keyed, average(data, index, neutral));
  }
}

/** Trim to the visible piece, then centre it. Never scales a source up. */
export function frameTransparentGarment(raster: Raster, canvasSize = 1600, occupancy = 0.88): Raster {
  const { data, width, height } = raster;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let index = 0, pixel = 0; index < data.length; index += 4, pixel += 1) {
    if (data[index + 3]! <= 8) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (maxX < minX || maxY < minY) throw new Error("Background removal did not leave a visible garment");

  const trimWidth = maxX - minX + 1;
  const trimHeight = maxY - minY + 1;
  const occ = Math.max(0.5, Math.min(0.96, occupancy));
  const maxDraw = Math.max(1, Math.round(canvasSize * occ));
  const scale = Math.min(1, maxDraw / Math.max(trimWidth, trimHeight));
  const drawWidth = Math.max(1, Math.round(trimWidth * scale));
  const drawHeight = Math.max(1, Math.round(trimHeight * scale));
  const side = Math.min(canvasSize, Math.max(drawWidth, drawHeight, Math.round(Math.max(drawWidth, drawHeight) / occ)));
  const destX = Math.floor((side - drawWidth) / 2);
  const destY = Math.floor((side - drawHeight) / 2);

  const out = new Uint8ClampedArray(side * side * 4);
  const area = scale < 1;
  for (let y = 0; y < drawHeight; y += 1) {
    const srcY0 = minY + (y * trimHeight) / drawHeight;
    const srcY1 = minY + ((y + 1) * trimHeight) / drawHeight;
    for (let x = 0; x < drawWidth; x += 1) {
      const dst = ((destY + y) * side + (destX + x)) * 4;
      if (!area) {
        const srcX = minX + Math.min(trimWidth - 1, Math.round((x * trimWidth) / drawWidth));
        const srcY = minY + Math.min(trimHeight - 1, Math.round((y * trimHeight) / drawHeight));
        const src = (srcY * width + srcX) * 4;
        out[dst] = data[src]!;
        out[dst + 1] = data[src + 1]!;
        out[dst + 2] = data[src + 2]!;
        out[dst + 3] = data[src + 3]!;
        continue;
      }
      const srcX0 = minX + (x * trimWidth) / drawWidth;
      const srcX1 = minX + ((x + 1) * trimWidth) / drawWidth;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      const yStart = Math.max(minY, Math.floor(srcY0));
      const yEnd = Math.min(maxY, Math.ceil(srcY1) - 1);
      const xStart = Math.max(minX, Math.floor(srcX0));
      const xEnd = Math.min(maxX, Math.ceil(srcX1) - 1);
      for (let sy = yStart; sy <= yEnd; sy += 1) {
        for (let sx = xStart; sx <= xEnd; sx += 1) {
          const src = (sy * width + sx) * 4;
          r += data[src]!;
          g += data[src + 1]!;
          b += data[src + 2]!;
          a += data[src + 3]!;
          n += 1;
        }
      }
      if (n === 0) continue;
      out[dst] = Math.round(r / n);
      out[dst + 1] = Math.round(g / n);
      out[dst + 2] = Math.round(b / n);
      out[dst + 3] = Math.round(a / n);
    }
  }
  return { data: out, width: side, height: side };
}

export type ChromaDiagnostics = { contaminatedPixels: number; maxSpill: number };

function verifyNoChromaSpill(raster: Raster, keyed: number[], neutral: number[]): ChromaDiagnostics {
  const { data } = raster;
  let contaminatedPixels = 0;
  let maxSpill = 0;
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) continue;
    const spill = Math.max(0, average(data, index, keyed) - average(data, index, neutral));
    if (spill > maxSpill) maxSpill = spill;
    if (spill > 1.5) contaminatedPixels += 1;
  }
  return { contaminatedPixels, maxSpill };
}

/** Lift a flat chroma background, strip spill, and frame. Same tolerance and feather as the original. */
export function processChromaBackground(
  raster: Raster,
  key: string,
  options: { tolerance?: number } = {},
): { raster: Raster; verification: ChromaDiagnostics; tolerance: number } {
  const tolerance = cleanupTolerance(options.tolerance);
  const feather = 80;
  const { target, keyed, neutral } = keyChannels(key);
  const { data } = raster;

  for (let index = 0; index < data.length; index += 4) {
    const distance = Math.sqrt(
      (data[index]! - target[0]!) ** 2 + (data[index + 1]! - target[1]!) ** 2 + (data[index + 2]! - target[2]!) ** 2,
    );
    if (distance <= tolerance) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
      continue;
    }
    if (distance < tolerance + feather) {
      data[index + 3] = Math.round(data[index + 3]! * ((distance - tolerance) / feather));
    }
    const neutralLevel = average(data, index, neutral);
    const spill = Math.max(0, average(data, index, keyed) - neutralLevel);
    if (spill > 0) {
      const spillAlpha = Math.max(0, 1 - Math.max(0, spill - 4) / 150);
      data[index + 3] = Math.round(data[index + 3]! * spillAlpha);
      removeKeyedSpill(data, index, keyed, neutralLevel);
    }
    if (data[index + 3]! <= 8) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    }
  }

  stripSpill(raster, keyed, neutral);
  const framed = frameTransparentGarment(raster);
  stripSpill(framed, keyed, neutral);
  return { raster: framed, verification: verifyNoChromaSpill(framed, keyed, neutral), tolerance };
}

export async function readRaster(file: string): Promise<Raster> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8ClampedArray(data), width: info.width, height: info.height };
}

export async function writeRaster(raster: Raster, file: string) {
  await mkdir(path.dirname(file), { recursive: true });
  const encoded = await sharp(Buffer.from(raster.data), {
    raw: { width: raster.width, height: raster.height, channels: 4 },
  })
    .webp({ quality: 95, alphaQuality: 100, effort: 5 })
    .toBuffer();
  await writeFile(file, encoded);
}

async function main() {
  const [input, output, mode, key] = process.argv.slice(2);
  if (!input || !output) {
    console.error("usage: process-images.ts <in> <out.webp> [chroma #00ff00]");
    process.exit(1);
  }
  const raster = await readRaster(input);
  if (mode === "chroma") {
    const result = processChromaBackground(raster, key || chooseChromaKey());
    if (result.verification.contaminatedPixels > 1) {
      throw new Error(`Background cleanup left ${result.verification.contaminatedPixels} chroma-contaminated pixels`);
    }
    await writeRaster(result.raster, output);
    return;
  }
  await writeRaster(frameTransparentGarment(raster), output);
}

if (process.argv[1]?.includes("process-images")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
