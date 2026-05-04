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

export interface AdminUser {
  user_id: number
  email: string
  full_name: string | null
  role: 'user' | 'project_manager' | 'admin' | 'student'
  tier: 'free' | 'pro'
  is_active: boolean
  is_email_verified: boolean
  created_at: string
  last_login_at: string | null
}

export interface AdminProject {
  project_id: number
  project_name: string
  is_archived: boolean
  analysis_count: number
  created_at: string
  user_id: number
  email: string
  full_name: string | null
  user_role: string
}

export interface ScanLog {
  id: number
  user_id: number
  user_name: string
  role: string
  action: string
  resource_type: string
  project_id?: number
  status: 'SUCCESS' | 'FAILED' | 'in_progress'
  ip_address: string
  error_message?: string | null
  timestamp: string
}

export interface MetricConfig {
  id: number
  name: string
  description: string
  enabled: boolean
  threshold?: number
}

interface UsersListResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

interface ProjectsListResponse {
  projects: AdminProject[]
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

export interface MitigationRule {
  id: number
  metric_name: string
  threshold_low: number
  threshold_high: number
  mitigation_advice: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
}

export interface RulesListResponse {
  rules: MitigationRule[]
  total: number
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
    const response = await apiClient.get<AdminUser[]>('/admin/users', {
      params: { page, limit },
    })

    // The backend returns an array, not a paginated object
    const usersArray = Array.isArray(response.data) ? response.data : []

    return {
      users: usersArray,
      total: usersArray.length,
      page: 1,
      limit: usersArray.length,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get single user details
 */
export const getUserById = async (id: number): Promise<AdminUser> => {
  try {
    const response = await apiClient.get<AdminUser>(`/admin/users/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update user
 */
export const updateUser = async (id: number, payload: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    const response = await apiClient.put<AdminUser>(`/admin/users/${id}`, payload)
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
export const toggleUserStatus = async (userId: number): Promise<AdminUser> => {
  try {
    const response = await apiClient.patch<AdminUser>(`/admin/users/${userId}/toggle`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get audit logs
 */
export const getLogs = async (page: number = 1, limit: number = 10): Promise<LogsListResponse> => {
  try {
    const response = await apiClient.get<LogsListResponse>('/admin/logs', {
      params: { page, limit },
    })

    // The backend returns a paginated object per the contract
    return {
      logs: response.data.logs || [],
      total: response.data.total || 0,
      page: response.data.page || page,
      limit: response.data.limit || limit,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Update user role
 * PATCH /admin/users/:id/role
 */
export const updateUserRole = async (userId: number, role: string): Promise<void> => {
  try {
    await apiClient.patch(`/admin/users/${userId}/role`, { role })
  } catch (error) {
    throw error
  }
}

/**
 * Get mitigation rules
 * GET /admin/metrics/rules
 */
export const getRules = async (): Promise<RulesListResponse> => {
  try {
    const response = await apiClient.get<RulesListResponse>('/admin/metrics/rules')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get single mitigation rule
 * GET /admin/metrics/rules/:id
 */
export const getRuleById = async (id: number): Promise<MitigationRule> => {
  try {
    const response = await apiClient.get<MitigationRule>(`/admin/metrics/rules/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update mitigation rule
 * PUT /admin/metrics/rules/:id
 */
export const updateRule = async (id: number, payload: Partial<MitigationRule>): Promise<MitigationRule> => {
  try {
    const response = await apiClient.put<{ message: string, rule: MitigationRule }>(`/admin/metrics/rules/${id}`, payload)
    return response.data.rule
  } catch (error) {
    throw error
  }
}

