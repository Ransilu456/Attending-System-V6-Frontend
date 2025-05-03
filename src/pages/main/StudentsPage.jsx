import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash, Plus, Users, X, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

import studentService from "../../services/studentService";

const StudentsPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    indexNumber: "",
    address: "",
    student_email: "",
    parent_email: "",
    parent_telephone: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      return (
        searchTerm === "" ||
        (student.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (student.indexNumber?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (student.student_email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
      );
    });
  }, [students, searchTerm]);

  const pageVariants = {
    initial: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: { opacity: 0, y: 20 },
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAllStudents();
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open edit student modal
  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      indexNumber: student.indexNumber,
      address: student.address || "",
      student_email: student.student_email || "",
      parent_email: student.parent_email || "",
      parent_telephone: student.parent_telephone || "",
    });
    setShowEditModal(true);
  };

  // Open delete student modal
  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Confirm delete student
  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setLoading(true);
      await studentService.deleteStudent(studentToDelete._id);
      toast.success("Student deleted successfully");
      fetchStudents();
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  // Update existing student
  const updateStudent = async (e) => {
    e.preventDefault();

    if (!currentStudent) return;

    try {
      setLoading(true);
      await studentService.updateStudent(currentStudent._id, formData);
      toast.success("Student updated successfully");
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.message || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const viewAttendanceHistory = (studentId) => {
    navigate(`/attendance/history/${studentId}`);
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="py-6 dark:bg-slate-900 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div variants={itemVariants} className="flex items-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Students Management
          </h1>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Search and Add */}
        <motion.div
          variants={itemVariants}
          className="mt-4 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md dark:shadow-slate-700/10 border border-gray-200 dark:border-slate-700"
        >
          <div className="w-full sm:w-64 mb-4 sm:mb-0">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                placeholder="Search students"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/students/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Register New Student
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div variants={itemVariants} className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow-md rounded-lg border border-gray-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Index Number
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Last Attendance
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
                        >
                          <div className="flex justify-center items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
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
                            </svg>
                            Loading students...
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
                        >
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <motion.tr
                          key={student._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            {student.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {student.indexNumber}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {student.student_email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                student.status === "active"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : student.status !== "active"
                                  ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              }`}
                            >
                              {student.lastAttendance?.status || "active"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {student.lastAttendance
                              ? new Date(student.lastAttendance).toLocaleString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "Never"}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  viewAttendanceHistory(student._id)
                                }
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                title="View Attendance History"
                              >
                                <Clock className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">
                                  View Attendance History for {student.name}
                                </span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditModal(student)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                <Pencil
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  Edit {student.name}
                                </span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openDeleteModal(student)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                <Trash className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">
                                  Delete {student.name}
                                </span>
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div
          className="fixed z-50 inset-0 overflow-y-auto"
          aria-labelledby="edit-student-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowEditModal(false)}
            ></div>

            <div
              className="inline-block overflow-hidden shadow-2xl transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-slate-800 px-6 pt-6 pb-6 sm:p-8 relative">
                <div className="text-center sm:text-left">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                      <Pencil
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                      Edit Student
                    </h3>
                  </div>

                  <div className="mt-4">
                    <form onSubmit={updateStudent} className="space-y-4">
                      <div>
                        <label
                          htmlFor="edit-name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="edit-name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-indexNumber"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
                        >
                          Index Number
                        </label>
                        <input
                          type="text"
                          name="indexNumber"
                          id="edit-indexNumber"
                          required
                          value={formData.indexNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-address"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
                        >
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          id="edit-address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-student_email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
                        >
                          Student Email
                        </label>
                        <input
                          type="email"
                          name="student_email"
                          id="edit-student_email"
                          required
                          value={formData.student_email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-parent_email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
                        >
                          Parent Email
                        </label>
                        <input
                          type="email"
                          name="parent_email"
                          id="edit-parent_email"
                          value={formData.parent_email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-parent_telephone"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
                        >
                          Parent Phone
                        </label>
                        <input
                          type="text"
                          name="parent_telephone"
                          id="edit-parent_telephone"
                          value={formData.parent_telephone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm transition-colors duration-200"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 px-6 py-4 sm:px-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm px-6 py-3 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 sm:w-auto sm:text-sm transition-all duration-200"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={updateStudent}
                  className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Pencil className="h-5 w-5 mr-2" aria-hidden="true" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {showDeleteModal && studentToDelete && (
        <div
          className="fixed z-50 inset-0 overflow-y-auto"
          aria-labelledby="delete-student-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowDeleteModal(false)}
            ></div>

            <div
              className="inline-block overflow-hidden shadow-2xl transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-slate-800 p-8 relative">
                <div className="absolute top-6 right-6">
                  <button
                    type="button"
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-14 w-14 border-2 border-red-200 dark:border-red-800 shadow-inner">
                    <Trash
                      className="h-8 w-8 text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-5 sm:mt-0 sm:ml-6 sm:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Delete Student
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                      Are you sure you want to delete this student? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-5 bg-gray-50 dark:bg-slate-700/30 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center mb-4">
                    <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-base font-medium text-gray-900 dark:text-white">
                      Student Information
                    </span>
                  </div>
                  <div className="ml-7 space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Name:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {studentToDelete.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Index:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {studentToDelete.indexNumber}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Email:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {studentToDelete.student_email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      <span className="font-semibold">Warning:</span> This will
                      delete all data associated with this student, including
                      attendance records, reports, and personal information.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm px-6 py-3 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
                    onClick={confirmDelete}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-5 w-5 mr-2" aria-hidden="true" />
                        Permanently Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentsPage;
