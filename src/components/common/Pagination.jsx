import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @param {Object} props
 * @param {number} props.currentPage 
 * @param {number} props.totalPages
 * @param {number} props.totalItems 
 * @param {number} props.pageSize 
 * @param {Function} props.onPageChange 
 * @param {boolean} props.disabled 
 * @param {string} props.className 
 */
const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0, 
  pageSize = 10, 
  onPageChange,
  disabled = false,
  className = ''
}) => {
  const pageNumbers = [];

  const getPageNumbers = () => {    
    const maxPagesDisplayed = 5;
    
    if (totalPages <= maxPagesDisplayed) {
  
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
   
      pageNumbers.push(1);
      
    
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled) {
      return;
    }
    onPageChange(page);
  };

  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers();

  return (
    <nav className={`flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 sm:px-0 ${className}`}>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || disabled}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-sm font-medium ${
                currentPage === 1 || disabled
                  ? 'text-gray-300 dark:text-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {/* Page Numbers */}
            {pages.map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  disabled={disabled}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`${
                    page === currentPage
                      ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {page}
                </span>
              )
            ))}
            
            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || disabled}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-sm font-medium ${
                currentPage === totalPages || disabled
                  ? 'text-gray-300 dark:text-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile pagination */}
      <div className="flex sm:hidden items-center justify-between py-3">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
            currentPage === 1 || disabled
              ? 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-slate-900'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" aria-hidden="true" />
          Previous
        </button>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
        </p>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
            currentPage === totalPages || disabled
              ? 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-slate-900'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          Next
          <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination; 