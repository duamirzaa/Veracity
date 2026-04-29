import apiClient from './api'
import type { User } from '@/contexts/AuthContext'
import type { Project } from './projects'

export interface DashboardStats {
  avgRisk: number
  totalScans: number
  successfulScans: number
  failedScans: number
  riskDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  scanTrends: Array<{
    date: string
    scans: number
    avgRisk: number
  }>
}

export interface UserWithAccess extends User {
  name?: string
  projects: string[]
  access: 'read' | 'write' | 'admin'
}

export interface ScanLog {
  id: number
  project_id: number
  project_name: string
  user_id: number
  user_name: string
  status: 'success' | 'failed' | 'in_progress'
  files_scanned: number
  predictions_generated: number
  timestamp: string
  error_message?: string
}

export interface MetricConfig {
  id: number
  name: string
  description: string
  enabled: boolean
  threshold?: number
}

interface UsersListResponse {
  users: UserWithAccess[]
  total: number
  page: number
  limit: number
}

interface ProjectsListResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
}

interface LogsListResponse {
  logs: ScanLog[]
  total: number
  page: number
  limit: number
}

interface MetricsListResponse {
  metrics: MetricConfig[]
}

/**
 * Get admin dashboard stats
 */
export const getAdminDashboard = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get all users
 */
export const getUsers = async (page: number = 1, limit: number = 10): Promise<UsersListResponse> => {
  try {
    const response = await apiClient.get<UsersListResponse>('/admin/users', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get single user details
 */
export const getUserById = async (id: number): Promise<UserWithAccess> => {
  try {
    const response = await apiClient.get<UserWithAccess>(`/admin/users/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update user
 */
export const updateUser = async (id: number, payload: Partial<UserWithAccess>): Promise<UserWithAccess> => {
  try {
    const response = await apiClient.put<UserWithAccess>(`/admin/users/${id}`, payload)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Delete user
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/users/${id}`)
  } catch (error) {
    throw error
  }
}

/**
 * Get all projects (admin view)
 */
export const getAdminProjects = async (page: number = 1, limit: number = 10): Promise<ProjectsListResponse> => {
  try {
    const response = await apiClient.get<ProjectsListResponse>('/admin/projects', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get scan logs
 */
export const getScanLogs = async (page: number = 1, limit: number = 10): Promise<LogsListResponse> => {
  try {
    const response = await apiClient.get<LogsListResponse>('/admin/logs', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get single scan log details
 */
export const getScanLogById = async (id: number): Promise<ScanLog> => {
  try {
    const response = await apiClient.get<ScanLog>(`/admin/logs/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get metric configurations
 */
export const getMetrics = async (): Promise<MetricsListResponse> => {
  try {
    const response = await apiClient.get<MetricsListResponse>('/admin/metrics')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update metric configuration
 */
export const updateMetric = async (id: number, payload: Partial<MetricConfig>): Promise<MetricConfig> => {
  try {
    const response = await apiClient.put<MetricConfig>(`/admin/metrics/${id}`, payload)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get admin analytics
 * GET /admin/analytics
 */
export const getAnalytics = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<DashboardStats>('/admin/analytics')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Toggle user status (activate/deactivate)
 * PATCH /admin/users/:id/toggle
 */
export const toggleUserStatus = async (userId: number): Promise<UserWithAccess> => {
  try {
    const response = await apiClient.patch<UserWithAccess>(`/admin/users/${userId}/toggle`)
    return response.data
  } catch (error) {
    throw error
  }
}
