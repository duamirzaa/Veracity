import apiClient from './api'
import type { Prediction } from '@/types/prediction'

interface AnalysisRequest {
  code: string
  file_path: string
  project_id?: number
}

interface AnalysisResponse {
  prediction: Prediction
}

interface PredictionsListResponse {
  predictions: Prediction[]
  total: number
  page: number
  limit: number
}

/**
 * Submit code for defect analysis
 */
export const analyzeCode = async (payload: AnalysisRequest): Promise<AnalysisResponse> => {
  try {
    const response = await apiClient.post<AnalysisResponse>('/analysis', payload)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get all predictions
 */
export const getPredictions = async (page: number = 1, limit: number = 10): Promise<PredictionsListResponse> => {
  try {
    const response = await apiClient.get<PredictionsListResponse>('/predictions', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get single prediction by ID
 */
export const getPredictionById = async (id: number): Promise<Prediction> => {
  try {
    const response = await apiClient.get<Prediction>(`/predictions/${id}`)
    const prediction = response.data

    // Fallback: If mitigation_advice is missing, fetch it from chatbot start
    if (prediction && (!prediction.mitigation_advice || Object.keys(prediction.mitigation_advice).length === 0)) {
      try {
        const chatResponse = await apiClient.post('/chat/start', {
          session_id: `fallback-${prediction.id}-${Date.now()}`,
          risk_level: prediction.risk_level || 'medium',
          top_features: (prediction.top_risk_features || []).map(f => ({
            feature: f.feature_name,
            shap_value: f.shap_value,
            metric_value: f.feature_value
          }))
        })
        if (chatResponse.data?.conversation) {
          prediction.mitigation_advice = chatResponse.data.conversation
        }
      } catch (chatErr) {
        console.warn('Fallback advice fetch failed:', chatErr)
      }
    }

    return prediction
  } catch (error) {
    throw error
  }
}

/**
 * Get predictions by project ID
 */
export const getPredictionsByProjectId = async (projectId: number): Promise<PredictionsListResponse> => {
  try {
    const response = await apiClient.get<PredictionsListResponse>(`/projects/${projectId}/predictions`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Add this at the bottom ↓
const predictionsService = {
  analyzeCode,
  getPredictions,
  getPredictionById,
  getPredictionsByProjectId,
}

export default predictionsService
export { predictionsService }