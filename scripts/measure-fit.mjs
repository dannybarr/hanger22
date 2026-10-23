// Measures each rail cut-out so the conveyor can hang it by the collar.
// Writes data/fit.json: the opaque bounding box and the collar point, as
// fractions of the source image. Run with: node scripts/measure-fit.mjs
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const items = JSON.parse(readFileSync("data/items.json", "utf8"));
const fronts = [...new Set(items.filter((item) => item.images.imageStatus === "cutout").map((item) => item.images.front))];
const out = {};

for (const front of fronts) {
  const { data, info } = await sharp(`public${front}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const solid = (x, y) => data[(y * width + x) * channels + 3] > 40;

  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  const rowLeft = new Int32Array(height).fill(-1);
  const rowRight = new Int32Array(height).fill(-1);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!solid(x, y)) continue;
      if (rowLeft[y] < 0) rowLeft[y] = x;
      rowRight[y] = x;
    }
    if (rowLeft[y] >= 0) {
      x0 = Math.min(x0, rowLeft[y]);
      x1 = Math.max(x1, rowRight[y]);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  const boxW = x1 - x0 + 1;

  // The collar is the first row wide enough to be cloth, not a stray hanger hook.
  let collarY = y0;
  while (collarY < y1 && rowRight[collarY] - rowLeft[collarY] < boxW * 0.16) collarY += 1;
  const collarX = (rowLeft[collarY] + rowRight[collarY]) / 2;

  // Some sellers photographed the piece on its own hanger. Then the photo's hook is the pivot.
  const ownHook = (collarY - y0) / height > 0.04;
  const hookX = (rowLeft[y0] + rowRight[y0]) / 2;

  out[front] = {
    box: [x0 / width, y0 / height, (x1 + 1) / width, (y1 + 1) / height].map((n) => Number(n.toFixed(4))),
    collar: [Number((collarX / width).toFixed(4)), Number((collarY / height).toFixed(4))],
    pivot: ownHook ? [Number((hookX / width).toFixed(4)), Number((y0 / height).toFixed(4))] : null,
    px: [width, height],
  };
  console.log(front, out[front]);
}

writeFileSync("data/fit.json", `${JSON.stringify(out, null, 2)}\n`);
