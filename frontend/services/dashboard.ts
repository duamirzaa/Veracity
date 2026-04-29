import apiClient from './api'

export interface DashboardStatsUser {
  totalPredictions: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  criticalRiskCount: number
  averageDefectProbability: number
  riskTrends: Array<{
    date: string
    low: number
    medium: number
    high: number
    critical: number
  }>
  defectStats: Array<{
    name: string
    value: string
    change: string
    positive: boolean
    icon: string
    color: string
    bgColor: string
    iconColor: string
  }>
}

/**
 * Get dashboard stats for current user
 */
export const getDashboardStats = async (): Promise<DashboardStatsUser> => {
  try {
    const response = await apiClient.get<DashboardStatsUser>('/dashboard/stats')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get recent predictions
 */
export const getRecentPredictions = async (limit: number = 5) => {
  try {
    const response = await apiClient.get('/dashboard/recent-predictions', {
      params: { limit },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
