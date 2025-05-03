import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  UserCircle,
  QrCode,
  BarChart,
  Users,
  Settings,
  LogOut,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Home,
} from "lucide-react";

import ThemeToggle from "../components/ui/ThemeToggle";

const MainLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const userDropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarCollapsed) {
      const timeout = setTimeout(() => {
        setSidebarCollapsed(false);
      }, 300);
      setHoverTimeout(timeout);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true") {
      setSidebarCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home, public: true },
    { name: "Dashboard", href: "/dashboard", icon: BarChart, admin: true },
    { name: "Students", href: "/dashboard/students", icon: Users, admin: true },
    { name: "QR Scanner", href: "/dashboard/scanner", icon: QrCode, public: true },
    { name: "Attendance", href: "/dashboard/attendance", icon: Calendar, admin: true },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart, admin: true },
    { name: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageCircle, admin: true },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, admin: true },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle, public: true },
  ];

  useEffect(() => {
    const adminRoutes = ["/dashboard/whatsapp", "/dashboard/settings", "/dashboard/reports"];
    if (
      isAuthenticated &&
      !isAdmin &&
      adminRoutes.includes(location.pathname)
    ) {
      console.log("Non-admin accessing admin route, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [location.pathname, isAdmin, isAuthenticated]);

  const filteredNavigation = navigation.filter((item) => {
    if (item.admin && !isAdmin) return false;
    if (!item.public && !isAuthenticated) return false;
    return true;
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutsideSidebar(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0, transition: { delay: 0.2 } },
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -5,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    }),
    hover: {
      scale: 1.03,
      x: 4,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * {
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-0 ${
        theme === "dark" ? "dark bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              className="relative flex w-72 max-w-xs flex-1 flex-col bg-white dark:bg-slate-800 pt-5 pb-4 shadow-xl rounded-r-xl"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
            >
              {/* Close button */}
              <div className="absolute top-0 right-0 pt-2 pr-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X
                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Logo */}
              <div className="flex flex-shrink-0 items-center px-6">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 logos">
                  Attendance System
                </h1>
              </div>

              {/* Navigation */}
              <div className="mt-8 h-0 flex-1 overflow-y-auto px-3">
                <nav className="space-y-2">
                  {filteredNavigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={navItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to={item.href}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-lg ${
                          location.pathname === item.href
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                        aria-current={
                          location.pathname === item.href ? "page" : undefined
                        }
                      >
                        <item.icon
                          className={`mr-4 h-6 w-6 flex-shrink-0 ${
                            location.pathname === item.href
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* User menu */}
              <div className="border-t border-gray-200 dark:border-slate-700 p-4 mt-2">
                {isAuthenticated ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-700">
                        {user?.name?.charAt(0)?.toUpperCase() || (
                          <UserCircle className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                        {user?.name}
                      </p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                        {user?.email}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <ThemeToggle />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="flex-shrink-0 rounded-full p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={handleLogout}
                        aria-label="Log out"
                      >
                        <LogOut className="h-6 w-6" aria-hidden="true" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <UserCircle className="h-5 w-5 mr-2" />
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`hidden md:fixed md:inset-y-0 md:flex md:flex-col ${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-200 shadow-md dark:shadow-slate-900/50 relative">
          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full p-1.5 shadow-md z-10 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Logo */}
          <div
            className={`flex flex-shrink-0 items-center h-16 px-4 ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            } overflow-hidden border-b border-gray-200 dark:border-slate-700`}
          >
            {sidebarCollapsed ? (
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                AS
              </h1>
            ) : (
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 logos">
                Attendance System
              </h1>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav
              className={`mt-2 flex-1 space-y-1 ${
                sidebarCollapsed ? "px-2" : "px-3"
              }`}
            >
              {filteredNavigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={navItemVariants}
                  whileHover={sidebarCollapsed ? "hover" : "hover"}
                  whileTap="tap"
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center ${
                      sidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5"
                    } text-sm font-medium rounded-lg ${
                      location.pathname === item.href
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title={sidebarCollapsed ? item.name : ""}
                    aria-current={
                      location.pathname === item.href ? "page" : undefined
                    }
                  >
                    <item.icon
                      className={`${sidebarCollapsed ? "mr-0" : "mr-3"} ${
                        sidebarCollapsed ? "h-6 w-6" : "h-5 w-5"
                      } flex-shrink-0 ${
                        location.pathname === item.href
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                      }`}
                      aria-hidden="true"
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* User menu */}
          <div
            className={`border-t border-gray-200 dark:border-slate-700 ${
              sidebarCollapsed ? "p-3" : "p-4"
            }`}
          >
            {isAuthenticated ? (
              <div className="relative">
                <div
                  className={`w-full flex ${
                    sidebarCollapsed
                      ? "justify-center"
                      : "items-center text-left"
                  } cursor-pointer`}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  ref={userDropdownRef}
                  role="button"
                  tabIndex={0}
                  aria-label="User menu"
                  aria-expanded={showUserDropdown}
                  aria-haspopup="true"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md ring-2 ring-white dark:ring-slate-700">
                      {user?.name?.charAt(0)?.toUpperCase() || (
                        <UserCircle className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="ml-3 flex flex-col flex-grow overflow-hidden">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {user?.name}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <ThemeToggle />
                      </div>
                    </>
                  )}
                </div>

                {/* Red Logout Button */}
                {isAuthenticated && (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className={`mt-3 w-full flex items-center justify-center ${
                      sidebarCollapsed ? "p-2" : "py-2 px-4"
                    } bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-lg hover:from-red-700 hover:to-red-600 dark:hover:from-red-800 dark:hover:to-red-700 shadow-sm transition-all duration-200 cursor-pointer`}
                    role="button"
                    tabIndex={0}
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut
                      className={`h-5 w-5 ${!sidebarCollapsed && "mr-2"}`}
                    />
                    {!sidebarCollapsed && "Logout"}
                  </motion.div>
                )}

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      className={`absolute ${
                        sidebarCollapsed ? "left-full ml-2" : "right-0 left-0"
                      } mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10`}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <UserCircle className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          Settings
                        </Link>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {sidebarCollapsed ? (
                  <div className="flex justify-center">
                    <Link
                      to="/login"
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      title="Log in"
                    >
                      <ExternalLink className="h-6 w-6" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <UserCircle className="h-5 w-5 mr-2" />
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex flex-1 flex-col ${
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        } transition-all duration-300 ease-in-out`}
      >
        {/* Top header */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-slate-800 shadow dark:shadow-slate-700/20 md:hidden transition-colors duration-200">
          <button
            type="button"
            className="border-r border-gray-200 dark:border-slate-700 px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between items-center px-4">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
              Attendance System
            </h1>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {isAuthenticated && (
                <button
                  className="flex-shrink-0 rounded-full p-1 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                  onClick={() => navigate("/profile")}
                  aria-label="User profile"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || (
                      <UserCircle className="h-5 w-5" />
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <motion.main
          className="flex-1 transition-colors duration-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="py-6"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default MainLayout;
