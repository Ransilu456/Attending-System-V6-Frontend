import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const StatusBadge = ({ status, className = '' }) => {
  
  const getStatusConfig = () => {
    const config = {
      icon: null,
      text: 'Unknown',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-600'
    };
    
    switch (status?.toLowerCase()) {
      case 'present':
      case 'entered':
        config.icon = <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />;
        config.text = 'Present';
        config.bgColor = 'bg-green-100 dark:bg-green-900/20';
        config.textColor = 'text-green-800 dark:text-green-200';
        config.borderColor = 'border-green-200 dark:border-green-800';
        break;
        
      case 'absent':
        config.icon = <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />;
        config.text = 'Absent';
        config.bgColor = 'bg-red-100 dark:bg-red-900/20';
        config.textColor = 'text-red-800 dark:text-red-200';
        config.borderColor = 'border-red-200 dark:border-red-800';
        break;
        
      case 'checked-in':
      case 'checked_in':
        config.icon = <CheckCircle className="h-4 w-4 text-blue-500" aria-hidden="true" />;
        config.text = 'Checked In';
        config.bgColor = 'bg-blue-100 dark:bg-blue-900/20';
        config.textColor = 'text-blue-800 dark:text-blue-200';
        config.borderColor = 'border-blue-200 dark:border-blue-800';
        break;
        
      case 'checked-out':
      case 'checked_out':
        config.icon = <Clock className="h-4 w-4 text-purple-500" aria-hidden="true" />;
        config.text = 'Checked Out';
        config.bgColor = 'bg-purple-100 dark:bg-purple-900/20';
        config.textColor = 'text-purple-800 dark:text-purple-200';
        config.borderColor = 'border-purple-200 dark:border-purple-800';
        break;
        
      case 'left':
        config.icon = <Clock className="h-4 w-4 text-purple-500" aria-hidden="true" />;
        config.text = 'Left';
        config.bgColor = 'bg-purple-100 dark:bg-purple-900/20';
        config.textColor = 'text-purple-800 dark:text-purple-200';
        config.borderColor = 'border-purple-200 dark:border-purple-800';
        break;
        
      case 'pending':
        config.icon = <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />;
        config.text = 'Pending';
        config.bgColor = 'bg-yellow-100 dark:bg-yellow-900/20';
        config.textColor = 'text-yellow-800 dark:text-yellow-200';
        config.borderColor = 'border-yellow-200 dark:border-yellow-800';
        break;
        
      case 'late':
        config.icon = <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />;
        config.text = 'Late';
        config.bgColor = 'bg-orange-100 dark:bg-orange-900/20';
        config.textColor = 'text-orange-800 dark:text-orange-200';
        config.borderColor = 'border-orange-200 dark:border-orange-800';
        break;
        
      default:
        if (status) {
          config.text = status.charAt(0).toUpperCase() + status.slice(1);
        }
        break;
    }
    
    return config;
  };
  
  const config = getStatusConfig();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {config.text}
    </span>
  );
};

export default StatusBadge; 