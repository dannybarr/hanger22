/**
 * Turn a sourced product photo into a Hanger 22 cut-out, the Wardrobe Vaulted way.
 *
 *   1. Crop to the piece with 8% padding (minimum 12px), if a box is given.
 *   2. Ask the image model to reconstruct only the garment on a flat chroma
 *      background, with Wardrobe Vaulted's garment prompt word for word.
 *   3. Lift the chroma, strip spill, frame at 1024px and 88% (process-images.ts).
 *   4. Refuse a cut-out that still carries chroma at the edge. Retry the cleanup
 *      at stronger tolerances first, with no second AI call, as WV's editor does.
 *
 * Views other than the front are for the 360 view. They add a direction, the
 * same way WV appends a member's regeneration direction, so the model keeps
 * the side it was shown instead of inventing a front.
 *
 *   OPENAI_API_KEY=... node --experimental-strip-types scripts/source-piece.ts \
 *     --id h22-ghost-4100044 --photo sourcing/ghost/front.jpg --view front \
 *     --name "grey cotton canvas jacket" --part upperbody --color "#c9c7c2"
 *
 * Optional: --box x,y,w,h on WV's 0-1000 grid, --secondary "#hex",
 * --tags "stand collar,flap pockets", --tolerance 46.
 * Writes public/cutouts/<id>-<view>.webp and records it in data/items.json.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
// @ts-expect-error Node runs this file directly, so the import keeps its .ts extension.
import { chooseChromaKey, processChromaBackground, readRaster, writeRaster } from "./process-images.ts";

type PieceMetadata = { name?: string; part?: string; color?: string | null; secondaryColor?: string | null; tags?: string[] };

const VIEWS = ["front", "right", "back", "left"] as const;
type View = (typeof VIEWS)[number];

/** Word for word from Wardrobe Vaulted src/lib/ai/prompts.ts. Do not edit; the wording is the quality. */
function buildGarmentPrompt(metadata: PieceMetadata = {}, chromaKey = "#00ff00"): string {
  const name = metadata.name || "clothing item";
  const category = metadata.part || "wardrobe item";
  const primary = metadata.color || "the exact visible color";
  const secondary = metadata.secondaryColor ? ` with distinct secondary color ${metadata.secondaryColor}` : "";
  const details = metadata.tags?.length ? metadata.tags.join(", ") : "all visible construction and design details";

  return `Use case: background-extraction
Asset type: ecommerce catalog product cutout source

Input image: The reference photograph shows the exact garment, either by itself or worn by a person. Use it only to identify and reconstruct the garment.

Primary request: Reconstruct ONLY the complete empty ${name} (${category}) as a clean, front-facing ecommerce catalog product photograph. If a wearer is present, remove them. Remove every other garment, object, and background element. Show the complete item naturally arranged and symmetrical, with no person, body, mannequin, or hanger visible.

Garment fidelity: Preserve the reference garment's exact primary color ${primary}${secondary}, material and texture, silhouette, neckline, sleeves, fastenings, pattern, and distinctive details (${details}). Preserve any clearly legible existing graphic or logo exactly, but do not invent or reinterpret uncertain logos, text, pockets, seams, hardware, colors, or decoration.

Composition: Centered straight-on product view. Keep the entire garment inside the frame with generous, even padding on every side. No cropping or truncation.

Background: Perfectly flat, absolutely uniform solid ${chromaKey} chroma-key color, edge-to-edge. No shadows, gradient, texture, vignette, floor, horizon, reflection, or lighting variation.

Lighting: Neutral diffuse product lighting contained on the garment only.

Avoid: person, body, skin, hair, mannequin, hanger, props, other garments, retail tags, cast shadow, contact shadow, reflection, watermark, caption, border, background variation, or chroma spill.

Critical: Use no ${chromaKey} anywhere in the garment. Produce exactly one complete garment with a crisp, separable outer silhouette.`;
}

const VIEW_DIRECTION: Record<Exclude<View, "front">, string> = {
  back: "The reference shows the BACK of the garment. Keep it as a straight-on back view. Do not turn it to the front or invent front details.",
  right: "The reference shows the garment from its right side. Keep that side view. Do not turn it to the front or invent unseen details.",
  left: "The reference shows the garment from its left side. Keep that side view. Do not turn it to the front or invent unseen details.",
};

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 ? process.argv[index + 1] : undefined;
}

/** WV cropDetectedItem: box on a 0-1000 grid, 8% padding, minimum 12px. */
async function crop(photo: Buffer, box: string | undefined): Promise<Buffer> {
  const upright = await sharp(photo).rotate().toColourspace("srgb").png().toBuffer();
  if (!box) return upright;
  const [bx, by, bw, bh] = box.split(",").map(Number);
  const meta = await sharp(upright).metadata();
  const W = meta.width!;
  const H = meta.height!;
  const x = Math.max(0, Math.min(999, Math.round(bx!)));
  const y = Math.max(0, Math.min(999, Math.round(by!)));
  const w = Math.max(1, Math.min(1000 - x, Math.round(bw!)));
  const h = Math.max(1, Math.min(1000 - y, Math.round(bh!)));
  const rawLeft = (x / 1000) * W;
  const rawTop = (y / 1000) * H;
  const rawWidth = (w / 1000) * W;
  const rawHeight = (h / 1000) * H;
  const padding = Math.max(12, Math.round(Math.max(rawWidth, rawHeight) * 0.08));
  const left = Math.max(0, Math.floor(rawLeft - padding));
  const top = Math.max(0, Math.floor(rawTop - padding));
  const right = Math.min(W, Math.ceil(rawLeft + rawWidth + padding));
  const bottom = Math.min(H, Math.ceil(rawTop + rawHeight + padding));
  return sharp(upright).extract({ left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) }).png().toBuffer();
}

/** WV editWithOpenAi: gpt-image-2, 1024x1024, high quality, PNG. */
async function reconstruct(image: Buffer, prompt: string): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Set OPENAI_API_KEY to run the reconstruction stage.");
  const form = new FormData();
  form.set("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-2");
  form.set("prompt", prompt);
  form.set("size", "1024x1024");
  form.set("quality", "high");
  form.set("output_format", "png");
  form.append("image[]", new Blob([new Uint8Array(image)], { type: "image/png" }), "crop.png");
  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const result = (await response.json()) as { data?: { b64_json?: string }[]; error?: { message?: string } };
  const encoded = result.data?.[0]?.b64_json;
  if (!response.ok || !encoded) throw new Error(result.error?.message || `The image could not be generated (${response.status}).`);
  return Buffer.from(encoded, "base64");
}

async function main() {
  const id = arg("id");
  const photo = arg("photo");
  const view = (arg("view") || "front") as View;
  if (!id || !photo || !VIEWS.includes(view)) {
    console.error("usage: source-piece.ts --id <item id> --photo <file> [--view front|right|back|left] [--name] [--part] [--color #hex] [--box x,y,w,h]");
    process.exit(1);
  }
  const metadata: PieceMetadata = {
    name: arg("name"),
    part: arg("part"),
    color: arg("color") ?? null,
    secondaryColor: arg("secondary") ?? null,
    tags: arg("tags")?.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
  const chromaKey = chooseChromaKey(metadata.color ?? undefined);
  const work = path.join("sourcing", ".work", id);
  await mkdir(work, { recursive: true });

  const cropped = await crop(await readFile(photo), arg("box"));
  await writeFile(path.join(work, `${view}-crop.png`), cropped);

  const base = buildGarmentPrompt(metadata, chromaKey);
  const prompt = view === "front" ? base : `${base}\nUser regeneration direction: ${VIEW_DIRECTION[view]}`;
  const generatedFile = path.join(work, `${view}-generated.png`);
  const generated = await reconstruct(cropped, prompt);
  await writeFile(generatedFile, generated);

  const start = Number(arg("tolerance") ?? 46);
  let accepted = null;
  for (const tolerance of [start, start + 16, start + 32]) {
    const result = await processChromaBackground(await readRaster(generatedFile), chromaKey, { tolerance });
    console.log(`cleanup at tolerance ${result.tolerance}: ${result.verification.contaminatedPixels} tinted pixels`);
    if (result.verification.contaminatedPixels <= 1) {
      accepted = result;
      break;
    }
  }
  if (!accepted) throw new Error(`Chroma left on the edge. Check ${generatedFile} and rerun with --tolerance, or regenerate.`);

  const output = `public/cutouts/${id}-${view}.webp`;
  await writeRaster(accepted.raster, output);

  const items = JSON.parse(await readFile("data/items.json", "utf8")) as Array<{ id: string; images: Record<string, unknown> & { spin?: string[] } }>;
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`No item ${id} in data/items.json`);
  const url = `/${output.replace(/^public\//, "")}`;
  if (view === "front") {
    item.images.front = url;
    item.images.pixelWidth = 1024;
    item.images.pixelHeight = 1024;
    item.images.imageStatus = "cutout";
    item.images.placeholder = false;
  }
  const spin: Record<string, string> = Object.fromEntries((item.images.spin ?? []).map((src: string) => [src.match(/-(front|right|back|left)\.webp$/)?.[1] ?? src, src]));
  spin[view] = url;
  item.images.spin = VIEWS.filter((name) => spin[name]).map((name) => spin[name]);
  await writeFile("data/items.json", `${JSON.stringify(items, null, 2)}\n`);
  console.log(`saved ${output}. Run node scripts/measure-fit.mjs to refresh the fit data.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
