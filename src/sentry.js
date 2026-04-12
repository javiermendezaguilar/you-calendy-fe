import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const environment =
  import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "production";
const release =
  import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA ||
  import.meta.env.VITE_GIT_COMMIT_SHA ||
  undefined;
const tracesSampleRate = Number(
  import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.2
);
const replaysSessionSampleRate = Number(
  import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0.05
);
const replaysOnErrorSampleRate = Number(
  import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 1.0
);

if (dsn && import.meta.env.VITE_SENTRY_ENABLED !== "false") {
  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: Number.isFinite(tracesSampleRate)
      ? tracesSampleRate
      : 0.2,
    replaysSessionSampleRate: Number.isFinite(replaysSessionSampleRate)
      ? replaysSessionSampleRate
      : 0.05,
    replaysOnErrorSampleRate: Number.isFinite(replaysOnErrorSampleRate)
      ? replaysOnErrorSampleRate
      : 1.0,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/groomnest\.com/,
      /^https:\/\/www\.groomnest\.com/,
      /^https:\/\/api\.groomnest\.com/,
      /^https:\/\/you-calendy-be-production\.up\.railway\.app/,
      /^https:\/\/.*\.railway\.app/,
    ],
  });
}
