import { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Search, 
  AlertCircle, 
  X, 
  Download,
  User,
  QrCode,
  Copy,
  Check
} from 'lucide-react';

const QRGenerator = () => {
  const [studentData, setStudentData] = useState({
    name: '',
    indexNumber: '',
    student_email: '',
    phone: '',
    address: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [apiError, setApiError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const MAX_RETRIES = 3;
  const searchTimeoutRef = useRef(null);
  const qrRef = useRef();

  const searchStudent = useCallback(async () => {
    if (!searchTerm.trim()) {
      return;
    }

    if (isOffline) {
      toast.warning('You are offline. Search is not available.');
      return;
    }
    
    try {
      setSearchLoading(true);
      setApiError('');
      setSearchResults([]);
      
      const response = await studentService.getAllStudents();
      const students = response.data.students || [];

      const filteredStudents = searchTerm 
        ? students.filter(student => 
            (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.indexNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.student_email && student.student_email?.toLowerCase()?.includes(searchTerm.toLowerCase()))
          )
        : students;
      
      setSearchResults(filteredStudents);
      setShowSearchResults(true);
      setRetryCount(0);
      
      if (filteredStudents.length === 0) {
        toast.info('No students found with that search term');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setApiError(error.response?.data?.message || 'Failed to search students');

      if ((!error.response || error.response.status >= 500) && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          searchStudent();
        }, 2000 * Math.pow(2, retryCount));
      } else {
        toast.error(
          error.response?.data?.message || 
          'Failed to search students. Please check your connection and try again.'
        );
      }
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, isOffline, retryCount]);

  useEffect(() => {

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchStudent();
      }, 500);
    } else if (searchTerm === '') {
      setShowSearchResults(false);
      setSearchResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchStudent]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Connection restored');
      if (searchTerm && searchResults.length === 0) {
        searchStudent();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [searchTerm, searchResults.length, searchStudent]);
  
  useEffect(() => {
    if (apiError) {
      setApiError('');
    }
  }, [studentData, apiError]);

  const handleSelectStudent = (student) => {
    setStudentData({
      _id: student._id,
      name: student.name || '',
      indexNumber: student.indexNumber || '',
      student_email: student.student_email || '',
      phone: student.phone || '',
      address: student.address || ''
    });
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const downloadQRCode = () => {
    if (!studentData.name || !studentData.indexNumber) {
      toast.error('Please select a student first');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      if (qrRef.current) {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          const image = canvas.toDataURL('image/png');
          const anchor = document.createElement('a');
          anchor.href = image;
          anchor.download = `${studentData.name}-${studentData.indexNumber}-QR.png`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          toast.success('QR Code downloaded successfully');
        } else {
          toast.error('Could not find QR code canvas');
        }
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyQRCode = () => {
    if (!studentData.name || !studentData.indexNumber) {
      toast.error('Please select a student first');
      return;
    }
    
    try {
      if (qrRef.current) {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          canvas.toBlob(async (blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast.success('QR Code copied to clipboard');
          });
        } else {
          toast.error('Could not find QR code canvas');
        }
      }
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast.error('Failed to copy QR code. Your browser may not support this feature.');
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <QrCode className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
            Search for Student QR Code
          </h2>
          
          {/* Search box with loading indicator */}
          <div className="relative">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Search by name, index number, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {searchTerm && !searchLoading && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700"
            >
              {searchResults.map((student) => (
                <div 
                  key={student._id || student.indexNumber}
                  className="p-3 flex items-center hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition duration-150 ease-in-out"
                  onClick={() => handleSelectStudent(student)}
                >
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>ID: {student.indexNumber}</span>
                      {student.student_email && <span>{student.student_email}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {showSearchResults && searchResults.length === 0 && !searchLoading && searchTerm && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-center text-gray-600 dark:text-gray-300">
              No students found matching '{searchTerm}'
            </div>
          )}
        </div>
      </div>

      {/* QR Code Display & Download Section */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {studentData.name && studentData.indexNumber ? 'Student QR Code' : 'Selected Student QR Code'}
          </h2>
          
          {studentData.name && studentData.indexNumber ? (
            <>
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  {studentData.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {studentData.indexNumber}
                </p>
                {studentData.student_email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {studentData.student_email}
                  </p>
                )}
              </div>
              
              <div 
                ref={qrRef}
                className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-100 dark:border-slate-700 mb-5"
              >
                <QRCodeCanvas
                  id="qrCode"
                  value={JSON.stringify({
                    _id: studentData._id,
                    name: studentData.name,
                    indexNumber: studentData.indexNumber,
                    student_email: studentData.student_email,
                    phone: studentData.phone,
                    address: studentData.address
                  })}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={downloadQRCode}
                  disabled={isDownloading}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download QR Code
                    </>
                  )}
                </button>
                
                <button
                  onClick={copyQRCode}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-8 flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-full p-6 mb-4">
                <QrCode className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Search and select a student above to generate their QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;