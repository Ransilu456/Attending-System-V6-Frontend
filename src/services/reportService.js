import api from './api'

const reportService = {
  /**
   * Generate various attendance reports
   * @param {string} reportType - Type of report: 'daily', 'weekly', 'monthly', or 'individual'
   * @param {object} params - Query parameters for the report 
   * @param {object} headers - Additional headers
   * @returns {Promise<Blob>} - Excel report as a blob
   */
  generateReport: async (reportType, params, headers = {}) => {
    try {
      // Map report types to endpoints
      const reportEndpoints = {
        'daily': '/reports/dailyAttendanceReport',
        'weekly': '/reports/weeklyAttendanceReport', 
        'monthly': '/reports/monthlyAttendanceReport',
        'individual': '/reports/individualStudentReport'
      };
      
      // Validate report type
      if (!reportEndpoints[reportType]) {
        throw new Error(`Unknown report type: ${reportType}`);
      }
      
      // Make the API request
      const response = await api.get(reportEndpoints[reportType], {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Type': 'application/json',
          'preserve-mongodb-format': 'true',
          'time-format': 'preserve-null',
          'mongodb-date-format': 'true',
          ...headers
        }
      });
      
      return response;
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
      throw error;
    }
  }
};

export default reportService;