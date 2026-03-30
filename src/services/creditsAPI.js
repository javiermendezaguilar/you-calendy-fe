import { axiosInstance } from '../configs/axios.config';

// Public routes
/**
 * Get all available credit products
 * @returns {Promise} API response with credit products
 */
export const getCreditProducts = () => axiosInstance.get('/credits/products');

// Barber routes (require authentication)
/**
 * Create a checkout session for purchasing credits
 * @param {Object} checkoutData - Checkout session data
 * @param {string} checkoutData.productId - Credit product ID
 * @param {number} checkoutData.quantity - Quantity to purchase
 * @param {string} checkoutData.successUrl - Success redirect URL
 * @param {string} checkoutData.cancelUrl - Cancel redirect URL
 * @returns {Promise} API response with checkout session URL
 */
export const createCheckoutSession = (checkoutData) => axiosInstance.post('/credits/checkout', checkoutData);

// Admin routes (require admin authentication)
/**
 * Create a new credit product (Admin only)
 * @param {Object} productData - Credit product data
 * @param {string} productData.title - Product title
 * @param {string} productData.description - Product description
 * @param {number} productData.amount - Price amount in cents
 * @param {string} productData.currency - Currency code (e.g., 'usd')
 * @param {number} productData.smsCredits - Number of SMS credits
 * @param {number} productData.emailCredits - Number of email credits
 * @returns {Promise} API response with created product
 */
export const createCreditProduct = (productData) => axiosInstance.post('/credits/products', productData);

/**
 * Update an existing credit product (Admin only)
 * @param {string} productId - Credit product ID
 * @param {Object} updateData - Updated product data
 * @returns {Promise} API response with updated product
 */
export const updateCreditProduct = (productId, updateData) => axiosInstance.put(`/credits/products/${productId}`, updateData);

/**
 * Get all credit products for admin (includes inactive products)
 * @returns {Promise} API response with all credit products
 */
export const getAdminCreditProducts = () => axiosInstance.get('/credits/products');

/**
 * Alternative admin endpoint (fallback)
 * @returns {Promise} API response with all credit products
 */
export const getAdminCreditProductsAlt = () => axiosInstance.get('/admin/credits/products');

/**
 * Delete a credit product (Admin only)
 * @param {string} productId - Credit product ID
 * @returns {Promise} API response
 */
export const deleteCreditProduct = (productId) => axiosInstance.delete(`/credits/products/${productId}`);

// Credits API service object for backward compatibility
export const creditsAPI = {
  getCreditProducts,
  createCheckoutSession,
  createCreditProduct,
  updateCreditProduct,
  getAdminCreditProducts,
  deleteCreditProduct,
};

export default creditsAPI;