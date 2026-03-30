import React, { useEffect } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

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
      <div data-i18n-skip="true">
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
};

export default QueryProvider;