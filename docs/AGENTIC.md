# Agentic commerce

Hanger 22 does not check out. A request is an enquiry. The feeds below tell an agent what can be sourced, in pounds, and that payment is not available on the site.

## What is live in V1

- JSON-LD `Product` on `/p/[slug]`, with `Brand`, an `AggregateOffer` in GBP, and `isRelatedTo` when the piece belongs to a collab. `availability` is `InStock` when the piece is in the vault, `LimitedAvailability` for a vault candidate still sourced to order, otherwise `PreOrder`. The homepage carries `Organization` and `WebSite` with a `SearchAction` pointed at `/pieces?q=`.
- `/llms.txt` — a markdown brief: how requests work, the catalogue, policies, contact.
- `/api/catalog` — `{ version: 1, generated_at, items }`. Public pieces only. `revalidate` is 3600 seconds. Vault hangers are excluded.
- `/api/acp-feed` — an ACP-shaped product feed. Each item has `id`, `title`, `description`, `link`, `image_link`, `brand`, `condition`, `price` (guide minimum, `GBP`), `availability`, `enable_search: true`, `enable_checkout: false`.
- `robots.txt` allows GPTBot, Google-Extended, PerplexityBot and OAI-SearchBot. `sitemap.xml` lists the public URLs.

The public catalogue is cut-outs only. Items carry `imageStatus`, `availability` (`in_vault` or `sourced`), `cutReason` and `sourceMarket`. `authConfidence` is included only when it is `high`. The ACP description leads with the story, the cut and the market; the guide price comes after. The ACP item uses `in_stock` or `preorder` for the vault split. Cost, markup, margin and the demand signal are not in JSON-LD, `/llms.txt`, `/api/catalog` or `/api/acp-feed`. `/studio` is a noindex desk and is disallowed in `robots.txt`.

## ACP checkout, later

The product feed follows the OpenAI / Stripe Agentic Commerce Protocol field names as of the 2026-04-17 spec. Checkout is intentionally off.

When a payment provider exists, the checkout API is:

- `POST /checkout_sessions`
- `POST /checkout_sessions/:id/complete`
- `POST /checkout_sessions/:id/cancel`

Requests carry an `Idempotency-Key` and an `API-Version` header. Sessions should be able to reprice against the live source listing, because a guide on this site is not a stocked offer. Do not turn `enable_checkout` on until that path can refuse a listing that has sold.

## Google UCP / AP2

AI Mode and Gemini read Merchant Center. The same public pieces can be submitted there once there is a real domain, a returns policy URL that a solicitor has signed, and a price that is an offer rather than a guide. UCP / AP2 is the agent-payment side of that. It is not wired here.

## Shopify

If a Shopify backend is ever added, Catalog and the UCP MCP can expose the same pieces. V1 has no Shopify store. Do not invent SKUs in Shopify just to satisfy a feed.

## Our own MCP

A later MCP server on this catalogue should expose three tools and nothing that spends money:

- `search_catalog` — the same filters as `/pieces` (category, brand, collab, price band, query).
- `get_piece` — one slug, including sources, licence notes, and whether the image is a placeholder.
- `request_piece` — the same body as `POST /api/request`. It creates an enquiry. It does not capture a card.

Vault pieces stay out of `search_catalog` unless the caller is the desk.
