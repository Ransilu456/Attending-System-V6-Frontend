import api from './api';
import { toast } from 'react-toastify';

const authService = {
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', { email: credentials.email, passwordProvided: !!credentials.password });
      const response = await api.post('/admin/login', credentials);

      console.log('Login response received:', {
        status: response.status,
        hasToken: !!response.data?.token || !!response.data?.accessToken,
        hasUser: !!response.data?.user || !!response.data?.admin,
        dataKeys: Object.keys(response.data || {})
      });

      if (response.data) {
        const token = response.data.token || response.data.accessToken;
        const userData = response.data.user || response.data.admin || response.data.userData;
        
        if (token) {
          localStorage.setItem('token', token);
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  },
  
  logout: async () => {
    try {
     
      const response = await api.post('/admin/logout');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      console.log('User logged out successfully');
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      if (!error.response) {
        toast.error('Cannot connect to server. Your session has been cleared locally.');
      }
      throw error;
    }
  },
  
  register: (userData) => api.post('/admin/register', userData),
  forgotPassword: async (email) => {
    try {
      console.log('Sending password reset request for email:', email);
      
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      
      const response = await api.post('/admin/forgot-password', { email });
      
      console.log('Password reset request response:', {
        status: response.status,
        success: response.status === 200
      });
      
      return response;
    } catch (error) {
      console.error('Password reset request error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        toast.error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },
  resetPassword: async (token, password) => {
    try {
      console.log('Resetting password with token');
      
      if (!token) {
        throw new Error('Reset token is required');
      }
      
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const response = await api.post(`/admin/reset-password/${token}`, { password });
      
      console.log('Password reset response:', {
        status: response.status,
        success: response.status === 200
      });
      
      return response;
    } catch (error) {
      console.error('Password reset error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid or expired reset token');
      }
      throw error;
    }
  },
  getProfile: () => api.get('/admin/me'),
  updateProfile: async (data) => {
    try {
      console.log('Updating profile with data:', { ...data, passwordProvided: false });
      const response = await api.patch('/admin/profile', data);
      
      console.log('Profile update response:', {
        status: response.status,
        hasUpdatedUser: !!response.data?.admin || !!response.data?.user,
        dataKeys: Object.keys(response.data || {})
      });
      
      if (response.data && (response.data.admin || response.data.user)) {
        const updatedUser = response.data.admin || response.data.user;
        
        if (localStorage.getItem('token')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else if (sessionStorage.getItem('token')) {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response;
    } catch (error) {
      console.error('Profile update error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      }
      throw error;
    }
  },
  updatePassword: async (data) => {
    try {
      console.log('Updating password');
      
      if (!data.currentPassword || !data.newPassword) {
        throw new Error('Current password and new password are required');
      }
      
      if (data.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      const response = await api.post('/admin/update-password', data);
      
      console.log('Password update response:', {
        status: response.status,
        success: response.status === 200
      });
      
      return response;
    } catch (error) {
      console.error('Password update error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      }
      throw error;
    }
  },
  
  refreshToken: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      return Promise.reject(new Error('No token available to refresh'));
    }
    
    // For now, this is a mock implementation that just returns the current token
    // In a real implementation, this would call the server to get a new token
    // based on a refresh token or other mechanism
    console.log('Token refresh requested - using current token as fallback');
    
    // Return the current token in the same format as the login response
    // This is a temporary solution until backend supports token refresh
    return Promise.resolve({
      data: {
        token: token
      }
    });
    
    // return api.post('/auth/refresh-token');
  },
};

export default authService;