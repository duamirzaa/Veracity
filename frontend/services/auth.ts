import apiClient from './api'
import type { User } from '@/contexts/AuthContext'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  token: string
}

interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name?: string
}

interface RegisterResponse {
  user: User
  // Note: No token returned on register - user must login after registration
}

/**
 * Login with email and password
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Register new user
 */
export const register = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', credentials)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Verify token validity
 */
export const verifyToken = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/auth/verify')
    return response.data
  } catch (error) {
    throw error
  }
}
