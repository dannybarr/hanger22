import { toCatalog } from "@/lib/feeds";
import { siteOrigin } from "@/lib/site";

export const revalidate = 3600;

export function GET(request: Request) {
  const origin = siteOrigin(new URL(request.url).origin);
  return Response.json(toCatalog(origin));
}
