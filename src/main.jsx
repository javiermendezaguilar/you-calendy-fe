import React from "react";
import ReactDOM from "react-dom/client";
import "./sentry.js";
import AppProviders from "./AppProviders.jsx";
import AppErrorBoundary from "./components/common/AppErrorBoundary.jsx";

const legacyFrontendHosts = new Set([
  "app.groomnest.com",
  "www.groomnest.com",
  "you-calendy-fe-three.vercel.app",
  "you-calendy-fe-pi.vercel.app",
]);

if (legacyFrontendHosts.has(window.location.hostname)) {
  const redirectUrl = `https://groomnest.com${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(redirectUrl);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders />
    </AppErrorBoundary>
  </React.StrictMode>
);
