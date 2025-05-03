import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Performance monitoring function
const reportWebVitals = (metric) => {
  // When in production, send to analytics
  if (import.meta.env.PROD) {
    console.log(metric); // Replace with your analytics call
    // Example: sendToAnalytics(metric);
  }
};

// Remove the loading spinner when app renders
const removeLoadingSpinner = () => {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) {
    spinner.remove();
  }
};

// Deferred loading for better FCP
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use a callback to render after the browser is idle
if (window.requestIdleCallback) {
  window.requestIdleCallback(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    removeLoadingSpinner();
  });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    removeLoadingSpinner();
  }, 1);
}

// Report performance metrics when available
if ('performance' in window && 'measure' in window.performance) {
  window.performance.mark('app-start');
  
  // Report metrics after hydration
  window.addEventListener('load', () => {
    window.performance.mark('app-loaded');
    window.performance.measure('app-render-time', 'app-start', 'app-loaded');
    
    const performanceEntries = window.performance.getEntriesByType('measure');
    performanceEntries.forEach(entry => {
      reportWebVitals(entry);
    });
  });
}
