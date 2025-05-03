import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.size 
 * @param {string} props.color 
 * @param {string} props.className 
 * @param {boolean} props.centered
 * @param {string} props.text 
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '', 
  centered = false,
  text = ''
}) => {

  const sizeMap = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };


  const colorMap = {
    blue: 'border-blue-500',
    gray: 'border-gray-500 dark:border-gray-400',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    indigo: 'border-indigo-500',
    pink: 'border-pink-500'
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;
  const spinnerColor = colorMap[color] || colorMap.blue;
  
  const wrapperClasses = centered 
    ? 'flex items-center justify-center' 
    : '';
  
  return (
    <div className={`${wrapperClasses} ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerSize} ${spinnerColor} border-t-transparent border-solid`}>
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 