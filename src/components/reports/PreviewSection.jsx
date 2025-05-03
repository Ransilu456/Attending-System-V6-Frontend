import { AlertCircle, Eye } from 'lucide-react';
import { calculateEnhancedDuration } from '../../utils/formatters';
import { DateTime } from 'luxon';
import { motion } from 'framer-motion';


const formatEnhancedTime = (time) => {
  if (!time) return 'N/A';
  
  try {
    if (typeof time === 'object' && time.$date) {
      if (time.$date.$numberLong) {
        const timestamp = parseInt(time.$date.$numberLong);
        return DateTime.fromMillis(timestamp)
          .setZone('Asia/Colombo')
          .toLocaleString(DateTime.TIME_WITH_SECONDS);
      } else if (typeof time.$date === 'string') {
        return DateTime.fromISO(time.$date)
          .setZone('Asia/Colombo')
          .toLocaleString(DateTime.TIME_WITH_SECONDS);
      }
    }
    
    // Handle standard MongoDB ISODate format
    if (typeof time === 'object' && time.$$date) {
      return DateTime.fromMillis(time.$$date)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    
    // Handle Date object
    if (time instanceof Date) {
      return DateTime.fromJSDate(time)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    
    // Handle ISO string
    if (typeof time === 'string') {
      const parsedTime = DateTime.fromISO(time);
      if (parsedTime.isValid) {
        return parsedTime
          .setZone('Asia/Colombo')
          .toLocaleString(DateTime.TIME_WITH_SECONDS);
      }
    }
    
    // Handle timestamp (number)
    if (typeof time === 'number') {
      return DateTime.fromMillis(time)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    
    // Last resort - try parsing as regular date string
    const fallbackDate = new Date(time);
    if (!isNaN(fallbackDate.getTime())) {
      return DateTime.fromJSDate(fallbackDate)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    
    console.warn('Unrecognized time format:', time);
    return 'N/A';
  } catch (e) {
    console.warn(`Error formatting time: ${JSON.stringify(time)}`, e);
    return 'N/A';
  }
};

// Enhanced date formatting function
const formatEnhancedDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    // Handle MongoDB date format with $date.$numberLong
    if (typeof date === 'object' && date.$date) {
      if (date.$date.$numberLong) {
        const timestamp = parseInt(date.$date.$numberLong);
        return DateTime.fromMillis(timestamp)
          .setZone('Asia/Colombo')
          .toLocaleString(DateTime.DATE_MED);
      } else if (typeof date.$date === 'string') {
        return DateTime.fromISO(date.$date)
          .setZone('Asia/Colombo')
          .toLocaleString(DateTime.DATE_MED);
      }
    }
    
    // Handle Date object
    if (date instanceof Date) {
      return DateTime.fromJSDate(date)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.DATE_MED);
    }
    
    // Handle ISO string
    if (typeof date === 'string') {
      const parsedDate = DateTime.fromISO(date);
      if (parsedDate.isValid) {
        return parsedDate.setZone('Asia/Colombo').toLocaleString(DateTime.DATE_MED);
      }
    }
    
    // Handle timestamp
    if (typeof date === 'number') {
      return DateTime.fromMillis(date)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.DATE_MED);
    }
    
    // Last resort
    const fallbackDate = new Date(date);
    if (!isNaN(fallbackDate.getTime())) {
      return DateTime.fromJSDate(fallbackDate)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.DATE_MED);
    }
    
    console.warn('Unrecognized date format:', date);
    return 'N/A';
  } catch (e) {
    console.warn(`Error formatting date: ${JSON.stringify(date)}`, e);
    return 'N/A';
  }
};

// PreviewSection component for showing preview of reports
const PreviewSection = ({ reportType, previewData, loading, error, selectedDate }) => {
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"
        ></motion.div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Loading preview data...</p>
      </motion.div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-md shadow-md"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-600 dark:text-red-300">{error.message || 'Failed to load preview data'}</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (!previewData || 
      (
        !previewData.students && 
        !previewData.student && 
        !previewData.data && 
        !previewData.attendanceRecords && 
        !Array.isArray(previewData) && 
        (Array.isArray(previewData) && previewData.length === 0)
      )
    ) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-6 shadow-sm"
      >
        <p>No preview data available. Generate a preview to see report data.</p>
      </motion.div>
    );
  }

  // Table headers based on report type
  const getTableHeaders = () => {
    switch (reportType) {
      case 'daily':
        return (
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Index Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Entry Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Leave Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Duration</th>
          </tr>
        );
      case 'weekly':
        return (
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Index Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Days Present</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Days Absent</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Attendance Rate</th>
          </tr>
        );
      case 'monthly':
        return (
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Index Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Month</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Days Present</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Days Absent</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Attendance Rate</th>
          </tr>
        );
      case 'individual':
        return (
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Entry Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Leave Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Duration</th>
          </tr>
        );
      default:
        return (
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Index Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">Status</th>
          </tr>
        );
    }
  };
  
  // Table rows based on report type
  const getTableRows = () => {
    // For daily report type
    if (reportType === 'daily') {
      // Handle both array and object response formats
      const students = previewData.data || previewData.students || previewData;
      
      if (!students || !Array.isArray(students) || students.length === 0) {
        return (
          <tr>
            <td colSpan="6" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              No data available for selected date
            </td>
          </tr>
        );
      }
      
      return students.map((item, index) => {
        // Find the most recent attendance record for the selected date (if available)
        let mostRecentRecord = null;
        if (item.attendanceHistory && item.attendanceHistory.length > 0) {
          // Get the selected date string to compare with record dates
          const selectedDateStr = formatEnhancedDate(selectedDate);
          
          // Find records that match the selected date
          const matchingRecords = item.attendanceHistory.filter(record => {
            const recordDate = formatEnhancedDate(new Date(record.date));
            return recordDate === selectedDateStr;
          });
          
          // If we have matching records, use the most recent one (usually the last one)
          if (matchingRecords.length > 0) {
            mostRecentRecord = matchingRecords[matchingRecords.length - 1];
          }
        }
        
        // Use the most recent record info if available, otherwise fallback to the top-level data
        const status = mostRecentRecord ? 
          (mostRecentRecord.status === 'entered' ? 'Present' : 
           mostRecentRecord.status === 'left' ? 'Left' : 
           mostRecentRecord.status === 'late' ? 'Late' : 'Absent') : 
          item.status;
          
        const entryTime = mostRecentRecord ? mostRecentRecord.entryTime : item.entryTime;
        const leaveTime = mostRecentRecord ? mostRecentRecord.leaveTime : item.leaveTime;
        
        return (
          <tr key={`daily-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'}>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.name || 'N/A'}</td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.indexNumber || 'N/A'}</td>
            <td className="px-4 py-3 text-sm">
              <span className={`px-2 py-1 text-xs rounded-full ${
                status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                status === 'Left' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' :
                status === 'Absent' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {status || 'Unknown'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatEnhancedTime(entryTime)}</td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatEnhancedTime(leaveTime)}</td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
              {entryTime && leaveTime 
                ? calculateEnhancedDuration(entryTime, leaveTime) 
                : 'N/A'}
            </td>
          </tr>
        );
      });
    }

    // For weekly report type
    if (reportType === 'weekly') {
      // Handle different response formats
      let students = [];
      
      if (previewData.students && Array.isArray(previewData.students)) {
        students = previewData.students;
      } else if (previewData.data && Array.isArray(previewData.data)) {
        students = previewData.data;
      } else if (Array.isArray(previewData)) {
        students = previewData;
      }
      
      return students.length === 0 ? (
        <tr>
          <td colSpan="5" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
            No data available for selected date range
          </td>
        </tr>
      ) : students.map((item, index) => (
        <tr key={`weekly-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'}>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.name || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.indexNumber || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.daysPresent || 0}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.daysAbsent || 0}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
            {typeof item.attendanceRate === 'number' 
              ? `${item.attendanceRate.toFixed(1)}%` 
              : 'N/A'}
          </td>
        </tr>
      ));
    }

    // For monthly report type
    if (reportType === 'monthly') {
      // Handle different response formats
      let students = [];
      
      if (previewData.students && Array.isArray(previewData.students)) {
        students = previewData.students;
      } else if (previewData.data && Array.isArray(previewData.data)) {
        students = previewData.data;
      } else if (Array.isArray(previewData)) {
        students = previewData;
      }
      
      return students.length === 0 ? (
        <tr>
          <td colSpan="6" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
            No data available for selected date range
          </td>
        </tr>
      ) : students.map((item, index) => (
        <tr key={`monthly-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'}>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.name || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.indexNumber || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.month || 'N/A'}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.daysPresent || 0}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.daysAbsent || 0}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
            {typeof item.attendanceRate === 'number' 
              ? `${item.attendanceRate.toFixed(1)}%` 
              : 'N/A'}
          </td>
        </tr>
      ));
    }

    // For individual report type
    if (reportType === 'individual') {
      // Handle different response formats
      let records = [];
      
      if (previewData.student && Array.isArray(previewData.student.attendanceRecords)) {
        records = previewData.student.attendanceRecords;
      } else if (previewData.data && Array.isArray(previewData.data)) {
        records = previewData.data;
      } else if (previewData.attendanceRecords && Array.isArray(previewData.attendanceRecords)) {
        records = previewData.attendanceRecords;
      } else if (Array.isArray(previewData)) {
        records = previewData;
      }
      
      return records.length === 0 ? (
        <tr>
          <td colSpan="5" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
            No data available for selected student
          </td>
        </tr>
      ) : records.map((item, index) => (
        <tr key={`individual-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'}>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatEnhancedDate(item.date)}</td>
          <td className="px-4 py-3 text-sm">
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
              item.status === 'Left' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' :
              item.status === 'Absent' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {item.status || 'Unknown'}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatEnhancedTime(item.entryTime)}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatEnhancedTime(item.leaveTime)}</td>
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
            {item.entryTime && item.leaveTime 
              ? calculateEnhancedDuration(item.entryTime, item.leaveTime) 
              : 'N/A'}
          </td>
        </tr>
      ));
    }

    return (
      <tr>
        <td colSpan="6" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
          No data available
        </td>
      </tr>
    );
  };
  
  // Get count of records for display
  const getRecordCount = () => {
    if (reportType === 'daily') {
      const students = previewData.data || previewData.students || previewData;
      return Array.isArray(students) ? students.length : 0;
    } else if (reportType === 'weekly' || reportType === 'monthly') {
      return (previewData.students || []).length;
    } else if (reportType === 'individual') {
      return (previewData.student?.attendanceRecords || []).length;
    }
    return 0;
  };
  
  // Show the table with the preview data
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
        <Eye className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
        Report Preview
        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
          {getRecordCount()} Records
        </span>
      </h3>
      
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-slate-700">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-600 dark:to-blue-500">
            {getTableHeaders()}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {getTableRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewSection; 