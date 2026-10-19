import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medivanta_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect if accessing authenticated route
      if (
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/admin/dashboard') ||
        currentPath.startsWith('/book-appointment')
      ) {
        localStorage.removeItem('medivanta_token');
        localStorage.removeItem('medivanta_user');
        localStorage.removeItem('medivanta_role');
        window.location.href = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
