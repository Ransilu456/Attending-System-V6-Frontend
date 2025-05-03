import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.status 
 */
const StatusBadge = ({ status }) => {
  const getBadgeClasses = () => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'entered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'left':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'absent':
        return <XCircle className="h-4 w-4 mr-1" />;
      case 'entered':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'left':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const formatStatusText = () => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClasses()}`}>
      {getStatusIcon()}
      {formatStatusText()}
    </span>
  );
};

export default StatusBadge; 