import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const axiosInstance = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry or unauthorized access
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized, clear localStorage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/unauthorized'; // Redirect to the unauthorized page
    }
    return Promise.reject(error);
  }
);

// function to get admin id from token
export const getAdminId = (): string | null => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: { id: string } = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

export default axiosInstance;
