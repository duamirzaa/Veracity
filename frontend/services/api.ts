declare const process: any;

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

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
  (config: AxiosRequestConfig) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
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
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
