"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { secretsMatch, studioCookieName, studioPassword, studioToken } from "@/lib/studio-auth";

export async function unlockStudio(formData: FormData) {
  const expected = studioPassword();
  const given = String(formData.get("password") ?? "");
  if (!expected || !secretsMatch(given, expected)) redirect("/studio?denied=1");
  const jar = await cookies();
  jar.set(studioCookieName(), studioToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    path: "/studio",
    maxAge: 60 * 60 * 12,
  });
  redirect("/studio");
}
