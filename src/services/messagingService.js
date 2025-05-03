import api from './api';
import axios from 'axios';
import { toast } from 'react-toastify';

// Helper function to check if the server is responding
const checkServerConnectivity = async () => {
  try {
    // Use a very short timeout to quickly check if server is responding
    const response = await axios.get(`${api.defaults.baseURL}/health`, {
      timeout: 3000
    });
    return response.status === 200;
  } catch (error) {
    console.warn('Server connectivity check failed:', error.message);
    return false;
  }
};

const messagingService = {
    MESSAGE_TYPES: {
      TEXT: 'manual',
      ATTENDANCE: 'attendance',
      NOTIFICATION: 'notification', 
      SYSTEM: 'system',
      TEMPLATE: 'template',
      TEST: 'test',
      AUTOMATED: 'automated'
    },
  
    formatAttendanceMessage: (studentData) => {
      const status = studentData.status === 'entered' ? 'Entered School' :
                    studentData.status === 'left' ? 'Left School' :
                    studentData.status === 'late' ? 'Arrived Late' : 'Marked Present';
      
      const timestamp = new Date(studentData.timestamp || studentData.entryTime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Colombo'
      });
  
      return `🏫 Attendance Update
  
  Student: ${studentData.name}
  Index Number: ${studentData.indexNumber}
  Status: ${status}
  Time: ${timestamp}
  
  Additional Details:
  Email: ${studentData.student_email || studentData.email}
  Parent Phone: ${studentData.parent_telephone}
  Address: ${studentData.address}`;
    },
  
    sendMessage: async (data) => {
      try {
        const toastId = toast.loading('Sending message...');

        if (!data.phoneNumber) {
          toast.update(toastId, {
            render: 'Phone number is required',
            type: 'error',
            isLoading: false,
            autoClose: 3000
          });
          throw new Error('Phone number is required');
        }
        if (!data.message) {
          toast.update(toastId, {
            render: 'Message content is required',
            type: 'error',
            isLoading: false,
            autoClose: 3000
          });
          throw new Error('Message content is required');
        }
  
        const formattedPhone = data.phoneNumber.replace(/\s+/g, '');
        if (!formattedPhone.startsWith('+')) {
          data.phoneNumber = '+' + formattedPhone;
        }
  
        const response = await api.post('/whatsapp/send', {
          phoneNumber: data.phoneNumber,
          message: data.message,
          type: data.type || 'test'
        });
  
        toast.update(toastId, {
          render: `Message sent successfully to ${data.phoneNumber}`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
  
        return response.data;
      } catch (error) {
        console.error('Error sending message:', error);
        toast.update(toastId, {
          render: error.response?.data?.message || 'Failed to send message',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
        throw error;
      }
    },
  
    sendBulkMessages: async (data) => {
      try {
        const toastId = toast.loading('Sending bulk messages...');
        
        const response = await api.post('/whatsapp/bulk', {
          studentIds: data.studentIds,
          message: data.message,
          type: 'notification'
        });
  
        const { summary } = response.data;
        toast.update(toastId, {
          render: `Messages sent: ${summary.successful} successful, ${summary.failed} failed`,
          type: summary.failed === 0 ? 'success' : 'warning',
          isLoading: false,
          autoClose: 5000
        });
  
        return response.data;
      } catch (error) {
        console.error('Error sending bulk messages:', error);
        toast.error('Failed to send bulk messages');
        throw error;
      }
    },
  
    getWhatsAppStatus: async () => {
      try {
        const response = await api.get('/whatsapp/status');
        if (response.data?.status) {
          return {
            isReady: response.data.status.isReady,
            error: response.data.status.error,
            qrCode: response.data.status.qrCode,
            connectionEvents: response.data.status.connectionEvents || [],
            messageStats: response.data.status.messageStats || {
              total: 0,
              successful: 0,
              failed: 0,
              pending: 0
            },
            connectionDuration: response.data.status.connectionDuration,
            serverTime: response.data.status.serverTime
          };
        }
        return { isReady: false, error: null };
      } catch (error) {
        console.error('Error getting WhatsApp status:', error);
        throw error;
      }
    },
  
    getQRCode: async () => {
      try {
        const response = await api.get('/whatsapp/qr');
        return {
          success: response.data.success,
          qrCode: response.data.qrCode,
          timestamp: response.data.timestamp,
          expiresIn: response.data.expiresIn || 60,
          message: response.data.message,
          shouldRetry: response.data.shouldRetry || false,
          retryAfter: response.data.retryAfter || 2,
          isConnected: response.data.isConnected || false
        };
      } catch (error) {
        console.error('Error getting QR code:', error);
        if (error.response && error.response.data) {
          // Return structured error response from server if available
          return {
            success: false,
            shouldRetry: error.response.data.shouldRetry || true,
            retryAfter: error.response.data.retryAfter || 3,
            message: error.response.data.message || 'Failed to get QR code'
          };
        }
        throw error;
      }
    },
  
    refreshQRCode: async () => {
      try {
        const isServerUp = await checkServerConnectivity();
        if (!isServerUp) {
          throw new Error('Server is not responding. Please check if the server is running.');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await api.post('/whatsapp/qr/refresh');
        return {
          success: response.data.success,
          qrCode: response.data.qrCode,
          timestamp: response.data.timestamp,
          expiresIn: response.data.expiresIn || 60,
          message: response.data.message,
          shouldRetry: response.data.shouldRetry || false,
          retryAfter: response.data.retryAfter || 2,
          isConnected: response.data.isConnected || false
        };
      } catch (error) {
        console.error('Error refreshing QR code:', error);

        if (error.message === 'Server connection failed') {
          throw new Error('Cannot connect to server. Please check if the server is running.');
        } else if (error.response && error.response.status === 404) {
          throw new Error('QR refresh endpoint not found. Please check server configuration.');
        } else if (error.response && error.response.status === 500) {
          throw new Error('Server error while refreshing QR code. Please try again later.');
        } else if (error.response && error.response.data) {
          // Return structured error response from server if available
          return {
            success: false,
            shouldRetry: error.response.data.shouldRetry || true,
            retryAfter: error.response.data.retryAfter || 3,
            message: error.response.data.message || 'Failed to refresh QR code'
          };
        }
        
        throw error;
      }
    },
  
    logoutWhatsApp: async () => {
      try {
        const response = await api.post('/whatsapp/logout');
        return response.data;
      } catch (error) {
        console.error('Error logging out WhatsApp:', error);
        throw error;
      }
    },
  
    async checkPreviousDayAttendance() {
      const response = await axiosInstance.post('/api/whatsapp/check-previous');
      return response.data;
    },
  
    getStudentsForMessaging: async (search = '', page = 1, limit = 50) => {
      try {
        const response = await api.get('/whatsapp/students', {
          params: { search, page, limit }
        });
        return response.data;
      } catch (error) {
        console.error('Error getting students for messaging:', error);
        throw error;
      }
    },
  
    sendMessageToStudent: async (studentId, message, type = 'notification') => {
      try {
        const response = await axios.post(
          `${API_URL}/whatsapp/send-to-student`,
          { studentId, message, type },
          { 
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error sending message to student:', error);
        throw error;
      }
    },
  };

export default messagingService;