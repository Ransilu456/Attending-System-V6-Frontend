import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { User, Key, Settings } from "lucide-react";

import ThemeToggle from "../../components/ui/ThemeToggle";

const SettingsPage = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Update password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    try {
      setPasswordLoading(true);
      await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-4 sm:py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.h1
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400"
        >
          Settings
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
          
          {/* Profile Settings */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200"
          >
            <div className="px-4 py-4 sm:py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Profile Settings
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Update your personal information
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-4 sm:py-5 sm:p-6">
              <form
                onSubmit={handleProfileSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full shadow-sm text-xs sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full shadow-sm text-xs sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {profileLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-5 sm:w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Profile"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Password Settings */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200"
          >
            <div className="px-4 py-4 sm:py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                  <Key className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Password Settings
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Update your password
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-4 sm:py-5 sm:p-6">
              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      required
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full shadow-sm text-xs sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full shadow-sm text-xs sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full shadow-sm text-xs sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {passwordLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-5 sm:w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Application Settings */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200"
          >
            <div className="px-4 py-4 sm:py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-full">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Application Settings
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Configure application preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700">
              <dl>
                <div className="bg-gray-50 dark:bg-slate-700/30 px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">
                    Theme
                  </dt>
                  <dd className="mt-1 text-xs sm:text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          Appearance
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Choose between light and dark mode
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                        <ThemeToggle />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </span>
                      </div>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
