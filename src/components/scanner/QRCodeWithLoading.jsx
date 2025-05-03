import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import PropTypes from 'prop-types';

const QRCodeWithLoading = ({ qrCodeUrl, loading, error, studentData }) => {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setShowInfo(false);
  }, [qrCodeUrl]);

  useEffect(() => {
    if (imageLoaded && studentData) {
      const timer = setTimeout(() => {
        setShowInfo(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, studentData]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };


  const formatDataField = (value, fallback = 'Not available') => {
    if (!value) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
  };

  return (
    <div className="qr-code-container relative p-6 max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-6"
          >
            <div className="border-t-4 border-blue-500 dark:border-blue-400 rounded-full w-12 h-12 animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Generating QR code...</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center p-6"
          >
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to generate QR code</p>
              <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {!loading && !error && qrCodeUrl && (
          <div className="flex flex-col items-center">
            <motion.div 
              key="qrcode"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="qr-code-wrapper rounded-lg overflow-hidden bg-white p-4 border-2 border-gray-200 dark:border-gray-700 shadow-md"
            >
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="h-60 w-60 object-contain" 
                onLoad={handleImageLoad}
              />
            </motion.div>

            {imageLoaded && studentData && (
              <motion.div 
                className="mt-6 w-full text-left bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-4 py-3">
                  <h3 className="text-white font-medium">Student Information</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDataField(studentData.name)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Index Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDataField(studentData.indexNumber)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white break-words">
                      {formatDataField(studentData.email || studentData.student_email)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDataField(studentData.grade)}</p>
                  </div>
                  {studentData.address && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white break-words">{formatDataField(studentData.address)}</p>
                    </div>
                  )}
                  {studentData.contact && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDataField(studentData.contact)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      studentData.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {formatDataField(studentData.status, 'Unknown')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

QRCodeWithLoading.propTypes = {
  qrCodeUrl: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  studentData: PropTypes.object
};

QRCodeWithLoading.defaultProps = {
  loading: false,
  error: null,
  studentData: null
};

export default QRCodeWithLoading; 