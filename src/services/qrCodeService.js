import api from './api';
import { toast } from 'react-toastify';

const qrCodeService = {
  downloadStylishQRCode: async (studentId) => {
    try {
      const response = await api.get(`/admin/students/${studentId}/qr-code`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      if (!error.response) {
        toast.error('Network error. Please check your connection.');
      }
      throw error;
    }
  },
  
  markAttendance: async (qrData) => {
    try {

      const sanitizedQrData = {
        ...qrData,
        parent_telephone: qrData.parent_telephone ? qrData.parent_telephone.replace(/\s+/g, '') : ''
      };
      
      const enrichedData = {
        qrCodeData: sanitizedQrData,
        deviceInfo: navigator.userAgent,
        scanLocation: 'QR Scanner App'
      };
      
      const response = await api.post('/students/mark-attendance', enrichedData);
      
      console.log('Full attendance API response:', JSON.stringify(response.data));
      
      return response;
    } catch (error) {
      console.error('Error marking attendance via QR code:', error);
      throw error;
    }
  },
  
  searchQRCode: async (searchParams) => {
    try {
      const response = await api.get('/students/search-qr', { params: searchParams });
      return response;
    } catch (error) {
      console.error('Error searching for QR code:', error);
      throw error;
    }
  },
  
  downloadQRCode: async (params) => {
    try {
      const response = await api.get('/students/download-qr-code', {
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      throw error;
    }
  }
};

export default qrCodeService;