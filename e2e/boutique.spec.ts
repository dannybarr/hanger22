import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getPublicItems, getRailItems } from "../lib/data";
import { acpFeedSchema, catalogFeedSchema } from "../lib/schema";

const RAIL = getRailItems();
const RAIL_COUNT = RAIL.length;
const THIRD = RAIL[2];
const PRIVATE_KEYS = ["costBasis", "markupPct", "estimatedMarginGBP", "demandSignal"];

async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("homepage renders the rail, marquee and request", async ({ page }) => {
  const errors = await expectNoConsoleErrors(page);
  await page.goto("/");
  const rail = page.getByRole("list", { name: "Pieces on the rail" });
  await expect(rail.getByRole("listitem")).toHaveCount(RAIL_COUNT);
  await expect(page.getByTestId("marquee")).toBeVisible();
  await expect(page.getByRole("button", { name: /request a piece/i })).toBeVisible();
  await page.waitForTimeout(400);
  expect(errors.filter((error) => !/favicon/i.test(error))).toEqual([]);
});

async function waitForSeparatedRail(page: Page) {
  const rail = page.getByRole("list", { name: "Pieces on the rail" });
  await expect.poll(async () => {
    const lefts = await rail.getByRole("button").evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().left)));
    return new Set(lefts).size;
  }).toBe(5);
  return rail;
}

test("hovering the third piece faces it forward", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Hover is a desktop gesture");
  await page.goto("/");
  const rail = await waitForSeparatedRail(page);
  const third = rail.getByRole("listitem").nth(2).getByRole("button");
  await third.hover();
  await expect(third).toHaveAttribute("data-state", "front");
  await expect(page.locator("[data-state=front]")).toHaveCount(1);
  const label = (await third.getAttribute("aria-label")) ?? "";
  const title = label.split(",")[0]?.trim();
  await expect(page.getByTestId("rail-caption")).toHaveText(title ?? "");
});

test("focus mode counts, advances, and returns focus", async ({ page }, info) => {
  await page.goto("/");
  const rail = await waitForSeparatedRail(page);
  const third = rail.getByRole("listitem").nth(2).getByRole("button");
  if (info.project.name === "mobile") {
    await third.tap();
    const opened = page.getByRole("dialog");
    if (!(await opened.isVisible())) {
      await expect(third).toHaveAttribute("data-state", "front");
      await third.tap();
    }
  } else {
    await third.hover();
    await expect(third).toHaveAttribute("data-state", "front");
    await third.click({ force: true });
  }
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const total = String(RAIL_COUNT).padStart(2, "0");
  await expect(dialog.getByTestId("counter")).toHaveText(`03 / ${total}`);
  await expect(dialog.getByRole("heading", { name: THIRD?.shortTitle ?? "" })).toBeVisible();
  await expect(dialog.getByText("Sourced to order, 5–10 days")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByTestId("counter")).toHaveText(`04 / ${total}`);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(third).toBeFocused();
});

test("reduced motion stops the marquee", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const name = await page.getByTestId("marquee-track").evaluate((element) => getComputedStyle(element).animationName);
  expect(name).toBe("none");
});

test("product page exposes Product JSON-LD", async ({ page }) => {
  await page.goto("/p/moncler-zellerfeld-trailgrip-3d-khaki");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const product = blocks.map((block) => JSON.parse(block) as { "@type"?: string; name?: string; brand?: { name?: string }; offers?: unknown }).find((entry) => entry["@type"] === "Product");
  expect(product?.name).toContain("Trailgrip");
  expect(product?.brand?.name).toBe("Moncler");
  expect(product?.offers).toBeTruthy();
});

test("feeds and llms.txt answer with the expected shape", async ({ request }) => {
  const llms = await request.get("/llms.txt");
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toContain("/api/catalog");

  const catalog = await request.get("/api/catalog");
  expect(catalog.status()).toBe(200);
  catalogFeedSchema.parse(await catalog.json());

  const acp = await request.get("/api/acp-feed");
  expect(acp.status()).toBe(200);
  acpFeedSchema.parse(await acp.json());
});

test("request form validates and confirms", async ({ page }) => {
  await page.goto("/p/moncler-zellerfeld-trailgrip-3d-khaki");
  await page.getByRole("button", { name: /request this piece/i }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /send request/i }).click();
  await expect(dialog.getByText("Name is required")).toBeVisible();
  await dialog.getByLabel("Name").fill("Ada Lovelace");
  await dialog.getByLabel("Email").fill("ada@example.com");
  await dialog.getByLabel("Size").fill("EU 38");
  await dialog.getByLabel("Budget, GBP").fill("300");
  await dialog.getByLabel("Notes").fill("Khaki pair, if it is still there.");
  await dialog.getByRole("button", { name: /send request/i }).click();
  await expect(dialog.getByRole("status")).toHaveText(/request received/i);
});

test("konami opens the vault", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-hydrated=true]")).toBeVisible();
  for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) {
    await page.keyboard.press(key);
  }
  await expect(page.locator("[data-vault=open]")).toBeVisible();
  await expect(page.locator("[data-unlisted=true]")).toHaveCount(3);
});

test("public responses omit desk economics", async ({ request }) => {
  const paths = [
    "/",
    "/pieces",
    "/about",
    "/p/palace-oakley-logo-hood-off-white",
    "/p/stone-island-ghost-jacket",
    "/p/stone-island-dior-technical-jacket",
    "/api/catalog",
    "/api/acp-feed",
    "/llms.txt",
    "/sitemap.xml",
    "/robots.txt",
    "/studio",
  ];
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), path).toBeLessThan(500);
    const body = await response.text();
    for (const key of PRIVATE_KEYS) {
      expect(body, `${path} includes ${key}`).not.toContain(key);
    }
    expect(body, path).not.toMatch(/authConfidence[^a-zA-Z]{0,12}medium/);
  }
  const catalog = catalogFeedSchema.parse(await (await request.get("/api/catalog")).json());
  expect(catalog.items.length).toBe(6);
  expect(catalog.items.some((item) => item.availability === "in_vault")).toBe(true);
  expect(catalog.items.every((item) => item.imageStatus === "cutout")).toBe(true);
});

test("product pages lead with the cut and name the market", async ({ page }) => {
  await page.goto("/p/moncler-zellerfeld-trailgrip-3d-khaki");
  await expect(page.getByText("From Europe")).toBeVisible();
  await expect(page.getByText("Collaboration").first()).toBeVisible();
  const europe = await page.locator("main").innerText();
  expect(europe.indexOf("Collaboration")).toBeLessThan(europe.indexOf("Guide"));
  await expect(page.getByText("High confidence")).toBeVisible();

  await page.goto("/p/kapital-bandana-patchwork-42633272");
  await expect(page.getByRole("heading", { name: /bandana patchwork/i })).toBeVisible();
  await expect(page.getByText("From the UK").first()).toBeVisible();
  await expect(page.getByText("High confidence")).toHaveCount(0);
  const bandana = await page.locator("main").innerText();
  expect(bandana.indexOf("Rare from the range")).toBeLessThan(bandana.indexOf("Guide"));
});

test("studio stays gated and noindex", async ({ page }) => {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { name: "Desk" })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await page.getByLabel("Password").fill("not-the-desk");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.getByText("does not open the desk")).toBeVisible();
  await page.getByLabel("Password").fill(process.env.STUDIO_PASSWORD || "rail-desk");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Buy outright" })).toBeVisible();
  await expect(page.getByRole("link", { name: "grailed" }).first()).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Margin" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Score" })).toBeVisible();
});

test("axe finds no serious or critical issues", async ({ page }) => {
  for (const path of ["/", "/pieces", "/p/moncler-zellerfeld-trailgrip-3d-khaki"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const bad = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(bad, `${path} ${bad.map((violation) => violation.id).join(",")}`).toEqual([]);
  }
});
