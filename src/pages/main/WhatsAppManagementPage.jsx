import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Phone,
  LogOut,
  Send,
  RefreshCw,
  Shield,
  Clock,
  Settings,
  Users,
  QrCode,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  CheckSquare,
  Square,
  X
} from "lucide-react";

import messagingService from '../../services/messagingService';
import QRCode from 'qrcode.react';

// Student Selection Table Component
const StudentsTable = ({ onSendMessage }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const studentsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getStudentsForMessaging(searchTerm, currentPage, studentsPerPage);
      setStudents(response.students || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalStudents(response.pagination?.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
      setLoading(false);
      toast.error('Failed to load students');
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student._id));
    }
  };

  const handleSendBulkMessage = async () => {
    if (!bulkMessage.trim()) {
      toast.error('Please enter a message to send');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      setSubmitting(true);
      const result = await messagingService.sendBulkMessages({
        studentIds: selectedStudents,
        message: bulkMessage
      });

      setSubmitting(false);
      setBulkMessage('');
      setSelectedStudents([]);
      
      if (result.success) {
        toast.success(`Messages sent: ${result.summary.successful} successful, ${result.summary.failed} failed`);
      } else {
        toast.error('Failed to send messages');
      }
    } catch (error) {
      setSubmitting(false);
      toast.error('Error sending messages: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredStudents = searchTerm
    ? students.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.indexNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
    : students;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name or index number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={fetchStudents}
              className="btn btn-outline flex items-center gap-2 w-full md:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading students...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No students found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <button 
                        onClick={handleSelectAll}
                        className="focus:outline-none"
                        aria-label={selectedStudents.length === students.length ? "Deselect all" : "Select all"}
                      >
                        {selectedStudents.length === students.length ? (
                          <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Index Number
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Parent Phone
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleSelectStudent(student._id)}
                          className="focus:outline-none"
                          aria-label={selectedStudents.includes(student._id) ? "Deselect" : "Select"}
                        >
                          {selectedStudents.includes(student._id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.indexNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.parent_telephone}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => onSendMessage(student)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              Showing {filteredStudents.length > 0 ? (currentPage - 1) * studentsPerPage + 1 : 0} - {Math.min(currentPage * studentsPerPage, totalStudents)} of {totalStudents} students
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
              >
                Prev
              </button>
              
              <span className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div>
          <label className="form-label font-medium text-gray-700 dark:text-gray-300">Bulk Message</label>
          <textarea
            value={bulkMessage}
            onChange={(e) => setBulkMessage(e.target.value)}
            className="form-input w-full mt-1"
            rows={4}
            placeholder="Type your message to send to selected students..."
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {selectedStudents.length} {selectedStudents.length === 1 ? 'student' : 'students'} selected
          </div>
          <button
            onClick={handleSendBulkMessage}
            disabled={selectedStudents.length === 0 || !bulkMessage.trim() || submitting}
            className="btn btn-blue flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to Selected Students
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const WhatsAppManagementPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [whatsappStatus, setWhatsappStatus] = useState({ isReady: false, error: null });
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [connectionHistory, setConnectionHistory] = useState([]);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/whatsapp' } });
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }

    const checkStatus = async () => {
      try {
        const status = await messagingService.getWhatsAppStatus();
        setWhatsappStatus(status);
        if (status.connectionEvents) {
          setConnectionHistory(status.connectionEvents);
        }
        if (status.messageStats) {
          setMessageStats(status.messageStats);
        }
        if (!status.isReady && status.qrCode) {
          setQrCode(status.qrCode);
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        toast.error('Failed to check WhatsApp status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    let timer;
    if (qrCode) {
      timer = setTimeout(() => {
        setQrCode(null);
        toast.info('QR code expired. Please refresh to get a new one.');
      }, 60000);
    }
    return () => clearTimeout(timer);
  }, [qrCode]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const toastId = toast.loading('Disconnecting from WhatsApp...');
      await messagingService.logoutWhatsApp();
      
      toast.update(toastId, {
        render: 'Successfully disconnected from WhatsApp',
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      
      setWhatsappStatus({ isReady: false, error: null });
      setQrCode(null);
      
      // Start polling for QR code after logout
      let retryCount = 0;
      const maxRetries = 5;
      const pollForQR = async () => {
        try {
          console.log(`Attempt ${retryCount + 1} to get new QR code after logout...`);
          const result = await messagingService.getQRCode();
          
          if (result.qrCode) {
            console.log('New QR code received after logout');
            setQrCode(result.qrCode);
            setRefreshKey(prev => prev + 1);
            toast.success('QR code refreshed successfully');
            return true;
          } else if (retryCount < maxRetries) {
            retryCount++;
            toast.info(`Waiting for QR code... (Attempt ${retryCount}/${maxRetries})`);
            setTimeout(pollForQR, 2000);
            return false;
          } else {
            console.log('Failed to get QR code after maximum retries');
            toast.error('Could not get QR code automatically. Please refresh manually.');
            return false;
          }
        } catch (error) {
          console.error('Error polling for QR code:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(pollForQR, 2000);
            return false;
          } else {
            toast.error('Could not get QR code. Please refresh manually.');
            return false;
          }
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollForQR, 1500);
    } catch (error) {
      toast.error('Failed to disconnect from WhatsApp');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      toast.error('Please enter both number and message');
      return;
    }

    setIsSending(true);
    const toastId = toast.loading('Sending message...');

    try {
      const result = await messagingService.sendMessage({
        phoneNumber: testNumber,
        message: testMessage,
        type: 'test'
      });
      
      if (result.success) {
        setTestMessage('');
        toast.update(toastId, {
          render: `Message sent successfully to ${testNumber}`,
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else {
        let errorMessage = result.message || 'Failed to send message';
        
        if (result.code === 'CLIENT_NOT_READY') {
          errorMessage = 'WhatsApp client not ready. Please scan QR code to connect.';
          setWhatsappStatus({ isReady: false, error: errorMessage });
        } else if (result.code === 'AUTH_LOST' || result.code === 'INVALID_WID') {
          errorMessage = 'WhatsApp authentication lost. Please scan QR code again.';
          setWhatsappStatus({ isReady: false, error: errorMessage });
          setQrCode(null);
          handleRefreshQR();
        } else if (result.code === 'INVALID_PHONE') {
          errorMessage = 'Invalid phone number format. Please check and try again.';
        }
        
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: error.message || 'Failed to send message',
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshQR = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      const toastId = toast.loading('Refreshing QR code...');
      
      const result = await messagingService.refreshQRCode();
      if (result.qrCode) {
        setQrCode(result.qrCode);
        setRefreshKey(prev => prev + 1);
        toast.update(toastId, {
          render: 'QR code refreshed successfully',
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else if (result.shouldRetry) {
        toast.update(toastId, {
          render: 'QR code not available yet. Retrying...',
          type: "info",
          isLoading: false,
          autoClose: 3000
        });
        
        // Wait for the suggested retry time or default to 2000ms
        const retryAfter = (result.retryAfter || 2) * 1000;
        setTimeout(() => {
          attemptQRRefresh();
        }, retryAfter);
      } else {
        toast.update(toastId, {
          render: 'No QR code received. Please try again.',
          type: "warning",
          isLoading: false,
          autoClose: 3000
        });
        
        setTimeout(() => {
          attemptQRRefresh();
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to refresh QR code');
      // Try one more time automatically
      setTimeout(() => {
        attemptQRRefresh();
      }, 3000);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const attemptQRRefresh = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryRefresh = async () => {
      try {
        console.log(`Automatic QR refresh attempt ${retryCount + 1}/${maxRetries}...`);
        const result = await messagingService.refreshQRCode();
        
        if (result.qrCode) {
          setQrCode(result.qrCode);
          setRefreshKey(prev => prev + 1);
          toast.success('QR code obtained successfully');
          return true;
        } else if (retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
          return tryRefresh();
        } else {
          toast.error('Could not obtain QR code after multiple attempts. Try refreshing manually.');
          return false;
        }
      } catch (error) {
        console.error(`Error during automatic QR refresh attempt ${retryCount + 1}:`, error);
        if (retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
          return tryRefresh();
        } else {
          toast.error('Failed to refresh QR code. Please try manually.');
          return false;
        }
      }
    };
    
    return tryRefresh();
  };

  const handleEmergencyLogout = async () => {
    if (window.confirm('Are you sure you want to force logout? This will clear all WhatsApp sessions.')) {
      try {
        setIsLoggingOut(true);
        const toastId = toast.loading('Performing emergency logout...');
        
        await messagingService.logoutWhatsApp();
        
        toast.update(toastId, {
          render: 'Emergency logout successful',
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        
        setWhatsappStatus({ isReady: false, error: null });
        setQrCode(null);
        
        setTimeout(() => {
          handleRefreshQR();
        }, 1000);
      } catch (error) {
        toast.error('Emergency logout failed');
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  const handleSendToStudent = (student) => {
    if (student && student.parent_telephone) {
      setTestNumber(student.parent_telephone);
      setActiveTab('test');
      setTimeout(() => {
        const testSection = document.getElementById('test-message-section');
        if (testSection) {
          testSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      toast.error('Selected student has no parent phone number');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Messaging</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage WhatsApp connections and send messages to students
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-icon"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          {whatsappStatus.isReady && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn btn-danger flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Disconnecting...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Disconnect</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'status'
              ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('status')}
        >
          WhatsApp Status
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'students'
              ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('students')}
        >
          Student Messages
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'test'
              ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('test')}
        >
          Test Message
        </button>
      </div>

      {/* Content Based on Active Tab */}
      <div className="space-y-6">
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="card md:col-span-1">
              <div className="card-header">
                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="card-title">Connection Status</h2>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${whatsappStatus.isReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">
                      {whatsappStatus.isReady ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {whatsappStatus.connectionDuration && whatsappStatus.isReady && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {whatsappStatus.connectionDuration}
                    </span>
                  )}
                </div>
                {!whatsappStatus.isReady && (
                  <button
                    onClick={handleRefreshQR}
                    disabled={isRefreshing}
                    className="btn btn-sm btn-outline w-full mt-2 flex items-center justify-center gap-2"
                  >
                    {isRefreshing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        <span>Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Connection</span>
                      </>
                    )}
                  </button>
                )}
                {whatsappStatus.error && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    <p>{whatsappStatus.error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            {!whatsappStatus.isReady && (
              <div className="card md:col-span-2">
                <div className="card-header">
                  <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="card-title">Scan QR Code</h2>
                </div>
                <div className="flex flex-col items-center p-4">
                  {qrCode ? (
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <QRCode 
                        value={qrCode} 
                        size={220} 
                        level="H" 
                        includeMargin={true}
                        key={refreshKey}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-56 h-56 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Open WhatsApp on your phone and scan this QR code
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      QR code expires in 1 minute
                    </p>
                    <button 
                      onClick={handleRefreshQR}
                      disabled={isRefreshing}
                      className="btn btn-sm btn-outline mt-3 flex items-center justify-center gap-2 w-full max-w-xs mx-auto"
                    >
                      {isRefreshing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                          <span>Refreshing QR Code...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Refresh QR Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message Stats Card - Always visible */}
            <div className={`card ${whatsappStatus.isReady ? 'md:col-span-3' : 'md:col-span-2'}`}>
              <div className="card-header">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="card-title">Message Statistics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
                <StatCard 
                  label="Total Messages" 
                  value={messageStats.total} 
                  icon={<MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />} 
                />
                <StatCard 
                  label="Successful" 
                  value={messageStats.successful} 
                  icon={<CheckCircle className="w-5 h-5 text-green-500" />} 
                />
                <StatCard 
                  label="Failed" 
                  value={messageStats.failed} 
                  icon={<XCircle className="w-5 h-5 text-red-500" />} 
                />
                <StatCard 
                  label="Pending" 
                  value={messageStats.pending} 
                  icon={<Clock className="w-5 h-5 text-amber-500" />} 
                />
              </div>
            </div>

            {/* Connection History */}
            <div className="card md:col-span-3">
              <div className="card-header">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="card-title">Connection History</h2>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-b-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Event</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {connectionHistory.length > 0 ? (
                      connectionHistory.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">{entry.event}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              entry.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              entry.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                          No connection history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Send Messages to Students</h2>
            {!whatsappStatus.isReady ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-700 dark:text-amber-400 mb-4 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">WhatsApp is not connected</p>
                  <p className="mt-1">You need to connect WhatsApp first before sending messages. Go to the WhatsApp Status tab and scan the QR code.</p>
                  <button
                    onClick={() => setActiveTab('status')}
                    className="mt-2 btn btn-sm btn-outline flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Go to Status Tab</span>
                  </button>
                </div>
              </div>
            ) : (
              <StudentsTable onSendMessage={handleSendToStudent} />
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div id="test-message-section">
            <h2 className="text-xl font-bold mb-4">Send Test Message</h2>

            {!whatsappStatus.isReady ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-700 dark:text-amber-400 mb-4 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">WhatsApp is not connected</p>
                  <p className="mt-1">You need to connect WhatsApp first before sending messages. Go to the WhatsApp Status tab and scan the QR code.</p>
                  <button
                    onClick={() => setActiveTab('status')}
                    className="mt-2 btn btn-sm btn-outline flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Go to Status Tab</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="card-title">Send Test Message</h2>
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <Phone className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        value={testNumber}
                        onChange={(e) => setTestNumber(e.target.value)}
                        placeholder="Enter phone number with country code"
                        className="form-input rounded-l-none"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Format: +94XXXXXXXXX (include country code)</p>
                  </div>
                  <div>
                    <label className="form-label">Message</label>
                    <textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={4}
                      className="form-input"
                      placeholder="Enter your test message"
                    />
                  </div>
                  <button
                    onClick={handleSendTestMessage}
                    disabled={!testNumber || !testMessage || isSending}
                    className="btn btn-blue w-full flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Test Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Section */}
      {showSettings && (
        <div className="mt-6">
          <div className="card">
            <div className="card-header">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="card-title">Advanced Settings</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <h3 className="font-medium">Emergency Actions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use this option if you're having connection issues or need to reset the WhatsApp connection.
                </p>
                <button
                  onClick={handleEmergencyLogout}
                  disabled={isLoggingOut}
                  className="btn btn-danger w-full flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Emergency Disconnect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ label, value, icon }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      {icon}
      <span className="text-2xl font-bold">{value}</span>
    </div>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

export default WhatsAppManagementPage;

