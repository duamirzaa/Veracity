import { AxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from an API error
 * @param error The error object from a catch block
 * @param defaultMessage A fallback message if no specific error can be determined
 * @returns A clean, readable error message
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'An unexpected error occurred'): string => {
  // Log full error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('API Error Context:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message
    });
  }

  // 1. Try to get specific error message from backend response
  const data = error?.response?.data;
  const backendError = data?.error || data?.message;
  const errorCode = data?.code;

  // Handle specific application error codes
  if (errorCode) {
    switch (errorCode) {
      case 'TIER_LIMIT_EXCEEDED':
        return 'Monthly limit reached. Upgrade to Pro for unlimited analyses.';
      case 'ML_UNAVAILABLE':
        return 'The ML analysis service is currently offline. Please try again later.';
      case 'ML_TIMEOUT':
        return 'Analysis timed out. Please try a smaller code snippet.';
      case 'RATE_LIMITED':
        return 'You are sending requests too fast. Please wait a moment.';
      case 'PROJECT_LIMIT_REACHED':
        return 'You have reached the maximum number of projects for your plan.';
    }
  }

  if (backendError && typeof backendError === 'string') {
    return backendError;
  }

  // 2. Handle specific HTTP status codes with user-friendly messages
  if (error?.response?.status) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return 'Invalid data provided. Please check your input.';
      case 401:
        return 'Session expired. Please sign in again.';
      case 403:
        return 'Access denied. You may need a Pro plan for this feature.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
      case 423: // Account locked or already exists in some contexts
        return 'Email or resource is already registered.';
      case 429:
        return 'Too many requests. Please slow down and try again later.';
      case 500:
        return 'Our servers are having trouble. Please try again in a few minutes.';
      case 503:
        return 'Service is temporarily unavailable. We are working on it!';
      default:
        // If we have a status but no specific case, return a slightly cleaner generic message
        return `${defaultMessage} (Error ${status})`;
    }
  }

  // 3. Handle network/connection errors
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return 'Network connection lost. Please check your internet.';
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'The request timed out. Our servers might be busy.';
  }

  // 4. Fallback to standard Error message or default
  if (error instanceof Error && error.message && !error.message.includes('status code')) {
    return error.message;
  }

  return defaultMessage;
};
