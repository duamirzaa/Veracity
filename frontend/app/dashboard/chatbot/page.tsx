'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaPaperPlane, FaRobot, FaUser, FaRedo, FaSpinner } from 'react-icons/fa'
import { startChat, sendChatMessage, resetChat } from '@/services/chatbot'
import { getPredictionById } from '@/services/predictions'
import type { ConversationMessage, ChatOption } from '@/services/chatbot'

interface DisplayMessage {
  id: number
  type: 'user' | 'bot'
  content: string
  emoji?: string
  options?: ChatOption[]
  friendlySummary?: string
  timestamp: Date
}

const generateSessionId = () => `sess_${Math.random().toString(36).substring(2, 15)}`

function ChatbotContent() {
  const searchParams = useSearchParams()
  const predictionId = searchParams?.get('prediction_id') || null

  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Convert backend conversation messages to display messages
  const convertMessages = (convoMessages: ConversationMessage[], startId: number): DisplayMessage[] => {
    return convoMessages.map((msg, idx) => ({
      id: startId + idx,
      type: 'bot' as const,
      content: msg.text,
      emoji: msg.emoji,
      options: msg.options,
      friendlySummary: msg.friendly_summary,
      timestamp: new Date(),
    }))
  }

  const initChat = async () => {
    try {
      setInitializing(true)
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)

      let riskLevel = 'medium'
      let topFeatures: string[] = []

      if (predictionId) {
        try {
          const pred = await getPredictionById(parseInt(predictionId))
          riskLevel = pred.risk_level || 'medium'
          topFeatures = pred.top_risk_features?.map((f: any) => f.feature_name) || []
        } catch {
          // Use defaults if prediction fetch fails
        }
      }

      const res = await startChat({
        session_id: newSessionId,
        risk_level: riskLevel,
        top_features: topFeatures,
      })

      if (res.conversation?.messages) {
        const botMessages = convertMessages(res.conversation.messages, Date.now())
        setMessages(botMessages)
        setQuickReplies(res.conversation.quick_replies || [])
      } else {
        setMessages([{
          id: Date.now(),
          type: 'bot',
          content: "Hello! I'm your code health assistant. How can I help you?",
          timestamp: new Date(),
        }])
      }
    } catch (err) {
      console.error('Failed to init chat:', err)
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: "Hello! I'm having trouble connecting to the ML service right now. Please try again later.",
        emoji: '⚠️',
        timestamp: new Date(),
      }])
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    initChat()
  }, [predictionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: DisplayMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setQuickReplies([])
    setLoading(true)

    try {
      const currentSessionId = sessionId || generateSessionId()
      if (!sessionId) setSessionId(currentSessionId)

      const response = await sendChatMessage({
        session_id: currentSessionId,
        message: text,
      })

      if (response.conversation?.messages) {
        const botMessages = convertMessages(response.conversation.messages, Date.now() + 1)
        setMessages((prev) => [...prev, ...botMessages])
        setQuickReplies(response.conversation.quick_replies || [])
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: "I received your message but couldn't generate a response.",
          timestamp: new Date(),
        }])
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Sorry, I'm having trouble connecting right now."
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        emoji: '⚠️',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const handleQuickReply = async (reply: string) => {
    await sendMessage(reply)
  }

  const handleOptionClick = async (option: ChatOption) => {
    await sendMessage(option.label)
  }

  const handleReset = async () => {
    if (sessionId) {
      try {
        await resetChat(sessionId)
      } catch {
        // Ignore reset errors
      }
    }
    setMessages([])
    setQuickReplies([])
    await initChat()
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Defect Prediction Chatbot</h1>
          <p className="text-gray-400 mt-1">Get instant advice on code quality and mitigation strategies</p>
        </div>
        <button
          onClick={handleReset}
          disabled={initializing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors border border-dark-600 disabled:opacity-50"
        >
          <FaRedo />
          New Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-dark-800 rounded-lg border border-dark-700 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {initializing && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <div className="bg-dark-700 rounded-lg p-4 flex items-center gap-3">
                <FaSpinner className="animate-spin text-primary-400" />
                <span className="text-gray-300">Initializing chat session...</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.emoji ? (
                    <span className="text-lg">{message.emoji}</span>
                  ) : (
                    <FaRobot className="text-white" />
                  )}
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Friendly summary */}
                {message.friendlySummary && (
                  <div className="mt-2 text-xs text-gray-400 italic border-t border-dark-600 pt-2">
                    {message.friendlySummary}
                  </div>
                )}

                {/* Options buttons */}
                {message.options && message.options.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {message.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={loading}
                        className="text-left text-sm px-3 py-2 bg-dark-600 hover:bg-dark-500 text-primary-300 hover:text-primary-200 rounded-lg transition-colors border border-dark-500 disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && !loading && (
          <div className="px-4 py-2 border-t border-dark-700/50 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center mr-1">Quick replies:</span>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 rounded-full transition-colors border border-primary-500/20"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-dark-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about code metrics, risk levels, or mitigation strategies..."
              className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading || initializing}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || initializing}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaPaperPlane />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <ChatbotContent />
      </Suspense>
    </DashboardLayout>
  )
}
