import axios from 'axios';
import { BACKEND_URL } from '../config';

/*
  WHY axios instance?
  - One place to set baseURL and token header
  - Every request automatically sends the token
  - If token changes, update in one place only
  - Can add interceptors later (e.g. auto logout on 401)
*/
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
});

// Runs before every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*
  WHY response interceptor?
  - If token expires, backend returns 401
  - Instead of every component handling 401 separately,
    we handle it once here — auto logout and redirect to login
*/
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;