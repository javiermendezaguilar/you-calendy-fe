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

function App() {
  const shouldInitializeAuthManager = isCurrentContextAuthenticated();

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
      <GlobalBlockingLoader delay={200} blockingQueryKeys={["subscriptionStatus", "me"]} />
      <Router />
    </>
  );
}

export default App;
