import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import useFormSubmit from '../../hooks/useFormSubmit';
import ToastHelper from '../../components/ToastHelper';

const LoginPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const { loading, error: apiError, setError: setApiError } = useFormSubmit(
    async (data) => {
      try {
        await login(data.email, data.password);
        return true;
      } catch (error) {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 60;
          setLoginDisabled(true);
          setCountdown(retryAfter);
          throw new Error(`Too many login attempts. Please try again in ${formatTime(retryAfter)}.`);
        }
        throw error;
      }
    },
    {
      onSuccess: () => {
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    }
  );

  useEffect(() => {
    if (location.state?.message) {
      ToastHelper.info(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (apiError) {
      setApiError('');
    }
  }, [formData, apiError, setApiError]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setLoginDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = () => {
    let isValid = true;
    let newTouched = { email: true, password: true };

    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    setTouched(newTouched);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      ToastHelper.error('Please fix the errors in the form before submitting');
      return;
    }

    try {
      
      setLoginDisabled(true);

      console.log(`Submitting login form with "Remember Me": ${rememberMe}`);
      await login(formData.email, formData.password, rememberMe);
      
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Form submission error:', error);

      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
        setCountdown(retryAfter);
        ToastHelper.warning(`Too many login attempts. Please try again in ${formatTime(retryAfter)}.`);
      }

      if (error.response?.status === 401) {
        ToastHelper.error('Invalid email or password. Please try again.');
      }

      if (error.response?.status !== 429) {
        setLoginDisabled(false);
      }
    }
  };

  const socialLoginButtons = [
    {
      name: 'Google', color: isDark ? 'bg-slate-700' : 'bg-white', textColor: isDark ? 'text-white' : 'text-gray-700', hoverColor: isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-50', icon: (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
        </svg>
      )
    },
    {
      name: 'Facebook', color: 'bg-blue-600', textColor: 'text-white', hoverColor: 'hover:bg-blue-700', icon: (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20.9,2H3.1A1.1,1.1,0,0,0,2,3.1V20.9A1.1,1.1,0,0,0,3.1,22h9.58V14.25h-2.6v-3h2.6V9a3.64,3.64,0,0,1,3.88-4,20.26,20.26,0,0,1,2.33.12v2.7H17.3c-1.26,0-1.5.6-1.5,1.47v1.93h3l-.39,3H15.8V22h5.1A1.1,1.1,0,0,0,22,20.9V3.1A1.1,1.1,0,0,0,20.9,2Z" />
        </svg>
      )
    },
    {
      name: 'Apple', color: 'bg-black', textColor: 'text-white', hoverColor: 'hover:bg-gray-900', icon: (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16.5,3A5.37,5.37,0,0,0,13,4.59,4.63,4.63,0,0,0,11.5,9a4.1,4.1,0,0,0,3.5-1.5A4.77,4.77,0,0,0,16.5,3ZM12,6.5a4.79,4.79,0,0,0-4,2A6.51,6.51,0,0,0,7,13.5c0,2,1,4.5,2,5.5,1.5,1.5,2.5,1.5,3.5,1.5a5.86,5.86,0,0,0,3-1.5A5.83,5.83,0,0,0,18,17.5a5.86,5.86,0,0,0-3-1.5,5.86,5.86,0,0,0-3,1.5,5.86,5.86,0,0,0,3,1.5c1,0,2,0,3.5-1.5,1-1,2-3.5,2-5.5a6.51,6.51,0,0,0-1-5A4.79,4.79,0,0,0,12,6.5Z" />
        </svg>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
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
    hidden: { y: 20, opacity: 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const errorShake = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
    visible: itemVariants.visible
  };


  return (
    <motion.div className={`min-h-screen ${isDark 
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-800' 
      : 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100'} py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 flex items-center justify-center`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`max-w-5xl w-full flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Left side - Login Form */}
        <div className="w-full md:w-3/5 lg:w-1/2 p-6 sm:p-8 md:p-10">
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}>
              Sign in to your account
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Welcome back! Please enter your details
            </p>
          </motion.div>

          {/* API Error Message */}
          {apiError && (
            <div
              className={`rounded-md ${
                isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
              } p-3 sm:p-4 border mb-4 sm:mb-6`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    isDark ? 'text-red-300' : 'text-red-800'
                  }`}>Authentication Error</h3>
                  <div className={`mt-1 text-sm ${
                    isDark ? 'text-red-300' : 'text-red-700'
                  }`}>
                    <p>{apiError.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <motion.form
            className="space-y-4 sm:space-y-6"
            onSubmit={onSubmit}
            initial="hidden"
            animate={Object.keys(errors).length > 0 && Object.values(touched).some(t => t) ? "shake" : "visible"}
            variants={errorShake}
          >
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className={`block mb-1.5 sm:mb-2 text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border text-sm rounded-lg block w-full p-2.5 ${
                  touched.email && errors.email
                    ? isDark
                      ? 'bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
                      : 'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
                    : isDark
                    ? 'focus:ring-blue-500 focus:border-blue-500'
                    : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="you@example.com"
              />
              <AnimatePresence>
                {touched.email && errors.email && (
                  <motion.p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className={`block mb-1.5 sm:mb-2 text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border text-sm rounded-lg block w-full p-2.5 ${
                    touched.password && errors.password
                      ? isDark
                        ? 'bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
                        : 'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500'
                      : isDark
                      ? 'focus:ring-blue-500 focus:border-blue-500'
                      : 'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDark ? 'text-gray-300 hover:text-gray-200' : 'text-gray-400 hover:text-gray-500'
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <AnimatePresence>
                {touched.password && errors.password && (
                  <motion.p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0" variants={itemVariants}>
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 focus:ring-blue-600'
                      : 'bg-gray-50 border-gray-300 focus:ring-blue-300'
                  } focus:ring-3`}
                />
                <label htmlFor="remember-me" className={`ml-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot your password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0 || loginDisabled}
                className={`group relative flex w-full justify-center rounded-md ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                } py-2.5 sm:py-3 px-4 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all duration-300 ${
                  loading || Object.keys(errors).length > 0 || loginDisabled
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : loginDisabled ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Try again in {formatTime(countdown)}
                  </span>
                ) : (
                  <>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-blue-300 group-hover:text-blue-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Sign in
                  </>
                )}
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mt-3 sm:mt-4">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Don't have an account?</span>{' '}
              <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign up
              </Link>
              <br />
              <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>Need the access from the developer</span>
            </motion.div>
          </motion.form>

          <div className="mt-6 sm:mt-8">
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`${isDark ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-500'} px-3 sm:px-4`}>Or continue with</span>
              </div>
            </motion.div>

            <motion.div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" variants={itemVariants}>
              {socialLoginButtons.map((button) => (
                <motion.button
                  key={button.name}
                  type="button"
                  className={`${button.color} ${button.textColor} ${button.hoverColor} flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isDark ? 'focus:ring-offset-slate-800' : ''
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {button.icon}
                  {button.name}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right side - Image and Info */}
        <div className="hidden md:block md:w-2/5 lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-8 md:p-10 lg:p-12 text-white relative overflow-hidden">
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
                className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Welcome to Attendance System
              </motion.h2>

              <motion.p
                className="text-blue-100 mb-6 md:mb-8 max-w-md text-sm md:text-base"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Sign in to access our powerful attendance tracking system. Manage students, generate reports, and gain valuable insights.
              </motion.p>

              <motion.div
                className="space-y-3 md:space-y-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {[
                  "Track student attendance in real-time",
                  "Generate comprehensive reports",
                  "Manage student records efficiently",
                  "QR code scanning functionality",
                  "Secure and easy to use interface"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-blue-300 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span className="text-sm md:text-base">{feature}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              className="mt-auto text-xs md:text-sm text-blue-200"
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

export default LoginPage;