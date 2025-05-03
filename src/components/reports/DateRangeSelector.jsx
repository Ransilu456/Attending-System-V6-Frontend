import { Calendar } from 'lucide-react';
import { DateTime } from 'luxon';
import { useTheme } from '../../context/ThemeContext';
import 'react-datepicker/dist/react-datepicker.css';

// Helper function to format date for input
const formatDate = (date) => {
  if (!date) return '';
  try {
    return DateTime.fromJSDate(new Date(date)).toFormat('yyyy-MM-dd');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// DateRangeSelector component for Weekly and Monthly reports
const DateRangeSelector = ({ reportType, selectedDate, setSelectedDate, startDate, setStartDate, endDate, setEndDate }) => {
  const { theme } = useTheme();
  const todayDate = new Date();
  const today = formatDate(todayDate);
  const formattedToday = todayDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  // For daily report, just show date picker
  if (reportType === 'daily') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Date
        </label>
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
          <input
            type="date"
            value={formatDate(selectedDate)}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(new Date(e.target.value));
              }
            }}
            max={today}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-700 dark:text-white transition-colors duration-200"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Please select a date not in the future. Today is {formattedToday}.</p>
      </div>
    );
  }
  
  // For weekly/monthly reports, show date range pickers
  if (reportType === 'weekly' || reportType === 'monthly') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {reportType === 'weekly' ? 'Select Week Range' : 'Select Month Range'}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <input
                type="date"
                value={formatDate(startDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    const newStartDate = new Date(e.target.value);
                    setStartDate(newStartDate);
                    
                    // If end date is before start date, set end date to start date
                    const endDateObj = new Date(endDate);
                    if (endDateObj < newStartDate) {
                      setEndDate(newStartDate);
                    }
                  }
                }}
                max={today}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <input
                type="date"
                value={formatDate(endDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    setEndDate(new Date(e.target.value));
                  }
                }}
                max={today}
                min={formatDate(startDate)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Date range must be in the past. Today is {formattedToday}.
        </p>
      </div>
    );
  }
  
  // For individual student reports
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Date Range for Student
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
            <input
              type="date"
              value={formatDate(startDate)}
              onChange={(e) => {
                if (e.target.value) {
                  const newStartDate = new Date(e.target.value);
                  setStartDate(newStartDate);
                  
                  // If end date is before start date, set end date to start date
                  const endDateObj = new Date(endDate);
                  if (endDateObj < newStartDate) {
                    setEndDate(newStartDate);
                  }
                }
              }}
              max={today}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-700 dark:text-white transition-colors duration-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
            <input
              type="date"
              value={formatDate(endDate)}
              onChange={(e) => {
                if (e.target.value) {
                  setEndDate(new Date(e.target.value));
                }
              }}
              max={today}
              min={formatDate(startDate)}
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-700 dark:text-white transition-colors duration-200"
            />
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Date range must be in the past. Today is {formattedToday}.
      </p>
    </div>
  );
};

export default DateRangeSelector; 