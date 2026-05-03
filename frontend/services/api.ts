declare const process: any;
import axios, { InternalAxiosRequestConfig } from 'axios';
import { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie'

// Backend API base URL - changed from port 8000 to 5000 to match backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('auth_token');
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      Cookies.remove('auth_token')
      Cookies.remove('auth_user')
      window.location.href = '/'
    }

    if (error.response?.status === 403) {
      const data = error.response.data as any
      if (data?.upgrade_required) {
        // Dispatch custom event for UI to show upgrade modal
        window.dispatchEvent(new CustomEvent('upgrade-required'))
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
