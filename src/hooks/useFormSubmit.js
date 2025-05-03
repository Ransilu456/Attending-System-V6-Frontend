import { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * @param {Function} submitFn 
 * @param {Object} options 
 * @returns {Object}
 */
const useFormSubmit = (submitFn, options = {}) => {
  const { onSuccess, onError, successMessage } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const result = await submitFn(formData);
      
      if (successMessage) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error('Form submission error:', error);

      e.preventDefault();
      
      let errorMessage;
      
      // Handle network errors
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } 
      // Handle server errors
      else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      // Handle validation errors
      else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Please check your information and try again.';
      }
      // Handle authentication errors
      else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      }
      // Handle other errors
      else {
        errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (onError) {
        onError(error, errorMessage);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    handleSubmit
  };
};

export default useFormSubmit; 