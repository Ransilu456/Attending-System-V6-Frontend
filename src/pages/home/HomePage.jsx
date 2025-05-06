import React, { useState, useEffect, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  UserCircle,
  QrCode,
  BarChart,
  Users,
  Settings,
  LogOut,
  Calendar,
  MessageCircle,
  ChevronRight,
  CheckSquare,
  FileText,
  ArrowRight,
  Star,
} from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart, badge: "New" },
  { name: "Students", href: "/dashboard/students", icon: Users, badge: "8" },
  {
    name: "QR Scanner",
    href: "/dashboard/scanner",
    icon: QrCode,
    badge: "Scan",
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: Calendar,
    badge: "New",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart,
    badge: "Updated",
  },

  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    badge: "Pro",
  },

];

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

const Navbar = memo(() => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "backdrop-blur-xl bg-white/90 dark:bg-slate-900/95 shadow-md dark:shadow-slate-900/30"
          : "backdrop-blur-sm bg-white/70 dark:bg-slate-900/80"
      } border-b ${
        scrolled
          ? "border-gray-200/70 dark:border-slate-800/80"
          : "border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.h1
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400"
              whileHover={{ scale: 1.05 }}
            >
              DP Attendance
            </motion.h1>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Home
            </Link>

            <Link
              to="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            <div className="hidden sm:flex space-x-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.button
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Login
                    </motion.button>
                  </Link>

                  <Link to="/register">
                    <motion.button
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const NavigationItem = memo(({ item, index, activeTab, setActiveTab }) => {
  return (
    <motion.div
      key={item.name}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={navItemVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <button
        className={`group flex items-center justify-around p-2.5 w-full text-sm gap-2 font-medium rounded-lg ${
          activeTab === item.name.toLowerCase()
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
        }`}
        onClick={() => setActiveTab(item.name.toLowerCase())}
      >
        <item.icon
          className={`mr-0 h-5 w-5 flex-shrink-0 ${
            activeTab === item.name.toLowerCase()
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
          }`}
          aria-hidden="true"
        />
        <span className="truncate">{item.name}</span>
        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {item.badge}
        </span>
      </button>
    </motion.div>
  );
});

const Sidebar = memo(({ activeTab, setActiveTab, screenSize }) => {
  return (
    <div
      className={`${
        screenSize === "small" ? "hidden" : "flex"
      } flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-200 shadow-md dark:shadow-slate-900/50`}
    >
      {/* Logo */}
      <div className="flex flex-shrink-0 items-center h-14 px-4 overflow-hidden border-b border-gray-200 dark:border-slate-700">
        <motion.h1
          className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300"
          whileHover={{ scale: 1.03 }}
        >
          Attendance System
        </motion.h1>
      </div>

      <div className="flex pt-3 flex-grow">
        <nav className="mt-1 flex-1 space-y-0.5 px-2">
          {navigation.map((item, index) => (
            <NavigationItem
              key={item.name}
              item={item}
              index={index}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </nav>
      </div>

      {/* User menu */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-2.5">
        <div className="relative">
          <div className="flex items-center">
            <motion.div
              className="h-7 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div className="ml-3 flex flex-col flex-grow overflow-hidden">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                User name
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                example@gmail.com
              </p>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 w-full flex items-center justify-center p-2 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-lg hover:from-red-700 hover:to-red-600 dark:hover:from-red-800 dark:hover:to-red-700 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="text-sm">Logout</span>
        </motion.div>
      </div>
    </div>
  );
});

const DashboardContent = memo(({ activeTab }) => {
  if (activeTab === "dashboard") {
    return (
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Welcome card */}
        <motion.div
          className="col-span-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/20"
          whileHover={{
            y: -5,
            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
          }}
        >
          <h2 className="text-xl font-bold mb-1 text-white ">Welcome back, User!</h2>
          <p className="opacity-80 text-sm">
            Your attendance dashboard is ready for today
          </p>
          <div className="flex gap-4 mt-3">
            <motion.button
              className="px-3 py-1.5 bg-white text-blue-600 rounded-lg shadow-md font-medium text-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Mark Attendance
            </motion.button>
            <motion.button
              className="px-3 py-1.5 bg-blue-700 text-white rounded-lg shadow-md font-medium text-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              View Reports
            </motion.button>
          </div>
        </motion.div>

        {/* Stats cards - make row layout more compact */}
        <motion.div
          className="col-span-3 bg-white dark:bg-slate-800 rounded-xl p-3 dark:shadow-slate-900/50"
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Total Students
            </h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold mt-1 dark:text-white">256</p>
          <p className="text-xs text-green-500 mt-0.5">+12% from last month</p>
        </motion.div>

        <motion.div
          className="col-span-3 bg-white dark:bg-slate-800 rounded-xl p-3 dark:shadow-slate-900/50"
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Present Today
            </h3>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold mt-1 dark:text-white">198</p>
          <p className="text-xs text-green-500 mt-0.5">77% attendance rate</p>
        </motion.div>

        <motion.div
          className="col-span-3 bg-white dark:bg-slate-800 rounded-xl p-3  dark:shadow-slate-900/50"
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Classes Today
            </h3>
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold mt-1 dark:text-white">8</p>
          <p className="text-xs text-blue-500 mt-0.5">Next class in 45 min</p>
        </motion.div>

        <motion.div
          className="col-span-3 bg-white dark:bg-slate-800 rounded-xl p-3 dark:shadow-slate-900/50"
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Messages
            </h3>
            <MessageCircle className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-xl font-bold mt-1 dark:text-white">12</p>
          <p className="text-xs text-orange-500 mt-0.5">5 unread messages</p>
        </motion.div>

        {/* Chart section */}
        <motion.div
          className="col-span-8 bg-white dark:bg-slate-800 rounded-xl p-4 dark:shadow-slate-900/50"
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">
            Weekly Attendance
          </h3>
          <div className="flex justify-between items-end h-36 mt-2 px-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex flex-col items-center">
                <motion.div
                  className="w-8 bg-blue-500 dark:bg-blue-600 rounded-t-md"
                  style={{
                    height: [75, 85, 95, 80, 90, 60, 50][i] + "%",
                    opacity: 0.7 + i * 0.05,
                  }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                ></motion.div>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          className="col-span-4 bg-white dark:bg-slate-800 rounded-xl p-4 dark:shadow-slate-900/50"
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {[
              {
                text: "Class A attendance marked",
                time: "10 mins ago",
                icon: CheckSquare,
                color: "text-green-500",
              },
              {
                text: "New student registered",
                time: "1 hour ago",
                icon: UserCircle,
                color: "text-blue-500",
              },
              {
                text: "Report generated",
                time: "3 hours ago",
                icon: FileText,
                color: "text-purple-500",
              },
              {
                text: "System updated",
                time: "Yesterday",
                icon: Settings,
                color: "text-gray-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                whileHover={{
                  x: 5,
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                }}
              >
                <div
                  className={`p-1.5 rounded-full bg-gray-100 dark:bg-slate-700 ${item.color}`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          This section is under development
        </p>
      </div>
    </div>
  );
});

const MacOs = memo(() => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [screenSize, setScreenSize] = useState("medium");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("small");
      } else if (width >= 640 && width < 1280) {
        setScreenSize("medium");
      } else if (width >= 1280 && width < 1920) {
        setScreenSize("large");
      } else {
        setScreenSize("xlarge");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getContainerSize = useMemo(() => {
    switch (screenSize) {
      case "small":
        return "w-full max-w-[95vw] h-[70vh]";
      case "medium":
        return "w-full max-w-[90vw] h-[680px]";
      case "large":
        return "w-full max-w-[1100px] h-[680px]";
      case "xlarge":
        return "w-full max-w-[1600px] h-[800px]";
      default:
        return "w-full max-w-[1100px] h-[680px]";
    }
  }, [screenSize]);

  // When a tab is clicked, we're going to prevent the actual tab change
  // This will keep the dashboard view always showing
  const handleTabClick = () => {
    // Force activeTab to always be 'dashboard' for demo purposes
    setActiveTab("dashboard");
  };

  return (
    <motion.div
      className={`relative xlarge mx-auto z-10`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      {/* Drop shadow effects */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[85%] h-10 bg-black/20 dark:bg-black/40 blur-xl rounded-full"></div>

      {/* Glowing rotating circle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 dark:from-blue-400/20 dark:to-indigo-400/20 blur-[60px]"
          style={{
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            zIndex: -1,
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, repeatType: "reverse" },
          }}
        />

        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/15 dark:to-blue-400/15 blur-[60px]"
          style={{
            top: "40%",
            left: "60%",
            x: "-50%",
            y: "-50%",
            zIndex: -1,
          }}
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, repeatType: "reverse" },
          }}
        />

        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-400/15 dark:to-indigo-400/15 blur-[50px]"
          style={{
            top: "60%",
            left: "40%",
            x: "-50%",
            y: "-50%",
            zIndex: -1,
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.3, 1],
          }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            scale: {
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            },
          }}
        />
      </div>

      <motion.div
        className={`border-4 border-gray-200 dark:border-gray-700 dark:border-opacity-70 ${getContainerSize} rounded-xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden backdrop-blur-sm relative`}
        whileHover={{
          boxShadow: "0 25px 65px rgba(59, 130, 246, 0.4)",
          y: -5,
        }}
      >
        {/* Constant blue glow effects */}
        <motion.div
          className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-400 opacity-30 blur-[100px] z-0"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute -top-40 -left-40 w-[350px] h-[350px] rounded-full bg-blue-600 opacity-20 blur-[80px] z-0"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
        />

        {/* Title bar - make it responsive */}
        <div className="w-full bg-white dark:bg-slate-800 h-10 rounded-t-xl flex justify-between items-center px-2 border-b-2 dark:border-gray-300 dark:border-opacity-25 z-10 relative">
          <div className="flex gap-2 ml-2">
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-[14px] w-[14px] rounded-full bg-red-500 cursor-pointer"
            ></motion.div>
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-[14px] w-[14px] rounded-full bg-yellow-500 cursor-pointer"
            ></motion.div>
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-[14px] w-[14px] rounded-full bg-green-500 cursor-pointer"
            ></motion.div>
          </div>

          {/* Hide tabs on small screens */}
          <div
            className={`${screenSize === "small" ? "hidden" : "flex"} gap-4`}
          >
            {["Dashboard", "Students", "Reports", "Settings"].map((tab) => (
              <motion.button
                key={tab}
                className={`text-sm px-3 py-1 rounded-md ${
                  activeTab === tab.toLowerCase()
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={handleTabClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2 mr-2">
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-[14px] w-[14px] rounded-full bg-gray-300 dark:bg-slate-600 cursor-pointer"
            ></motion.div>
          </div>
        </div>

        {/* Main content grid - make it responsive */}
        <div
          className={`grid ${
            screenSize === "small" ? "grid-cols-1" : "grid-cols-[200px_1fr]"
          } h-[calc(100%-2.5rem)] relative z-10`}
        >
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleTabClick}
            screenSize={screenSize}
          />

          <div className="p-5 overflow-auto bg-gray-50 dark:bg-slate-900">
            <AnimatePresence mode="wait">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DashboardContent activeTab="dashboard" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="absolute inset-0 bg-blue-400/5 dark:bg-blue-400/10 z-1 pointer-events-none"
          animate={{
            opacity: [0, 0.05, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.div>

      <div className="relative mx-auto w-[80%] h-5 bg-gray-300 dark:bg-gray-700 rounded-b-xl"></div>
    </motion.div>
  );
});

const Hero = memo(() => {
  return (
    <section className="w-full pt-10 md:pt-20 pb-5 md:pb-10 relative z-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-[1600px]">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 2xl:max-w-4xl z-40">
          <motion.div
            className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Reimagine Attendance Tracking
          </motion.div>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Modern Solution for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
              {" "}
              Education{" "}
            </span>
            Attendance
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl 2xl:text-2xl text-gray-600 dark:text-gray-300 mx-auto mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            A powerful, reliable system to track and manage student attendance
            with real-time analytics and reporting.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/register">
              <motion.button
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-800/20"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 15px rgba(209, 213, 219, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Login
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
          <motion.div
            className="flex justify-center items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + star * 0.1 }}
                >
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <span>Trusted by DP Education</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

const BackgroundEffects = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute top-[5%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-200 dark:bg-blue-900 opacity-20 dark:opacity-10 blur-[150px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.2, 0.15],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-300 dark:bg-indigo-800 opacity-20 dark:opacity-10 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-300/5 to-purple-300/5 dark:from-blue-900/5 dark:to-purple-900/5 blur-[100px]"
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          duration: 40,
          ease: "linear",
        }}
      />
    </div>
  );
});

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-slate-900 bg-gray-50 relative overflow-hidden">
      <BackgroundEffects />

      <div className="h-20"></div>
      <Navbar />

      <Hero />

      <div className="w-full flex justify-center items-center py-10 md:py-20 relative z-20">
        <MacOs />
      </div>
    </div>
  );
};

export default HomePage;
