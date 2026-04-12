import { test, expect } from "@playwright/test";

const API_URL = process.env.SMOKE_API_URL || "https://api.groomnest.com";
const BASE_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4173";
const BASE_ORIGIN = new URL(BASE_URL).origin;
const API_ORIGIN = new URL(API_URL).origin;
const BASE_HOSTNAME = new URL(BASE_URL).hostname;
const BARBER_EMAIL = process.env.SMOKE_BARBER_EMAIL;
const BARBER_PASSWORD = process.env.SMOKE_BARBER_PASSWORD;
const IS_REMOTE = process.env.SMOKE_REMOTE === "1";
const VERCEL_PROTECTION_BYPASS =
  process.env.SMOKE_VERCEL_PROTECTION_BYPASS || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const VERCEL_SET_BYPASS_COOKIE = process.env.SMOKE_VERCEL_SET_BYPASS_COOKIE || "true";
const IS_CANONICAL_AUTH_HOST = /(^|\.)groomnest\.com$/i.test(BASE_HOSTNAME);
const ALLOW_NON_CANONICAL_AUTH_SMOKE = process.env.SMOKE_ALLOW_NON_CANONICAL_AUTH === "1";
const CAN_RUN_AUTH_SMOKE =
  Boolean(BARBER_EMAIL && BARBER_PASSWORD) &&
  IS_REMOTE &&
  BASE_URL.startsWith("https://") &&
  (IS_CANONICAL_AUTH_HOST || ALLOW_NON_CANONICAL_AUTH_SMOKE);

const NON_BLOCKING_CONSOLE_PATTERNS = [
  /favicon/i,
  /failed to load resource.*\.map/i,
  /failed to load resource: the server responded with a status of 401/i,
  /failed to load resource: the server responded with a status of 403 \(\)/i,
  /ingest\.de\.sentry\.io/i,
];

const NON_BLOCKING_RESOURCE_PATTERNS = [/ingest\.de\.sentry\.io/i];

const isBlockingConsoleError = (message) => {
  return !NON_BLOCKING_CONSOLE_PATTERNS.some((pattern) => pattern.test(message));
};

const attachRuntimeCollectors = (page) => {
  const consoleErrors = [];
  const pageErrors = [];
  const serverErrors = [];
  const clientErrors = [];
  const requestFailures = [];
  const resourceErrors = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (isBlockingConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("response", (response) => {
    const url = response.url();
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${url}`);
      return;
    }

    if (response.status() >= 400 && !NON_BLOCKING_RESOURCE_PATTERNS.some((pattern) => pattern.test(url))) {
      resourceErrors.push(`${response.status()} ${url}`);
    }

    if (response.status() >= 400 && (url.startsWith(BASE_ORIGIN) || url.startsWith(API_ORIGIN))) {
      clientErrors.push(`${response.status()} ${url}`);
    }
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    if (!(url.startsWith(BASE_ORIGIN) || url.startsWith(API_ORIGIN))) {
      return;
    }

    requestFailures.push(`${request.method()} ${url} :: ${request.failure()?.errorText || "request failed"}`);
  });

  return { consoleErrors, pageErrors, serverErrors, clientErrors, requestFailures, resourceErrors };
};

const assertNoRuntimeFailures = async (page, collectors) => {
  await expect(page.locator("body")).not.toContainText(/Frontend runtime error/i);
  expect.soft(collectors.clientErrors, "client errors").toEqual([]);
  expect.soft(collectors.resourceErrors, "resource errors").toEqual([]);
  expect.soft(collectors.requestFailures, "request failures").toEqual([]);
  expect(collectors.clientErrors, "client errors").toEqual([]);
  expect(collectors.resourceErrors, "resource errors").toEqual([]);
  expect(collectors.requestFailures, "request failures").toEqual([]);
  expect.soft(collectors.consoleErrors, "console errors").toEqual([]);
  expect.soft(collectors.pageErrors, "page errors").toEqual([]);
  expect.soft(collectors.serverErrors, "server errors").toEqual([]);
  expect(collectors.consoleErrors, "console errors").toEqual([]);
  expect(collectors.pageErrors, "page errors").toEqual([]);
  expect(collectors.serverErrors, "server errors").toEqual([]);
};

const assertNotBlank = async (page) => {
  await expect(page.locator("#root")).toBeVisible();

  await expect
    .poll(async () => {
      const rootHtml = await page.locator("#root").innerHTML();
      return rootHtml.replace(/\s+/g, "").trim().length;
    })
    .toBeGreaterThan(200);
};

const assertNotInterceptedByPlatformAuth = async (page) => {
  const currentUrl = page.url();

  if (currentUrl.startsWith(BASE_ORIGIN)) {
    return;
  }

  if (/vercel\.com\/login/i.test(currentUrl)) {
    const bypassHint = VERCEL_PROTECTION_BYPASS
      ? "A bypass secret is configured, so it is likely invalid for this deployment or the preview was not rebuilt after rotating the secret."
      : "No Vercel automation bypass secret is configured for this smoke run.";
    throw new Error(
      `Remote smoke target is protected by Vercel Authentication and redirected to ${currentUrl}. ${bypassHint}`,
    );
  }

  throw new Error(`Remote smoke navigated outside expected origin: ${currentUrl}`);
};

const ensurePreviewBypassCookie = async (page) => {
  if (!IS_REMOTE || !VERCEL_PROTECTION_BYPASS || !BASE_URL.startsWith("https://")) {
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
    throw new Error("Vercel bypass response did not return a Set-Cookie header");
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
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);

  const cookies = await page.context().cookies(BASE_ORIGIN);
  if (!cookies.some((cookie) => cookie.name === cookieName)) {
    throw new Error(`Failed to seed Vercel bypass cookie ${cookieName} in browser context`);
  }
};

const getBypassedRoute = (path) => {
  return path;
};

const openStableRoute = async (page, path) => {
  const collectors = attachRuntimeCollectors(page);
  await ensurePreviewBypassCookie(page);
  await page.goto(getBypassedRoute(path), { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await assertNotInterceptedByPlatformAuth(page);
  await assertNoRuntimeFailures(page, collectors);
  await assertNotBlank(page);
  return collectors;
};

test("canonical backend health responds", async ({ request }) => {
  const response = await request.get(API_URL, { failOnStatusCode: false });
  expect(response.ok()).toBeTruthy();
});

test("home route renders without blank screen", async ({ page }) => {
  await openStableRoute(page, "/");
  await expect(page.locator("body")).toContainText(/grow your/i);
  await expect(page.locator("body")).toContainText(/get started for free/i);
});

test("login route renders and exposes the email login flow", async ({ page }) => {
  await openStableRoute(page, "/login");
  await expect(page.getByRole("button", { name: /login with email/i })).toBeVisible();
  await expect(page.getByLabel(/email input/i)).toBeVisible();
  await expect(page.getByLabel(/password input/i)).toBeVisible();
});

test("registration route renders and exposes sign-up flow", async ({ page }) => {
  await openStableRoute(page, "/registration");
  await expect(page.locator("body")).toContainText(/sign up to start managing your appointments/i);
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});

test("forgot password route renders recovery flow", async ({ page }) => {
  await openStableRoute(page, "/forgot-password");
  await expect(page.getByRole("button", { name: /send reset code/i })).toBeVisible();
  await expect(page.getByLabel(/email input/i)).toBeVisible();
});

test("barber dashboard redirects unauthenticated users to login without breaking", async ({ page }) => {
  await openStableRoute(page, "/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: /login with email/i })).toBeVisible();
});

test("admin protected routes redirect unauthenticated users to admin login", async ({ page }) => {
  await openStableRoute(page, "/admin/dashboard");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("button", { name: /admin login/i })).toBeVisible();
});

test("barber login reaches the real dashboard when smoke credentials are provided", async ({ page }) => {
  test.skip(
    !CAN_RUN_AUTH_SMOKE,
    "Authenticated smoke only runs against remote HTTPS canonical hosts with configured credentials, unless explicitly overridden",
  );

  const collectors = attachRuntimeCollectors(page);

  await ensurePreviewBypassCookie(page);
  await page.goto(getBypassedRoute("/login"), { waitUntil: "domcontentloaded" });
  await assertNotInterceptedByPlatformAuth(page);
  await page.getByLabel(/email input/i).fill(BARBER_EMAIL);
  await page.getByLabel(/password input/i).fill(BARBER_PASSWORD);
  await page.getByRole("button", { name: /login with email/i }).click();

  await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 20_000 });
  await page.waitForLoadState("networkidle").catch(() => {});

  await assertNoRuntimeFailures(page, collectors);
  await assertNotBlank(page);
  await expect(page.locator("body")).toContainText(/updating|appointment|marketing|clients|support/i);
});
