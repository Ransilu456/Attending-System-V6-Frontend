import { useState, useEffect, useCallback } from 'react';
import QRScanner from '../../components/scanner/QRScanner';
import QRGenerator from '../../components/scanner/QRGenerator';
import DigitalQRScanner from '../../components/scanner/DigitalQRScanner';
import attendanceService from '../../services/attendanceServices';

import { toast } from 'react-toastify';
import { DateTime } from 'luxon';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    if (timestamp instanceof Date) {
      return DateTime.fromJSDate(timestamp)
        .setZone('Asia/Colombo')
        .toLocaleString({
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
    }
    
    const parsedTime = DateTime.fromISO(timestamp);
    if (parsedTime.isValid) {
      return parsedTime.setZone('Asia/Colombo').toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return DateTime.fromJSDate(new Date(timestamp))
      .setZone('Asia/Colombo')
      .toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
  } catch (e) {
    console.warn('Invalid time format:', timestamp);
    return 'N/A';
  }
};

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const QRScannerPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState({ students: [], stats: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);


  const fetchRecentAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (typeof attendanceService.getRecentAttendance !== 'function') {
        console.error('Error: attendanceService.getRecentAttendance is not a function');
        setError('Recent attendance feature is not available');
        setRecentAttendance({ students: [], stats: {} });
        return;
      }
      
      const response = await attendanceService.getRecentAttendance();
      
      if (!response.data) {
        setRecentAttendance({ students: [], stats: {} });
        return;
      }
      
      // Process the student data
      const processedStudents = (response.data.students || []).map(student => {
        return {
          ...student,
          id: student.id || student._id,
          indexNumber: student.indexNumber?.toUpperCase() || 'N/A',
          displayStatus: student.status === 'entered' ? 'Present' :
                        student.status === 'left' ? 'Left' :
                        student.status === 'late' ? 'Late' :
                        'Absent',
          messageStatus: student.messageStatus || 'pending'
        };
      });
      
      setRecentAttendance({
        students: processedStudents,
        stats: response.data.stats || {
          totalCount: processedStudents.length,
          presentCount: processedStudents.filter(s => s.status === 'entered').length,
          absentCount: processedStudents.filter(s => s.status === 'absent').length,
          leftCount: processedStudents.filter(s => s.status === 'left').length
        }
      });
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
      setError('Failed to fetch recent attendance data');
      toast.error('Failed to fetch recent attendance');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchRecentAttendance();
    const interval = setInterval(fetchRecentAttendance, 60000);
    return () => clearInterval(interval);
  }, [fetchRecentAttendance]);

  useEffect(() => {
    if (scanSuccess) {
      fetchRecentAttendance();
    }
  }, [scanSuccess, fetchRecentAttendance]);

  // Reset scan result after delay
  useEffect(() => {
    let timer;
    if (scanResult) {
      timer = setTimeout(() => {
        setScanResult(null);
        setScanSuccess(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scanResult]);

  const handleScanSuccess = useCallback(async (result) => {
    try {
      let parsedData = result;
      if (typeof result === 'string') {
        try {
          parsedData = JSON.parse(result);
        } catch (error) {
          console.error('Error parsing scan result:', error);
          throw new Error('Invalid QR code format');
        }
      }
      
      if (parsedData.student) {
        parsedData = {
          ...parsedData.student,
          status: parsedData.status || parsedData.student.status,
          timestamp: parsedData.timestamp || new Date().toISOString(),
          entryTime: parsedData.entryTime || parsedData.student.entryTime,
          leaveTime: parsedData.leaveTime || parsedData.student.leaveTime
        };
      }
      
      if (!parsedData || !parsedData.indexNumber) {
        throw new Error('Invalid QR code data. Missing student information.');
      }
      
      setScanResult(parsedData);
      setScanSuccess(true);
      
      const statusDisplay = parsedData.status || 'present';
      toast.success(`Attendance marked for ${parsedData.name || 'Student'} as ${statusDisplay}`);
      
      await fetchRecentAttendance();
      
    } catch (error) {
      console.error('Error processing scan result:', error);
      toast.error(error.message || 'Failed to process QR code data');
      setScanSuccess(false);
      setScanResult(null);
    }
  }, [fetchRecentAttendance]);

  const handleScanError = useCallback((error) => {
    console.error('Scan error:', error);
    toast.error(error.message || 'Failed to scan QR code');
    setScanSuccess(false);
    setScanResult(null);
  }, []);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'present' || statusLower === 'entered') {
      return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100';
    } else if (statusLower === 'left') {
      return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100';
    } else if (statusLower === 'late') {
      return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100';
    } else if (statusLower === 'absent') {
      return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100';
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  {/*const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
      <motion.div
        className="w-8 h-8 border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
    </div>
  );*/}

 {/* const RecentAttendanceSection = ({ recentAttendance, loading, error }) => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="text-red-500 dark:text-red-400 p-4 text-center">
          <AlertTriangle className="h-5 w-5 inline mr-2" />
          {error.message || 'Failed to load recent attendance'}
        </div>
      );
    }

    if (!recentAttendance?.students?.length) {
      return (
        <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
          <Info className="h-5 w-5 inline mr-2" />
          No attendance records for today
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Students</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{recentAttendance.stats.totalCount}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Present</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">{recentAttendance.stats.presentCount}</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Absent</p>
            <p className="text-2xl font-bold text-red-800 dark:text-red-200">{recentAttendance.stats.absentCount}</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Left</p>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{recentAttendance.stats.leftCount}</p>
          </div>
        </div>

        <table className="min-w-full bg-white dark:bg-slate-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-gray-700 dark:text-gray-200">Name</th>
              <th className="px-4 py-2 text-gray-700 dark:text-gray-200">Index Number</th>
              <th className="px-4 py-2 text-gray-700 dark:text-gray-200">Status</th>
              <th className="px-4 py-2 text-gray-700 dark:text-gray-200">Time</th>
              <th className="px-4 py-2 text-gray-700 dark:text-gray-200">Message Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAttendance.students.map((record, index) => (
              <tr key={`${record._id}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{record.name}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{record.indexNumber}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${record.status === 'entered' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' :
                      record.status === 'left' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' :
                      'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                  {record.timestamp ? formatTime(new Date(record.timestamp)) : 'N/A'}
                </td>
                <td className="px-4 py-2">
                  {record.messageStatus ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${record.messageStatus === 'sent' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' :
                        record.messageStatus === 'failed' ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100' :
                        record.messageStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {record.messageStatus.charAt(0).toUpperCase() + record.messageStatus.slice(1)}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">No message</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };*/}

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">QR Code Scanner</h1>
              
          
              {scanResult && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-4 rounded-md ${scanSuccess ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-700'} border-l-4`}
                >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {scanSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-300" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" aria-hidden="true" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${scanSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      {scanSuccess ? 'Attendance Marked Successfully' : 'Scan Error'}
                    </h3>
                    <div className={`mt-2 text-sm ${scanSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {scanSuccess ? (
                        <div className="space-y-2">
                          <p className="font-semibold">Student Details:</p>
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-green-200 dark:border-green-800 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">Name:</p>
                              <p className="font-medium text-gray-800 dark:text-white">{scanResult.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">Index Number:</p>
                              <p className="font-medium text-gray-800 dark:text-white">{scanResult.indexNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">Email:</p>
                              <p className="font-medium text-gray-800 dark:text-white">
                                {scanResult.student_email || 
                                  scanResult.email || 
                                  scanResult.student?.student_email || 
                                  scanResult.student?.email || 
                                  'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">Address:</p>
                              <p className="font-medium text-gray-800 dark:text-white">
                                {scanResult.address || 
                                  scanResult.student?.address || 
                                  'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">Status:</p>
                              <p className="font-medium">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getStatusColor(scanResult.status)
                                }`}>
                                  {scanResult.status === 'entered' ? 'Present' : 
                                   scanResult.status === 'left' ? 'Left' : 
                                   scanResult.status || 'Present'}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">Time:</p>
                              <p className="font-medium text-gray-800 dark:text-white">{formatTime(scanResult.timestamp || new Date())}</p>
                            </div>
                            {scanResult.entryTime && (
                              <div>
                                <p className="text-gray-600 dark:text-gray-300 text-xs">Entry Time:</p>
                                <p className="font-medium text-gray-800 dark:text-white">{formatTime(scanResult.entryTime)}</p>
                              </div>
                            )}
                            {scanResult.leaveTime && (
                              <div>
                                <p className="text-gray-600 dark:text-gray-300 text-xs">Exit Time:</p>
                                <p className="font-medium text-gray-800 dark:text-white">{formatTime(scanResult.leaveTime)}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs">WhatsApp Notification:</p>
                              <p className="font-medium">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${scanResult.messageStatus === 'sent' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' :
                                    scanResult.messageStatus === 'failed' ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100' :
                                    scanResult.messageStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' :
                                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                  {scanResult.messageStatus ? scanResult.messageStatus.charAt(0).toUpperCase() + scanResult.messageStatus.slice(1) : 'Not Sent'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p>Failed to process QR code. Please try again.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              )}
              
              <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 dark:bg-blue-900/40 p-1">
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                        'ring-white dark:ring-slate-700 ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600 dark:hover:text-blue-300'
                      )
                    }
                  >
                    Camera Scanner
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                        'ring-white dark:ring-slate-700 ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600 dark:hover:text-blue-300'
                      )
                    }
                  >
                    Upload QR Image
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                        'ring-white dark:ring-slate-700 ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600 dark:hover:text-blue-300'
                      )
                    }
                  >
                    Search for QR
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-4">
                  <Tab.Panel className={classNames('rounded-xl p-3')}>
                    <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                  </Tab.Panel>
                  <Tab.Panel className={classNames('rounded-xl p-3')}>
                    <DigitalQRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                  </Tab.Panel>
                  <Tab.Panel className={classNames('rounded-xl p-3')}>
                    <QRGenerator />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
       
       {/*<div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Today's Attendance</h2>
                  <button
                    onClick={fetchRecentAttendance}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg shadow-sm px-4 py-5 border border-gray-100 dark:border-gray-600">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Total</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{recentAttendance.stats.totalCount}</dd>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/50 rounded-lg shadow-sm px-4 py-5 border border-green-100 dark:border-green-800">
                    <dt className="text-sm font-medium text-green-600 dark:text-green-200 truncate">Present</dt>
                    <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-200">{recentAttendance.stats.presentCount}</dd>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-lg shadow-sm px-4 py-5 border border-yellow-100 dark:border-yellow-800">
                    <dt className="text-sm font-medium text-yellow-600 dark:text-yellow-200 truncate">Late</dt>
                    <dd className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-200">{recentAttendance.stats.leftCount}</dd>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/50 rounded-lg shadow-sm px-4 py-5 border border-red-100 dark:border-red-800">
                    <dt className="text-sm font-medium text-red-600 dark:text-red-200 truncate">Absent</dt>
                    <dd className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-200">{recentAttendance.stats.absentCount}</dd>
                  </div>
                </div>

                <RecentAttendanceSection recentAttendance={recentAttendance} loading={loading} error={error} />
              </div>
            </div>
          </div>
        </div>*/}
      </div>
    </div>
  );
};

export default QRScannerPage;