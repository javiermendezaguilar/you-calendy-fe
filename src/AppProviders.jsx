import React from "react";
import App from "./App.jsx";
import "./index.css";
import "./i18n.js";
import { BrowserRouter, useLocation } from "react-router-dom";
import QueryProvider from "./configs/query.config.jsx";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import { Toaster as SonnerToaster } from "sonner";
import { AnalyticsProvider } from "./contexts/AnalyticsContext.jsx";
import BatchTranslationBoundary from "./contexts/BatchTranslationBoundary.jsx";
import {
  isLightweightPublicPath,
  needsRegistrationStore,
} from "./utils/routeRuntimeProfile.js";

function AppProviderTree() {
  const { pathname } = useLocation();
  const useLightweightPublicRuntime = isLightweightPublicPath(pathname);
  const useRegistrationStore = needsRegistrationStore(pathname);

  let tree = (
    <MantineProvider>
      <BatchTranslationBoundary>
        <QueryProvider>
          <App />
          <SonnerToaster richColors position="top-right" />
        </QueryProvider>
      </BatchTranslationBoundary>
    </MantineProvider>
  );

  if (!useLightweightPublicRuntime) {
    tree = <AnalyticsProvider>{tree}</AnalyticsProvider>;
  }

  if (useRegistrationStore) {
    tree = (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {tree}
        </PersistGate>
      </Provider>
    );
  }

  return tree;
}

export default function AppProviders() {
  return (
    <BrowserRouter>
      <AppProviderTree />
    </BrowserRouter>
  );
}
