import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';

import ToastHelper from '../../components/ToastHelper';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword, loading, error } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setTouched(true);
      ToastHelper.error('Please enter a valid email address');
      return;
    }
    
    try {
      await forgotPassword(email);
      setSubmitted(true);
      ToastHelper.success('Reset instructions sent to your email');
    } catch (err) {
      console.error('Failed to send reset email:', err);
      ToastHelper.error(error || 'Failed to send reset email. Please try again.');
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
              Forgot your password?
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              variants={itemVariants}
              className={`rounded-md ${
                isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
              } p-6 border mb-6`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${isDark ? 'text-green-300' : 'text-green-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${
                    isDark ? 'text-green-200' : 'text-green-800'
                  }`}>
                    Reset instructions sent
                  </h3>
                  <div className={`mt-2 text-sm ${
                    isDark ? 'text-green-300' : 'text-green-700'
                  }`}>
                    <p>
                      We've sent password reset instructions to <span className="font-medium">{email}</span>. Please check your email.
                    </p>
                  </div>
                  <div className="mt-4">
                    <motion.div
                      className="-mx-2 -my-1.5 flex"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/login"
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          isDark 
                            ? 'bg-green-800/50 text-green-200 hover:bg-green-800' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        Return to login
                      </Link>
                    </motion.div>
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
              <div>
                <label htmlFor="email-address" className={`block mb-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } appearance-none rounded-md relative block w-full pl-10 px-3 py-2 border ${
                      touched && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                        ? isDark
                          ? 'bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
                          : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : isDark
                        ? 'focus:ring-blue-500 focus:border-blue-500'
                        : 'focus:ring-blue-500 focus:border-blue-500'
                    } focus:outline-none focus:z-10 sm:text-sm`}
                    placeholder="you@example.com"
                    onBlur={() => setTouched(true)}
                  />
                </div>
                <AnimatePresence>
                  {touched && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && (
                    <motion.p
                      className={`mt-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      Please enter a valid email address
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

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
                        <Mail className="h-5 w-5 text-blue-300 group-hover:text-blue-200" aria-hidden="true" />
                      </span>
                      Send reset instructions
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
          
          {!submitted && (
            <motion.div variants={itemVariants} className="flex items-center justify-center mt-6">
              <div className="text-sm">
                <Link to="/login" className={`font-medium text-blue-600 hover:text-blue-500 ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : ''
                }`}>
                  Remember your password? Log in
                </Link>
              </div>
            </motion.div>
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
                Password Recovery
              </motion.h2>

              <motion.p
                className="text-blue-100 mb-8 max-w-md"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Don't worry! It happens to the best of us. Enter your email address and we'll send you instructions to reset your password.
              </motion.p>

              <motion.div
                className="space-y-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {[
                  "Secure password reset process",
                  "Email verification for added security",
                  "Quick and easy recovery",
                  "24/7 support available",
                  "Industry-standard encryption"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>{feature}</span>
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

export default ForgotPasswordPage; 