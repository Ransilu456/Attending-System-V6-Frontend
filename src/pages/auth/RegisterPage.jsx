import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";

import useFormSubmit from "../../hooks/useFormSubmit";

const RegisterPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    agreeToTerms: false,
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    loading,
    error: apiError,
    setError: setApiError,
    handleSubmit,
  } = useFormSubmit(
    async (data) => {
      const { confirmPassword, agreeToTerms, ...registrationData } = data;
      try {
        await register(registrationData);
        return true;
      } catch (error) {
        let errorMessage = "Registration failed. Please try again.";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 400) {
          errorMessage =
            "Invalid registration data. Please check your information.";
        } else if (error.response?.status === 409) {
          errorMessage =
            "Email already exists. Please use a different email address.";
        }
        setApiErrorMessage(errorMessage);
        throw error;
      }
    },
    {
      onSuccess: () => {
        navigate("/login", {
          state: { message: "Account created successfully. Please log in." },
        });
      },
    }
  );

  useEffect(() => {
    if (apiError) {
      setApiError("");
      setApiErrorMessage("");
    }
  }, [formData, apiError, setApiError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, fieldValue);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          newErrors.name = "Name must be less than 50 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          newErrors.name =
            "Name can only contain letters, spaces, hyphens and apostrophes";
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password =
            "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password =
            "Password must contain at least one uppercase letter";
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = "Password must contain at least one number";
        } else {
          delete newErrors.password;
        }

        if (touched.confirmPassword && formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case "agreeToTerms":
        if (!value) {
          newErrors.agreeToTerms = "You must agree to the terms and conditions";
        } else {
          delete newErrors.agreeToTerms;
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
    let newTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    };

    // Validate each field
    Object.keys(newTouched).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    setTouched(newTouched);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiErrorMessage("");
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting");
      return;
    }

    try {
      await handleSubmit(e, formData);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const errorShake = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
    visible: itemVariants.visible,
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-800"
          : "bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100"
      } py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 flex items-center justify-center`}
    >
      <motion.div
        className={`max-w-5xl w-full flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden ${
          isDark ? "bg-slate-800" : "bg-white"
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left side - Registration Form */}
        <div className="w-full md:w-3/5 lg:w-1/2 p-6 sm:p-8 md:p-10">
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h2
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              Create Your Account
            </h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join us to start managing attendance efficiently
            </p>
          </motion.div>

          {/* Display API error message */}
          {(apiError || apiErrorMessage) && (
            <div
              className={`rounded-md ${
                isDark
                  ? "bg-red-900/30 border-red-800"
                  : "bg-red-50 border-red-200"
              } p-3 sm:p-4 border mb-4 sm:mb-6`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      isDark ? "text-red-300" : "text-red-800"
                    }`}
                  >
                    Registration Error
                  </h3>
                  <div
                    className={`mt-1 text-sm ${
                      isDark ? "text-red-300" : "text-red-700"
                    }`}
                  >
                    <p>{apiErrorMessage || apiError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <motion.form
            className="space-y-4 sm:space-y-6"
            onSubmit={onSubmit}
            initial="hidden"
            animate={
              Object.keys(errors).length > 0 &&
              Object.values(touched).some((t) => t)
                ? "shake"
                : "visible"
            }
            variants={errorShake}
          >
            {/* Full Name Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="name"
                className={`block mb-1.5 sm:mb-2 text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border text-sm rounded-lg block w-full p-2.5 ${
                  touched.name && errors.name
                    ? isDark
                      ? "bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500"
                      : "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500"
                    : isDark
                    ? "focus:ring-blue-500 focus:border-blue-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="John Doe"
              />
              <AnimatePresence>
                {touched.name && errors.name && (
                  <motion.p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className={`block mb-1.5 sm:mb-2 text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
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
                    ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border text-sm rounded-lg block w-full p-2.5 ${
                  touched.email && errors.email
                    ? isDark
                      ? "bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500"
                      : "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500"
                    : isDark
                    ? "focus:ring-blue-500 focus:border-blue-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="you@example.com"
              />
              <AnimatePresence>
                {touched.email && errors.email && (
                  <motion.p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className={`block mb-1.5 sm:mb-2 text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border text-sm rounded-lg block w-full p-2.5 ${
                  touched.password && errors.password
                    ? isDark
                      ? "bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500"
                      : "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500"
                    : isDark
                    ? "focus:ring-blue-500 focus:border-blue-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="••••••••"
              />
              <AnimatePresence>
                {touched.password && errors.password ? (
                  <motion.p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                ) : (
                  <p
                    className={`mt-1 text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Password must be at least 6 characters long and contain at
                    least one lowercase letter, one uppercase letter, and one
                    number
                  </p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="confirmPassword"
                className={`block mb-1.5 sm:mb-2 text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } border text-sm rounded-lg block w-full p-2.5 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? isDark
                      ? "bg-red-900/30 border-red-600 text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500"
                      : "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500"
                    : isDark
                    ? "focus:ring-blue-500 focus:border-blue-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="••••••••"
              />
              <AnimatePresence>
                {touched.confirmPassword && errors.confirmPassword && (
                  <motion.p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div variants={itemVariants} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-4 h-4 rounded-sm focus:ring-3 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 focus:ring-blue-600"
                      : "bg-gray-50 border-gray-300 focus:ring-blue-300"
                  } ${
                    touched.agreeToTerms && errors.agreeToTerms
                      ? isDark
                        ? "border-red-600"
                        : "border-red-500"
                      : isDark
                      ? "border-slate-600"
                      : "border-gray-300"
                  }`}
                  required
                />
              </div>
              <label
                htmlFor="agreeToTerms"
                className={`ms-2 text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                I agree with the{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  terms and conditions
                </a>
              </label>
            </motion.div>
            <AnimatePresence>
              {touched.agreeToTerms && errors.agreeToTerms && (
                <motion.p
                  className={`mt-1 text-xs sm:text-sm ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.agreeToTerms}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <div className="text-sm">
                <span
                  className={`${isDark ? "text-gray-300" : "text-gray-500"}`}
                >
                  Already have an account?
                </span>{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
                className={`group relative flex w-full justify-center rounded-md ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                } py-2.5 sm:py-3 px-4 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all duration-300 ${
                  loading || Object.keys(errors).length > 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Creating account...
                  </span>
                ) : (
                  <>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-blue-300 group-hover:text-blue-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    Create Account
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </div>

        {/* Right side - Image and Info */}
        <div className="hidden md:block md:w-2/5 lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-8 md:p-10 lg:p-12 text-white relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </motion.div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <motion.h2
                className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Join Our Attendance System
              </motion.h2>

              <motion.p
                className="text-blue-100 mb-6 md:mb-8 max-w-md text-sm md:text-base"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Create your account to access our powerful attendance tracking
                system. Manage students, generate reports, and gain valuable
                insights.
              </motion.p>

              <motion.div
                className="space-y-3 md:space-y-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {[
                  "Secure authentication system",
                  "Role-based access control",
                  "Manage student records",
                  "Generate attendance reports",
                  "QR code scanning functionality",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-blue-300 mr-2 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
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
      </motion.div>
    </div>
  );
};

export default RegisterPage;
