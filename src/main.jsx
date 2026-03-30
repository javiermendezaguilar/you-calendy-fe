import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n.js";
import { BrowserRouter } from "react-router-dom";
import QueryProvider from "./configs/query.config.jsx";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store.js';
import { Toaster as SonnerToaster } from 'sonner';
import { AnalyticsProvider } from './contexts/AnalyticsContext.jsx';
import { BatchTranslationProvider } from './contexts/BatchTranslationContext.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MantineProvider>
            <AnalyticsProvider>
              <BatchTranslationProvider>
                <QueryProvider>
                  <App />
                  <SonnerToaster richColors position="top-right" />
                </QueryProvider>
              </BatchTranslationProvider>
            </AnalyticsProvider>
          </MantineProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
