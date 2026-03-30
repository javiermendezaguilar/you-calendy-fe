import React, { useEffect, useRef, useState } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import BrandLoader from './BrandLoader';

/**
 * GlobalBlockingLoader
 * Shows the full-screen BrandLoader ONLY when there are blocking queries (no cached data yet)
 * at the very start of a view (e.g., post-login) and hides on background refetches.
 *
 * Implementation details:
 * - We rely on a prop `blockingQueryKeys` passed from root (optional) to narrow which queries
 *   can block the UI. If empty, we consider all queries that currently have no data.
 * - Debounce: waits a short delay before showing to avoid flash for ultra-fast responses.
 * - Once a blocking query has produced data at least once, subsequent refetches won't trigger
 *   the full-screen loader; consumers can still show localized skeletons or overlays.
 */
const GlobalBlockingLoader = ({ delay = 180, blockingQueryKeys = [] }) => {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);
  const hasShownRef = useRef(false);

  // Whether any target queries are in a 'loading without data yet' state
  const computeBlocking = () => {
    const queries = queryClient.getQueryCache().getAll();
    return queries.some(q => {
      if (blockingQueryKeys.length && !blockingQueryKeys.some(k => JSON.stringify(q.queryKey).includes(k))) {
        return false; // not in allowed set
      }
      const hasData = typeof q.state.data !== 'undefined' && q.state.data !== null;
      const isLoading = q.state.status === 'loading';
      return isLoading && !hasData; // only block if no data yet
    });
  };

  useEffect(() => {
    const check = () => {
      const blocking = computeBlocking();
      if (blocking && !hasShownRef.current) {
        // Start debounce timer
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            setShow(true);
            hasShownRef.current = true; // after first show, we won't show again for refetches
          }, delay);
        }
      } else {
        // Not blocking anymore
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (!blocking) {
          setShow(false);
        }
      }
    };

    // Initial check
    check();

    // Subscribe to query cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe(check);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsubscribe();
    };
  }, [delay, blockingQueryKeys, queryClient]);

  if (!show) return null;
  return <BrandLoader label="Loading" fullscreen />;
};

export default GlobalBlockingLoader;
