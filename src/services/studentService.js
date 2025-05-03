import api from './api';
import { toast } from 'react-toastify';

export const studentService = {
  getAllStudents: async () => {
    try {
      const response = await api.get('/admin/students');
      return response;
    } catch (error) {
      if (!error.response) {
        toast.error('Network error. Please check your connection.');
      }
      throw error;
    }
  },
  registerStudent: async (data) => {
    const formattedData = {
      ...data,
      indexNumber: data.indexNumber?.toUpperCase(),
      parent_telephone: data.parent_telephone?.trim() 
    };
    return api.post('/admin/students', formattedData);
  },
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  markAttendance: (data) => api.post('/admin/students/attendance', data),
  getScannedStudentsToday: () => api.get('/admin/students/scanned-today'),
  getAttendanceReport: (date) => api.get(`/admin/students/attendance-report?date=${date}`, {
    responseType: 'arraybuffer',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }),
  bulkImportStudents: (formData) => api.post('/admin/students/bulk-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  getStudentAttendanceHistory: async (studentId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
 
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const queryString = queryParams.toString();
      const url = `/admin/students/${studentId}/attendance${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance history:', error);
      toast.error('Failed to fetch attendance history. Please try again.');
      throw error;
    }
  },
  
  clearAttendanceHistory: async (studentId) => {
    try {
    
      if (!window.confirm('Are you sure you want to clear all attendance history for this student? This action cannot be undone.')) {
        return { cancelled: true };
      }
      
      const response = await api.delete(`/admin/students/${studentId}/attendance/clear`);
      toast.success('Successfully cleared attendance history');
      return response.data;
    } catch (error) {
      console.error('Error clearing attendance history:', error);
      toast.error('Failed to clear attendance history. Please try again.');
      throw error;
    }
  },
  
  deleteAttendanceRecord: async (studentId, recordId) => {
    try {
     
      if (!window.confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        return { cancelled: true };
      }
      
      const response = await api.delete(`/admin/students/${studentId}/attendance/${recordId}`);
      toast.success('Successfully deleted attendance record');
      return response.data;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      toast.error('Failed to delete attendance record. Please try again.');
      throw error;
    }
  }
};

export default studentService;