import apiClient from './api'

// Real backend response types based on actual API behavior

export interface ChatOption {
  label: string
  action: string
}

export interface ConversationMessage {
  type: string // 'greeting' | 'menu' | 'info' | 'advice' | etc.
  emoji?: string
  text: string
  friendly_summary?: string
  options?: ChatOption[]
  tone?: string
}

export interface ConversationResponse {
  messages: ConversationMessage[]
  quick_replies?: string[]
  session_id: string
}

export interface StartChatResponse {
  session_id: string
  conversation: ConversationResponse
  timestamp: string
}

export interface SendMessageResponse {
  session_id: string
  conversation: ConversationResponse
  timestamp: string
}

interface StartChatRequest {
  session_id: string
  risk_level: string
  top_features: string[]
}

interface SendMessageRequest {
  session_id: string
  message: string
}

/**
 * Start a new chat session
 * POST /api/chat/start
 */
export const startChat = async (payload: StartChatRequest): Promise<StartChatResponse> => {
  try {
    const response = await apiClient.post<StartChatResponse>('/chat/start', payload)
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
export const resetChat = async (sessionId: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/chat/reset', { session_id: sessionId })
    return response.data
  } catch (error) {
    throw error
  }
}
