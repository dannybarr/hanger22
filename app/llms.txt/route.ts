import { getPublicItems } from "@/lib/data";
import { formatGBP, priceOf } from "@/lib/money";
import { SITE_DESCRIPTION, siteOrigin } from "@/lib/site";

export function GET(request: Request) {
  const origin = siteOrigin(new URL(request.url).origin);
  const pieces = getPublicItems()
    .map((item) => `- ${item.title} | ${item.brand} | ${origin}/p/${item.slug} | ${formatGBP(priceOf(item))}`)
    .join("\n");
  const body = `# Hanger 22

${SITE_DESCRIPTION}

## Catalogue

${origin}/api/catalog

${pieces}

## Houses

${origin}/brands

## Policies

- Terms: ${origin}/legal/terms
- Privacy: ${origin}/legal/privacy
- Delivery and returns: ${origin}/legal/returns
- How reserving works: ${origin}/reserving

## Contact

London, United Kingdom
${origin}/contact
`;
  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
