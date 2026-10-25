import { getItem, getItems } from "@/lib/data";
import { sendToInbox } from "@/lib/inbox";
import { formatGBP, priceOf } from "@/lib/money";
import { requestSchema } from "@/lib/schema";
import { siteOrigin } from "@/lib/site";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;
  // Spam trap: people never see the company field, so anything in it came from a bot.
  if (typeof raw.company === "string" && raw.company.trim()) {
    return Response.json({ status: "new" }, { status: 202 });
  }
  const parsed = requestSchema.safeParse({
    itemId: typeof raw.itemId === "string" && raw.itemId.trim() ? raw.itemId.trim() : undefined,
    name: raw.name,
    email: raw.email,
    phone: typeof raw.phone === "string" && raw.phone.trim() ? raw.phone.trim() : undefined,
    size: typeof raw.size === "string" && raw.size.trim() ? raw.size.trim() : undefined,
    notes: typeof raw.notes === "string" && raw.notes.trim() ? raw.notes.trim() : undefined,
    budgetGBP: raw.budgetGBP === "" || raw.budgetGBP == null ? undefined : Number(raw.budgetGBP),
  });
  if (!parsed.success) {
    return Response.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const record = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
  // Always logged as well, so nothing is lost if the email service is down.
  console.info("[hanger22] request", record);

  const full = data.itemId ? getItems().find((entry) => entry.id === data.itemId) : undefined;
  const piece = full ? getItem(full.slug) : undefined;
  const origin = siteOrigin(new URL(request.url).origin);
  const subject = piece
    ? `Intent to buy: ${piece.brand}, ${piece.shortTitle} (${formatGBP(priceOf(piece))})`
    : `Personal shopping request from ${data.name}`;

  const result = await sendToInbox({
    subject,
    replyTo: data.email,
    fields: {
      "Request": piece ? "Expression of intent to buy" : "Personal shopping",
      "Piece": piece ? `${piece.brand}, ${piece.title}` : undefined,
      "Price": piece ? formatGBP(priceOf(piece)) : undefined,
      "Page": piece ? `${origin}/p/${piece.slug}` : undefined,
      "Source listing (private)": full?.sourceListingIds.join(", "),
      "Name": data.name,
      "Email": data.email,
      "Phone": data.phone,
      "Size": data.size,
      "Budget": data.budgetGBP ? formatGBP(data.budgetGBP) : undefined,
      "Note": data.notes,
      "Reference": record.id,
    },
  });
  if (!result.delivered) console.warn("[hanger22] inbox delivery not confirmed", record.id, result.detail);

  return Response.json({ id: record.id, status: "received" }, { status: 202 });
}
