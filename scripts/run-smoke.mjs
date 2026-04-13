import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

const getArgValue = (name) => {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const hasFlag = (flag) => args.includes(flag);

const remote = hasFlag("--remote");
const skipBuild = hasFlag("--skip-build");
const baseUrl = getArgValue("--base-url");
const apiUrl = getArgValue("--api-url");

const env = {
  ...process.env,
  SMOKE_REMOTE: remote ? "1" : "0",
};

if (baseUrl) {
  env.SMOKE_BASE_URL = baseUrl;
}

if (apiUrl) {
  env.SMOKE_API_URL = apiUrl;
}

if (process.env.SMOKE_BARBER_EMAIL) {
  env.SMOKE_BARBER_EMAIL = process.env.SMOKE_BARBER_EMAIL;
}

if (process.env.SMOKE_BARBER_PASSWORD) {
  env.SMOKE_BARBER_PASSWORD = process.env.SMOKE_BARBER_PASSWORD;
}

if (process.env.SMOKE_VERCEL_PROTECTION_BYPASS) {
  env.SMOKE_VERCEL_PROTECTION_BYPASS = process.env.SMOKE_VERCEL_PROTECTION_BYPASS;
}

if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  env.VERCEL_AUTOMATION_BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
}

if (process.env.SMOKE_VERCEL_SET_BYPASS_COOKIE) {
  env.SMOKE_VERCEL_SET_BYPASS_COOKIE = process.env.SMOKE_VERCEL_SET_BYPASS_COOKIE;
}

if (!remote && !skipBuild) {
  const buildResult = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
    env,
  });

  if (buildResult.status !== 0) {
    process.exit(buildResult.status ?? 1);
  }
}

const testResult = spawnSync("npx", ["playwright", "test"], {
  stdio: "inherit",
  shell: true,
  env,
});

process.exit(testResult.status ?? 1);
