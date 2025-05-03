import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Download, X } from 'lucide-react';

import qrCodeService from '../../services/qrCodeService';


const StylishQRCode = ({ studentId, studentName, indexNumber, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await qrCodeService.downloadStylishQRCode(studentId);
        const imageUrl = URL.createObjectURL(response.data);
        setQrCode(imageUrl);
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('Failed to load QR code. Please try again.');
        toast.error('Failed to load QR code');
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();

    return () => {
      if (qrCode) {
        URL.revokeObjectURL(qrCode);
      }
    };
  }, [studentId, qrCode]);

  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${indexNumber || studentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code downloaded successfully');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 m-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-4">
          {studentName ? `QR Code: ${studentName}` : 'Student QR Code'}
        </h2>
        
        {indexNumber && (
          <p className="text-center text-gray-600 mb-4">Index: {indexNumber}</p>
        )}
        
        <div className="flex justify-center mb-6">
          {loading ? (
            <div className="w-64 h-64 bg-gray-100 animate-pulse flex items-center justify-center">
              <p className="text-gray-500">Loading QR Code...</p>
            </div>
          ) : error ? (
            <div className="w-64 h-64 bg-red-50 flex items-center justify-center border border-red-200 rounded">
              <p className="text-red-500 text-center px-4">{error}</p>
            </div>
          ) : (
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="w-64 h-64 object-contain"
            />
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            disabled={loading || error || !qrCode}
            className={`
              flex items-center px-4 py-2 rounded 
              ${!loading && !error && qrCode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              transition-colors
            `}
          >
            <Download className="w-5 h-5 mr-2" />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylishQRCode;
