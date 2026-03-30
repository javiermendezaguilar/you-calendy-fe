import React from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';

const InvitationRedirect = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business');
  
  // Build the redirect URL with both token and business ID - redirect to home page
  const redirectUrl = businessId 
    ? `/client?invitation_token=${token}&business=${businessId}`
    : `/client?invitation_token=${token}`;
    
  return <Navigate to={redirectUrl} replace />;
};

export default InvitationRedirect;
