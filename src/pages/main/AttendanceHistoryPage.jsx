import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserCircle,
  Trash,
  ChevronLeft,
  Filter,
  RefreshCw,
} from "lucide-react";

import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/attendance/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import studentService  from "../../services/studentService";

import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatters";

const AttendanceHistoryPage = () => {
  const { studentId } = useParams();
  console.log("AttendanceHistoryPage - studentId from params:", studentId);
  
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Filter state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalCount: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0,
  });

  // Fetch student attendance history
  const fetchAttendanceHistory = async () => {
    setLoading(true);
    try {
      // Validate studentId before making the API call
      if (!studentId || studentId === ':studentId') {
        console.error("Invalid studentId:", studentId);
        setError("Invalid student ID");
        toast.error("Invalid student ID. Please check the URL.");
        setLoading(false);
        return;
      }

      console.log("Fetching attendance for studentId:", studentId);
      const offset = (currentPage - 1) * recordsPerPage;
      const params = {
        limit: recordsPerPage,
        offset,
        sortBy: sortField,
        sortOrder,
      };

      if (startDate) {
        params.startDate = startDate.toISOString();
      }

      if (endDate) {
        params.endDate = endDate.toISOString();
      }

      const result = await studentService.getStudentAttendanceHistory(
        studentId,
        params
      );

      console.log("API result:", result);

      if (result.status === "success") {
        setStudent(result.data.student);
        setAttendanceHistory(result.data.attendanceHistory);
        setTotalRecords(result.data.totalRecords);
        setStats(result.data.stats);
      } else {
        setError("Failed to fetch attendance history");
        toast.error("Failed to fetch attendance history");
      }
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setError("An error occurred while fetching the attendance history");
      toast.error("Error loading attendance history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("AttendanceHistoryPage - useEffect triggered with studentId:", studentId);
    if (studentId) {
      fetchAttendanceHistory();
    }
  }, [
    studentId,
    currentPage,
    recordsPerPage,
    sortField,
    sortOrder,
    filtersApplied,
  ]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    setFiltersApplied(!filtersApplied);
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilterStatus("");
    setSortField("date");
    setSortOrder("desc");
    setCurrentPage(1);
    setFiltersApplied(!filtersApplied);
  };

  // Delete a specific attendance record
  const handleDeleteRecord = async (recordId) => {
    try {
      const result = await studentService.deleteAttendanceRecord(
        studentId,
        recordId
      );

      if (result.cancelled) {
        return;
      }

      if (result.status === "success") {
        toast.success("Attendance record deleted successfully");
        fetchAttendanceHistory();
      } else {
        toast.error(result.message || "Failed to delete attendance record");
      }
    } catch (err) {
      console.error("Error deleting attendance record:", err);
      toast.error("An error occurred while deleting the attendance record");
    }
  };

  // Clear all attendance history
  const handleClearHistory = async () => {
    try {
      const result = await studentService.clearAttendanceHistory(studentId);

      if (result.cancelled) {
        return;
      }

      if (result.status === "success") {
        toast.success("Attendance history cleared successfully");
        fetchAttendanceHistory();
      } else {
        toast.error(result.message || "Failed to clear attendance history");
      }
    } catch (err) {
      console.error("Error clearing attendance history:", err);
      toast.error("An error occurred while clearing the attendance history");
    }
  };

  // Toggle sort order
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  if (loading && !attendanceHistory.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" color="blue" />
      </div>
    );
  }

  if (error && !attendanceHistory.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-center mb-4">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">Please try again later or contact support.</p>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance History
          </h1>
          {student && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Student: <span className="font-semibold">{student.name}</span> (
              {student.indexNumber})
            </p>
          )}
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate(`/students/edit/${studentId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <UserCircle className="h-5 w-5 mr-2" />
            View Student Profile
          </button>

          <button
            onClick={handleClearHistory}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-200 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash className="h-5 w-5 mr-2" />
            Clear All History
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Records
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Present/Entered
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.presentCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.absentCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Attendance Rate
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.attendancePercentage
              ? stats.attendancePercentage.toFixed(2)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              maxDate={endDate || new Date()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholderText="Select start date"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate}
              maxDate={new Date()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholderText="Select end date"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="entered">Entered</option>
              <option value="left">Left</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <div className="flex">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md rounded-r-none shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="entryTime">Entry Time</option>
                <option value="leaveTime">Leave Time</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={applyFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Attendance history table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === "date" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("entryTime")}
                >
                  <div className="flex items-center">
                    Entry Time
                    {sortField === "entryTime" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("leaveTime")}
                >
                  <div className="flex items-center">
                    Leave Time
                    {sortField === "leaveTime" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading && attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <LoadingSpinner size="md" color="blue" centered />
                  </td>
                </tr>
              ) : attendanceHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceHistory.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {record.entryTime ? formatDate(record.entryTime) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {record.leaveTime ? formatDate(record.leaveTime) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {record.scanLocation || "Main Entrance"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteRecord(record._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete Record"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRecords > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecords / recordsPerPage)}
            totalItems={totalRecords}
            pageSize={recordsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;
