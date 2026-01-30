/**
 * API Retry Utility
 * Provides retry logic with exponential backoff for failed API requests
 */

/**
 * Retry failed API requests with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Promise} - Result of successful request
 */
export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      const status = error.response?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw error;
      }
      
      // Don't retry if no more attempts
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Don't retry if explicitly marked as non-retryable
      if (error.noRetry) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const baseDelay = initialDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
      const delay = baseDelay + jitter;
      
      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying after ${Math.round(delay)}ms...`);
      console.log(`[Retry] Error:`, error.message || error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if error is retryable
 * @param {Error} error - Error object to check
 * @returns {boolean} - True if error should be retried
 */
export const isRetryableError = (error) => {
  // Network errors (no response from server)
  if (error.isNetworkError) return true;
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') return true;
  if (error.message?.toLowerCase().includes('timeout')) return true;
  
  // Server errors (5xx)
  const status = error.response?.status;
  if (status && status >= 500) return true;
  
  // Rate limit (429) - should retry with backoff
  if (status === 429) return true;
  
  // Connection errors
  if (error.code === 'ENOTFOUND') return true;
  if (error.code === 'ECONNREFUSED') return true;
  if (error.code === 'ETIMEDOUT') return true;
  
  return false;
};

/**
 * Retry with custom configuration for specific endpoints
 * @param {Function} fn - Function to retry
 * @param {Object} config - Retry configuration
 * @returns {Promise} - Result of successful request
 */
export const retryWithConfig = async (fn, config = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = isRetryableError,
    onRetry = null
  } = config;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Don't retry if no more attempts
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const baseDelay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.3 * baseDelay;
      const delay = baseDelay + jitter;
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, error);
      }
      
      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying after ${Math.round(delay)}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Retry configuration presets for different scenarios
 */
export const retryPresets = {
  // Fast retry for quick operations
  fast: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000
  },
  
  // Standard retry for most operations
  standard: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000
  },
  
  // Patient retry for slow networks (mobile)
  patient: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000
  },
  
  // Critical operations that must succeed
  critical: {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 60000
  }
};

/**
 * Create a retryable version of an API function
 * @param {Function} apiFn - API function to wrap
 * @param {Object} config - Retry configuration
 * @returns {Function} - Wrapped function with retry logic
 */
export const makeRetryable = (apiFn, config = retryPresets.standard) => {
  return async (...args) => {
    return retryWithConfig(() => apiFn(...args), config);
  };
};

export default {
  retryWithBackoff,
  retryWithConfig,
  isRetryableError,
  retryPresets,
  makeRetryable
};
