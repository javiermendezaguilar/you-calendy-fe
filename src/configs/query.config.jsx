import React, { useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
let ReactQueryDevtools = null;

if (import.meta.env.DEV) {
  const devtoolsModule = await import("@tanstack/react-query-devtools");
  ReactQueryDevtools = devtoolsModule.ReactQueryDevtools;
}

const QueryProvider = ({ children }) => {
  // Reset cache on auth changes to prevent cross-user stale data (e.g., subscription status)
  useEffect(() => {
    const handler = () => {
      // Clear all queries and mutations safely
      queryClient.clear();
      // Optional: prefetch critical queries after login could go here
    };
    window.addEventListener('auth:login', handler);
    window.addEventListener('auth:logout', handler);
    return () => {
      window.removeEventListener('auth:login', handler);
      window.removeEventListener('auth:logout', handler);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && ReactQueryDevtools ? (
        <div data-i18n-skip="true">
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      ) : null}
    </QueryClientProvider>
  );
};

export default QueryProvider;
