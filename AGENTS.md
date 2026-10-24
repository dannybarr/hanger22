# Hanger 22: instructions for agents

Hanger 22 is a small, reserve-then-pay boutique of rare collaborations and grails. Customers reserve a piece and pay nothing. We secure the piece, photograph it and send a payment link, and they pay only if they are happy. Trust is the product, so every rule below exists because breaking it would mislead a buyer or leak the business.

Owner: Danny Barr. Pushing to `main` deploys to https://hanger22.vercel.app.

## Ground rules

- **Never invent.** Stories, specs, conditions, sizes, seasons and brand history must come from the listing, the label or a cited source. If you cannot verify a fact, leave it out. "Not on our record yet, we confirm it from the labels before you pay" is always acceptable.
- **The business model stays private.** Marketplace names, seller names, source prices, listing URLs, markups and research notes live only in private fields (`notes`, `costBasis`, `markupPct`, `estimatedMarginGBP`, `demandSignal`, `priceProvisional`, `authRoute`, `sourceListingIds`, `images.credit`, `images.sourceUrl`, `images.licence`) and in `data/sources.json`. Never put them in `story`, `specs`, `title` or `shortTitle`.
- **Client components receive `ShopItem` only** (`toShopItem` in `lib/data.ts`). Never pass a full item to a `"use client"` component.
- **No stock claims.** Pieces are sourced to order, so `availability` is `"sourced"`. Never write "in stock", "ships now", "one of one" or "authenticated" unless it is literally true.
- **Copy is British English, short and human.** No em dashes, no buzzwords, no exclamation marks.
- Do not change the conveyor rail, the brand wall or the type system unless asked.

## Adding a product

1. **Record the source** in `data/sources.json`: `id` (`src-<item id>`), `itemId`, `platform`, `url`, `priceShown` (the payable price and its currency), `condition` (as the listing states it), `seenAt` (ISO date), `sold: false`, `note` (anything useful, kept private) and `licence`.

2. **Work out the price fields** from the source price:

   ```
   node scripts/economics.mjs <price> <GBP|USD|EUR|CNY>
   ```

   Copy `guidePriceGBP`, `priceGBP`, `priceProvisional`, `costBasis`, `markupPct` and `estimatedMarginGBP` exactly. Danny sets the final `priceGBP` later; leave `priceProvisional: true`.

3. **Write the item** in `data/items.json`, using an existing piece as the template:
   - `id`: `h22-<short-name>-<listing ref>`. `slug` is lowercase, hyphenated and readable.
   - `title`: full and descriptive. `shortTitle`: 2 to 4 words, unique on the site (no two "Black jacket"s).
   - `brand`: exactly as the house names itself. Write a collaboration as `"A x B"` so the brand pages find both houses.
   - `category`: one of the schema values. `condition`: `new`, `new-with-defects`, `excellent`, `good` or `fair`, matching the listing and never better than it.
   - `story`: 60 to 140 words for a buyer. What it is, the collaboration or drop, why it is hard to find, and the size and condition. Facts only.
   - `specs`: buyer-facing only (colour, material, size, measurements, season if verified).
   - `notes`: your research, privately. `status: "available-to-source"`, `availability: "sourced"`, `authConfidence: "medium"` unless the authentication evidence is strong.
   - `sourceListingIds: ["src-<item id>"]`.

4. **Make the cut-out** with the Wardrobe Vaulted pipeline. It needs `OPENAI_API_KEY`:

   ```
   node --experimental-strip-types scripts/source-piece.ts --id <id> --photo <file> \
     --credit "<who took the photo>" --source-url "<listing url>" \
     --name "<what it is>" --part upperbody --color "#hex" [--box x,y,w,h]
   ```

   It writes a candidate and a preview to `sourcing/.work/<id>/`. **Look at the preview against the real photo.** Reject it if the garment's colour, logo, pockets, fastenings or proportions changed, or if anything was invented. Only then publish:

   ```
   node --experimental-strip-types scripts/source-piece.ts --id <id> --view front --accept
   ```

   Publishing copies the image into `public/cutouts`, records credit and source, flags it as a studio image (the product page discloses that), backs up `items.json` and refreshes `data/fit.json`.

5. **360 view (optional).** Run the same command with `--view right`, `--view back` and `--view left`, each from a **real photograph of that side**. Never generate a side nobody photographed. The 360 toggle appears only once a piece has four views.

6. **The rail (optional).** The home conveyor shows outerwear and apparel listed in `RAIL_SEQUENCE` in `lib/data.ts`. Add the id there to hang it. The Ghost jacket stays first.

7. **Check and ship:**

   ```
   npx tsc --noEmit -p .
   npx eslint app components lib scripts
   npx vitest run
   npx next build
   ```

   All must pass. Commit with a plain message saying what was added, then push to `main` only if Danny asked you to.

## Selling a piece or removing one

If a source sells, set `sold: true` on its source record and either swap in another live listing or set the item's `status` to `"vault"` to take it off the site. Never leave a dead piece reservable.

## Brand stories

Long-form house stories live in `lib/houseStories.ts`. Each chapter must be supported by a source listed for that house, preferably the house's own history, annual reports or named journalism. A house without a story shows an honest "still writing" page. Do not add one without sources.

## Useful files

- `lib/schema.ts`: the data model. `lib/data.ts`: what is public and on the rail.
- `components/rail/Conveyor.tsx`: the home rail. `components/product/ProductStage.tsx`: the product image, zoom and 360.
- `app/brands`, `components/brands/TrophyWall.tsx`, `scripts/build-trophies.mjs` (rerun after adding a logo to `public/brands`).
- `tests/unit/catalog.test.ts`: checks prices, private fields and that nothing serves sourcing details.
