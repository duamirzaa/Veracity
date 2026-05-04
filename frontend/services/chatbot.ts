import apiClient from './api'

export interface ChatMessage {
  id?: number
  type: 'user' | 'bot'
  content: string
  timestamp?: string
}

export interface ChatLimit {
  used: number
  remaining: number | 'unlimited'
  limit: number | 'unlimited'
}

interface StartChatResponse {
  session_id: string
  message: string
  context?: object
  limit?: ChatLimit
  conversation?: any
}

interface SendMessageResponse {
  session_id: string
  message: string        // ← string hai, ChatMessage nahi
  limit: ChatLimit
}

/**
 * Start a new chat session
 * POST /api/chat/start
 */
export const startChat = async (
  projectId?: number | string,
  risk_level?: string,
  top_features?: any[]
): Promise<StartChatResponse> => {
  const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const response = await apiClient.post<StartChatResponse>('/chat/start', {
    session_id,
    project_id: projectId || null,
    risk_level,
    top_features: top_features?.map(f => ({
      feature: f.feature_name || f.feature,
      shap_value: f.shap_value,
      metric_value: f.feature_value || f.metric_value
    }))
  })
  return { ...response.data, session_id }
}

/**
 * Send message to chatbot
 * POST /api/chat/message
 */
export const sendChatMessage = async (
  message: string,
  sessionId: string
): Promise<SendMessageResponse> => {
  const response = await apiClient.post<SendMessageResponse>('/chat/message', {
    session_id: sessionId,
    message,
  })
  return response.data
}

/**
 * Reset chat session
 * POST /api/chat/reset
 */
export const resetChat = async (
  sessionId: string
): Promise<{ message: string }> => {
  const response = await apiClient.post('/chat/reset', {
    session_id: sessionId,
  })
  return response.data
}
