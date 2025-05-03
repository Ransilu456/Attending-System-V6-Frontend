import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, CheckCircle, ArrowRightCircle, XCircle, Clock, Calendar, Search, PieChart } from 'lucide-react';
import { DateTime } from 'luxon';
import attendanceService from '../../services/attendanceServices';

const formatTime = (time) => {
  if (!time) return '-';
  try {
    if (time instanceof Date) {
      return DateTime.fromJSDate(time)
        .setZone('Asia/Colombo')
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    
    const parsedTime = DateTime.fromISO(time);
    if (parsedTime.isValid) {
      return parsedTime.setZone('Asia/Colombo').toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    
    return DateTime.fromJSDate(new Date(time))
      .setZone('Asia/Colombo')
      .toLocaleString(DateTime.TIME_WITH_SECONDS);
  } catch (e) {
    console.warn(`Invalid time format: ${time}`, e);
    return '-';
  }
};

const getStatusBadge = (status) => {
  if (!status) return 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  
  const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium';
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'present' || statusLower === 'entered') {
      return `${baseClasses} bg-gradient-to-r from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 text-green-800 dark:text-green-100`;
  } else if (statusLower === 'left') {
      return `${baseClasses} bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 text-blue-800 dark:text-blue-100`;
  } else if (statusLower === 'late') {
    return `${baseClasses} bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 text-yellow-800 dark:text-yellow-100`;
  } else if (statusLower === 'absent') {
      return `${baseClasses} bg-gradient-to-r from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 text-red-800 dark:text-red-100`;
  }
  
  return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
};

const StatsCard = ({ title, count, total, color, icon }) => (
  <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          <span className={`text-${color}-600 dark:text-${color}-400`}>{count}</span>
          {total !== undefined && <span className="text-gray-400 dark:text-gray-500 text-lg ml-1">/ {total}</span>}
        </p>
      </div>
      <div className={`p-3.5 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-500 dark:from-${color}-600 dark:to-${color}-700 text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const SearchFilter = ({ searchQuery, setSearchQuery, activeTab, setActiveTab }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-blue-400" />
      </div>
      <input
        type="text"
        placeholder="Search students..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 w-full px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white shadow-sm"
      />
    </div>
    <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800">
      <button 
        onClick={() => setActiveTab('present')}
        className={`px-4 py-2 rounded-l-lg transition-colors duration-150 ${
          activeTab === 'present' 
            ? 'bg-blue-500 text-white font-medium' 
            : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
      >
        Present
      </button>
      <button 
        onClick={() => setActiveTab('left')}
        className={`px-4 py-2 rounded-r-lg transition-colors duration-150 ${
          activeTab === 'left' 
            ? 'bg-blue-500 text-white font-medium' 
            : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
      >
        Left
      </button>
    </div>
  </div>
);

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(DateTime.now().setZone('Asia/Colombo'));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.now().setZone('Asia/Colombo'));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Current Time</h3>
        <Clock className="h-5 w-5 text-blue-500" />
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          {currentTime.toFormat('hh:mm:ss a')}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentTime.toFormat('EEEE, MMMM d, yyyy')}
        </div>
      </div>
    </div>
  );
};

const AttendanceDistribution = ({ presentCount, leftCount }) => {
  const total = presentCount + leftCount;
  const presentPercentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  const leftPercentage = total > 0 ? Math.round((leftCount / total) * 100) : 0;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Attendance Distribution</h3>
        <PieChart className="h-5 w-5 text-blue-500" />
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="w-32 h-32 rounded-full border-8 border-blue-500 dark:border-blue-600 relative">
          <div 
            className="absolute inset-0 rounded-full border-8 border-green-500 dark:border-green-600" 
            style={{ 
              clipPath: `polygon(50% 50%, 50% 0%, ${presentPercentage > 25 ? '100% 0%' : `${50 + 50 * Math.sin(2 * Math.PI * presentPercentage / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * presentPercentage / 100)}%`})`,
              transform: `rotate(${presentPercentage > 25 ? 0 : -90}deg)`
            }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-around">
        <div className="text-center">
          <div className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Present</span>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{presentCount} ({presentPercentage}%)</p>
        </div>
        <div className="text-center">
          <div className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Left</span>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{leftCount} ({leftPercentage}%)</p>
        </div>
      </div>
    </div>
  );
};

const StudentItem = ({ student }) => {
  const getStatusIcon = (status) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'present' || statusLower === 'entered') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (statusLower === 'left') {
      return <ArrowRightCircle className="h-4 w-4 text-blue-500" />;
    }
    
    return <Clock className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150">
      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center text-white font-medium shadow-md">
        {student.name.substring(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {student.name}
          </p>
          <span className={getStatusBadge(student.status)}>
            {student.displayStatus}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-mono">{student.indexNumber}</span>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            {getStatusIcon(student.status)}
            <span className="ml-1">
              {student.status?.toLowerCase() === 'left' 
                ? formatTime(student.leaveTime)
                : formatTime(student.entryTime)
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentList = ({ students, loading, activeTab }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400"></div>
      </div>
    );
  }

  if (!students.length) {
    const message = activeTab === 'present' 
      ? 'No students currently present' 
      : 'No students have left yet';
    
    const subText = activeTab === 'present'
      ? 'Students will appear here when they check in'
      : 'Students who leave will appear here';
    
    const icon = activeTab === 'present'
      ? <CheckCircle className="mx-auto h-12 w-12 text-green-300 dark:text-green-700" />
      : <ArrowRightCircle className="mx-auto h-12 w-12 text-blue-300 dark:text-blue-700" />;
    
    return (
      <div className="text-center py-16 bg-gradient-to-b from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-blue-100 dark:border-blue-900">
        {icon}
        <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">{message}</p>
        <p className="text-blue-400 dark:text-blue-500 text-sm mt-1">{subText}</p>
      </div>
    );
  }

  const title = activeTab === 'present' ? 'Present Students' : 'Left Students';
  const icon = activeTab === 'present' 
    ? <CheckCircle className="h-5 w-5 text-green-500" />
    : <ArrowRightCircle className="h-5 w-5 text-blue-500" />;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        {icon}
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {students.map((student) => (
          <StudentItem key={student.uniqueKey} student={student} />
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    leftCount: 0,
    absentCount: 0,
    lateCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('present');

  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const attendanceResponse = await attendanceService.getTodayAttendance();
      console.log('Dashboard attendance response:', attendanceResponse);
      
      if (!attendanceResponse || !attendanceResponse.data) {
        setRecentActivity([]);
        setStats({
          totalStudents: 0,
          presentCount: 0,
          leftCount: 0,
          absentCount: 0,
          lateCount: 0
        });
        setLoading(false);
        return;
      }
      
      const { students, totalCount, presentCount, absentCount, lateCount } = attendanceResponse.data;
      
      if (!students || students.length === 0) {
        setRecentActivity([]);
        setStats({
          totalStudents: totalCount || 0,
          presentCount: presentCount || 0,
          leftCount: 0,
          absentCount: absentCount || 0,
          lateCount: lateCount || 0
        });
        setLoading(false);
        return;
      }
      
      const processedStudents = students.map(student => {
        const uniqueKey = student._id || student.id || Math.random().toString(36).substring(7);
        
        try {
          let todayRecord = null;
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (student?.attendanceHistory && Array.isArray(student.attendanceHistory)) {
            todayRecord = student.attendanceHistory.find(record => 
              record.date && record.date.startsWith(today)
            );
          }
 
          let entryTime = null;
          let leaveTime = null;
          
          if (todayRecord) {
            entryTime = todayRecord.entryTime;
            leaveTime = todayRecord.leaveTime;
          }
          
          let displayStatus = student.status;
          let currentStatus = student.status;
          
          if (todayRecord) {
            currentStatus = todayRecord.status;
            
            if (currentStatus) {
              const statusLower = currentStatus.toLowerCase();
              if (statusLower === 'entered') {
                displayStatus = 'Present';
              } else if (statusLower === 'left') {
                displayStatus = 'Left';
              } else {
                displayStatus = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
              }
            }
          }
          
          const studentName = student.firstName && student.lastName
            ? `${student.firstName} ${student.lastName}`
            : student.name || 'Unknown Student';
      
          const email = student.student_email || student.email || null;

          return {
            ...student,
            uniqueKey,
            name: studentName,
            email,
            student_email: student.student_email,
            displayStatus,
            status: currentStatus,
            entryTime,
            leaveTime,
            timestamp: entryTime ? new Date(entryTime).getTime() : 0
          };
        } catch (err) {
          console.error('Error processing student data:', err);
      
          return {
            uniqueKey: uniqueKey,
            name: student.name || student.firstName || 'Unknown Student',
            indexNumber: student.indexNumber || 'N/A',
            status: student.status || 'Unknown',
            displayStatus: student.status || 'Unknown',
            entryTime: null,
            leaveTime: null,
            timestamp: 0,
            _id: student._id || student.id
          };
        }
      });
      
      // Filter to only include present or left students
      const presentStudents = processedStudents.filter(student => {
        const status = student.status?.toLowerCase();
        return status === 'present' || status === 'entered';
      });
      
      const leftStudents = processedStudents.filter(student => {
        const status = student.status?.toLowerCase();
        return status === 'left';
      });
      
      // Sort by timestamp (most recent first)
      const sortedPresent = presentStudents.sort((a, b) => b.timestamp - a.timestamp);
      const sortedLeft = leftStudents.sort((a, b) => {
        // Sort left students by leave time
        const aTime = a.leaveTime ? new Date(a.leaveTime).getTime() : 0;
        const bTime = b.leaveTime ? new Date(b.leaveTime).getTime() : 0;
        return bTime - aTime;
      });
      
      // Combine present and left students
      const allStudents = [...sortedPresent, ...sortedLeft];

      setRecentActivity(allStudents);
      setStats({
        totalStudents: totalCount || 0,
        presentCount: presentStudents.length || 0,
        leftCount: leftStudents.length || 0,
        absentCount: absentCount || 0,
        lateCount: lateCount || 0
      });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setError('Failed to load dashboard data');
     
      setRecentActivity([]);
      setStats({
        totalStudents: 0,
        presentCount: 0,
        leftCount: 0,
        absentCount: 0,
        lateCount: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter students based on active tab and search query
  const filteredStudents = useMemo(() => {
    const students = recentActivity.filter(student => {
      // First filter by active tab (present or left)
      const status = student.status?.toLowerCase();
      const matchesTab = activeTab === 'present' 
        ? (status === 'present' || status === 'entered')
        : status === 'left';
      
      // Then filter by search query
      const matchesSearch = 
        (student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (student.indexNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (student.student_email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
    
    return students;
  }, [recentActivity, activeTab, searchQuery]);

  const statsIcons = {
    total: <Users className="h-6 w-6 text-white" />,
    present: <CheckCircle className="h-6 w-6 text-white" />,
    left: <ArrowRightCircle className="h-6 w-6 text-white" />,
    absent: <XCircle className="h-6 w-6 text-white" />
  };

  useEffect(() => {
    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 30000); 
    return () => clearInterval(interval);
  }, [fetchRecentActivity]);

  // Check if there are any students (present or left)
  const hasStudents = stats.presentCount > 0 || stats.leftCount > 0;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Attendance Dashboard</h1>
          <LiveClock />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard
            title="Total Students"
            count={stats.totalStudents}
            color="blue"
            icon={statsIcons.total}
          />
          <StatsCard
            title="Present"
            count={stats.presentCount}
            total={stats.totalStudents}
            color="green"
            icon={statsIcons.present}
          />
          <StatsCard
            title="Left"
            count={stats.leftCount}
            total={stats.totalStudents}
            color="blue"
            icon={statsIcons.left}
          />
          <StatsCard
            title="Absent"
            count={stats.absentCount}
            total={stats.totalStudents}
            color="red"
            icon={statsIcons.absent}
          />
        </div>

        {/* Display error if any */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {hasStudents ? (
          <>

            <SearchFilter 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AttendanceDistribution 
                presentCount={stats.presentCount} 
                leftCount={stats.leftCount} 
              />
              <StudentList 
                students={filteredStudents} 
                loading={loading}
                activeTab={activeTab}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-gradient-to-b from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">No Activity Yet</h3>
            <p className="text-blue-400 dark:text-blue-500 text-sm mt-1 max-w-md mx-auto">
              The dashboard will display attendance information when students start checking in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

