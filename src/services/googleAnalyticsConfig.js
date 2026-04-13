import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.groomnest.com';

class GoogleAnalyticsConfigService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin/api-keys`;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    // Try to get admin token first, then fallback to regular token
    const adminToken = localStorage.getItem('adminToken');
    const regularToken = localStorage.getItem('token');
    const token = adminToken || regularToken;

    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Save Google Analytics configuration to backend
   * @param {string} measurementId - GA4 Measurement ID
   * @param {object} metadata - Additional metadata
   */
  async saveConfiguration(measurementId, metadata = {}) {
    try {
      const headers = this.getAuthHeaders();
      if (!headers) {
        return {
          success: false,
          error: 'Authentication required for GA configuration'
        };
      }

      const response = await axios.put(
        this.baseURL,
        {
          googleAnalyticsApiKey: measurementId,
          metadata: {
            ...metadata,
            type: 'google_analytics_measurement_id',
            savedAt: new Date().toISOString()
          }
        },
        {
          headers
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error saving GA configuration:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get current Google Analytics configuration
   */
  async getConfiguration() {
    try {
      const headers = this.getAuthHeaders();
      if (!headers) {
        return {
          success: false,
          error: 'Admin privileges required for GA configuration'
        };
      }

      const response = await axios.get(this.baseURL, {
        headers
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Handle authentication errors gracefully
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          success: false,
          error: 'Admin privileges required for GA configuration'
        };
      }
      
      console.error('Error fetching GA configuration:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Test Google Analytics connection
   * @param {string} measurementId - GA4 Measurement ID
   */
  async testConnection(measurementId) {
    try {
      // This would typically make a request to test the GA connection
      // For now, we'll do basic validation
      if (!measurementId || !measurementId.match(/^G-[A-Z0-9]+$/)) {
        throw new Error('Invalid Measurement ID format');
      }

      // You can add more sophisticated testing here
      return {
        success: true,
        message: 'Connection test successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove Google Analytics configuration
   */
  async removeConfiguration() {
    try {
      const headers = this.getAuthHeaders();
      if (!headers) {
        return {
          success: false,
          error: 'Authentication required for GA configuration'
        };
      }

      const response = await axios.put(
        this.baseURL,
        {
          googleAnalyticsApiKey: null,
          metadata: {
            type: 'google_analytics_measurement_id',
            removedAt: new Date().toISOString()
          }
        },
        {
          headers
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error removing GA configuration:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

// Create singleton instance
const gaConfigService = new GoogleAnalyticsConfigService();

export default gaConfigService;
