import apiClient from './api'

export interface ChatMessage {
  id?: number
  type: 'user' | 'bot'
  content: string
  timestamp?: string
}

export interface ChatSession {
  id: number
  session_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

interface StartChatResponse {
  session_id: string
  message: ChatMessage
}

interface SendMessageRequest {
  message: string
  session_id?: string
}

interface SendMessageResponse {
  message: ChatMessage
  session_id: string
}

/**
 * Start a new chat session
 * POST /api/chat/start
 */
export const startChat = async (): Promise<StartChatResponse> => {
  try {
    const response = await apiClient.post<StartChatResponse>('/chat/start')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Send message to chatbot
 * POST /api/chat/message
 */
export const sendChatMessage = async (payload: SendMessageRequest): Promise<SendMessageResponse> => {
  try {
    const response = await apiClient.post<SendMessageResponse>('/chat/message', payload)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Reset chat session
 * POST /api/chat/reset
 */
export const resetChat = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/chat/reset', { session_id: sessionId })
    return response.data
  } catch (error) {
    throw error
  }
}
