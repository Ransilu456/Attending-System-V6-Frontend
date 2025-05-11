import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true 
});


const checkServerConnectivity = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { 
      timeout: 5000,
      validateStatus: false 
    });
    return response.status === 200 && response.data?.status === 'ok';
  } catch {
    return false;
  }
};


api.interceptors.request.use(
  async (config) => {
   
    const isServerUp = await checkServerConnectivity();
    if (!isServerUp) {
      throw new Error('Server is not responding. Please check if the server is running.');
    }

    let token = localStorage.getItem('token');
    
    if (!token) {
      token = sessionStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response || error.response.status === 0) {
      toast.error('Cannot connect to server. Please check your connection and try again.');
      return Promise.reject(new Error('Server connection failed'));
    }

    const { response: errorResponse } = error;

    
    if (errorResponse.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }


    if (errorResponse.status === 403) {
      toast.error('You do not have permission to perform this action');
      return Promise.reject(error);
    }


    if (errorResponse.status === 400 && errorResponse.config.url.includes('/reports/')) {
      const message = errorResponse.data?.message || 'Invalid report parameters';
      

      if (errorResponse.data?.error === 'future_date') {
        toast.error('Reports cannot be generated for future dates');
      } else if (errorResponse.data?.error === 'date_range_invalid') {
        toast.error('Invalid date range. The start date must be before the end date.');
      } else if (errorResponse.data?.error === 'no_data') {
        toast.warning('No attendance data found for the selected period');
      } else {
        toast.error(message);
      }
      
      return Promise.reject(error);
    }


    if (errorResponse.status === 422) {
      const message = errorResponse.data?.message || 'Validation failed';
      toast.error(message);
      return Promise.reject(error);
    }

    if (errorResponse.status === 429) {
      const retryAfter = parseInt(errorResponse.headers['retry-after']) || 60;
      toast.warning(`Too many attempts. Please wait ${Math.ceil(retryAfter / 60)} minutes.`);
      return Promise.reject(error);
    }


    if (errorResponse.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);


export default {
  ...api
};
