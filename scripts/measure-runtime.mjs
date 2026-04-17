/* global process */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.RUNTIME_BASE_URL || process.env.SMOKE_BASE_URL || "https://staging.groomnest.com";
const API_URL = process.env.RUNTIME_API_URL || process.env.SMOKE_API_URL || "https://api.groomnest.com";
const BASE_ORIGIN = new URL(BASE_URL).origin;
const API_ORIGIN = new URL(API_URL).origin;
const BARBER_EMAIL = process.env.SMOKE_BARBER_EMAIL;
const BARBER_PASSWORD = process.env.SMOKE_BARBER_PASSWORD;
const VERCEL_PROTECTION_BYPASS =
  process.env.SMOKE_VERCEL_PROTECTION_BYPASS || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const VERCEL_SET_BYPASS_COOKIE = process.env.SMOKE_VERCEL_SET_BYPASS_COOKIE || "true";
const OUTPUT_PATH = path.resolve(process.cwd(), "artifacts", "runtime-measure.json");

if (!BARBER_EMAIL || !BARBER_PASSWORD) {
  throw new Error("SMOKE_BARBER_EMAIL and SMOKE_BARBER_PASSWORD are required");
}

const countUsefulResources = async (page) => {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    const asNumber = (value) => (Number.isFinite(value) ? Number(value.toFixed(2)) : null);
    return {
      resourceCount: resources.length,
      scriptCount: resources.filter((entry) => entry.initiatorType === "script").length,
      transferSizeKb: asNumber(resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0) / 1024),
      decodedBodySizeKb: asNumber(resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0) / 1024),
    };
  });
};

const waitForClientsFirstUsable = async (page) => {
  await page
    .locator('[data-testid="clients-table-ready"], [data-testid="clients-table-empty"]')
    .first()
    .waitFor({ timeout: 20_000 });
};

const ensurePreviewBypassCookie = async (page) => {
  if (!VERCEL_PROTECTION_BYPASS || !BASE_URL.startsWith("https://")) {
    return;
  }

  const bypassUrl = new URL(BASE_URL);
  bypassUrl.searchParams.set("x-vercel-protection-bypass", VERCEL_PROTECTION_BYPASS);
  bypassUrl.searchParams.set("x-vercel-set-bypass-cookie", VERCEL_SET_BYPASS_COOKIE);

  const response = await page.request.get(bypassUrl.toString(), {
    failOnStatusCode: false,
    maxRedirects: 0,
  });

  const setCookieHeader = response.headers()["set-cookie"];
  if (!setCookieHeader) {
    return;
  }

  const [cookiePair] = setCookieHeader.split(";", 1);
  const [cookieName, ...cookieValueParts] = cookiePair.split("=");
  const cookieValue = cookieValueParts.join("=");

  if (!cookieName || !cookieValue) {
    throw new Error("Unable to parse Vercel bypass cookie from Set-Cookie header");
  }

  await page.context().addCookies([
    {
      name: cookieName,
      value: cookieValue,
      url: BASE_ORIGIN,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
};

const measureStep = async (page, label, action, options = {}) => {
  let responses = 0;
  const onResponse = (response) => {
    const url = response.url();
    if (url.startsWith(BASE_ORIGIN) || url.startsWith(API_ORIGIN)) {
      responses += 1;
    }
  };

  page.on("response", onResponse);
  await page.evaluate(() => {
    performance.clearResourceTimings();
  });

  const startedAt = Date.now();
  const actionResult = await action();
  const firstUsableMs = options.firstUsableWait ? Date.now() - startedAt : null;
  await page.waitForLoadState("networkidle").catch(() => {});
  const durationMs = Date.now() - startedAt;

  page.off("response", onResponse);

  const resources = await countUsefulResources(page);
  return {
    label,
    finalUrl: page.url(),
    durationMs,
    firstUsableMs,
    responses,
    ...resources,
    ...(actionResult && typeof actionResult === "object" ? actionResult : {}),
  };
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
  });

  try {
    await ensurePreviewBypassCookie(page);

    const results = [];

    results.push(
      await measureStep(page, "login_page", async () => {
        await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      }),
    );

    results.push(
      await measureStep(page, "login_to_dashboard", async () => {
        await page.getByLabel(/email input/i).fill(BARBER_EMAIL);
        await page.getByLabel(/password input/i).fill(BARBER_PASSWORD);
        await page.getByRole("button", { name: /login with email/i }).click();
        await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 20_000 });
        await page.locator("body").getByText(/appointment|marketing|clients|support/i).first().waitFor({
          timeout: 20_000,
        });
      }),
    );

    results.push(
      await measureStep(page, "dashboard_clients", async () => {
        await page.goto(`${BASE_URL}/dashboard/clients`, { waitUntil: "domcontentloaded" });
        await waitForClientsFirstUsable(page);
      }, { firstUsableWait: true }),
    );

    const payload = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      apiUrl: API_URL,
      results,
    };

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    console.log(JSON.stringify(payload, null, 2));
  } finally {
    await browser.close();
  }
};

await main();
