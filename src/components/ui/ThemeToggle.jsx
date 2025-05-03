import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme, isAnimating } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      disabled={isAnimating}
      className="relative w-14 h-7 flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-200"
      style={{
        backgroundColor: isDark ? '#1e40af' : '#e5e7eb', // blue-800 for dark, gray-200 for light
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span 
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-gray-200'
        }`}
      />
      
      <motion.span 
        className={`absolute left-0.5 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-colors duration-200 ${
          isDark ? 'bg-black' : 'bg-white'
        }`}
        animate={{ 
          x: isDark ? 26 : 0,
        }}
        transition={{ 
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-white" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </motion.span>
    </motion.button>
  );
};

export default ThemeToggle; 