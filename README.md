# Hanger 22

A London desk for rare collabs and grails. A few pieces are in the vault and ship now. The rest are sourced to order. There is no checkout.

The homepage is a chrome rail. Five live jackets hang side-on until a hover turns one to face you. Neighbours slide apart, the hanger sways, and a drag flicks along the bar and settles on the nearest piece. A click lifts that piece into focus.

## Run

Local setup is in [LOCAL.md](LOCAL.md): Node 22, then `pnpm install` and `pnpm dev`. Open [http://localhost:3000](http://localhost:3000). The public site does not need environment variables.

```bash
pnpm install
pnpm dev
```

```bash
pnpm test
pnpm build
pnpm test:e2e
```

Playwright expects a production build already running, or it starts `next start` on port 3461 itself. Install browsers once with `pnpm exec playwright install chromium`.

## Data

Seed listings live in `data/`. The home rail hangs only the five pilot jackets checked on 21 October 2026: Stone Island Ghost 4100044 (Farfetch; the rail picture is a Bloomingdale’s UAE packshot of the same jacket, because the listing frame showed a model), Moncler x Palm Angels 72059216, 2 Moncler 1952 Komae 70832580, Kapital bandana patchwork 42633272, and Supreme x Stone Island 69748871 (this one replaced a mainline Sacai wool jacket). Each cut-out was framed with `scripts/process-images.ts` after rembg. Flat lays of filled outerwear sit between 0.66 and 0.77 opaque inside the tight alpha box; the rail rejects 0.80 and above. Older commons cut-outs are off the rail and off the public catalogue. Watches stay off the rail. Pieces without a cut-out stay on the desk only. Each item has `cutReason` (`collab`, `limited`, `one_off`, `rare_from_range`), `sourceMarket` (`UK`, `JP`, `EU`, `US`, `CN`) and `authConfidence` (`high` or `medium`). Only high confidence is shown. A Japan piece reads “Imported from Japan”. Guide prices are the source amount converted to GBP at the rates in `lib/money.ts`, then multiplied by 1.20 and 1.35 and rounded. Each item also carries a desk-only cost, markup, margin and demand signal. Those fields are stripped before anything reaches a page, a feed, or JSON-LD.

`/studio` is the read-only ledger (source URL, cost, list, margin, buy-outright score). Set `STUDIO_PASSWORD` in the environment. Locally that value is `rail-desk`. If the variable is missing, the route 404s. It is `noindex` and disallowed in `robots.txt`.

Konami vault hangers are not in the public feeds. They have no listing behind them.

The five rail cut-outs live in `public/cutouts`. Four are Vestiaire flat lays. The Ghost is a Bloomingdale’s UAE packshot of style 4100044, noted on the piece, because the Farfetch frame showed a model. Older commons cut-outs are not on the rail and not in the public catalogue. The licence note is on the piece and in `sources.json`.

## Agentic commerce

See [docs/AGENTIC.md](docs/AGENTIC.md). `/llms.txt`, `/api/catalog` and `/api/acp-feed` are live. ACP checkout is not.

## Deploy

`vercel.json` pins the function region to `lhr1`. Set `NEXT_PUBLIC_SITE_URL` to the public origin so feeds, JSON-LD and the sitemap use it.

## Not in V1

Real cut-out photography for the pieces that only have silhouettes, a request inbox, solicitor-reviewed legal copy, payments, accounts, and live marketplace scanning.
