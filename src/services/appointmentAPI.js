import { clientLogin } from './clientAPI';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.groomnest.com';

/**
 * Helper function to get user's timezone offset in minutes
 * Returns the offset in minutes (e.g., 300 for UTC+5, -300 for UTC-5)
 * 
 * JavaScript's getTimezoneOffset() returns the opposite sign:
 * - It returns minutes to SUBTRACT from UTC to get local time
 * - So for UTC+5 (Pakistan), it returns -300
 * - We need to negate it to get +300 (minutes to ADD to UTC)
 * 
 * This function automatically handles:
 * - All timezones globally (UTC-12 to UTC+14)
 * - Daylight Saving Time (DST) changes
 * - Half-hour and quarter-hour offsets (e.g., India UTC+5:30, Nepal UTC+5:45)
 * 
 * Examples:
 * - Pakistan (UTC+5): getTimezoneOffset() returns -300, function returns 300
 * - Spain (UTC+1): getTimezoneOffset() returns -60, function returns 60
 * - Spain (UTC+2 DST): getTimezoneOffset() returns -120, function returns 120
 * - India (UTC+5:30): getTimezoneOffset() returns -330, function returns 330
 * - Nepal (UTC+5:45): getTimezoneOffset() returns -345, function returns 345
 * - New York (UTC-5): getTimezoneOffset() returns 300, function returns -300
 * - New York (UTC-4 DST): getTimezoneOffset() returns 240, function returns -240
 */
const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  // getTimezoneOffset() returns minutes to subtract from UTC to get local time
  // So for UTC+5, it returns -300, and we need to return +300
  // For UTC-5, it returns 300, and we need to return -300
  return -offset;
};

/**
 * Get available time slots for a specific business and date
 * @param {string} businessId - Business ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} serviceId - Service ID (optional)
 * @param {string} staffId - Staff ID (optional)
 * @returns {Promise<Object>} Available time slots
 */
export const getAvailableTimeSlots = async (businessId, date, serviceId = null, staffId = null) => {
  try {
    // Get user's timezone offset in minutes
    // This ensures slots are filtered based on the user's local timezone
    const timezoneOffset = getTimezoneOffset();
    
    // Format date to YYYY-MM-DD in user's local timezone
    const formatLocalYmd = (d) => {
      if (!d) return null;
      const dateObj = d instanceof Date ? d : new Date(d);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const formattedDate = formatLocalYmd(date);
    if (!formattedDate) {
      throw new Error('Invalid date provided');
    }
    
    const params = new URLSearchParams({
      businessId,
      date: formattedDate,
      timezoneOffset: timezoneOffset.toString(),
      ...(serviceId && { serviceId }),
      ...(staffId && { staffId })
    });

    const response = await fetch(`${API_BASE_URL}/appointments/available?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch available time slots');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch available time slots');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    throw error;
  }
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create appointment');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Create appointment for clients with completed profiles using authenticated endpoint.
 * Uses cookie-based authentication (clientToken cookie) - no token needed in localStorage.
 * @param {FormData|Object} appointmentData - Appointment data including client info
 * @returns {Promise<Object>} Created appointment result
 */
export const createClientAppointment = async (appointmentData) => {
  try {
    // Check if appointmentData is FormData (for file uploads) or regular object
    const isFormData = appointmentData instanceof FormData;

    // Get client ID from localStorage (required to identify the client)
    const clientId = localStorage.getItem('clientId');

    if (!clientId) {
      throw new Error('Client ID is required. Please complete your profile first.');
    }

    // Add clientId to FormData if not already present
    if (isFormData && !appointmentData.has('clientId')) {
      appointmentData.append('clientId', clientId);
    }

    // Use the authenticated appointments endpoint.
    // Always send 'x-user-context: client' so the auth middleware picks the clientToken
    // cookie over any barber/admin token that may also be present in the browser.
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      credentials: 'include', // Include cookies (clientToken) in the request
      headers: {
        'x-user-context': 'client', // Ensures correct token resolution in auth middleware
      },
      body: appointmentData,
    });

    const result = await response.json();

    if (!response.ok) {
      // ────────────────────────────────────────────────────────────────────────
      // IMPORTANT: Do NOT retry on 403 (Forbidden / Blocked client).
      //
      // A 403 means the backend has explicitly rejected the booking — most likely
      // because the client is blocked due to an unexcused no-show.  If we were to
      // retry, the FormData body would already be consumed by the first fetch call
      // and the retry would send an empty body.  That causes req.body.businessId
      // to be undefined on the backend, which makes the checkNoShowBlock middleware
      // silently skip the block check and call next(), ultimately allowing the
      // appointment to be created — defeating the entire blocking mechanism.
      //
      // Surface the backend error message directly to the user instead.
      // ────────────────────────────────────────────────────────────────────────
      if (response.status === 403) {
        throw new Error(result.message || 'You are not authorized to book appointments.');
      }

      // Only attempt session refresh on 401 (Unauthenticated) — never on 403.
      // NOTE: FormData is consumed after the first fetch, so we CANNOT safely retry
      // the original request.  Refresh the cookie and ask the user to try again.
      if (response.status === 401) {
        try {
          await clientLogin(clientId);
          // Cookie refreshed — tell the user to try again (we cannot replay FormData).
          throw new Error('Session expired. Please try booking again.');
        } catch (loginError) {
          if (loginError.message === 'Session expired. Please try booking again.') {
            throw loginError;
          }
          throw new Error('Please complete your profile first to book appointments.');
        }
      }

      throw new Error(result.message || 'Failed to create appointment');
    }

    return {
      success: true,
      data: result.data || result,
    };
  } catch (error) {
    console.error('Error creating client appointment:', error);
    return {
      success: false,
      error: error.message || 'Failed to create appointment',
    };
  }
};
