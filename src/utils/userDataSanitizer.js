/**
 * User Data Sanitizer
 * Removes sensitive data from user objects before storing in localStorage
 */

/**
 * List of safe fields to keep in user object for localStorage
 * These are the fields actually used in the frontend
 */
const SAFE_USER_FIELDS = [
  '_id',
  'id',
  'name',
  'email',
  'phone',
  'profileImage',
  'role',
  'status',
  'isActive',
  'isNotificationEnabled',
  'notificationSettings',
  'language',
  'permissions',
  'deviceToken', // Used for push notifications
  'provider', // Used to identify auth provider
  'pendingPenalties', // Used for business logic
  'privateNotes', // Used for business notes
];

/**
 * List of sensitive fields to ALWAYS remove
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordResetToken',
  'passwordResetTokenExpires',
  '__v', // MongoDB version key
  'createdAt', // Not needed for frontend
  'updatedAt', // Not needed for frontend
];

/**
 * Sanitize user object - remove sensitive data, keep only safe fields
 * @param {Object} user - The user object from API
 * @returns {Object} - Sanitized user object with only safe fields
 */
export const sanitizeUserData = (user) => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const sanitized = {};

  // Copy only safe fields
  SAFE_USER_FIELDS.forEach(field => {
    if (user.hasOwnProperty(field)) {
      sanitized[field] = user[field];
    }
  });

  // Explicitly remove sensitive fields (in case they exist)
  SENSITIVE_FIELDS.forEach(field => {
    if (sanitized.hasOwnProperty(field)) {
      delete sanitized[field];
    }
  });

  return sanitized;
};

/**
 * Sanitize and stringify user data for localStorage
 * @param {Object} user - The user object from API
 * @returns {string} - JSON string of sanitized user object
 */
export const sanitizeAndStringifyUser = (user) => {
  const sanitized = sanitizeUserData(user);
  return JSON.stringify(sanitized);
};

