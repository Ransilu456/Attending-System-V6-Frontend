import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import qrCodeService from '../../services/qrCodeService';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Camera } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const { theme } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [availableCameras, setAvailableCameras] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    checkCameraPermission();
    getAvailableCameras();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cameraPermission === true) {
      startScanning();
    }
  }, [cameraPermission]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 400
      }
    }
  };


  const getAvailableCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Media devices API not supported in this browser');
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      setAvailableCameras(cameras);
      

      if (cameras.length === 0) {
        setError('No cameras found on your device');
        setCameraPermission(false);
        
        if (onScanError) {
          onScanError(new Error('No cameras found'));
        }
        
        toast.error('No cameras found on your device');
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
      setError('Failed to detect cameras: ' + error.message);
      
      if (onScanError) {
        onScanError(error);
      }
    }
  };

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
      setError(null);
    } catch (err) {
      console.error('Camera permission error:', err);
      setCameraPermission(false);
      setError('Camera access denied. Please allow camera access to scan QR codes.');
      
      if (onScanError) {
        onScanError(new Error('Camera access denied'));
      }
      
      toast.error('Camera access denied. Please allow camera access in your browser settings.');
    }
  };


  const startScanning = useCallback(() => {
    if (!cameraPermission) {
      checkCameraPermission();
      return;
    }
    
    setScanning(true);
    setError(null);
    

    intervalRef.current = setInterval(() => {
      captureAndProcessFrame();
    }, 500);
  }, [cameraPermission]);

 
  const stopScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScanning(false);
  }, []);


  const toggleCamera = () => {
    setFacingMode(prevMode => 
      prevMode === "environment" ? "user" : "environment"
    );
  };


  const captureAndProcessFrame = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current) return;

    try {
      const webcam = webcamRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });


      const imageSrc = webcam.getScreenshot();
      if (!imageSrc) return;

      const image = new Image();
      image.onload = async () => {
        try {
          canvas.width = image.width;
          canvas.height = image.height;

          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

          const qrData = await processImageData(imageData);
          
          if (qrData) {

            stopScanning();
            handleQRCodeDetected(qrData);
          }
        } catch (err) {
          console.error('Error processing image:', err);
          setError('Error processing camera image: ' + err.message);
          
          if (onScanError) {
            onScanError(err);
          }
        }
      };
      
      image.src = imageSrc;
    } catch (err) {
      console.error('Error processing frame:', err);
      setError('Error capturing camera frame: ' + err.message);
      
      if (onScanError) {
        onScanError(err);
      }
    }
  }, [stopScanning, onScanError]);


  const processImageData = async (imageData) => {
    try {

      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {
          inversionAttempts: "dontInvert",
        }
      );
      
      if (code) {
        console.log("QR Code detected:", code.data);
        
        try {

          let qrData;
          try {
            qrData = JSON.parse(code.data);
          } catch (parseError) {
            console.error("Failed to parse QR code data:", parseError);
            throw new Error("Invalid QR code format. Please scan a valid QR code.");
          }
          

          if (!qrData || !qrData.indexNumber) {
            throw new Error("Invalid QR code data. Missing required information.");
          }
          
          return qrData;
        } catch (error) {
          console.error("Error processing QR code data:", error);
          setError(error.message || "Failed to process QR code data");
          
          if (onScanError) {
            onScanError(error);
          }
          

          toast.error(error.message || "Failed to process QR code data");
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error("Error in QR code processing:", error);
      setError("QR code processing error: " + error.message);
      
      if (onScanError) {
        onScanError(error);
      }
      
      return null;
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    try {
      setLoading(true);

      if (!qrData || !qrData.indexNumber) {
        throw new Error('Invalid QR code data. Missing student information.');
      }

      const response = await qrCodeService.markAttendance(qrData);

      if (response && response.data) {
        toast.success(response.data.message || 'Attendance marked successfully');

        if (onScanSuccess) {
          onScanSuccess({
            ...qrData,
            status: response.data.status || 'present',
            timestamp: response.data.timestamp || new Date().toISOString()
          });
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);

      let errorMessage;
      
      if (err.response?.status === 404) {
        errorMessage = 'Student not found in the database';
      } else if (err.response?.status === 409) {
        errorMessage = 'Attendance already marked for this student today';
      } else {
        errorMessage = err.response?.data?.message || 'Failed to mark attendance';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (onScanError) {
        onScanError(err);
      }

      setTimeout(() => {
        setError(null);
        startScanning();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = () => {
    checkCameraPermission();
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center"
    >
      <motion.div 
        variants={itemVariants}
        className="relative w-full max-w-md overflow-hidden rounded-lg shadow-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
      >
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {cameraPermission === false ? (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-700/10"
          >
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Camera Access Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please allow camera access in your browser settings to scan QR codes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={requestPermission}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-md transition-all duration-200"
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Webcam component */}
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }}
              className="w-full h-auto"
              onUserMediaError={(err) => {
                console.error('Webcam error:', err);
                setError('Error accessing camera: ' + err.message);
                setCameraPermission(false);
                
                if (onScanError) {
                  onScanError(err);
                }
              }}
            />
            
            {/* Scanning overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-64 h-64 border-4 border-white dark:border-blue-400 rounded-lg"
                  style={{ boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.5)' }}
                ></motion.div>
                <motion.div 
                  animate={{ 
                    rotate: 360,
                    boxShadow: ["0 0 10px 3px rgba(59, 130, 246, 0.4)", "0 0 10px 3px rgba(59, 130, 246, 0)"] 
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                    boxShadow: { repeat: Infinity, duration: 1.5, yoyo: true }
                  }}
                  className="absolute w-72 h-72 border-t-4 border-r-4 border-blue-500 dark:border-blue-400 rounded-lg"
                ></motion.div>
              </div>
            )}
            
            {/* Loading overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70"
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-700/50 rounded-full mb-4"
                    ></motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white font-medium"
                    >
                      Processing...
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Camera toggle button */}
            {availableCameras.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: theme === 'dark' ? 'rgb(51, 65, 85)' : 'rgb(55, 65, 81)' }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCamera}
                className="absolute top-4 right-4 p-2 bg-gray-800 dark:bg-slate-700 bg-opacity-70 dark:bg-opacity-70 text-white rounded-full hover:bg-gray-700 dark:hover:bg-slate-600 focus:outline-none shadow-lg transition-colors duration-200"
                title={facingMode === "environment" ? "Switch to front camera" : "Switch to back camera"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            )}
          </>
        )}
      </motion.div>
      
      {/* Controls and Status */}
      <motion.div 
        variants={itemVariants}
        className="mt-6 space-y-4 w-full max-w-md"
      >
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded-md shadow-md"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Instructions */}
        <div className="text-center">
          {cameraPermission === true && !error && !loading && (
            <motion.p 
              variants={itemVariants}
              className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-slate-700"
            >
              {scanning 
                ? "Position the QR code within the blue frame to scan" 
                : "QR code detected. Processing..."}
            </motion.p>
          )}
          
          {!scanning && !loading && !error && (
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startScanning}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
            >
              <Camera className="h-5 w-5 mr-2" />
              Scan Again
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScanner; 