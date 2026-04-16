import React from "react";
import { Navigate } from "react-router-dom";
import BrandLoader from "../common/BrandLoader";
import { useSubscriptionStatus } from "../../hooks/useSubscription";

const BarberSubscriptionGate = ({ children }) => {
  const { data: subData, isLoading, isFetching, error, isSuccess } =
    useSubscriptionStatus();

  const statusValue = subData?.data?.status;
  const hasResolved =
    !!error || isSuccess || typeof statusValue !== "undefined";

  if ((isLoading || isFetching) && !hasResolved) {
    return <BrandLoader label="Loading" fullscreen />;
  }

  if (error) {
    return <Navigate to="/subscription-required" replace />;
  }

  const status = subData?.data?.status;
  const daysLeft = subData?.data?.daysLeft;
  const hasActiveSubscription = status === "active";
  const trialActive =
    status === "trialing" &&
    (typeof daysLeft === "number" ? daysLeft > 0 : true);

  if (!hasActiveSubscription && !trialActive) {
    return <Navigate to="/subscription-required" replace />;
  }

  return children;
};

export default BarberSubscriptionGate;
