import axios, { type AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

// Prevent rapid repeated force-logout from multiple 401s (e.g. React Query retries)
let lastLogoutAt = 0;
const LOGOUT_DEBOUNCE_MS = 2000;

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const now = Date.now();

      if (now - lastLogoutAt < LOGOUT_DEBOUNCE_MS) return Promise.reject(error);

      lastLogoutAt = now;
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('force-logout'));
    }
    return Promise.reject(error);
  },
);

export default api;
