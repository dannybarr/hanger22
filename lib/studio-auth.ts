import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "h22_studio";

export function studioCookieName() {
  return COOKIE;
}

export function studioPassword() {
  return process.env.STUDIO_PASSWORD ?? "";
}

export function studioToken(password: string) {
  return createHmac("sha256", password).update("hanger22-studio-v1").digest("hex");
}

export function secretsMatch(given: string, expected: string) {
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
