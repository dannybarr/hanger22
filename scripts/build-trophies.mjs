// Turns every house logo into a white-on-transparent mask the site casts in brass.
// Logos that already float on transparency keep their alpha. Logos printed on a
// solid box or a flat photo background are cut by contrast against the corner
// colour, so a red Supreme box leaves only the letters.
// Run with: node scripts/build-trophies.mjs
import { mkdir, readdir } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "public/brands";
const OUT = "public/brands/trophy";
const HEIGHT = 360;

await mkdir(OUT, { recursive: true });
const files = (await readdir(SOURCE)).filter((name) => /\.(svg|png|jpe?g)$/i.test(name) && !name.startsWith("wall"));

for (const file of files) {
  const slug = file.replace(/\.[^.]+$/, "");
  const input = sharp(`${SOURCE}/${file}`, { density: 300, limitInputPixels: false }).resize({ height: HEIGHT * 2, withoutEnlargement: false }).ensureAlpha();
  const { data, info } = await input.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = width * height;

  let opaque = 0;
  for (let i = 0; i < px; i += 1) if (data[i * channels + 3] > 200) opaque += 1;
  // Only a logo printed on an opaque background is cut by contrast. A solid silhouette keeps its alpha.
  const boxed = data[3] > 200 && opaque / px > 0.6;

  const corner = [0, 1, 2].map((c) => data[c]);
  const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const cornerLum = lum(...corner);

  const out = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i += 1) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = data[i * channels + 3];
    let alpha = a;
    if (boxed) {
      const colour = Math.hypot(r - corner[0], g - corner[1], b - corner[2]) / 441;
      const light = Math.abs(lum(r, g, b) - cornerLum) / 255;
      alpha = Math.round(255 * Math.min(1, Math.max(0, (Math.max(colour, light) - 0.12) / 0.38)));
    }
    out[i * 4] = 255;
    out[i * 4 + 1] = 255;
    out[i * 4 + 2] = 255;
    out[i * 4 + 3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ height: HEIGHT, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${slug}.png`);
  console.log(`${slug}${boxed ? " (cut by contrast)" : ""}`);
}
