import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const { theme } = useTheme();

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
    >
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div variants={itemVariants}>
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <h1 className="mt-6 text-5xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent dark:from-red-400 dark:to-orange-400">
            404
          </h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 shadow-md transition-all duration-200"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound; 