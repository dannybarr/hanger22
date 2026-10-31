# Hanger 22: instructions for agents

Hanger 22 is a London store for limited editions, rare collaborations and grails: the pieces most people never get to see. To a customer it is a simple, confident shop. They choose a piece, press Buy now, express their intent to buy in a popup, and receive a personal checkout link by email. Behind the scenes, pieces are sourced from partners once a request arrives, and Danny sends the checkout link only when the piece is secured. **The customer never sees that process.**

Owner: Danny Barr. Pushing to `main` deploys to https://hanger22.vercel.app.

## Positioning and voice

- **Confident and simple.** Write like a premium store selling its own stock. Never mention sourcing, partners, marketplaces, sellers, previous owners, listings, "securing", "confirming the piece", photographs before payment, or "if it can be found". The only process a customer sees is: Buy now, express intent to buy, private checkout link by email, delivery, 14 days to change your mind.
- **Every product story is about the product.** When it launched, who made it and why, the collaboration or line it belongs to, what makes it rare, then its colour, material, size and condition. 60 to 140 words.
- **Human language.** British English, short sentences. No dashes of any kind used as punctuation, no semicolons, no hyphenated compounds where plain words work ("hard to find", not "hard-to-find"), no buzzwords, no exclamation marks.
- **Honest within the confidence.** Never claim stock, delivery speed, authentication or "one of one" unless it is literally true. If a fact cannot be verified, leave it out rather than hedge in the copy.
- Buy requests and personal shopping enquiries go to Danny's inbox through `lib/inbox.ts` on the server. Never put the inbox address in client code or copy.

## Ground rules

- **Never invent.** Stories, specs, conditions, sizes, seasons and brand history must come from the listing, the label or a cited source. If you cannot verify a fact, leave it out.
- **The business model stays private.** Marketplace names, seller names, source prices, listing URLs, markups and research notes live only in private fields (`notes`, `costBasis`, `markupPct`, `estimatedMarginGBP`, `demandSignal`, `priceProvisional`, `authRoute`, `sourceListingIds`, `images.credit`, `images.sourceUrl`, `images.licence`) and in `data/sources.json`. Never put them in `story`, `specs`, `title` or `shortTitle`.
- **Client components receive `ShopItem` only** (`toShopItem` in `lib/data.ts`). Never pass a full item to a `"use client"` component.
- **Data stays truthful.** Pieces are sourced to order, so `availability` is `"sourced"`.
- **Copy follows the voice rules above.**
- Do not change the conveyor rail, the brand wall or the type system unless asked.

## Adding a product

1. **Record the source** in `data/sources.json`: `id` (`src-<item id>`), `itemId`, `platform`, `url`, `priceShown` (the payable price and its currency), `condition` (as the listing states it), `seenAt` (ISO date), `sold: false`, `note` (anything useful, kept private) and `licence`.

2. **Work out the price fields** from the source price:

   ```
   node scripts/economics.mjs <price> <GBP|USD|EUR|CNY|KRW>
   ```

   Copy `guidePriceGBP`, `priceGBP`, `priceProvisional`, `costBasis`, `markupPct` and `estimatedMarginGBP` exactly. Danny sets the final `priceGBP` later; leave `priceProvisional: true`.

3. **Write the item** in `data/items.json`, using an existing piece as the template:
   - `id`: `h22-<short-name>-<listing ref>`. `slug` is lowercase, hyphenated and readable.
   - `title`: full and descriptive. `shortTitle`: the name shown everywhere, and it leads with the exclusivity. Put the collaboration or rare line first, then the piece, in title case: "Moncler x Palm Angels Jacket", "Stone Island Ghost Jacket", "sacai x Levi's Denim Blouson". It must be unique on the site.
   - `brand`: exactly as the house names itself. Write a collaboration as `"A x B"` so the brand pages find both houses.
   - `category`: one of the schema values. `condition`: `new`, `new-with-defects`, `excellent`, `good` or `fair`, matching the listing and never better than it.
   - `story`: 60 to 140 words told as the story of this product: when it launched, who made it and why, the line or collaboration, what makes it rare, then colour, material, size and condition. Facts only, voice rules apply.
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

5. **360 view (optional).** Run the same command with `--view right`, `--view back` and `--view left`, each from a **real photograph of that side**. Never generate a side nobody photographed. The 360 toggle appears once a piece has a second real view. Front and back give a half turn. Front, right, back and left give the full turn.

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
