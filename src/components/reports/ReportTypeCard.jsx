import React from 'react';
import { motion } from 'framer-motion';

const ReportTypeCard = ({ icon, title, description, isSelected, onClick }) => (
  <motion.div 
    onClick={onClick}
    whileHover={{ y: -4, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
    whileTap={{ scale: 0.98 }}
    className={`flex flex-col p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected 
        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-md dark:shadow-blue-900/20' 
        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800'
    }`}
  >
    <div className={`p-3 rounded-full self-start ${
      isSelected ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
    }`}>
      {icon}
    </div>
    <h3 className={`font-medium mt-3 ${
      isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-white'
    }`}>{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
  </motion.div>
);

export default ReportTypeCard; 