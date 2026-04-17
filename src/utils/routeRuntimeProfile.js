const LIGHTWEIGHT_PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/help-center",
  "/terms-and-conditions",
  "/privacy-policy",
]);

const REGISTRATION_FLOW_PATHS = new Set([
  "/registration",
  "/details",
  "/configuration",
  "/location",
  "/business-hours",
  "/services",
  "/welcome",
  "/plan",
]);

const EARLY_PRIVATE_BOOTSTRAP_PATHS = new Set([
  "/dashboard",
  "/dashboard/clients",
]);

export const isLightweightPublicPath = (pathname = "") =>
  LIGHTWEIGHT_PUBLIC_PATHS.has(pathname);

export const needsRegistrationStore = (pathname = "") =>
  REGISTRATION_FLOW_PATHS.has(pathname);

export const isEarlyPrivateBootstrapPath = (pathname = "") =>
  EARLY_PRIVATE_BOOTSTRAP_PATHS.has(pathname);
