import ClientModel from '../models/ClientModel';

/**
 * Service for managing client no-show penalties
 */
const penaltyService = {
  /**
   * Add a no-show penalty to a client
   * @param {string} clientId - The client's ID
   * @param {Object} penaltyData - Penalty details
   * @returns {Promise<Object>} - Result of the operation
   */
  addPenalty: async (clientId, penaltyData) => {
    try {
      console.log('Adding penalty for client', { clientId, penaltyData });
      
      return {
        success: true,
        message: 'Penalty added successfully',
        data: {
          id: `penalty-${Date.now()}`,
          clientId,
          amount: penaltyData.amount,
          date: new Date().toISOString(),
          reason: penaltyData.reason || 'No-show',
          paid: false,
          appointmentId: penaltyData.appointmentId,
        }
      };
    } catch (error) {
      console.error('Error adding penalty:', error);
      return {
        success: false,
        message: 'Failed to add penalty',
        error: error.message
      };
    }
  },

  /**
   * Mark a penalty as paid
   * @param {string} penaltyId - The penalty ID
   * @returns {Promise<Object>} - Result of the operation
   */
  markPenaltyAsPaid: async (penaltyId) => {
    try {
      console.log('Marking penalty as paid', { penaltyId });
      
      return {
        success: true,
        message: 'Penalty marked as paid',
        data: {
          id: penaltyId,
          paid: true,
          paidDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error marking penalty as paid:', error);
      return {
        success: false,
        message: 'Failed to mark penalty as paid',
        error: error.message
      };
    }
  },

  /**
   * Get penalties for a client
   * @param {string} clientId - The client's ID
   * @returns {Promise<Object>} - Result of the operation with penalties data
   */
  getClientPenalties: async (clientId) => {
    try {
      console.log('Getting penalties for client', { clientId });
      
      const mockPenalties = [
        {
          id: 'penalty-1',
          clientId,
          amount: 20,
          date: '2025-03-15T10:00:00Z',
          reason: 'No-show',
          paid: false,
          appointmentId: 'appt-123'
        },
        {
          id: 'penalty-2',
          clientId,
          amount: 15,
          date: '2025-02-20T14:30:00Z',
          reason: 'No-show',
          paid: true,
          paidDate: '2025-02-25T09:15:00Z',
          appointmentId: 'appt-456'
        }
      ];
      
      return {
        success: true,
        message: 'Penalties retrieved successfully',
        data: mockPenalties
      };
    } catch (error) {
      console.error('Error getting client penalties:', error);
      return {
        success: false,
        message: 'Failed to get penalties',
        error: error.message
      };
    }
  },

  /**
   * Check if a client has any unpaid penalties
   * @param {string} clientId - The client's ID
   * @returns {Promise<Object>} - Result with hasUnpaidPenalties flag
   */
  checkForUnpaidPenalties: async (clientId) => {
    try {
      const result = await penaltyService.getClientPenalties(clientId);
      
      if (result.success) {
        const hasUnpaid = result.data.some(penalty => !penalty.paid);
        const totalUnpaid = result.data
          .filter(penalty => !penalty.paid)
          .reduce((total, penalty) => total + penalty.amount, 0);
        
        return {
          success: true,
          data: {
            hasUnpaidPenalties: hasUnpaid,
            totalAmount: totalUnpaid,
            penalties: result.data.filter(penalty => !penalty.paid)
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error checking for unpaid penalties:', error);
      return {
        success: false,
        message: 'Failed to check for unpaid penalties',
        error: error.message
      };
    }
  }
};

export default penaltyService; 
