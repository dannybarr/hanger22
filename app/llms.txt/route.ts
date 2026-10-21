import { cutLabel, marketNote } from "@/lib/cut";
import { getDrops, getPublicItems } from "@/lib/data";
import { formatRange } from "@/lib/money";
import { SITE_DESCRIPTION, siteOrigin } from "@/lib/site";

export function GET(request: Request) {
  const origin = siteOrigin(new URL(request.url).origin);
  const pieces = getPublicItems()
    .map(
      (item) =>
        `- ${cutLabel(item.cutReason)}. ${item.title} — ${marketNote(item.sourceMarket)} — ${origin}/p/${item.slug} — guide ${formatRange(item.guidePriceGBP.min, item.guidePriceGBP.max)}`,
    )
    .join("\n");
  const drops = getDrops()
    .map((drop) => `- ${drop.title}: ${origin}/drops/${drop.slug}`)
    .join("\n");
  const body = `# Hanger 22

${SITE_DESCRIPTION}

## How a request works

There is no checkout. A person asks for a piece with their name, email, size, budget and notes. The site stores that in the browser and posts it to ${origin}/api/request, which validates the body and returns 202. Payment, if it happens, is agreed afterwards. Pieces marked in the vault ship now. The rest are sourced to order, usually five to ten days. Cost, markup and margin are not in this file.

## Catalogue

Machine-readable feed: ${origin}/api/catalog
Agentic Commerce Protocol product feed stub (search on, checkout off): ${origin}/api/acp-feed

${pieces}

## Drops

${drops}

## Policies

- Terms: ${origin}/legal/terms
- Privacy: ${origin}/legal/privacy
- Returns: ${origin}/legal/returns

## Contact

London, United Kingdom
requests@hanger22.example
${origin}/contact

The public catalogue is cut-outs only. Marketplace photographs identify the piece. They are not campaign imagery.
`;
  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
