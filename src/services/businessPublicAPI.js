// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
  // If we're in development mode, use localhost
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'https://api.groomnest.com';
  }
  
  // If we're in production, use production URL
  return 'https://api.groomnest.com';
};

const API_BASE_URL = getApiBaseUrl();

const normalizeWorkingHours = (workingHours) => {
  if (!workingHours) {
    return null;
  }

  if (Array.isArray(workingHours)) {
    return workingHours.reduce((acc, entry) => {
      if (!entry || !entry.day) {
        return acc;
      }

      acc[entry.day] = {
        enabled: Boolean(entry.enabled),
        shifts: (entry.shifts || []).map((shift) => ({
          start: shift.start,
          end: shift.end,
          breaks: shift.breaks || [],
        })),
      };

      return acc;
    }, {});
  }

  return workingHours;
};

/**
 * Get business gallery images
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} Business gallery images
 */
export const getBusinessGallery = async (businessId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/business/${businessId}/gallery`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching business gallery:', error);
    throw error;
  }
};

/**
 * Get business details by business ID
 * @param {string} businessId - Business ID from invitation or URL
 * @returns {Promise<Object>} Business data
 */
export const getBusinessById = async (businessId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/business/${businessId}`);
    
    if (!response.ok) {
      throw new Error('Business not found');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch business details');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching business details:', error);
    throw error;
  }
};

/**
 * Get business services by business ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} Business services
 */
export const getBusinessServices = async (businessId) => {
  try {
    // Get business data which includes services array
    const businessData = await getBusinessById(businessId);
    
    // Extract services from business data
    const services = businessData.services || [];
    
    return services;
  } catch (error) {
    console.error('Error fetching business services:', error);
    throw error;
  }
};

/**
 * Get business hours by business ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Business hours
 */
export const getBusinessHours = async (businessId) => {
  try {
    // Business hours are included in the main business object
    const businessData = await getBusinessById(businessId);
    return normalizeWorkingHours(
      businessData.businessHours || businessData.hours || null
    );
  } catch (error) {
    console.error('Error fetching business hours:', error);
    throw error;
  }
};

export const getStaffWorkingHoursClientSide = async (staffId) => {
  if (!staffId) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/business/staff/${staffId}/working-hours/client-side`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch staff working hours');
    }

    const workingHours =
      result.data?.staff?.workingHours || result.staff?.workingHours || null;

    return normalizeWorkingHours(workingHours);
  } catch (error) {
    console.error('Error fetching staff working hours:', error);
    throw error;
  }
};

/**
 * Get business staff by business ID
 * Note: This endpoint requires authentication, so for public access we'll return empty array
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} Business staff (empty for public access)
 */
export const getBusinessStaff = async () => {
  // Staff endpoints require authentication, so for public client access we return empty array
  // In a real implementation, you might want to have a public staff endpoint that returns basic info
  return [];
};

/**
 * Get client details by invitation token
 * @param {string} invitationToken - Invitation token
 * @returns {Promise<Object>} Client data with staff and business information
 */
export const getClientByInvitationToken = async (invitationToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/invitation/${invitationToken}`);
    
    if (!response.ok) {
      throw new Error('Invalid or expired invitation link');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch client details');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching client by invitation token:', error);
    throw error;
  }
};

/**
 * Get services for a specific staff member
 * @param {string} businessId - Business ID
 * @param {string} staffId - Staff ID
 * @returns {Promise<Array>} Staff-specific services
 */
export const getStaffServices = async (businessId, staffId) => {
  try {
    void staffId;
    // Get all business services
    const allServices = await getBusinessServices(businessId);
    
    // For now, we'll need to get staff details from the invitation token
    // Since there's no direct API endpoint for staff services, we'll filter on frontend
    // This is a temporary solution until a proper API endpoint is created
    return allServices;
  } catch (error) {
    console.error('Error fetching staff services:', error);
    throw error;
  }
};

/**
 * Get barber profile by link token (public access)
 * @param {string} linkToken - Barber link token
 * @returns {Promise<Object>} Barber profile data with business information
 */
export const getBarberProfileByLink = async (linkToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/barber/profile/${linkToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch barber profile');
    }
  } catch (error) {
    console.error('Error fetching barber profile by link:', error);
    throw error;
  }
};


