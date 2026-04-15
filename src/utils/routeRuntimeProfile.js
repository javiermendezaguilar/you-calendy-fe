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

export const isLightweightPublicPath = (pathname = "") =>
  LIGHTWEIGHT_PUBLIC_PATHS.has(pathname);

export const needsRegistrationStore = (pathname = "") =>
  REGISTRATION_FLOW_PATHS.has(pathname);
