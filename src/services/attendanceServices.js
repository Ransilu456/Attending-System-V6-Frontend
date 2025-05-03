import api from './api';
import { toast } from 'react-toastify';
import reportService from './reportService';

const attendanceService = {
  markAttendance: (data) => {
    const attendanceData = {
      ...data,
      deviceInfo: data.deviceInfo || navigator.userAgent,
      scanLocation: data.scanLocation || 'Main Entrance'
    };
    return api.post('/admin/attendance', attendanceData);
  },
  
  markManualAttendance: async (studentId, status, options = {}) => {
    try {
      const attendanceData = {
        studentId,
        status,
        deviceInfo: navigator.userAgent,
        scanLocation: options.location || 'Manual Entry',
        adminNote: options.adminNote || 'Manually marked by admin',
        sendNotification: options.sendNotification !== false,
        date: options.date || new Date().toISOString()
      };
      
      console.log('Marking manual attendance:', attendanceData);
      const response = await api.post('/admin/attendance', attendanceData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success(`Student ${status === 'entered' ? 'checked in' : status === 'left' ? 'checked out' : 'marked as ' + status} successfully`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error marking manual attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      throw error;
    }
  },
  
  configureAutoCheckout: async (settings) => {
    try {
      const response = await api.post('/admin/attendance/auto-checkout/configure', settings);
      
      if (response.status === 200) {
        toast.success('Auto-checkout settings updated successfully');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error configuring auto-checkout:', error);
      toast.error(error.response?.data?.message || 'Failed to update auto-checkout settings');
      throw error;
    }
  },
  
  getAutoCheckoutSettings: async () => {
    try {
      const response = await api.get('/admin/attendance/auto-checkout/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting auto-checkout settings:', error);
      return {
        enabled: false,
        time: '18:30',
        sendNotification: true
      };
    }
  },
  
  runAutoCheckout: async () => {
    try {
      const response = await api.post('/admin/attendance/auto-checkout/run');
      
      if (response.status === 200) {
        const { processed, failed } = response.data;
        toast.success(`Auto-checkout completed: ${processed} students processed, ${failed} failed`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error running auto-checkout:', error);
      toast.error(error.response?.data?.message || 'Failed to run auto-checkout');
      throw error;
    }
  },
  
  markStudentAttendance: (data) => {
    const attendanceData = {
      ...data,
      deviceInfo: data.deviceInfo || navigator.userAgent,
      scanLocation: data.scanLocation || 'Main Entrance'
    };
    return api.post('/admin/attendance/student', attendanceData);
  },
  
  markAttendanceByQR: (qrData) => {
    const enrichedData = {
      qrCodeData: qrData,
      deviceInfo: navigator.userAgent,
      scanLocation: 'QR Scanner'
    };
    return api.post('/students/mark-attendance', enrichedData);
  },
  
  getTodayAttendance: () => api.get('/admin/attendance/today'),
  getRecentAttendance: () => api.get('/admin/attendance/recent'),
  getAttendanceByDate: (date) => {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    return api.get(`/admin/attendance/${formattedDate}`);
  },
  getAttendanceReport: (date) => {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    return api.get(`/admin/attendance/report?date=${formattedDate}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  },

  get: (url, config = {}) => api.get(url, config),
  getAllStudents: () => api.get('/admin/students'),
  generateDailyReport: (params) => {
    console.warn('attendanceService.generateDailyReport is deprecated. Use reportService.generateReport("daily", params) instead');
    return reportService.generateReport('daily', params);
  },
  generateWeeklyReport: (params) => {
    console.warn('attendanceService.generateWeeklyReport is deprecated. Use reportService.generateReport("weekly", params) instead');
    return reportService.generateReport('weekly', params);
  },
  generateMonthlyReport: (params) => {
    console.warn('attendanceService.generateMonthlyReport is deprecated. Use reportService.generateReport("monthly", params) instead');
    return reportService.generateReport('monthly', params);
  },
  generateIndividualReport: (params) => {
    console.warn('attendanceService.generateIndividualReport is deprecated. Use reportService.generateReport("individual", params) instead');
    return reportService.generateReport('individual', params);
  },
  getDailyReportPreview: (params) => {
    console.warn('attendanceService.getDailyReportPreview is deprecated. Use reportService.getDailyReportPreview instead');
    return reportService.getDailyReportPreview(params);
  },
  getWeeklyReportPreview: (params) => {
    console.warn('attendanceService.getWeeklyReportPreview is deprecated. Use reportService.getWeeklyReportPreview instead');
    return reportService.getWeeklyReportPreview(params);
  },
  getMonthlyReportPreview: (params) => {
    console.warn('attendanceService.getMonthlyReportPreview is deprecated. Use reportService.getMonthlyReportPreview instead');
    return reportService.getMonthlyReportPreview(params);
  },
  getIndividualReportPreview: (params) => {
    console.warn('attendanceService.getIndividualReportPreview is deprecated. Use reportService.getIndividualReportPreview instead');
    return reportService.getIndividualReportPreview(params);
  },
  
  getFormattedDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },
  
  getDateRange: (startDate, endDate) => {
    return {
      startDate: attendanceService.getFormattedDate(startDate),
      endDate: attendanceService.getFormattedDate(endDate)
    };
  },
  
  formatReportParams: (params) => {
    const formattedParams = { ...params };
    
    if (formattedParams.date) {
      formattedParams.date = attendanceService.getFormattedDate(formattedParams.date);
    }
    
    if (formattedParams.startDate) {
      formattedParams.startDate = attendanceService.getFormattedDate(formattedParams.startDate);
    }
    
    if (formattedParams.endDate) {
      formattedParams.endDate = attendanceService.getFormattedDate(formattedParams.endDate);
    }
    
    formattedParams.includeEntryTime = true;
    formattedParams.includeLeaveTime = true;
    formattedParams.includeDuration = true;
    formattedParams.includeLocation = true;
    
    return formattedParams;
  },
  
  generateReport: (reportType, params, headers = {}) => {
    console.log(`Generating ${reportType} with params:`, params);
    console.warn('attendanceService.generateReport is deprecated. Please use reportService.generateReport instead.');
    return reportService.generateReport(reportType.replace('AttendanceReport', ''), params, headers);
  },
  
  canCheckOut: (student) => {
    if (!student) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecord = student.attendanceHistory?.find(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
    
    return todayRecord && 
           (todayRecord.status === 'entered' || todayRecord.status === 'present') && 
           !todayRecord.leaveTime;
  }
};

export default attendanceService;