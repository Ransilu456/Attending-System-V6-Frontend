import { useState, useRef, useEffect, useCallback } from 'react';
import ToastHelper from '../ToastHelper';
import jsQR from 'jsqr';
import { motion } from 'framer-motion';

import qrCodeService from '../../services/qrCodeService';

const DigitalQRScanner = ({ onScanSuccess, onScanError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  useEffect(() => {
    return () => {

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const resetScanner = useCallback(() => {
    setError(null);
    setApiError(null);
    setProcessingStatus('');
    setLoading(false);
    setFileInfo(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const validateFile = (file) => {
    if (!file) {
      setError('No file selected');
      return false;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`File type not supported. Please upload a JPEG, PNG, GIF, or WebP image.`);
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    setError(null);
    setApiError(null);
    setProcessingStatus('');
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    if (!validateFile(file)) {
      return;
    }
    
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type
    });

    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error('Error creating preview URL:', err);
      setError('Failed to create image preview');
      return;
    }
    
    processImage(file);
  };

  const processImage = (file) => {
    setLoading(true);
    setProcessingStatus('Reading image file...');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        setProcessingStatus('Processing image...');
        
        try {
          const canvas = canvasRef.current;
          if (!canvas) {
            throw new Error('Canvas element not found');
          }
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          setProcessingStatus('Scanning for QR code...');
          detectQRCode(imageData);
        } catch (err) {
          console.error('Error processing image:', err);
          setLoading(false);
          setError(`Error processing image: ${err.message}`);
        }
      };
      
      img.onerror = () => {
        setLoading(false);
        setError('Failed to load image. The file may be corrupted or not a valid image.');
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      setLoading(false);
      setError('Failed to read file. Please try again with a different file.');
    };
    
    reader.readAsDataURL(file);
  };

  const detectQRCode = (imageData) => {
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
        setProcessingStatus('QR code found! Verifying...');
        
        try {
          let qrData;
          try {
            qrData = JSON.parse(code.data);
          } catch (e) {
            if (code.data.includes('indexNumber=')) {
              const url = new URL(code.data);
              const indexNumber = url.searchParams.get('indexNumber');
              const name = url.searchParams.get('name');
              
              if (indexNumber) {
                qrData = { indexNumber, name };
              } else {
                throw new Error('Invalid QR code URL format');
              }
            } else {
              qrData = { rawData: code.data };
            }
          }
          
          handleQRCodeDetected(qrData);
        } catch (e) {
          console.error('Failed to process QR code data:', e);
          setLoading(false);
          setError('QR code found but data format is not recognized. Please try a different QR code.');
        }
      } else {
        setLoading(false);
        setError('No QR code found in the image. Please try a different image with a clearer QR code.');
      }
    } catch (err) {
      console.error('Error processing QR code:', err);
      setLoading(false);
      setError(`Error processing image: ${err.message}. Please try a different image.`);
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    try {
      console.log('Processing QR data:', qrData);
      
      if (!qrData.indexNumber) {
        throw new Error('Invalid QR code data. Missing student index number.');
      }

      setProcessingStatus('Marking attendance...');
      
    
      const response = await qrCodeService.markAttendance(qrData);
      
      console.log('API response:', response);
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      const processedData = {
        id: response.data.studentInfo?.id,
        indexNumber: response.data.studentInfo?.indexNumber || qrData.indexNumber,
        name: response.data.studentInfo?.name || qrData.name,
        status: response.data.attendanceStatus || 'entered',
        timestamp: new Date().toISOString(),
        messageStatus: response.data.studentInfo?.messageStatus || response.data.messageStatus || 'pending',
        parent_telephone: response.data.studentInfo?.parent_telephone || qrData.parent_telephone,
        student_email: response.data.studentInfo?.student_email || response.data.student?.student_email || '',
        address: response.data.studentInfo?.address || response.data.student?.address || ''
      };
      
      if (onScanSuccess) {
        onScanSuccess(processedData);
      }
      
      ToastHelper.success(response.data.message || 'Attendance marked successfully');
      

      resetScanner();
    } catch (error) {
      console.error('Error processing QR code:', error);
      setLoading(false);
      
      setApiError(error.message || 'Failed to process attendance');
      ToastHelper.error(error.message || 'Failed to process attendance');
      
      if (onScanError) {
        onScanError(error);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scan QR Code from Image</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Upload an image containing a QR code to scan</p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
      />

      <div 
        onClick={triggerFileInput}
        className={`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer mb-4 transition-colors
          ${previewUrl 
            ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
      >
        <div className="flex flex-col items-center justify-center">
          {previewUrl ? (
            <div className="relative w-full max-w-xs">
              <img 
                src={previewUrl} 
                alt="Selected file preview" 
                className="w-full h-auto max-h-64 object-contain rounded-lg shadow-md" 
              />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600"></div>
                  <p className="mt-2 text-sm text-white font-medium">{processingStatus}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">JPEG, PNG, GIF or WebP (MAX. 5MB)</p>
            </>
          )}
        </div>
      </div>
      

      {fileInfo && !error && !apiError && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">File:</span> {fileInfo.name}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Size:</span> {fileInfo.size}
          </p>
        </div>
      )}

      {(error || apiError) && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error || apiError}</span>
          </p>
        </div>
      )}
      
      <div className="flex space-x-3">
        <button
          onClick={triggerFileInput}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Select Image'}
        </button>
        
        {previewUrl && (
          <button
            onClick={resetScanner}
            className="py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
            disabled={loading}
          >
            Reset
          </button>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Note: Ensure the QR code is clear and well-lit for better detection.</p>
        <p>For best results, use a QR code with a high contrast against the background.</p>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </motion.div>
  );
};

export default DigitalQRScanner; 