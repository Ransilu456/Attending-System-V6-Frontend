import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import {
  Users,
  CheckCircle,
  ArrowRightCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";
import dayjs from "dayjs";
import attendanceService  from "../../services/attendanceServices";

const formatTime = (time) => {
  if (!time) return "N/A";

  try {
    if (time instanceof Date) {
      return DateTime.fromJSDate(time)
        .setZone("Asia/Colombo")
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }

    const parsedTime = DateTime.fromISO(time);
    if (parsedTime.isValid) {
      return parsedTime
        .setZone("Asia/Colombo")
        .toLocaleString(DateTime.TIME_WITH_SECONDS);
    }

    return DateTime.fromJSDate(new Date(time))
      .setZone("Asia/Colombo")
      .toLocaleString(DateTime.TIME_WITH_SECONDS);
  } catch (e) {
    console.warn(`Invalid time format: ${time}`, e);
    return "N/A";
  }
};

const StatsCard = ({ title, count, total, icon }) => (
  <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-gray-600 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
          {title}
        </p>
        <p className="text-3xl font-bold text-blue-900 dark:text-white mt-2">
          <span className="text-blue-700 dark:text-blue-300">{count}</span>
          {total !== undefined && (
            <span className="text-blue-400 dark:text-blue-400 text-lg ml-1">
              / {total}
            </span>
          )}
        </p>
      </div>
      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-full text-white shadow-md">
        {icon}
      </div>
    </div>
  </div>
);

const StudentTable = ({ students, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8 text-blue-500 dark:text-blue-400">
        No students found for the selected date
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-xl">
      <table className="min-w-full divide-y divide-blue-100 dark:divide-gray-700">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600">
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Index Number
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Entry Time
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Leave Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-blue-50 dark:divide-gray-700">
          {students.map((student, index) => (
            <tr
              key={student.uniqueKey}
              className={`${
                index % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-blue-50 dark:bg-gray-700"
              } hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-semibold">
                      {student.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {student.name || "N/A"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 dark:text-blue-300 font-mono">
                {student.indexNumber || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">
                {student.student_email || student.email || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(student.status)}>
                  {student.displayStatus ||
                    student.status?.charAt(0).toUpperCase() +
                      student.status?.slice(1) ||
                    "Unknown"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-300">
                {formatTime(student.entryTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-300">
                {formatTime(student.leaveTime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getStatusBadge = (status) => {
  const normalizedStatus = status?.toLowerCase() || "unknown";

  switch (normalizedStatus) {
    case "entered":
    case "present":
      return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-300";
    case "left":
      return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-300";
    case "late":
      return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-300";
    case "absent":
      return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-300";
    default:
      return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
  }
};

const SearchFilter = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
}) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search students..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-grow pl-10 px-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white transition-colors"
      />
    </div>
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white bg-white appearance-none pr-8 transition-colors"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.5em 1.5em",
      }}
    >
      <option value="all">All Statuses</option>
      <option value="present">Present</option>
      <option value="absent">Absent</option>
      <option value="left">Left</option>
      <option value="late">Late</option>
    </select>
  </div>
);

const DatePicker = ({ selectedDate, setSelectedDate, isValidDate }) => {
  const today = DateTime.now().toFormat("yyyy-MM-dd");
  const formattedSelectedDate =
    DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd");

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);

    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  return (
    <div className="flex-grow max-w-xs">
      <label
        htmlFor="date"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Select Date
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="date"
          id="date"
          value={formattedSelectedDate}
          onChange={handleDateChange}
          max={today}
          className={`w-full pl-10 px-3 py-2 border ${
            isValidDate
              ? "border-gray-300 dark:border-gray-600"
              : "border-red-300 dark:border-red-700"
          } rounded-lg focus:ring-2 ${
            isValidDate
              ? "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              : "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400"
          } dark:bg-gray-700 dark:text-white`}
        />
        {!isValidDate && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-3 text-red-500 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>
      {!isValidDate && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Cannot select a future date
        </p>
      )}
    </div>
  );
};

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="bg-white rounded-xl shadow-xl p-8 text-center">
    <div className="flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {error.type === "network" ? "Connection Error" : "Server Error"}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {error.type === "network"
          ? "Unable to connect to the server. Please check your internet connection and try again."
          : "We encountered an error while fetching attendance data. Our team has been notified."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

const AttendanceByDatePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    leftCount: 0,
    absentCount: 0,
    lateCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const errorToastRef = useRef(null);

  const isValidDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return selected <= today;
  }, [selectedDate]);

  const filteredStudents = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return [];

    return attendanceData.filter((student) => {
      const matchesSearch =
        (student.name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (student.indexNumber?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (student.student_email?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );

      const matchesStatus =
        filterStatus === "all" || student.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [attendanceData, searchQuery, filterStatus]);

  const fetchAttendanceByDate = useCallback(
    async (date = selectedDate) => {
      if (!isValidDate) {
        setAttendanceData([]);
        setStats({
          totalStudents: 0,
          presentCount: 0,
          leftCount: 0,
          absentCount: 0,
          lateCount: 0,
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const formattedDate = dayjs(date).format("YYYY-MM-DD");
        console.log(`Fetching attendance for date: ${formattedDate}`);

        const response = await attendanceService.getAttendanceByDate(
          formattedDate
        );
        console.log("Attendance response:", response);

        const fullDataResponse = await attendanceService.getTodayAttendance();
        console.log("Full attendance data:", fullDataResponse);

        if (!response || !response.data) {
          throw new Error("Invalid response from server");
        }

        const responseData = response.data.data;

        if (!responseData || !responseData.students) {
          setAttendanceData([]);
          setStats({
            totalStudents: 0,
            presentCount: 0,
            leftCount: 0,
            absentCount: 0,
            lateCount: 0,
          });
          return;
        }

        const fullStudentMap = {};
        if (fullDataResponse?.data?.students) {
          fullDataResponse.data.students.forEach((student) => {
            const id = student._id || student.id;
            if (id) {
              fullStudentMap[id] = student;
            }
          });
        }

        let { students, stats } = responseData;
        console.log("Raw students data:", students);

        if (!students || students.length === 0) {
          console.log("No students found in the data");
          setAttendanceData([]);
          setStats({
            totalStudents: stats?.totalCount || 0,
            presentCount: stats?.presentCount || 0,
            leftCount: stats?.leftCount || 0,
            absentCount: stats?.absentCount || 0,
            lateCount: stats?.lateCount || 0,
          });
          return;
        }

        const processedData = students.map((student) => {
          const studentId = student._id || student.id;
          const fullStudent =
            studentId && fullStudentMap[studentId]
              ? fullStudentMap[studentId]
              : student;

          const attendanceRecord = student.attendanceHistory?.find((record) => {
            if (!record.date) return false;

            const recordDate = new Date(record.date);
            const selectedDate = new Date(date);
            return recordDate.toDateString() === selectedDate.toDateString();
          });

          const fullAttendanceRecord =
            !attendanceRecord &&
            fullStudent.attendanceHistory?.find((record) => {
              if (!record.date) return false;

              const recordDate = new Date(record.date);
              const selectedDate = new Date(date);
              return recordDate.toDateString() === selectedDate.toDateString();
            });

          const record = attendanceRecord || fullAttendanceRecord;

          console.log("Processing student:", {
            id: student._id,
            name: student.name,
            entryTime: record?.entryTime,
            leaveTime: record?.leaveTime,
            status: record?.status || student.status,
          });

          let entryTimeObj = null;
          let leaveTimeObj = null;

          if (record?.entryTime) {
            try {
              const parsedEntry = DateTime.fromISO(record.entryTime);
              if (parsedEntry.isValid) {
                entryTimeObj = parsedEntry.toJSDate();
                console.log("Parsed entry time:", entryTimeObj);
              }
            } catch (e) {
              console.warn(
                `Invalid entry time format for student ${student.indexNumber}:`,
                record.entryTime
              );
            }
          }

          if (record?.leaveTime) {
            try {
              const parsedLeave = DateTime.fromISO(record.leaveTime);
              if (parsedLeave.isValid) {
                leaveTimeObj = parsedLeave.toJSDate();
                console.log("Parsed leave time:", leaveTimeObj);
              }
            } catch (e) {
              console.warn(
                `Invalid leave time format for student ${student.indexNumber}:`,
                record.leaveTime
              );
            }
          }

          const latestStatus = record?.status || student.status;

          let displayStatus;
          let normalizedStatus = latestStatus?.toLowerCase() || "unknown";

          switch (normalizedStatus) {
            case "entered":
              displayStatus = "Present";
              normalizedStatus = "present";
              break;
            case "left":
              displayStatus = "Left";
              break;
            case "late":
              displayStatus = "Late";
              break;
            case "absent":
              displayStatus = "Absent";
              break;
            default:
              displayStatus =
                latestStatus?.charAt(0).toUpperCase() +
                  latestStatus?.slice(1) || "Unknown";
              normalizedStatus = "unknown";
          }

          const processedStudent = {
            ...student,
            id: student.id || student._id,
            indexNumber:
              student.indexNumber?.toUpperCase() ||
              fullStudent.indexNumber?.toUpperCase() ||
              "N/A",
            student_email:
              student.email ||
              student.student_email ||
              fullStudent.email ||
              fullStudent.student_email ||
              "N/A",
            status: normalizedStatus,
            displayStatus: displayStatus,
            entryTime: entryTimeObj,
            leaveTime: leaveTimeObj,
            timestamp:
              student.timestamp ||
              student.updatedAt ||
              fullStudent.timestamp ||
              fullStudent.updatedAt ||
              new Date().toISOString(),
          };

          console.log("Processed student data:", processedStudent);
          return processedStudent;
        });

        const studentMap = {};

        processedData.forEach((student) => {
          const key = student.indexNumber;
          console.log("Processing student for map:", {
            key,
            student: {
              name: student.name,
              entryTime: student.entryTime,
              leaveTime: student.leaveTime,
              status: student.status,
            },
          });

          if (!studentMap[key]) {
            studentMap[key] = {
              ...student,
              uniqueKey: `student-${key}-${date.getTime()}`,
            };
            return;
          }

          const existingStudent = studentMap[key];

          if (
            student.entryTime &&
            (!existingStudent.entryTime ||
              (student.entryTime instanceof Date &&
                existingStudent.entryTime instanceof Date &&
                student.entryTime > existingStudent.entryTime) ||
              new Date(student.entryTime) > new Date(existingStudent.entryTime))
          ) {
            existingStudent.entryTime = student.entryTime;
          }

          if (
            student.leaveTime &&
            (!existingStudent.leaveTime ||
              (student.leaveTime instanceof Date &&
                existingStudent.leaveTime instanceof Date &&
                student.leaveTime > existingStudent.leaveTime) ||
              new Date(student.leaveTime) > new Date(existingStudent.leaveTime))
          ) {
            existingStudent.leaveTime = student.leaveTime;
          }

          if (
            student.timestamp &&
            (!existingStudent.timestamp ||
              new Date(student.timestamp) > new Date(existingStudent.timestamp))
          ) {
            existingStudent.status = student.status;
            existingStudent.displayStatus = student.displayStatus;
            existingStudent.timestamp = student.timestamp;
          }
        });
        const mergedData = Object.values(studentMap);
        console.log("Final merged data:", mergedData);

        const sortedData = mergedData.sort((a, b) => {
          const statusPriority = {
            entered: 1,
            present: 1,
            left: 2,
            late: 3,
            absent: 4,
          };
          const aPriority = statusPriority[a.status] || 5;
          const bPriority = statusPriority[b.status] || 5;
          const statusDiff = aPriority - bPriority;

          if (statusDiff !== 0) return statusDiff;

          return a.indexNumber.localeCompare(b.indexNumber);
        });

        console.log("Processed attendance data:", sortedData);
        setAttendanceData(sortedData);

        const presentStudents = mergedData.filter(
          (s) => s.status === "entered" || s.status === "present"
        ).length;
        const leftStudents = mergedData.filter(
          (s) => s.status === "left"
        ).length;
        const absentStudents = mergedData.filter(
          (s) => s.status === "absent"
        ).length;
        const lateStudents = mergedData.filter(
          (s) => s.status === "late"
        ).length;

        setStats({
          totalStudents: stats?.totalCount || mergedData.length,
          presentCount: stats?.presentCount || presentStudents,
          leftCount: stats?.leftCount || leftStudents,
          absentCount: stats?.absentCount || absentStudents,
          lateCount: stats?.lateCount || lateStudents,
        });
      } catch (err) {
        console.error("Error fetching attendance:", err);

        const errorType =
          err.message === "Network Error" || !err.response
            ? "network"
            : "server";

        setError({
          type: errorType,
          message: err.message || "An unexpected error occurred",
          details: err.response?.data?.message || "Please try again later",
        });

        setAttendanceData([]);
        setStats({
          totalStudents: 0,
          presentCount: 0,
          leftCount: 0,
          absentCount: 0,
          lateCount: 0,
        });

        if (errorToastRef.current !== errorType) {
          errorToastRef.current = errorType;
          toast.error(
            errorType === "network"
              ? "Connection error. Please check your internet connection."
              : "Failed to load attendance data. Please try again.",
            {
              onClose: () => {
                errorToastRef.current = null;
              },
            }
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedDate, isValidDate]
  );

  useEffect(() => {
    fetchAttendanceByDate();
  }, [selectedDate, fetchAttendanceByDate]);

  const handleRefresh = () => {
    fetchAttendanceByDate();
    toast.info("Refreshing attendance data...");
  };

  const formattedDate =
    DateTime.fromJSDate(selectedDate).toFormat("MMMM d, yyyy");

  return (
    <div className="container mx-auto px-4 py-8 bg-transparent min-h-screen dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
            Attendance for {formattedDate}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 w-[200px] md:w-auto">
            <DatePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              isValidDate={isValidDate}
            />
            <button
              onClick={handleRefresh}
              disabled={!isValidDate || loading}
              className={`w-full md:w-auto mt-auto inline-flex items-center justify-center px-4 py-2 h-10 self-end ${
                !isValidDate || loading
                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700"
              } text-white rounded-lg focus:ring-4 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 shadow-md`}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {error ? (
          <ErrorDisplay
            error={error}
            onRetry={() => {
              setError(null);
              fetchAttendanceByDate();
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Students"
                count={stats.totalStudents}
                icon={<Users className="w-6 h-6" />}
              />
              <StatsCard
                title="Present"
                count={stats.presentCount}
                total={stats.totalStudents}
                icon={<CheckCircle className="w-6 h-6" />}
              />
              <StatsCard
                title="Left"
                count={stats.leftCount}
                total={stats.totalStudents}
                icon={<ArrowRightCircle className="w-6 h-6" />}
              />
              <StatsCard
                title="Absent"
                count={stats.absentCount}
                total={stats.totalStudents}
                icon={<XCircle className="w-6 h-6" />}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
              <SearchFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
              />

              <StudentTable students={filteredStudents} loading={loading} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceByDatePage;
