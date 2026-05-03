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
  message: string        // ← string hai, ChatMessage nahi
  context: object
  limit: ChatLimit
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
  projectId?: number | string
): Promise<StartChatResponse> => {
  const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const response = await apiClient.post<StartChatResponse>('/chat/start', {
    session_id,
    project_id: projectId || null,
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
