import React, { useEffect, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

const QueryProvider = ({ children }) => {
  const [ReactQueryDevtools, setReactQueryDevtools] = useState(null);

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

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    let mounted = true;

    import("@tanstack/react-query-devtools").then((mod) => {
      if (mounted) {
        setReactQueryDevtools(() => mod.ReactQueryDevtools);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools ? (
        <div data-i18n-skip="true">
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      ) : null}
    </QueryClientProvider>
  );
};

export default QueryProvider;
