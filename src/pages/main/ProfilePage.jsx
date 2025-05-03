import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ToastHelper from '../../components/ToastHelper';
import { motion } from 'framer-motion';

import authService from '../../services/authService';

const ProfilePage = () => {
  const { user, updateProfile: updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      
      // Check if we have the updated user data in the response
      if (response.data && (response.data.user || response.data.admin)) {
        const updatedUser = response.data.user || response.data.admin;
        updateUserProfile(updatedUser);
        ToastHelper.success('Profile updated successfully');
      } else {
        console.error('Invalid response format:', response);
        ToastHelper.error('Received invalid response from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      ToastHelper.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      ToastHelper.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      ToastHelper.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Profile Settings</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profile Information */}
          <motion.div 
            className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 sm:py-5 sm:px-6 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Profile Information</h3>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500 dark:text-gray-300">Update your personal details</p>
            </div>
            <div className="px-4 py-4 sm:py-5 sm:p-6">
              <form onSubmit={updateProfile} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-xs sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-xs sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    Role
                  </label>
                  <div className="mt-1">
                    <input
                      id="role"
                      name="role"
                      type="text"
                      disabled
                      value={profileData.role}
                      className="bg-gray-50 dark:bg-slate-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-xs sm:text-sm border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-md cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Role cannot be changed</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div 
            className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="px-4 py-4 sm:py-5 sm:px-6 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Change Password</h3>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500 dark:text-gray-300">Update your password</p>
            </div>
            <div className="px-4 py-4 sm:py-5 sm:p-6">
              <form onSubmit={changePassword} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    Current Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-xs sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-xs sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    Confirm New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-xs sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 