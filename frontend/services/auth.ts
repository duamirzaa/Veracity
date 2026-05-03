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
  password: string
  full_name?: string
  role?: string
  tier?: string
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

/**
 * Update own profile (full_name and/or password)
 * PUT /auth/me
 */
export const updateProfile = async (data: { full_name?: string; password?: string }): Promise<User> => {
  try {
    const response = await apiClient.put<User>('/auth/me', data)
    return response.data
  } catch (error) {
    throw error
  }
}
