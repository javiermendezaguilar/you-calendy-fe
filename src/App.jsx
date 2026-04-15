import Router from "./routers/Router";
import "./App.css";
import { usePageTracking } from "./hooks/useAnalytics";
import { useAuthManager } from "./hooks/useAuthManager";
import { setupGlobalErrorHandlers } from "./utils/apiErrorHandler";
import { useEffect } from "react";
import React from "react";
import { processInvitationFromUrl } from "./utils/invitationUtils";
import GlobalBlockingLoader from "./components/common/GlobalBlockingLoader";
import { isCurrentContextAuthenticated } from "./utils/authUtils";
import { useLocation } from "react-router-dom";
import { isLightweightPublicPath } from "./utils/routeRuntimeProfile";

function App() {
  const location = useLocation();
  const shouldInitializeAuthManager = isCurrentContextAuthenticated();
  const shouldRenderGlobalBlockingLoader = !isLightweightPublicPath(
    location.pathname
  );

  // Enable automatic page tracking
  usePageTracking();
  
  // Initialize authentication manager
  useAuthManager(shouldInitializeAuthManager);

  // Process invitation token from URL on app load
  useEffect(() => {
    processInvitationFromUrl();
  }, []);

  // Setup global error handlers on app initialization
  React.useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <>
      {/* Global blocking loader shows only on first truly blocking data fetch */}
      {shouldRenderGlobalBlockingLoader ? (
        <GlobalBlockingLoader delay={200} blockingQueryKeys={["subscriptionStatus", "me"]} />
      ) : null}
      <Router />
    </>
  );
}

export default App;
