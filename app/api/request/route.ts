import { requestSchema } from "@/lib/schema";

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
  const record = {
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "new" as const,
  };
  console.info("[hanger22] request", record);
  return Response.json({ id: record.id, status: record.status }, { status: 202 });
}
