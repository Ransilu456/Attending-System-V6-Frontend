import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FileText, Download, Calendar, BarChart3, AlertCircle, BarChart, User, Users } from "lucide-react";
import { DateTime } from "luxon";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

import ReportTypeCard from "../../components/reports/ReportTypeCard";
import DateRangeSelector from "../../components/reports/DateRangeSelector";

import reportService from "../../services/reportService";
import attendanceService from "../../services/attendanceServices";

const formatDate = (date) => {
  if (!date) return "";
  try {
    return DateTime.fromJSDate(new Date(date)).toFormat("yyyy-MM-dd");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

const ReportsPage = () => {
  const { theme } = useTheme();

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const validDate = yesterday;

  const weekAgo = new Date(validDate);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [selectedReportType, setSelectedReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(validDate);
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(validDate);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await attendanceService.getAllStudents();
        setStudents(response.data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to fetch students list");
      }
    };

    if (selectedReportType === "individual") {
      fetchStudents();
    }
  }, [selectedReportType]);

  const isValidDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For daily report
    if (selectedReportType === "daily") {
      const selectedDay = new Date(selectedDate);
      selectedDay.setHours(0, 0, 0, 0);

      if (isNaN(selectedDay.getTime())) {
        toast.error("Invalid date format");
        return false;
      }

      if (selectedDay > today) {
        toast.error("Selected date cannot be in the future");
        return false;
      }

      return true;
    }

    // For other report types with date ranges
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Invalid date format");
      return false;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Validate date range
    if (start > end) {
      toast.error("Start date must be before end date");
      return false;
    }

    if (end > today) {
      toast.error("End date cannot be in the future");
      return false;
    }

    // For weekly reports, ensure the range is not more than 31 days
    if (selectedReportType === "weekly") {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 31) {
        toast.error("Weekly reports cannot span more than 31 days");
        return false;
      }
    }

    // For monthly reports, ensure the range is not more than 31 days
    if (selectedReportType === "monthly") {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 31) {
        toast.error("Monthly reports cannot span more than 31 days");
        return false;
      }
    }

    // For individual reports, ensure a student is selected
    if (selectedReportType === "individual" && !selectedStudent) {
      toast.error("Please select a student for individual report");
      return false;
    }

    return true;
  };
  
  const handleGenerateReport = async () => {
    if (!isValidDateRange()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Generating ${selectedReportType} report...`);

      // Format dates consistently for API requests
      const formattedSelectedDate = formatDate(selectedDate);
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      // Set headers for MongoDB date format preservation
      const headers = {
        "Preserve-MongoDB-Format": "true",
        "MongoDB-Date-Format": "true",
        "Content-Type": "application/json",
      };

      let response;
      let filename;

      switch (selectedReportType) {
        case "daily":
          console.log(
            `Generating daily report for date: ${formattedSelectedDate}`
          );
          response = await reportService.generateReport(
            "daily",
            {
              date: formattedSelectedDate,
            },
            headers
          );
          filename = `daily_attendance_report_${formattedSelectedDate}.xlsx`;
          break;

        case "weekly":
          console.log(
            `Generating weekly report for date range: ${formattedStartDate} to ${formattedEndDate}`
          );
          response = await reportService.generateReport(
            "weekly",
            {
              startDate: formattedStartDate,
              endDate: formattedEndDate,
            },
            headers
          );
          filename = `weekly_attendance_report_${formattedStartDate}_to_${formattedEndDate}.xlsx`;
          break;

        case "monthly":
          console.log(
            `Generating monthly report for date range: ${formattedStartDate} to ${formattedEndDate}`
          );
          response = await reportService.generateReport(
            "monthly",
            {
              startDate: formattedStartDate,
              endDate: formattedEndDate,
            },
            headers
          );
          filename = `monthly_attendance_report_${formattedStartDate}_to_${formattedEndDate}.xlsx`;
          break;

        case "individual":
          if (!selectedStudent) {
            throw new Error("Please select a student for individual report");
          }

          const selectedStudentInfo = students.find(
            (s) => s._id === selectedStudent
          );
          if (!selectedStudentInfo) {
            throw new Error("Selected student not found");
          }

          const studentName =
            selectedStudentInfo.name ||
            selectedStudentInfo.indexNumber ||
            "student";

          console.log(
            `Generating individual report for student: ${studentName}, date range: ${formattedStartDate} to ${formattedEndDate}`
          );

          response = await reportService.generateReport(
            "individual",
            {
              studentId: selectedStudent,
              startDate: formattedStartDate,
              endDate: formattedEndDate,
            },
            headers
          );

          filename = `individual_attendance_report_${studentName}_${formattedStartDate}_to_${formattedEndDate}.xlsx`;
          break;

        default:
          throw new Error(`Invalid report type: ${selectedReportType}`);
      }

      // Handle the blob response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Report generated successfully! Downloading ${filename}`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Failed to generate report");
      setError(
        error.message || "An error occurred while generating the report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="py-6 dark:bg-slate-900 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionVariants}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              Attendance Reports
            </h1>
          </div>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Configure Report
            </h2>

            <div className="space-y-6">

              {/* Report Type Selection */}
              <motion.div variants={sectionVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ReportTypeCard
                    icon={<FileText className="h-6 w-6" />}
                    title="Daily Attendance"
                    description="Student attendance for a specific day"
                    isSelected={selectedReportType === "daily"}
                    onClick={() => setSelectedReportType("daily")}
                  />

                  <ReportTypeCard
                    icon={<Calendar className="h-6 w-6" />}
                    title="Weekly Attendance"
                    description="Attendance summary across a week"
                    isSelected={selectedReportType === "weekly"}
                    onClick={() => setSelectedReportType("weekly")}
                  />

                  <ReportTypeCard
                    icon={<BarChart className="h-6 w-6" />}
                    title="Monthly Attendance"
                    description="Monthly attendance statistics"
                    isSelected={selectedReportType === "monthly"}
                    onClick={() => setSelectedReportType("monthly")}
                  />

                  <ReportTypeCard
                    icon={<User className="h-6 w-6" />}
                    title="Individual Student"
                    description="Detailed report for one student"
                    isSelected={selectedReportType === "individual"}
                    onClick={() => setSelectedReportType("individual")}
                  />
                </div>
              </motion.div>

              {/* Date Selection */}
              <motion.div variants={sectionVariants}>
                <DateRangeSelector
                  reportType={selectedReportType}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />
              </motion.div>

              {/* Student Selection for Individual Report */}
              <AnimatePresence>
                {selectedReportType === "individual" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Student
                    </label>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-200"
                      >
                        <option value="">Select a student...</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name} ({student.indexNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <motion.button
                whileHover={{
                  scale:
                    loading ||
                    (selectedReportType === "individual" && !selectedStudent)
                      ? 1
                      : 1.02,
                }}
                whileTap={{
                  scale:
                    loading ||
                    (selectedReportType === "individual" && !selectedStudent)
                      ? 1
                      : 0.98,
                }}
                onClick={handleGenerateReport}
                disabled={
                  loading ||
                  (selectedReportType === "individual" && !selectedStudent)
                }
                className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center transition-all duration-200 ${
                  loading ||
                  (selectedReportType === "individual" && !selectedStudent)
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                }`}
              >
                {loading ? (
                  <>
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </motion.svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Generate Report
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;
