import React, { useRef, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isBarberAuthenticated, clearAuthData } from '../../utils/authUtils';
import { useSubscriptionStatus } from '../../hooks/useSubscription';
import BrandLoader from '../common/BrandLoader';

/**
 * BarberProtectedRoute
 * NOTE: Previously this component returned a full-screen BrandLoader whenever `isFetching` was true.
 * React Query (or similar) triggers `isFetching` on window refocus (e.g. when switching tabs),
 * which caused the protected route to temporarily unmount its children and REMOUNT them after refetch.
 * Any local component state inside the page (e.g. form inputs) was therefore lost.
 *
 * Fix: Show a blocking loader ONLY during the initial load when there is no subscription data yet.
 * During background refetches (data already loaded + isFetching) keep children mounted and optionally
 * display a lightweight, non-blocking overlay indicator (kept simple here; can be styled further).
 */

const BarberProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { data: subData, isLoading, isFetching, error, isSuccess } = useSubscriptionStatus();
  
  // Check if barber is authenticated
  if (!isBarberAuthenticated()) {
    // Clear any invalid auth data
    clearAuthData("barber");
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Track whether we've completed the very first resolution (success OR error)
  const initialResolvedRef = useRef(false);
  const statusValue = subData?.data?.status;
  const hasResolved = !!error || isSuccess || typeof statusValue !== 'undefined';
  if (hasResolved && !initialResolvedRef.current) {
    initialResolvedRef.current = true;
  }

  // Show full-screen loader ONLY before first resolution
  const showInitialLoader = !initialResolvedRef.current && (isLoading || isFetching) && !hasResolved;
  // After initial resolution, keep children mounted; show tiny overlay on background refetches
  const pendingRefetch = initialResolvedRef.current && isFetching && !isLoading;

  // Debounce refetch overlay to avoid flicker on very fast background fetches
  const [showRefetchOverlay, setShowRefetchOverlay] = useState(false);
  const [refetchStartTime, setRefetchStartTime] = useState(null);
  
  useEffect(() => {
    let t;
    if (pendingRefetch) {
      // Track when refetch started
      if (!refetchStartTime) {
        setRefetchStartTime(Date.now());
      }
      
      // Only show overlay after 1 second AND if refetch is still ongoing
      t = setTimeout(() => {
        const elapsed = Date.now() - (refetchStartTime || Date.now());
        if (elapsed >= 1000 && pendingRefetch) {
          setShowRefetchOverlay(true);
        }
      }, 1000); // 1 second debounce
    } else {
      // Reset when refetch completes
      setShowRefetchOverlay(false);
      setRefetchStartTime(null);
    }
    return () => t && clearTimeout(t);
  }, [pendingRefetch, refetchStartTime]);

  if (showInitialLoader) {
    return <BrandLoader label="Loading" fullscreen />;
  }

  // If status cannot be verified or indicates no valid access, redirect to subscription required page
  if (error) {
    return <Navigate to="/subscription-required" replace />;
  }

  const status = subData?.data?.status;
  const daysLeft = subData?.data?.daysLeft;
  const hasActiveSubscription = status === "active";
  const trialActive =
    status === "trialing" &&
    (typeof daysLeft === "number" ? daysLeft > 0 : true);
  const allowed = hasActiveSubscription || trialActive;

  // Allow onboarding routes when status is 'none' (trial not started yet)
  const path = location.pathname;
  const onboardingPaths = [
    "/configuration",
    "/location",
    "/business-hours",
    "/services",
    "/welcome",
  ];
  const isOnboarding = onboardingPaths.some((p) => path.startsWith(p));
  const isTrialAvailable = status == null || status === "none";

  if (!allowed) {
    if (isTrialAvailable && isOnboarding) {
      return children;
    }
    return <Navigate to="/subscription-required" replace />;
  }

  // User is authenticated and has barber privileges
  return (
    <>
      {children}
      {showRefetchOverlay && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: 'translateY(0)',
            animation: 'slideInFromTop 0.3s ease-out'
          }}
          aria-live="polite"
          role="status"
        >
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #323334',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151',
            whiteSpace: 'nowrap'
          }}>
            Updating...
          </span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes slideInFromTop {
              0% { 
                transform: translateY(-100%); 
                opacity: 0; 
              }
              100% { 
                transform: translateY(0); 
                opacity: 1; 
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default BarberProtectedRoute;
