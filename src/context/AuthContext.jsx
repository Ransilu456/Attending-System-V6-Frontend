import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { createContext, useContext, useState, useEffect } from 'react';

import authService  from '../services/authService';
import ToastHelper from '../components/ToastHelper';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Checking for stored authentication...');
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        console.log('Auth check:', {
          tokenExists: !!token,
          userExists: !!storedUser,
          storage: localStorage.getItem('token') ? 'localStorage' : 'sessionStorage'
        });

        if (token && storedUser) {
          // Verify token expiration
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp < currentTime) {
              console.log('Token expired, logging out');
              logout();
              return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('Valid token found, setting user:', parsedUser.email);
          } catch (tokenError) {
            console.error('Token validation error:', tokenError);
            logout();
          }
        } else {
          console.log('No valid auth data found');
          setUser(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setLoading(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Attempting login for ${email} with "Remember Me": ${rememberMe}`);
      
      const response = await authService.login({ email, password });
      
      if (!response.data || (!response.data.token && !response.data.accessToken)) {
        throw new Error('Invalid server response. Please contact support.');
      }
      
      const token = response.data.token || response.data.accessToken;
      const userData = response.data.user || response.data.admin || response.data.userData;
      
      if (!token || !userData) {
        throw new Error('Missing authentication data from server.');
      }
      
      console.log(`Login successful for ${email}. Storing in ${rememberMe ? 'localStorage' : 'sessionStorage'}`);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('rememberMe', 'false');
      }
      
      setUser(userData);
      
      ToastHelper.success('Login successful!');
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage;
      
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      ToastHelper.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.register(userData);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage;
      
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Please check your information and try again.';
      } else {
        errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out, clearing all auth storage');
    
    authService.logout()
      .then(() => {
        console.log('Logout API call successful');
      })
      .catch((error) => {
        console.error('Logout API call failed:', error);
      })
      .finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        setUser(null);
        toast.info('You have been logged out');
      });
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process request';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(token, password);
      toast.success('Password reset successful! You can now log in with your new password.');
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(data);
      const updatedUser = response.data.admin;
      
      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;