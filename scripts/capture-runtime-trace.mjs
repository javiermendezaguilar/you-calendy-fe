/* global process */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.RUNTIME_BASE_URL || "https://staging.groomnest.com";
const API_URL = process.env.RUNTIME_API_URL || "https://api.groomnest.com";
const BASE_ORIGIN = new URL(BASE_URL).origin;
const API_ORIGIN = new URL(API_URL).origin;
const BARBER_EMAIL = process.env.SMOKE_BARBER_EMAIL;
const BARBER_PASSWORD = process.env.SMOKE_BARBER_PASSWORD;
const VERCEL_PROTECTION_BYPASS =
  process.env.SMOKE_VERCEL_PROTECTION_BYPASS || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const VERCEL_SET_BYPASS_COOKIE = process.env.SMOKE_VERCEL_SET_BYPASS_COOKIE || "true";

const OUTPUT_DIR = path.resolve(process.cwd(), "artifacts", "runtime-trace");
const TRACE_PATH = path.join(OUTPUT_DIR, "dashboard-clients-trace.json");
const SUMMARY_PATH = path.join(OUTPUT_DIR, "dashboard-clients-summary.json");

if (!BARBER_EMAIL || !BARBER_PASSWORD) {
  throw new Error("SMOKE_BARBER_EMAIL and SMOKE_BARBER_PASSWORD are required");
}

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

const toMetricMap = (metrics) =>
  Object.fromEntries(metrics.map(({ name, value }) => [name, value]));

const rounded = (value) => (Number.isFinite(value) ? Number(value.toFixed(2)) : null);

const getResourceSummary = async (page) =>
  page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    const sum = (selector) => resources.reduce((acc, entry) => acc + (selector(entry) || 0), 0);

    return {
      resourceCount: resources.length,
      scriptCount: resources.filter((entry) => entry.initiatorType === "script").length,
      transferSizeKb: Number((sum((entry) => entry.transferSize) / 1024).toFixed(2)),
      decodedBodySizeKb: Number((sum((entry) => entry.decodedBodySize) / 1024).toFixed(2)),
    };
  });

const main = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  try {
    await ensurePreviewBypassCookie(page);

    await client.send("Performance.enable", { timeDomain: "threadTicks" });

    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.getByLabel(/email input/i).fill(BARBER_EMAIL);
    await page.getByLabel(/password input/i).fill(BARBER_PASSWORD);
    await page.getByRole("button", { name: /login with email/i }).click();
    await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 20_000 });
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.goto(`${BASE_URL}/dashboard/clients`, { waitUntil: "domcontentloaded" });
    await page.locator("body").getByText(/client|clients/i).first().waitFor({ timeout: 20_000 });

    const beforeMetrics = toMetricMap((await client.send("Performance.getMetrics")).metrics);
    const traceStart = Date.now();

    await browser.startTracing(page, {
      path: TRACE_PATH,
      screenshots: true,
    });

    let responses = 0;
    const onResponse = (response) => {
      const responseOrigin = new URL(response.url()).origin;
      if (responseOrigin === BASE_ORIGIN || responseOrigin === API_ORIGIN) {
        responses += 1;
      }
    };

    page.on("response", onResponse);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("body").getByText(/client|clients/i).first().waitFor({ timeout: 20_000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    page.off("response", onResponse);

    await browser.stopTracing();

    const afterMetrics = toMetricMap((await client.send("Performance.getMetrics")).metrics);
    const resources = await getResourceSummary(page);
    const traceDurationMs = Date.now() - traceStart;

    const summary = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      apiUrl: API_URL,
      route: "/dashboard/clients",
      tracePath: path.basename(TRACE_PATH),
      measuredReload: {
        durationMs: traceDurationMs,
        responses,
        ...resources,
      },
      cdpMetricsDelta: {
        scriptDurationMs: rounded(((afterMetrics.ScriptDuration || 0) - (beforeMetrics.ScriptDuration || 0)) * 1000),
        taskDurationMs: rounded(((afterMetrics.TaskDuration || 0) - (beforeMetrics.TaskDuration || 0)) * 1000),
        layoutDurationMs: rounded(((afterMetrics.LayoutDuration || 0) - (beforeMetrics.LayoutDuration || 0)) * 1000),
        recalcStyleDurationMs: rounded(
          ((afterMetrics.RecalcStyleDuration || 0) - (beforeMetrics.RecalcStyleDuration || 0)) * 1000,
        ),
        jsHeapUsedSizeKb: rounded((afterMetrics.JSHeapUsedSize || 0) / 1024),
        nodes: rounded(afterMetrics.Nodes || 0),
      },
    };

    await fs.writeFile(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
};

await main();
