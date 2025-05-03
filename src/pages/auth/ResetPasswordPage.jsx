import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Key, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

import ToastHelper from '../../components/ToastHelper';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [resetComplete, setResetComplete] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!token || token.length < 20) {
      setTokenValid(false);
      ToastHelper.error('Invalid or expired reset token');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validatePassword();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    
    if (!validatePassword()) {
      ToastHelper.error(validationError);
      return;
    }
    
    try {
      await resetPassword(token, password);
      setResetComplete(true);
      ToastHelper.success('Password has been reset successfully');
    } catch (err) {
      console.error('Failed to reset password:', err);
      ToastHelper.error(error || 'Failed to reset password. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (tokenValid === false) {
    return (
      <motion.div
        className={`min-h-screen ${isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100'} py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={`max-w-md w-full p-8 space-y-8 rounded-xl shadow-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <motion.div variants={itemVariants}>
            <div className="text-center">
              <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Invalid Reset Link
              </h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                This password reset link is invalid or has expired.
              </p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-center">
            <Link
              to="/forgot-password"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Request a new reset link
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <Link to="/login" className={`text-sm font-medium text-blue-600 hover:text-blue-500 ${
              isDark ? 'text-blue-400 hover:text-blue-300' : ''
            }`}>
              Return to login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen ${isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100'} py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`max-w-5xl w-full flex rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          <motion.div variants={itemVariants}>
            <Link to="/login" className={`flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 ${
              isDark ? 'text-blue-400 hover:text-blue-300' : ''
            } mb-6`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className={`text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}>
              Reset Your Password
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Please enter your new password below.
            </p>
          </motion.div>
          
          {resetComplete ? (
            <motion.div
              variants={itemVariants}
              className={`rounded-md ${
                isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
              } p-6 border mb-6`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className={`h-6 w-6 ${isDark ? 'text-green-300' : 'text-green-500'}`} />
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${
                    isDark ? 'text-green-200' : 'text-green-800'
                  }`}>
                    Password Reset Successfully
                  </h3>
                  <div className={`mt-2 text-sm ${
                    isDark ? 'text-green-300' : 'text-green-700'
                  }`}>
                    <p>
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                  </div>
                  <div className="mt-4">
                    <motion.button
                      type="button"
                      onClick={() => navigate('/login')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isDark 
                          ? 'bg-green-800/50 text-green-200 hover:bg-green-800' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Go to login
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              variants={itemVariants}
            >
              {/* Password Field */}
              <div>
                <label htmlFor="password" className={`block mb-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validatePassword();
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border ${
                      touched.password && validationError.includes('least 8 characters')
                        ? isDark
                          ? 'bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
                          : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : isDark
                        ? 'focus:ring-blue-500 focus:border-blue-500'
                        : 'focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:z-10 sm:text-sm`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDark ? 'text-gray-300 hover:text-gray-200' : 'text-gray-400 hover:text-gray-500'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Password must be at least 8 characters long
                </p>
              </div>
              
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm-password" className={`block mb-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirmPassword) validatePassword();
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } appearance-none rounded-md relative block w-full pl-10 py-2 border ${
                      touched.confirmPassword && validationError.includes('match')
                        ? isDark
                          ? 'bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
                          : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : isDark
                        ? 'focus:ring-blue-500 focus:border-blue-500'
                        : 'focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:z-10 sm:text-sm`}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <AnimatePresence>
                {validationError && (touched.password || touched.confirmPassword) && (
                  <motion.div
                    className={`rounded-md ${
                      isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
                    } p-4 border`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                          {validationError}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {error && (
                <div className={`rounded-md ${
                  isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
                } p-4 border`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        isDark ? 'text-red-300' : 'text-red-800'
                      }`}>Error</h3>
                      <div className={`mt-1 text-sm ${
                        isDark ? 'text-red-300' : 'text-red-700'
                      }`}>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`group relative flex w-full justify-center rounded-md ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                  } py-3 px-4 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all duration-300`}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Key className="h-5 w-5 text-blue-300 group-hover:text-blue-200" aria-hidden="true" />
                      </span>
                      Reset Password
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Right side - Image and Info */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 text-white relative overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <motion.h2
                className="text-3xl font-bold mb-6 text-white"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Set Your New Password
              </motion.h2>

              <motion.p
                className="text-blue-100 mb-8 max-w-md"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                You're almost there! Create a strong, secure password to protect your account.
              </motion.p>

              <motion.div
                className="space-y-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {[
                  "Use at least 8 characters",
                  "Include numbers and special characters",
                  "Avoid using easily guessable information",
                  "Don't reuse passwords from other sites",
                  "Consider using a password manager"
                ].map((tip, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>{tip}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              className="mt-auto text-sm text-blue-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <p>© 2025 Attendance System. All rights reserved.</p>
              <p className="mt-1">Powered by Ransilu Samarasekara.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage; 